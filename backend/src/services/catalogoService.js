const catalogoRepository = require('../repositories/catalogoRepository');
const AppError = require('../utils/AppError');

async function listar() {
  return catalogoRepository.listarCatalogo();
}

async function obtenerPorCodigo(codigo) {
  const item = await catalogoRepository.obtenerPorCodigo(codigo);
  if (!item) {
    throw new AppError(404, `No se encontró el trámite con código "${codigo}".`);
  }
  return item;
}

async function listarUnidades() {
  return catalogoRepository.listarUnidadesOrganizativas();
}

module.exports = { listar, obtenerPorCodigo, listarUnidades };
