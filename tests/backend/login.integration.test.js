/**
 * Caso de uso: Autenticación administrativa (login)
 * Tipo: prueba de INTEGRACIÓN — ejercita la app Express real de punta a punta
 * (ruta → controlador → servicio → repositorio → MySQL local de desarrollo,
 * ya importado con el dump oficial y sembrado con `npm run db:seed`).
 */
const request = require('supertest');
const app = require('../../backend/src/app');
const pool = require('../../backend/src/config/db');

afterAll(async () => {
  await pool.end();
});

describe('POST /api/auth/login (integración)', () => {
  test('rechaza credenciales incorrectas con 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ clogin: 'ADMIN', password: 'password-incorrecta' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('rechaza body incompleto con 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ clogin: 'ADMIN' });
    expect(res.status).toBe(400);
  });

  test('acepta las credenciales demo de ADMIN y devuelve un JWT usable', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ clogin: 'ADMIN', password: 'Admin#2026' });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toEqual(expect.any(String));
    expect(loginRes.body.user).toMatchObject({ clogin: 'ADMIN', perfil: expect.any(String) });

    // El token debe servir de inmediato para acceder a una ruta protegida real.
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.clogin).toBe('ADMIN');
  });

  test('GET /api/auth/me sin token devuelve 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
