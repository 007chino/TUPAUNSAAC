const express = require('express');
const solicitudController = require('../controllers/solicitudController');
const { requireAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Rutas públicas (portal del estudiante)
router.post('/', upload.array('files', 5), solicitudController.crear);
router.get('/rastreo', solicitudController.rastrear);

// Rutas del panel administrativo (requieren sesión)
router.get('/', requireAuth, solicitudController.listar);
router.patch('/:id/estado', requireAuth, solicitudController.cambiarEstado);

module.exports = router;
