require('./env');

const mongoose = require('mongoose');
const { mongoUri } = require('./env');
require('../models/User');
require('../models/response');

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    await mongoose.syncIndexes();
    console.log('Conectado a MongoDB');
  } catch (err) {
    console.error('Error de conexión a MongoDB:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
