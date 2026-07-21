const multer = require('multer');

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Recurso no encontrado.' });
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: 'El archivo supera el tamaño máximo permitido (15MB).',
      LIMIT_FILE_COUNT: 'Se excedió el número máximo de archivos permitidos.'
    };
    return res.status(400).json({ error: messages[err.code] || err.message });
  }

  if (err && err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor.' });
}

module.exports = { notFoundHandler, errorHandler };
