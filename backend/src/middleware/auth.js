const jwt = require('jsonwebtoken');
const env = require('../config/env');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Se requiere autenticación. Inicia sesión en el panel administrativo.' });
  }

  try {
    req.user = jwt.verify(token, env.jwt.secret);
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Sesión inválida o expirada. Vuelve a iniciar sesión.' });
  }
}

module.exports = { requireAuth };
