/**
 * Helper compartido por las pruebas de integración de frontend: levanta la
 * app Express real en un puerto efímero y abre un Chrome real (vía
 * puppeteer-core, la misma dependencia que ya usan generate_*.js para
 * exportar los informes a PDF) apuntando a esa instancia.
 */
// puppeteer-core 25.x se distribuye como ESM puro; se carga con import()
// dinámico porque los archivos de prueba son CommonJS.
const app = require('../../../backend/src/app');
const pool = require('../../../backend/src/config/db');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function startTestEnv() {
  const { default: puppeteer } = await import('puppeteer-core');

  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });

  return { server, browser, baseUrl };
}

async function stopTestEnv({ server, browser }) {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
}

module.exports = { startTestEnv, stopTestEnv };
