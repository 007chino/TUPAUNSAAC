const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', requireAuth, dashboardController.estadisticas);
router.get('/export.csv', requireAuth, dashboardController.exportarCsv);

module.exports = router;
