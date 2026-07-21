const express = require('express');
const catalogoController = require('../controllers/catalogoController');

const router = express.Router();

router.get('/', catalogoController.listar);
router.get('/:codigo', catalogoController.obtenerPorCodigo);

module.exports = router;
