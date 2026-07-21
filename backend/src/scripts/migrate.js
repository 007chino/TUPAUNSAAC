const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const env = require('../config/env');

const MIGRATIONS_PATH = path.join(__dirname, '..', '..', '..', 'database', 'migrations.sql');

async function main() {
  const sql = fs.readFileSync(MIGRATIONS_PATH, 'utf8');

  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
    charset: 'utf8mb4',
    multipleStatements: true
  });

  console.log('Aplicando migraciones propias de la aplicación...');
  try {
    await connection.query(sql);
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Las columnas ya existían; se omite ese paso.');
    } else {
      throw error;
    }
  }
  await connection.end();
  console.log('Migraciones aplicadas correctamente.');
}

main().catch(error => {
  console.error('Error aplicando migraciones:', error.message);
  process.exit(1);
});
