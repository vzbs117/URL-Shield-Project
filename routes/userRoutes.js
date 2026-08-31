const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

// Rutas públicas
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Crear usuarios desde el panel admin
router.post('/', authMiddleware, authorizeRoles('admin'), userController.registerUser);

// Perfil del usuario autenticado
router.get('/profile', authMiddleware, userController.getProfile);

// Obtener todos los usuarios (solo admin)
router.get('/', authMiddleware, authorizeRoles('admin'), userController.getAllUsers);

// Obtener un usuario por ID (admin y moderadores pueden ver a cualquier usuario)
router.get('/:id', authMiddleware, authorizeRoles('admin'), userController.getUserById);

// Actualizar usuario (el usuario puede actualizar su perfil, pero solo un admin cambia roles)
router.put('/:id', authMiddleware, userController.updateUser);

// Eliminar usuario (el usuario puede eliminar su propia cuenta, admin/moderadores pueden eliminar cualquier cuenta)
router.delete('/:id', authMiddleware, (req, res, next) => {
  if (req.user.role === 'admin' || req.user._id.toString() === req.params.id) {
    return userController.deleteUser(req, res);
  }
  return res.status(403).json({ message: 'No tienes permisos para eliminar este usuario' });
});

module.exports = router;
