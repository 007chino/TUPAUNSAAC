/**
 * Caso de uso: Rastreo público de expediente
 * Tipo: prueba UNITARIA — ejercita la función pura getStatusMeta()
 * de public/js/utils.js, usada para pintar el ícono/etiqueta de cada
 * paso de la línea de tiempo de trazabilidad.
 */
const { getStatusMeta } = require('../../public/js/utils');

describe('getStatusMeta (unitaria)', () => {
  test.each([
    ['SOLICITADO', 'SOLICITADO', 'fa-folder-open'],
    ['EN PROCESO', 'EN EVALUACIÓN', 'fa-hourglass-half'],
    ['PAGADO', 'PAGO COMPROBADO', 'fa-credit-card'],
    ['CERRADO', 'RESUELTO / FINALIZADO', 'fa-circle-check'],
    ['ANULADO', 'RECHAZADO / OBSERVADO', 'fa-circle-xmark']
  ])('mapea el estado %s a la etiqueta e ícono correctos', (status, label, icon) => {
    expect(getStatusMeta(status)).toEqual({ label, icon });
  });

  test('devuelve un valor por defecto seguro ante un estado desconocido', () => {
    const result = getStatusMeta('ESTADO-QUE-NO-EXISTE');
    expect(result).toEqual({ label: 'ESTADO-QUE-NO-EXISTE', icon: 'fa-circle-question' });
  });
});
