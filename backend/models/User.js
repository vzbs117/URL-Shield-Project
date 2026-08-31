const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Esquema del Usuario con validaciones mejoradas
const UserSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: [true, 'El nombre es obligatorio'], 
    trim: true, 
    minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
    maxlength: [50, 'El nombre no puede exceder los 50 caracteres']
  },
  email: { 
    type: String, 
    required: [true, 'El email es obligatorio'], 
    unique: true, 
    lowercase: true,
    trim: true, 
    match: [/^\S+@\S+\.\S+$/, 'El email no es válido']
  },
  password: { 
    type: String, 
    required: [true, 'La contraseña es obligatoria'], 
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
    select: false
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  }
}, { timestamps: true });

// Encriptar la contraseña antes de guardar
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// Método de instancia para comparar contraseñas
UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Método estático para encriptar contraseñas manualmente
UserSchema.statics.hashPassword = async function (password) {
  return bcrypt.hash(password, 10);
};

// Exportar el modelo
module.exports = mongoose.model('User', UserSchema);
