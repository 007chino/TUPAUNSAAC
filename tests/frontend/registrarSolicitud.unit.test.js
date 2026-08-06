/**
 * Caso de uso: Registrar solicitud de trámite (portal del estudiante)
 * Tipo: prueba UNITARIA — ejercita la función pura validateSolicitudForm()
 * de public/js/utils.js, que replica en el cliente la misma regla de DNI
 * que valida el backend antes de armar el FormData y llamar a la API.
 */
const { validateSolicitudForm } = require('../../public/js/utils');

function datosValidos(overrides = {}) {
  return {
    dni: '73456123',
    nombres: 'María',
    apellidoPaterno: 'Quispe',
    requisitesTotal: 3,
    requisitesChecked: 3,
    ...overrides
  };
}

describe('validateSolicitudForm (unitaria)', () => {
  test('rechaza un DNI con menos de 8 dígitos', () => {
    const result = validateSolicitudForm(datosValidos({ dni: '123' }));
    expect(result).toEqual({ valid: false, error: 'El DNI debe tener 8 dígitos.' });
  });

  test('rechaza un DNI con letras', () => {
    const result = validateSolicitudForm(datosValidos({ dni: '7345612A' }));
    expect(result.valid).toBe(false);
  });

  test('rechaza nombres vacíos', () => {
    const result = validateSolicitudForm(datosValidos({ nombres: '  ' }));
    expect(result).toEqual({ valid: false, error: 'Los nombres son obligatorios.' });
  });

  test('rechaza apellido paterno vacío', () => {
    const result = validateSolicitudForm(datosValidos({ apellidoPaterno: '' }));
    expect(result).toEqual({ valid: false, error: 'El apellido paterno es obligatorio.' });
  });

  test('rechaza cuando falta marcar algún requisito obligatorio', () => {
    const result = validateSolicitudForm(datosValidos({ requisitesTotal: 3, requisitesChecked: 2 }));
    expect(result).toEqual({ valid: false, error: 'Debes confirmar todos los requisitos obligatorios antes de enviar.' });
  });

  test('acepta datos válidos con todos los requisitos marcados', () => {
    expect(validateSolicitudForm(datosValidos())).toEqual({ valid: true, error: null });
  });

  test('acepta datos válidos cuando el trámite no tiene requisitos configurados', () => {
    const result = validateSolicitudForm(datosValidos({ requisitesTotal: 0, requisitesChecked: 0 }));
    expect(result.valid).toBe(true);
  });
});
