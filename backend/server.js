require('./config/env');

const { port } = require('./config/env');
const app = require('./app');
const connectDB = require('./config/db');

let server;

const startServer = async () => {
  await connectDB();

  server = app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });
};

const shutdown = async (signal) => {
  console.log(`Recibida señal ${signal}. Cerrando servidor...`);

  if (server) {
    server.close(() => {
      console.log('Servidor HTTP detenido.');
    });
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('uncaughtException', (error) => {
  console.error('Excepción no capturada:', error);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('Promesa no manejada:', reason);
});

startServer().catch((error) => {
  console.error('No se pudo iniciar el backend:', error);
  process.exit(1);
});
