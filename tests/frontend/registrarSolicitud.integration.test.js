/**
 * Caso de uso: Registrar solicitud de trámite (portal del estudiante)
 * Tipo: prueba de INTEGRACIÓN — completa el formulario real en Chrome
 * (selección de trámite, datos personales, checklist de requisitos,
 * adjunto de archivo y voucher) y confirma que el flujo llega hasta
 * el backend real y hasta el rastreo público.
 */
const path = require('path');
const { startTestEnv, stopTestEnv } = require('./helpers/testEnv');

const ARCHIVO_PRUEBA = path.join(__dirname, '..', 'fixtures', 'documento-prueba.pdf');

function dniAleatorio() {
  return `78${String(Math.floor(100000 + Math.random() * 899999))}`;
}

describe('Registrar solicitud de trámite (integración E2E)', () => {
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

  test('completa el formulario y el backend confirma el registro del expediente', async () => {
    await page.click('[data-tab="student-submit"]');
    await page.waitForSelector('#submit-tramite-select option[value]:not([value=""])');

    const codigoTramite = await page.$eval(
      '#submit-tramite-select option[value]:not([value=""])',
      (opt) => opt.value
    );
    await page.select('#submit-tramite-select', codigoTramite);

    // El cambio de trámite dispara updateFormRequisites(), que pinta el checklist dinámico.
    await page.waitForFunction(
      () => document.querySelectorAll('#form-requisite-checklist input[type="checkbox"]').length > 0
    );
    await page.$$eval('#form-requisite-checklist input[type="checkbox"]', (boxes) => {
      boxes.forEach((box) => { box.checked = true; });
    });

    const dni = dniAleatorio();
    await page.type('#student-dni', dni);
    await page.type('#student-names', 'Luz Marina');
    await page.type('#student-apellido-paterno', 'Ccahuana');
    await page.type('#student-apellido-materno', 'Huillca');
    await page.type('#student-email', 'luz.test@unsaac.edu.pe');
    await page.type('#student-phone', '987654321');
    await page.type('#payment-voucher', '9988776655');

    const fileInput = await page.$('#form-file-input');
    await fileInput.uploadFile(ARCHIVO_PRUEBA);

    const dialogoPromesa = new Promise((resolve) => {
      page.once('dialog', async (dialog) => {
        const mensaje = dialog.message();
        await dialog.accept();
        resolve(mensaje);
      });
    });

    await page.click('#submit-tramite-form button[type="submit"]');
    const mensajeAlerta = await dialogoPromesa;

    expect(mensajeAlerta).toContain('¡Solicitud enviada con éxito!');
    expect(mensajeAlerta).toContain('Código de Trámite:');

    // Tras cerrar la alerta, la app rastrea el expediente recién creado y cambia de pestaña.
    await page.waitForSelector('#student-track.tab-view.active');
    await page.waitForSelector('#tracking-result-box[style*="display: block"]');

    const contenidoRastreo = await page.$eval('#tracking-result-box', (el) => el.textContent);
    expect(contenidoRastreo).toContain('SOLICITADO');
  }, 30000);
});
