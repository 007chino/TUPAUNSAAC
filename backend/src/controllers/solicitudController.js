const solicitudService = require('../services/solicitudService');

async function crear(req, res, next) {
  try {
    const solicitud = await solicitudService.crear(req.body, req.files);
    res.status(201).json(solicitud);
  } catch (error) {
    next(error);
  }
}

async function rastrear(req, res, next) {
  try {
    const query = req.query.q || req.query.query || '';
    const resultados = await solicitudService.rastrear(query);
    res.json({ resultados });
  } catch (error) {
    next(error);
  }
}

async function listar(req, res, next) {
  try {
    const { estado, officeId, search } = req.query;
    const resultados = await solicitudService.listarBandeja({ estado, officeId, search });
    res.json({ resultados });
  } catch (error) {
    next(error);
  }
}

async function cambiarEstado(req, res, next) {
  try {
    const { estado, observacion } = req.body;
    const actualizado = await solicitudService.cambiarEstado(req.params.id, estado, observacion, req.user?.cidtusuario);
    res.json(actualizado);
  } catch (error) {
    next(error);
  }
}

module.exports = { crear, rastrear, listar, cambiarEstado };
