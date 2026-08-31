const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { secretKey } = require('../config/env');

const authMiddleware = async (req, res, next) => {
  try {
    const authorizationHeader = req.header('Authorization') || '';
    const [scheme, token] = authorizationHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
    }

    const decoded = jwt.verify(token, secretKey);
    req.user = await User.findById(decoded.id).select('_id nombre email role createdAt updatedAt');

    if (!req.user) {
      return res.status(401).json({ message: 'Token inválido. Usuario no encontrado.' });
    }

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expirado. Por favor inicia sesión nuevamente.' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Token inválido.' });
    }
    return res.status(500).json({ message: 'Error en la autenticación.', error: error.message });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ message: 'Acceso denegado. No estás autenticado.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}` 
      });
    }

    next();
  };
};

module.exports = { authMiddleware, authorizeRoles };
