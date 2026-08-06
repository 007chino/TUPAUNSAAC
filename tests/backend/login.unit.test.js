/**
 * Caso de uso: Autenticación administrativa (login)
 * Tipo: prueba UNITARIA — la capa de datos (authRepository) está mockeada,
 * así que solo se ejercita la lógica de negocio de authService en aislamiento.
 */
jest.mock('../../backend/src/repositories/authRepository');

const bcrypt = require('bcryptjs');
const authRepository = require('../../backend/src/repositories/authRepository');
const authService = require('../../backend/src/services/authService');

function cuentaDemo(overrides = {}) {
  return {
    clogin: 'ADMIN',
    cidtusuario: '1',
    nidtperfil: 1,
    cdescripcionperfil: 'ADMINISTRADOR',
    cnombres: 'Ana',
    cpaterno: 'Perez',
    cmaterno: 'Lopez',
    ccorreo: 'ana@unsaac.edu.pe',
    dfechainicio: null,
    dfechafin: null,
    ...overrides
  };
}

describe('authService.login (unitaria)', () => {
  afterEach(() => jest.clearAllMocks());

  test('rechaza si falta usuario o contraseña', async () => {
    await expect(authService.login('', '')).rejects.toMatchObject({ status: 400 });
    expect(authRepository.findLoginByUsername).not.toHaveBeenCalled();
  });

  test('rechaza usuario inexistente', async () => {
    authRepository.findLoginByUsername.mockResolvedValue(null);
    await expect(authService.login('NOEXISTE', 'cualquiera')).rejects.toMatchObject({ status: 401 });
  });

  test('rechaza contraseña incorrecta', async () => {
    const hash = await bcrypt.hash('Correcta#123', 4);
    authRepository.findLoginByUsername.mockResolvedValue(cuentaDemo({ ccontrasenia: hash }));

    await expect(authService.login('ADMIN', 'Incorrecta#000')).rejects.toMatchObject({ status: 401 });
  });

  test('rechaza cuenta aún no habilitada (dfechainicio en el futuro)', async () => {
    const hash = await bcrypt.hash('Correcta#123', 4);
    const manana = new Date(Date.now() + 24 * 60 * 60 * 1000);
    authRepository.findLoginByUsername.mockResolvedValue(cuentaDemo({ ccontrasenia: hash, dfechainicio: manana }));

    await expect(authService.login('ADMIN', 'Correcta#123')).rejects.toMatchObject({ status: 401 });
  });

  test('retorna token JWT y datos del usuario con credenciales válidas', async () => {
    const hash = await bcrypt.hash('Correcta#123', 4);
    authRepository.findLoginByUsername.mockResolvedValue(cuentaDemo({ ccontrasenia: hash }));

    const result = await authService.login('ADMIN', 'Correcta#123');

    expect(result.token).toEqual(expect.any(String));
    expect(result.token.split('.')).toHaveLength(3); // header.payload.signature
    expect(result.user).toMatchObject({
      clogin: 'ADMIN',
      perfil: 'ADMINISTRADOR',
      nombres: 'Ana Perez Lopez',
      correo: 'ana@unsaac.edu.pe'
    });
  });
});
