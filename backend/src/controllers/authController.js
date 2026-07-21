const authService = require('../services/authService');

async function login(req, res, next) {
  try {
    const { clogin, password } = req.body;
    const result = await authService.login(clogin, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { login, me };
