require('./config/env');

const connectDB = require('./config/db');
const User = require('./models/User');
const { adminSeed } = require('./config/env');

const createAdmin = async () => {
  if (!adminSeed.password || adminSeed.password === 'change-this-admin-password') {
    throw new Error('Define una contraseña real en ADMIN_PASSWORD dentro de .env.local antes de ejecutar el seed.');
  }

  await connectDB();

  try {
    const existingAdmin = await User.findOne({ email: adminSeed.email.toLowerCase() });
    if (existingAdmin) {
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log(`Usuario ${adminSeed.email} promovido a admin.`);
      } else {
        console.log(`El administrador ${adminSeed.email} ya existe.`);
      }
      return;
    }

    const admin = new User({
      nombre: adminSeed.nombre,
      email: adminSeed.email.toLowerCase(),
      password: adminSeed.password,
      role: 'admin',
    });

    await admin.save();
    console.log(`Administrador ${adminSeed.email} creado exitosamente.`);
  } finally {
    await require('mongoose').disconnect();
  }
};

createAdmin().catch((error) => {
  console.error('Error creando el administrador:', error.message);
  process.exit(1);
});
