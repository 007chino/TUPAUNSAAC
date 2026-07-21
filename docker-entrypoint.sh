#!/bin/sh
set -e

echo "Esperando a que MySQL acepte conexiones en $DB_HOST:$DB_PORT..."
until node -e "
require('mysql2/promise')
  .createConnection({ host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD })
  .then(c => c.end())
" 2>/dev/null; do
  sleep 2
done

echo "Aplicando migraciones propias de la aplicación..."
node backend/src/scripts/migrate.js

echo "Sembrando credenciales de demostración..."
node backend/src/scripts/seedDemoUsers.js || echo "Aviso: no se pudieron sembrar los usuarios demo (¿tlogin vacío?)."

echo "Iniciando el servidor..."
exec node backend/src/server.js
