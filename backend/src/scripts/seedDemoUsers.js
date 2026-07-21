// Restablece contraseñas conocidas para las cuentas administrativas de demostración
// que ya existen en el dump (tlogin). No se inserta información nueva de alumnos:
// solo se sobrescribe el hash de contraseña de cuentas de prueba para que el panel
// administrativo sea utilizable inmediatamente después de desplegar.
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const DEMO_PASSWORD = 'Demo#2026';

const DEMO_ACCOUNTS = [
  { clogin: 'ADMIN', password: 'Admin#2026' },
  { clogin: '24007146', password: DEMO_PASSWORD },
  { clogin: '44760467', password: DEMO_PASSWORD },
  { clogin: 'OTI_RECAUDACION', password: DEMO_PASSWORD }
];

async function main() {
  for (const account of DEMO_ACCOUNTS) {
    const hash = await bcrypt.hash(account.password, 10);
    const [result] = await pool.query(
      'UPDATE tlogin SET ccontrasenia = ? WHERE clogin = ?',
      [hash, account.clogin]
    );
    if (result.affectedRows > 0) {
      console.log(`Contraseña actualizada para "${account.clogin}" -> "${account.password}"`);
    } else {
      console.warn(`No se encontró el login "${account.clogin}" en tlogin (se omitió).`);
    }
  }
  await pool.end();
  console.log('\nCredenciales de demostración listas. Consulta el README para la lista completa.');
}

main().catch(error => {
  console.error('Error creando usuarios demo:', error.message);
  process.exit(1);
});
