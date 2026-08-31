const User = require('../models/User');
const Response = require('../models/response');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { secretKey } = require('../config/env');

const formatUser = (user) => ({
  _id: user._id,
  id: user._id,
  nombre: user.nombre,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.registerUser = async (req, res) => {
  try {
    const { nombre, email, password, role } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!nombre || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(409).json({ message: 'El usuario ya existe' });
    }

    const allowedRoles = ['user', 'admin'];
    const requestedRole = allowedRoles.includes(role) ? role : 'user';
    const newUserRole = requestedRole === 'admin' && req.user?.role === 'admin' ? 'admin' : 'user';

    const user = new User({ nombre, email: normalizedEmail, password, role: newUserRole });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, secretKey, { expiresIn: '1h' });

    res.status(201).json({ 
      message: 'Usuario registrado con éxito', 
      token, 
      user: formatUser(user)
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error al registrar el usuario', error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'El correo y la contraseña son obligatorios' });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, secretKey, { expiresIn: '1h' });

    res.status(200).json({ 
      message: 'Inicio de sesión exitoso', 
      token, 
      user: formatUser(user)
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('_id nombre email role createdAt updatedAt').lean();
    res.status(200).json({ message: 'Usuarios obtenidos exitosamente', users });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }

    const user = await User.findById(id).select('_id nombre email role createdAt updatedAt').lean();

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Usuario obtenido exitosamente', user });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ message: 'Error al obtener usuario', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password, role } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }

    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
      return res.status(403).json({ message: 'No tienes permisos para actualizar este usuario' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (nombre) user.nombre = nombre;
    if (email) user.email = email.trim().toLowerCase();

    if (role && req.user.role === 'admin') {
      user.role = role;
    }

    if (password) {
      user.password = password;
    }

    await user.save();
    const updatedUser = await User.findById(id).select('_id nombre email role createdAt updatedAt').lean();

    res.status(200).json({ message: 'Usuario actualizado exitosamente', user: updatedUser });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
      return res.status(403).json({ message: 'No tienes permisos para eliminar este usuario' });
    }

    await Response.deleteMany({ user: user._id });
    await user.deleteOne();
    res.status(200).json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const user = await User.findById(userId).select('_id nombre email role createdAt updatedAt').lean();
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Perfil obtenido exitosamente', user });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error al obtener perfil', error: error.message });
  }
};
