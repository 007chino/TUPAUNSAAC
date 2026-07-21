const pool = require('../config/db');

const SELECT_BASE = `
  SELECT
    st.nidtsolicitudtramite AS internalId,
    st.cidtsolicitudtramite AS id,
    st.nnumerotramite AS numeroTramite,
    st.cestado AS status,
    st.dfechapeticion AS fechaPeticion,
    st.dfecharegistro AS fechaRegistro,
    st.cnumerotransaccion AS voucher,
    st.ccomprobantepath AS archivosJson,
    st.dfechapago AS fechaPago,
    st.cnumerorecibocaja AS numeroRecibo,
    sol.ccodigosolicitante AS codigoSolicitante,
    sol.cnumerodocumento AS dni,
    sol.ccodigoalumno AS codigoAlumno,
    sol.cnombres AS nombres,
    sol.capellidopaterno AS apellidoPaterno,
    sol.capellidomaterno AS apellidoMaterno,
    sol.ccorreo AS email,
    sol.ctelefono AS phone,
    (SELECT d.ccodigo FROM tsolicitudtramitedetalle d
      WHERE d.nidtsolicitudtramite = st.nidtsolicitudtramite
      ORDER BY d.nidtsolicitudtramitedetalle LIMIT 1) AS procedureCode,
    (SELECT GROUP_CONCAT(d.cdescripcion SEPARATOR '; ') FROM tsolicitudtramitedetalle d
      WHERE d.nidtsolicitudtramite = st.nidtsolicitudtramite) AS procedureName,
    (SELECT SUM(d.nmontotramite) FROM tsolicitudtramitedetalle d
      WHERE d.nidtsolicitudtramite = st.nidtsolicitudtramite) AS monto,
    (SELECT uo.cnombreunidadorganizativa FROM tsolicitudtramitedetalle d
      INNER JOIN tunidadtramite ut ON ut.ccodigo = d.ccodigo
      INNER JOIN tunidadorganizativa uo ON uo.nidtunidadorganizativa = ut.nidtunidadorganizativa
      WHERE d.nidtsolicitudtramite = st.nidtsolicitudtramite LIMIT 1) AS office
  FROM tsolicitudtramite st
  INNER JOIN tsolicitante sol ON sol.ccodigosolicitante = st.ccodigosolicitante
`;

function mapRow(row) {
  if (!row) return null;
  let files = [];
  if (row.archivosJson) {
    try {
      files = JSON.parse(row.archivosJson);
    } catch {
      files = [row.archivosJson];
    }
  }
  return {
    internalId: row.internalId,
    id: row.id,
    numeroTramite: row.numeroTramite,
    status: row.status,
    fechaPeticion: row.fechaPeticion,
    fechaRegistro: row.fechaRegistro,
    voucher: row.voucher || '',
    files,
    fechaPago: row.fechaPago,
    numeroRecibo: row.numeroRecibo,
    dni: row.dni,
    codigoAlumno: row.codigoAlumno || '',
    nombres: row.nombres,
    apellidoPaterno: row.apellidoPaterno,
    apellidoMaterno: row.apellidoMaterno,
    email: row.email || '',
    phone: row.phone || '',
    procedureCode: row.procedureCode,
    procedureName: row.procedureName,
    monto: row.monto !== null ? Number(row.monto) : 0,
    office: row.office || 'OFICINA POR ASIGNAR'
  };
}

async function crearSolicitud({ dni, nombres, apellidoPaterno, apellidoMaterno, tipoSolicitante, ccodigo, nidtmontotramite, denominacion, monto }) {
  const [results] = await pool.query(
    'CALL tupa_sp_registrar_solicitud_tramite(?,?,?,?,?,?,?,?,?,?,?,?)',
    [dni, dni, nombres, apellidoPaterno, apellidoMaterno || '', tipoSolicitante, new Date(), ccodigo, String(nidtmontotramite), denominacion, '1', String(monto)]
  );
  const info = results[0][0];
  return info;
}

async function actualizarContactoSolicitante(codigoSolicitante, { codigoAlumno, correo, telefono }) {
  await pool.query(
    'UPDATE tsolicitante SET ccodigoalumno = ?, ccorreo = ?, ctelefono = ? WHERE ccodigosolicitante = ?',
    [codigoAlumno || null, correo || null, telefono || null, codigoSolicitante]
  );
}

async function adjuntarComprobante(nidtsolicitudtramite, { voucher, archivos }) {
  await pool.query(
    'UPDATE tsolicitudtramite SET cnumerotransaccion = ?, ccomprobantepath = ?, dfechatransaccion = NOW(), dfechasubidoarchivo = NOW() WHERE nidtsolicitudtramite = ?',
    [voucher || null, archivos && archivos.length ? JSON.stringify(archivos) : null, nidtsolicitudtramite]
  );
}

async function insertarHistorial(nidtsolicitudtramite, estado, descripcion, cidtusuario) {
  await pool.query(
    'INSERT INTO tsolicitudtramitehistorial (nidtsolicitudtramite, cestado, cdescripcion, cidtusuario) VALUES (?,?,?,?)',
    [nidtsolicitudtramite, estado, descripcion, cidtusuario || null]
  );
}

