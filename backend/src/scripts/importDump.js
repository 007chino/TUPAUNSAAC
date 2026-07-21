// El dump oficial incluye procedimientos almacenados definidos con `DELIMITER ;;`,
// una directiva propia del cliente `mysql` que el driver mysql2 no interpreta.
// Por eso la importación se delega al binario `mysql` (disponible en cualquier
// imagen oficial de MySQL/MariaDB y en la instalación local de desarrollo).
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const mysql = require('mysql2/promise');
const env = require('../config/env');

const DUMP_PATH = path.join(__dirname, '..', '..', '..', 'bdtupa20260511.sql');

const CANDIDATE_BINARIES = [
  'mysql',
  'C:\\Program Files\\MySQL\\MySQL Server 8.4\\bin\\mysql.exe',
  'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe'
];

function findMysqlBinary() {
  for (const bin of CANDIDATE_BINARIES) {
    const result = spawnSync(bin, ['--version'], { stdio: 'ignore', shell: false });
    if (!result.error) return bin;
  }
  throw new Error('No se encontró el cliente "mysql" en el PATH ni en las rutas conocidas de Windows.');
}

async function ensureDatabaseExists() {
  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    charset: 'utf8mb4'
  });
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${env.db.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`
  );
  await connection.end();
}

async function main() {
  await ensureDatabaseExists();

  const mysqlBin = findMysqlBinary();
  console.log(`Importando ${DUMP_PATH} usando "${mysqlBin}"...`);

  const args = [
    `--host=${env.db.host}`,
    `--port=${env.db.port}`,
    `--user=${env.db.user}`,
    `--default-character-set=utf8mb4`,
    env.db.database
  ];

  const sqlBuffer = fs.readFileSync(DUMP_PATH);
  const result = spawnSync(mysqlBin, args, {
    input: sqlBuffer,
    stdio: ['pipe', 'inherit', 'inherit'],
    env: { ...process.env, MYSQL_PWD: env.db.password }
  });

  if (result.status !== 0) {
    throw new Error(`El cliente mysql terminó con código ${result.status}`);
  }
  console.log('Importación completada correctamente.');
}

main().catch(error => {
  console.error('Error importando el dump:', error.message);
  process.exit(1);
});
