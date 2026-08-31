const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const ENV_FILES = ['.env.local', '.env'];

for (const fileName of ENV_FILES) {
  const filePath = path.join(__dirname, '..', fileName);
  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath });
  }
}

const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:4200', 'http://127.0.0.1:4200'];

const requiredVariables = ['MONGO_URI', 'SECRET_KEY'];
const missingVariables = requiredVariables.filter((key) => !process.env[key]);

if (missingVariables.length > 0) {
  throw new Error(`Faltan variables de entorno requeridas: ${missingVariables.join(', ')}`);
}

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : DEFAULT_ALLOWED_ORIGINS;

module.exports = {
  port: Number(process.env.PORT) || 5001,
  mongoUri: process.env.MONGO_URI,
  secretKey: process.env.SECRET_KEY,
  virusTotalApiKey: process.env.API_KEY || '',
  allowedOrigins,
  adminSeed: {
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || '',
    nombre: process.env.ADMIN_NAME || 'Super Admin',
  },
};
