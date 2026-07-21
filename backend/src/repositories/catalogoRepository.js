const pool = require('../config/db');

async function listarCatalogo() {
  const [rows] = await pool.query(`
    SELECT
      ct.ccodigo AS codigo,
      ct.cdenominaciontramite AS denominacion,
      ct.cdescripcion AS descripcion,
      ct.ccodigobanco AS codigoBanco,
      ct.btienemontofijo AS tieneMontoFijo,
      (SELECT mt.nmonto FROM tmontotramite mt
        WHERE mt.ccodigo = ct.ccodigo AND mt.dfechafin IS NULL
        ORDER BY mt.dfechainicio DESC LIMIT 1) AS monto,
      (SELECT ut.nidtunidadorganizativa FROM tunidadtramite ut
        WHERE ut.ccodigo = ct.ccodigo LIMIT 1) AS officeId,
      (SELECT uo.cnombreunidadorganizativa FROM tunidadtramite ut
        INNER JOIN tunidadorganizativa uo ON uo.nidtunidadorganizativa = ut.nidtunidadorganizativa
        WHERE ut.ccodigo = ct.ccodigo LIMIT 1) AS office,
      (SELECT JSON_ARRAYAGG(tr.cdescripcionrequisito) FROM trequisitotramite tr
        WHERE tr.ccodigo = ct.ccodigo) AS requisitesJson
    FROM tcatalogotramite ct
    WHERE ct.btienemontofijo = 1
    ORDER BY ct.cdenominaciontramite
  `);

  return rows.map(row => ({
    codigo: row.codigo,
    denominacion: row.denominacion,
    descripcion: row.descripcion || '',
    codigoBanco: row.codigoBanco || 'BN-000',
    tieneMontoFijo: !!row.tieneMontoFijo,
    monto: row.monto !== null ? Number(row.monto) : 0,
    officeId: row.officeId,
    office: row.office || 'OFICINA POR ASIGNAR',
    requisites: Array.isArray(row.requisitesJson) && row.requisitesJson.length
      ? row.requisitesJson.filter(Boolean)
      : ['Solicitud dirigida a la autoridad competente.', 'Copia simple del DNI.', 'Recibo de pago del derecho administrativo.']
  }));
}

async function obtenerPorCodigo(codigo) {
  const catalogo = await listarCatalogo();
  return catalogo.find(item => item.codigo === codigo) || null;
}

async function montoActivo(ccodigo) {
  const [rows] = await pool.query(
    `SELECT nidtmontotramite AS id, nmonto AS monto
     FROM tmontotramite
     WHERE ccodigo = ? AND dfechafin IS NULL
     ORDER BY dfechainicio DESC LIMIT 1`,
    [ccodigo]
  );
  return rows[0] || null;
}

async function listarUnidadesOrganizativas() {
  const [rows] = await pool.query(
    'SELECT nidtunidadorganizativa AS id, cnombreunidadorganizativa AS nombre FROM tunidadorganizativa ORDER BY cnombreunidadorganizativa'
  );
  return rows;
}

module.exports = { listarCatalogo, obtenerPorCodigo, montoActivo, listarUnidadesOrganizativas };
