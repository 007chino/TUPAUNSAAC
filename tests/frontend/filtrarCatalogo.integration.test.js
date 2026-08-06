/**
 * Caso de uso: Filtrar catálogo de trámites (portal del estudiante)
 * Tipo: prueba de INTEGRACIÓN — abre Chrome real contra la app completa
 * (Express + MySQL) y ejercita la búsqueda tal como la usaría un
 * administrado real, verificando el DOM resultante.
 */
const { startTestEnv, stopTestEnv } = require('./helpers/testEnv');

describe('Filtrar catálogo de trámites (integración E2E)', () => {
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

  test('el catálogo carga múltiples trámites reales desde la API', async () => {
    const total = await page.$$eval('.catalog-card', (els) => els.length);
    expect(total).toBeGreaterThan(1);
  });

  test('buscar por el código de un trámite deja visible solo esa tarjeta', async () => {
    const totalInicial = await page.$$eval('.catalog-card', (els) => els.length);
    const codigo = await page.$eval('.catalog-card .procedure-code', (el) => el.textContent.trim());

    await page.$eval('#catalog-search-box', (el) => { el.value = ''; });
    await page.type('#catalog-search-box', codigo);
    await page.waitForFunction(
      (n) => document.querySelectorAll('.catalog-card').length < n,
      {},
      totalInicial
    );

    const codigosVisibles = await page.$$eval('.catalog-card .procedure-code', (els) => els.map((e) => e.textContent.trim()));
    expect(codigosVisibles).toEqual([codigo]);
  });

  test('una búsqueda sin coincidencias muestra el estado vacío', async () => {
    await page.$eval('#catalog-search-box', (el) => { el.value = ''; });
    await page.type('#catalog-search-box', 'xxxxx-texto-que-no-existe-en-ningun-tramite-xxxxx');
    await page.waitForFunction(() => document.querySelectorAll('.catalog-card').length === 0);

    const mensaje = await page.$eval('#catalog-cards-container', (el) => el.textContent);
    expect(mensaje).toContain('No se encontraron trámites');

    // Deja el buscador limpio para no afectar otras pruebas de este archivo.
    await page.$eval('#catalog-search-box', (el) => { el.value = ''; });
    await page.evaluate(() => filterCatalog());
  });
});