async function obtenerPorInternalId(nidtsolicitudtramite) {
  const [rows] = await pool.query(`${SELECT_BASE} WHERE st.nidtsolicitudtramite = ?`, [nidtsolicitudtramite]);
  return mapRow(rows[0]);
}

async function obtenerPorCodigoODni(query) {
  const [rows] = await pool.query(
    `${SELECT_BASE} WHERE st.cidtsolicitudtramite = ? OR sol.cnumerodocumento = ? ORDER BY st.dfecharegistro DESC`,
    [query, query]
  );
  return rows.map(mapRow);
}

async function obtenerInternalIdPorCodigo(cidtsolicitudtramite) {
  const [rows] = await pool.query(
    'SELECT nidtsolicitudtramite AS internalId, cestado FROM tsolicitudtramite WHERE cidtsolicitudtramite = ?',
    [cidtsolicitudtramite]
  );
  return rows[0] || null;
}

async function listar({ estado, officeId, search, limit = 500 } = {}) {
  const conditions = [];
  const params = [];

  if (estado) {
    conditions.push('st.cestado = ?');
    params.push(estado);
  }
  if (officeId) {
    conditions.push(`EXISTS (
      SELECT 1 FROM tsolicitudtramitedetalle d
      INNER JOIN tunidadtramite ut ON ut.ccodigo = d.ccodigo
      WHERE d.nidtsolicitudtramite = st.nidtsolicitudtramite AND ut.nidtunidadorganizativa = ?
    )`);
    params.push(officeId);
  }
  if (search) {
    conditions.push(`(
      st.cidtsolicitudtramite LIKE ? OR sol.cnumerodocumento LIKE ? OR sol.cnombres LIKE ? OR sol.capellidopaterno LIKE ?
      OR EXISTS (SELECT 1 FROM tsolicitudtramitedetalle d WHERE d.nidtsolicitudtramite = st.nidtsolicitudtramite AND d.cdescripcion LIKE ?)
    )`);
    const like = `%${search}%`;
    params.push(like, like, like, like, like);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limitClause = Number.isFinite(limit) ? `LIMIT ${Math.max(1, Math.floor(limit))}` : '';
  const [rows] = await pool.query(`${SELECT_BASE} ${where} ORDER BY st.dfecharegistro DESC ${limitClause}`, params);
  return rows.map(mapRow);
}

async function cambiarEstadoDirecto(nidtsolicitudtramite, estado) {
  await pool.query('UPDATE tsolicitudtramite SET cestado = ? WHERE nidtsolicitudtramite = ?', [estado, nidtsolicitudtramite]);
}

async function registrarPagoOficial(cidtsolicitudtramite) {
  const [results] = await pool.query(
    'CALL tupa_sp_registrar_pago_solicitud_tramite(?, ?)',
    [cidtsolicitudtramite, new Date()]
  );
  return results[0][0];
}

async function historial(nidtsolicitudtramite) {
  const [rows] = await pool.query(
    'SELECT cestado AS status, cdescripcion AS descripcion, dfecha AS fecha FROM tsolicitudtramitehistorial WHERE nidtsolicitudtramite = ? ORDER BY dfecha DESC, nidthistorial DESC',
    [nidtsolicitudtramite]
  );
  return rows;
}

async function estadisticas() {
  const [[totales]] = await pool.query(`
    SELECT
      COUNT(*) AS total,
      SUM(cestado = 'SOLICITADO') AS solicitado,
      SUM(cestado = 'EN PROCESO') AS enProceso,
      SUM(cestado IN ('PAGADO','PAGADO SIN ADJUNTO')) AS pagado,
      SUM(cestado = 'CERRADO') AS cerrado,
      SUM(cestado = 'ANULADO') AS anulado
    FROM tsolicitudtramite
  `);

  const [porOficina] = await pool.query(`
    SELECT COALESCE(uo.cnombreunidadorganizativa, 'SIN ASIGNAR') AS office, COUNT(*) AS total
    FROM tsolicitudtramite st
    LEFT JOIN tsolicitudtramitedetalle std ON std.nidtsolicitudtramite = st.nidtsolicitudtramite
    LEFT JOIN tunidadtramite ut ON ut.ccodigo = std.ccodigo
    LEFT JOIN tunidadorganizativa uo ON uo.nidtunidadorganizativa = ut.nidtunidadorganizativa
    GROUP BY office
    ORDER BY total DESC
  `);

  return { totales, porOficina };
}

module.exports = {
  mapRow,
  crearSolicitud,
  actualizarContactoSolicitante,
  adjuntarComprobante,
  insertarHistorial,
  obtenerPorInternalId,
  obtenerPorCodigoODni,
  obtenerInternalIdPorCodigo,
  listar,
  cambiarEstadoDirecto,
  registrarPagoOficial,
  historial,
  estadisticas
};
