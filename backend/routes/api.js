const express = require('express');
const router = express.Router();
const responseController = require('../controllers/apiController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

// Obtener las consultas del usuario autenticado
router.get('/responses/mine', authMiddleware, responseController.getMyUrls);

// Obtener todas las respuestas con paginación (solo admin y moderadores)
router.get('/responses', authMiddleware, authorizeRoles('admin'), responseController.getUrls);

// Obtener un reporte individual por su ID (admin, moderadores y el usuario dueño del reporte)
router.get('/responses/:id', authMiddleware, responseController.getResponseById);

// Consulta de URL a VirusTotal y creación de reporte (disponible para todos los usuarios autenticados)
router.post('/responses', authMiddleware, responseController.consultarURL);

// Eliminar un reporte (solo admin)
router.delete('/responses/:id', authMiddleware, authorizeRoles('admin'), responseController.deleteResponse);

module.exports = router;
