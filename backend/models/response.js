const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  url: { 
    type: String, 
    required: [true, 'La URL es obligatoria'], 
    trim: true, 
    match: [/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/, 'La URL no es válida']
  },
  result: { 
    type: mongoose.Schema.Types.Mixed, 
    required: [true, 'El resultado es obligatorio'] 
  },
  status: { 
    type: String, 
    enum: { 
      values: ['seguro', 'no seguro'], 
      message: 'El estado debe ser "seguro" o "no seguro"' 
    }, 
    required: [true, 'El estado es obligatorio'] 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true // Mejora rendimiento en consultas
  }
}, { timestamps: true });

responseSchema.index({ user: 1, url: 1 }, { unique: true });

const Response = mongoose.model('Response', responseSchema);

module.exports = Response;
