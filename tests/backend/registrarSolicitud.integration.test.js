/**
 * Caso de uso: Registrar solicitud de trámite (portal del estudiante)
 * Tipo: prueba de INTEGRACIÓN — usa un trámite real del catálogo (MySQL local
 * de desarrollo) y ejercita ruta → controlador → servicio → repositorio →
 * stored procedure oficial `tupa_sp_registrar_solicitud_tramite` → historial.
 */
const request = require('supertest');
const app = require('../../backend/src/app');
const pool = require('../../backend/src/config/db');

afterAll(async () => {
  await pool.end();
});

function dniAleatorio() {
  // Prefijo fijo + sufijo aleatorio para no chocar con datos reales del dump
  // y poder distinguir a simple vista los registros creados por esta prueba.
  return `79${String(Math.floor(100000 + Math.random() * 899999))}`;
}

describe('POST /api/solicitudes (integración)', () => {
  test('rechaza un DNI inválido con 400', async () => {
    const res = await request(app)
      .post('/api/solicitudes')
      .field('dni', '123')
      .field('nombres', 'Test')
      .field('apellidoPaterno', 'Test')
      .field('procedureCode', 'PE123299E43');

    expect(res.status).toBe(400);
  });

  test('registra una solicitud real con adjunto y aparece luego en el rastreo público', async () => {
    const catalogoRes = await request(app).get('/api/catalogo');
    expect(catalogoRes.status).toBe(200);
    expect(catalogoRes.body.catalog.length).toBeGreaterThan(0);
    const tramite = catalogoRes.body.catalog[0];

    const dni = dniAleatorio();

    const crearRes = await request(app)
      .post('/api/solicitudes')
      .field('dni', dni)
      .field('nombres', 'María')
      .field('apellidoPaterno', 'Quispe')
      .field('apellidoMaterno', 'Huamán')
      .field('codigoAlumno', '190456')
      .field('correo', 'maria.test@unsaac.edu.pe')
      .field('telefono', '984123456')
      .field('procedureCode', tramite.codigo)
      .field('tipoSolicitante', '1')
      .field('voucher', '0001234567')
      .attach('files', Buffer.from('%PDF-1.4 contenido de prueba'), {
        filename: 'dni-prueba.pdf',
        contentType: 'application/pdf'
      });

    expect(crearRes.status).toBe(201);
    expect(crearRes.body.id).toEqual(expect.any(String));
    expect(crearRes.body.status).toBe('SOLICITADO');

    const rastreoRes = await request(app).get(`/api/solicitudes/rastreo?q=${dni}`);
    expect(rastreoRes.status).toBe(200);
    expect(rastreoRes.body.resultados).toHaveLength(1);

    const expediente = rastreoRes.body.resultados[0];
    expect(expediente.procedureCode).toBe(tramite.codigo);
    expect(expediente.dni).toBe(dni);
    expect(expediente.history[0]).toMatchObject({ status: 'SOLICITADO' });
    expect(expediente.history[0].descripcion).toContain('1 documento(s) adjunto(s)');
  });

  test('rechaza un código de trámite que no existe en el catálogo con 404', async () => {
    const res = await request(app)
      .post('/api/solicitudes')
      .field('dni', dniAleatorio())
      .field('nombres', 'Test')
      .field('apellidoPaterno', 'Test')
      .field('procedureCode', 'CODIGO-QUE-NO-EXISTE');

    expect(res.status).toBe(404);
  });
});
