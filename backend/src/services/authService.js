const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const authRepository = require('../repositories/authRepository');

async function login(clogin, password) {
  if (!clogin || !password) {
    throw new AppError(400, 'Usuario y contraseña son obligatorios.');
  }

  const account = await authRepository.findLoginByUsername(clogin);
  if (!account) {
    throw new AppError(401, 'Usuario o contraseña incorrectos.');
  }

  const now = new Date();
  if (account.dfechainicio && now < new Date(account.dfechainicio)) {
    throw new AppError(401, 'La cuenta aún no está habilitada.');
  }
  if (account.dfechafin && now > new Date(account.dfechafin)) {
    throw new AppError(401, 'La cuenta ha expirado.');
  }

  const passwordMatches = await bcrypt.compare(password, account.ccontrasenia || '');
  if (!passwordMatches) {
    throw new AppError(401, 'Usuario o contraseña incorrectos.');
  }

  const payload = {
    clogin: account.clogin,
    cidtusuario: account.cidtusuario,
    perfil: account.cdescripcionperfil,
    nidtperfil: account.nidtperfil
  };

  const token = jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn });

  return {
    token,
    user: {
      clogin: account.clogin,
      nombres: [account.cnombres, account.cpaterno, account.cmaterno].filter(Boolean).join(' '),
      correo: account.ccorreo,
      perfil: account.cdescripcionperfil
    }
  };
}

module.exports = { login };
