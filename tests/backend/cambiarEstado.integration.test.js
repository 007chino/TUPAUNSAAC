/**
 * Caso de uso: Cambiar estado del expediente con trazabilidad (panel administrativo)
 * Tipo: prueba de INTEGRACIÓN — crea un expediente real, inicia sesión con las
 * credenciales demo y cambia su estado a través de la ruta protegida real,
 * verificando que el historial de trazabilidad quede registrado en MySQL.
 */
const request = require('supertest');
const app = require('../../backend/src/app');
const pool = require('../../backend/src/config/db');

afterAll(async () => {
  await pool.end();
});

async function crearSolicitudDePrueba() {
  const catalogoRes = await request(app).get('/api/catalogo');
  const tramite = catalogoRes.body.catalog[0];
  const dni = `79${String(Math.floor(100000 + Math.random() * 899999))}`;

  const res = await request(app)
    .post('/api/solicitudes')
    .field('dni', dni)
    .field('nombres', 'Carlos')
    .field('apellidoPaterno', 'Mamani')
    .field('procedureCode', tramite.codigo)
    .field('tipoSolicitante', '1');

  return { id: res.body.id, dni };
}

describe('PATCH /api/solicitudes/:id/estado (integración)', () => {
  let token;

  beforeAll(async () => {
    const loginRes = await request(app).post('/api/auth/login').send({ clogin: 'ADMIN', password: 'Admin#2026' });
    token = loginRes.body.token;
  });

  test('rechaza el cambio de estado sin token de sesión', async () => {
    const { id } = await crearSolicitudDePrueba();
    const res = await request(app).patch(`/api/solicitudes/${id}/estado`).send({ estado: 'EN PROCESO' });
    expect(res.status).toBe(401);
  });

  test('rechaza un estado inválido con 400', async () => {
    const { id } = await crearSolicitudDePrueba();
    const res = await request(app)
      .patch(`/api/solicitudes/${id}/estado`)
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: 'ESTADO-INVENTADO' });
    expect(res.status).toBe(400);
  });

  test('cambia el estado a EN PROCESO y agrega el paso al historial de trazabilidad', async () => {
    const { id, dni } = await crearSolicitudDePrueba();

    const patchRes = await request(app)
      .patch(`/api/solicitudes/${id}/estado`)
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: 'EN PROCESO' });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.status).toBe('EN PROCESO');

    const rastreoRes = await request(app).get(`/api/solicitudes/rastreo?q=${dni}`);
    const historial = rastreoRes.body.resultados[0].history;

    expect(historial).toHaveLength(2);
    expect(historial[0]).toMatchObject({ status: 'EN PROCESO' }); // más reciente primero
    expect(historial[1]).toMatchObject({ status: 'SOLICITADO' });
  });

  test('devuelve 404 al intentar cambiar el estado de un expediente que no existe', async () => {
    const res = await request(app)
      .patch('/api/solicitudes/TR-NO-EXISTE/estado')
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: 'EN PROCESO' });
    expect(res.status).toBe(404);
  });
});
