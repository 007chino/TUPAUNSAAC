/**
 * Caso de uso: Filtrar catálogo de trámites (portal del estudiante)
 * Tipo: prueba UNITARIA — ejercita la función pura filterCatalogItems()
 * de public/js/utils.js, sin DOM y sin red.
 */
const { filterCatalogItems } = require('../../public/js/utils');

const CATALOGO = [
  { codigo: 'PE123299E43', denominacion: 'Acceso a la información pública', descripcion: 'Solicitud de información', office: 'SECRETARÍA GENERAL' },
  { codigo: 'PE100011E01', denominacion: 'Constancia de matrícula', descripcion: 'Documento que acredita matrícula vigente', office: 'REGISTRO ACADÉMICO' },
  { codigo: 'PE100022E02', denominacion: 'Duplicado de carné universitario', descripcion: 'Reposición de carné por pérdida o deterioro', office: 'REGISTRO ACADÉMICO' }
];

describe('filterCatalogItems (unitaria)', () => {
  test('sin filtros devuelve el catálogo completo', () => {
    expect(filterCatalogItems(CATALOGO, '', '')).toHaveLength(3);
  });

  test('filtra por texto en la denominación, sin importar mayúsculas/minúsculas', () => {
    const result = filterCatalogItems(CATALOGO, 'MATRÍCULA', '');
    expect(result).toHaveLength(1);
    expect(result[0].codigo).toBe('PE100011E01');
  });

  test('filtra por texto en la descripción', () => {
    const result = filterCatalogItems(CATALOGO, 'reposición', '');
    expect(result.map(i => i.codigo)).toEqual(['PE100022E02']);
  });

  test('filtra por código exacto o parcial', () => {
    const result = filterCatalogItems(CATALOGO, 'pe1232', '');
    expect(result).toHaveLength(1);
  });

  test('filtra por oficina', () => {
    const result = filterCatalogItems(CATALOGO, '', 'REGISTRO ACADÉMICO');
    expect(result).toHaveLength(2);
  });

  test('combina texto + oficina y solo devuelve la intersección', () => {
    const result = filterCatalogItems(CATALOGO, 'carné', 'REGISTRO ACADÉMICO');
    expect(result).toHaveLength(1);
    expect(result[0].codigo).toBe('PE100022E02');
  });

  test('devuelve arreglo vacío si ningún trámite coincide', () => {
    expect(filterCatalogItems(CATALOGO, 'no-existe-esto', '')).toHaveLength(0);
  });
});
