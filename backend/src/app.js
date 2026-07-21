const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./config/env');
const routes = require('./routes');
const { UPLOAD_ROOT } = require('./middleware/upload');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const PUBLIC_DIR = path.join(__dirname, '..', '..', 'public');

const app = express();

app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

// Los archivos adjuntos (vouchers/DNI/fotos) se sirven con nombres aleatorios
// no enumerables (ver middleware/upload.js) a modo de URL de capacidad.
app.use('/uploads', express.static(UPLOAD_ROOT));

app.use(express.static(PUBLIC_DIR));

app.use('/api', notFoundHandler);

// SPA fallback: cualquier ruta que no sea de la API devuelve el index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.use(errorHandler);

module.exports = app;
