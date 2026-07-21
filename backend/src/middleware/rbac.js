function requireRole(...allowedProfiles) {
  return function rbacMiddleware(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: 'Se requiere autenticación.' });
    }
    if (!allowedProfiles.includes(req.user.perfil)) {
      return res.status(403).json({
        error: `Tu perfil (${req.user.perfil}) no tiene permisos para realizar esta acción.`
      });
    }
    return next();
  };
}

module.exports = { requireRole };
