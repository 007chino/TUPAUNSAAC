const solicitudRepository = require('../repositories/solicitudRepository');

async function estadisticas() {
  const { totales, porOficina } = await solicitudRepository.estadisticas();
  return {
    total: Number(totales.total) || 0,
    solicitado: Number(totales.solicitado) || 0,
    enProceso: Number(totales.enProceso) || 0,
    pagado: Number(totales.pagado) || 0,
    cerrado: Number(totales.cerrado) || 0,
    anulado: Number(totales.anulado) || 0,
    porOficina: porOficina.map(row => ({ office: row.office, total: Number(row.total) }))
  };
}

function toCsv(rows) {
  const header = ['ID Tramite', 'DNI', 'Codigo Alumno', 'Solicitante', 'Tramite', 'Oficina', 'Monto', 'Voucher', 'Estado', 'Fecha Registro'];
  const escape = value => `"${String(value ?? '').replace(/"/g, '""')}"`;

  const lines = rows.map(r => [
    r.id,
    r.dni,
    r.codigoAlumno,
    `${r.nombres} ${r.apellidoPaterno} ${r.apellidoMaterno || ''}`.trim(),
    r.procedureName,
    r.office,
    Number(r.monto).toFixed(2),
    r.voucher,
    r.status,
    r.fechaRegistro
  ].map(escape).join(','));

  return [header.join(','), ...lines].join('\n');
}

async function exportarCsv() {
  const rows = await solicitudRepository.listar({ limit: null });
  return toCsv(rows);
}

module.exports = { estadisticas, exportarCsv };
