const catalogoService = require('../services/catalogoService');

async function listar(req, res, next) {
  try {
    const catalogo = await catalogoService.listar();
    res.json({ catalog: catalogo });
  } catch (error) {
    next(error);
  }
}

async function obtenerPorCodigo(req, res, next) {
  try {
    const item = await catalogoService.obtenerPorCodigo(req.params.codigo);
    res.json(item);
  } catch (error) {
    next(error);
  }
}

async function listarUnidades(req, res, next) {
  try {
    const unidades = await catalogoService.listarUnidades();
    res.json({ unidades });
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, obtenerPorCodigo, listarUnidades };
