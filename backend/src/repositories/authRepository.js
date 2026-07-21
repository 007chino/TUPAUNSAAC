const pool = require('../config/db');

async function findLoginByUsername(clogin) {
  const [rows] = await pool.query(
    `SELECT l.clogin, l.cidtusuario, l.ccontrasenia, l.nidtperfil, l.dfechainicio, l.dfechafin,
            p.cdescripcionperfil,
            u.cnombres, u.cpaterno, u.cmaterno, u.ccorreo
     FROM tlogin l
     INNER JOIN tperfil p ON p.nidtperfil = l.nidtperfil
     INNER JOIN tusuario u ON u.cidtusuario = l.cidtusuario
     WHERE l.clogin = ?
     LIMIT 1`,
    [clogin]
  );
  return rows[0] || null;
}

module.exports = { findLoginByUsername };
