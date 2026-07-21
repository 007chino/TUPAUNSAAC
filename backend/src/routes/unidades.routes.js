const express = require('express');
const catalogoController = require('../controllers/catalogoController');

const router = express.Router();

router.get('/', catalogoController.listarUnidades);

module.exports = router;
