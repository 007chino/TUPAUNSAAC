const path = require('path');
const solicitudRepository = require('../repositories/solicitudRepository');
const catalogoRepository = require('../repositories/catalogoRepository');
const AppError = require('../utils/AppError');

const ESTADOS_VALIDOS = ['SOLICITADO', 'EN PROCESO', 'PAGADO', 'ANULADO', 'CERRADO'];
const TIPOS_SOLICITANTE_VALIDOS = [1, 2, 3];

const LOG_DESCRIPCIONES = {
  'SOLICITADO': 'Devuelto a estado inicial de recepción.',
  'EN PROCESO': 'Expediente digital evaluado. Requisitos y voucher en revisión. Derivado a la dependencia responsable.',
  'PAGADO': 'Pago validado por Tesorería/Caja UNSAAC.',
  'CERRADO': 'Procedimiento concluido con éxito. El documento solicitado está disponible.',
  'ANULADO': 'Trámite observado o anulado. Requisitos insuficientes o voucher inválido.'
};

async function crear(payload, files) {
  const {
    dni, nombres, apellidoPaterno, apellidoMaterno,
    codigoAlumno, correo, telefono,
    tipoSolicitante = 1, procedureCode, voucher
  } = payload;

  if (!dni || !/^\d{8}$/.test(String(dni))) {
    throw new AppError(400, 'El DNI debe tener 8 dígitos.');
  }
  if (!nombres || !apellidoPaterno) {
    throw new AppError(400, 'Nombres y apellido paterno son obligatorios.');
  }
  if (!procedureCode) {
    throw new AppError(400, 'Debes seleccionar un trámite del catálogo.');
  }
  if (voucher && String(voucher).length > 10) {
    throw new AppError(400, 'El número de voucher no puede superar los 10 caracteres.');
  }
  const tipo = Number(tipoSolicitante);
  if (!TIPOS_SOLICITANTE_VALIDOS.includes(tipo)) {
    throw new AppError(400, 'Tipo de solicitante inválido.');
  }

  const tramite = await catalogoRepository.obtenerPorCodigo(procedureCode);
  if (!tramite) {
    throw new AppError(404, `El trámite "${procedureCode}" no existe en el catálogo.`);
  }

  const montoInfo = await catalogoRepository.montoActivo(procedureCode);
  if (!montoInfo) {
    throw new AppError(409, `El trámite "${procedureCode}" no tiene un monto vigente configurado.`);
  }

  const info = await solicitudRepository.crearSolicitud({
    dni: String(dni),
    nombres,
    apellidoPaterno,
    apellidoMaterno,
    tipoSolicitante: tipo,
    ccodigo: procedureCode,
    nidtmontotramite: montoInfo.id,
    denominacion: tramite.denominacion,
    monto: montoInfo.monto
  });

  if (info.cestado !== 'CORRECTO') {
    throw new AppError(500, info.cmensaje || 'No se pudo registrar la solicitud.');
  }

  const internalId = info.ncodigo;

  await solicitudRepository.actualizarContactoSolicitante(String(dni), { codigoAlumno, correo, telefono });

  const archivos = (files || []).map(file => ({
    nombreOriginal: file.originalname,
    archivo: path.basename(file.path)
  }));

  if (voucher || archivos.length) {
    await solicitudRepository.adjuntarComprobante(internalId, { voucher, archivos });
  }

  await solicitudRepository.insertarHistorial(
    internalId,
    'SOLICITADO',
    `Trámite ingresado mediante portal web. ${archivos.length} documento(s) adjunto(s). Monto: S/. ${Number(montoInfo.monto).toFixed(2)}.`
  );

  return solicitudRepository.obtenerPorInternalId(internalId);
}

async function rastrear(query) {
  if (!query || !query.trim()) {
    throw new AppError(400, 'Ingresa un código de trámite o un DNI.');
  }
  const solicitudes = await solicitudRepository.obtenerPorCodigoODni(query.trim());
  const conHistorial = await Promise.all(
    solicitudes.map(async solicitud => {
      const historial = await solicitudRepository.historial(solicitud.internalId);
      return { ...solicitud, history: historial };
    })
  );
  return conHistorial;
}

async function listarBandeja(filtros) {
  return solicitudRepository.listar(filtros);
}

async function cambiarEstado(codigo, nuevoEstado, observacion, usuario) {
  if (!ESTADOS_VALIDOS.includes(nuevoEstado)) {
    throw new AppError(400, `Estado inválido. Debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
  }

  const actual = await solicitudRepository.obtenerInternalIdPorCodigo(codigo);
  if (!actual) {
    throw new AppError(404, `No se encontró el expediente "${codigo}".`);
  }

  if (nuevoEstado === 'PAGADO') {
    const info = await solicitudRepository.registrarPagoOficial(codigo);
    if (info.cestado !== 'CORRECTO') {
      throw new AppError(409, info.cmensaje || 'No se pudo registrar el pago.');
    }
  } else {
    await solicitudRepository.cambiarEstadoDirecto(actual.internalId, nuevoEstado);
  }

  const descripcion = observacion && observacion.trim()
    ? observacion.trim()
    : LOG_DESCRIPCIONES[nuevoEstado];

  await solicitudRepository.insertarHistorial(actual.internalId, nuevoEstado, descripcion, usuario);

  return solicitudRepository.obtenerPorInternalId(actual.internalId);
}

async function estadisticas() {
  return solicitudRepository.estadisticas();
}

module.exports = { crear, rastrear, listarBandeja, cambiarEstado, estadisticas };
