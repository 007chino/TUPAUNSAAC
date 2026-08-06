/**
 * Caso de uso: Rastreo público de expediente
 * Tipo: prueba de INTEGRACIÓN — siembra un expediente real a través de la
 * API (backend real + MySQL) y luego usa Chrome real para buscarlo desde
 * la pestaña de rastreo pública, verificando que la línea de tiempo se
 * renderice con los datos que realmente devuelve el servidor.
 */
const request = require('supertest');
const app = require('../../backend/src/app');
const { startTestEnv, stopTestEnv } = require('./helpers/testEnv');

function dniAleatorio() {
  return `77${String(Math.floor(100000 + Math.random() * 899999))}`;
}

async function sembrarSolicitud() {
  const catalogoRes = await request(app).get('/api/catalogo');
  const tramite = catalogoRes.body.catalog[0];
  const dni = dniAleatorio();

  const res = await request(app)
    .post('/api/solicitudes')
    .field('dni', dni)
    .field('nombres', 'Wilbert')
    .field('apellidoPaterno', 'Yupanqui')
    .field('procedureCode', tramite.codigo)
    .field('tipoSolicitante', '1');

  return { dni, id: res.body.id, denominacion: tramite.denominacion };
}

describe('Rastreo público de expediente (integración E2E)', () => {
  let env;
  let page;

  beforeAll(async () => {
    env = await startTestEnv();
    page = await env.browser.newPage();
    await page.goto(env.baseUrl, { waitUntil: 'networkidle0' });
    await page.waitForSelector('.catalog-card');
  }, 30000);

  afterAll(async () => {
    await page.close();
    await stopTestEnv(env);
  });

  test('rastrear por DNI muestra el expediente recién creado con su historial', async () => {
    const solicitud = await sembrarSolicitud();

    await page.click('[data-tab="student-track"]');
    await page.type('#tracking-input-id', solicitud.dni);
    await page.click('#student-track button.btn-primary');

    await page.waitForFunction(
      () => document.getElementById('tracking-result-box').style.display === 'block'
    );

    const contenido = await page.$eval('#tracking-result-box', (el) => el.textContent);
    expect(contenido).toContain(solicitud.id);
    expect(contenido).toContain('SOLICITADO');
  }, 30000);

  test('rastrear un código inexistente muestra el estado de "no encontrado"', async () => {
    await page.click('[data-tab="student-track"]');
    await page.$eval('#tracking-input-id', (el) => { el.value = ''; });
    await page.type('#tracking-input-id', 'TR-CODIGO-INVENTADO-0000');
    await page.click('#student-track button.btn-primary');

    await page.waitForFunction(
      () => document.getElementById('tracking-empty-state').style.display === 'block'
    );
    const mensaje = await page.$eval('#tracking-empty-state', (el) => el.textContent);
    expect(mensaje).toContain('Expediente No Encontrado');
  }, 30000);
});
