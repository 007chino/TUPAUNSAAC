const express = require('express');

const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/catalogo', require('./catalogo.routes'));
router.use('/unidades', require('./unidades.routes'));
router.use('/solicitudes', require('./solicitudes.routes'));
router.use('/dashboard', require('./dashboard.routes'));

module.exports = router;
