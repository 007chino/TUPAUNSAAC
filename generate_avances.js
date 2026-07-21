const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@600;700;800&display=swap');

  :root {
    --guinda: #7B1828;
    --guinda-light: #A52035;
    --guinda-pale: #f5eaec;
    --text: #1C0A0E;
    --muted: #6B3040;
    --border: #d4b0b7;
    --white: #ffffff;
    --ok-bg: #dcfce7; --ok-fg: #166534;
    --curso-bg: #fef3c7; --curso-fg: #92400e;
    --pend-bg: #f1f5f9; --pend-fg: #475569;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
    font-size: 10.5pt;
    color: var(--text);
    line-height: 1.6;
    background: white;
  }

  .page-break { page-break-before: always; }

  .cover {
    display: flex; flex-direction: column; align-items: center;
    justify-content: space-between; min-height: 277mm;
    background: white; padding: 0;
  }
  .cover-header {
    background: var(--guinda); width: 100%;
    padding: 30px 40px; text-align: center;
  }
  .cover-header h1 {
    font-family: 'Outfit', sans-serif; color: white;
    font-size: 18pt; font-weight: 800; letter-spacing: 1px;
    margin-bottom: 6px;
  }
  .cover-header p {
    color: rgba(255,255,255,0.82); font-size: 10pt;
    font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase;
  }
  .cover-body {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 40px;
  }
  .cover-badge {
    background: var(--guinda-pale); border: 2px solid var(--guinda);
    border-radius: 8px; padding: 6px 18px; font-size: 9pt;
    font-weight: 700; color: var(--guinda); letter-spacing: 1px;
    text-transform: uppercase; margin-bottom: 24px;
  }
  .cover-title {
    font-family: 'Outfit', sans-serif; font-size: 22pt;
    font-weight: 800; color: var(--guinda); text-align: center;
    line-height: 1.25; margin-bottom: 12px; max-width: 480px;
  }
  .cover-subtitle {
    font-size: 12pt; font-weight: 600; color: var(--muted);
    text-align: center; margin-bottom: 30px;
  }
  .cover-divider {
    width: 80px; height: 4px; background: var(--guinda);
    border-radius: 2px; margin: 0 auto 30px;
  }
  .cover-meta { width: 100%; max-width: 480px; }
  .cover-meta-row {
    display: flex; gap: 12px; padding: 8px 0;
    border-bottom: 1px solid var(--border);
    font-size: 10pt;
  }
  .cover-meta-row .label {
    font-weight: 700; color: var(--guinda); min-width: 170px;
  }
  .cover-footer {
    background: var(--guinda-pale); width: 100%; padding: 14px 40px;
    border-top: 3px solid var(--guinda); text-align: center;
    font-size: 9pt; color: var(--muted); font-weight: 600;
  }

  .doc-header {
    background: var(--guinda); color: white; padding: 10px 30px;
    margin-bottom: 28px; display: flex; justify-content: space-between;
    align-items: center; border-radius: 0 0 8px 8px;
  }
  .doc-header .title { font-weight: 700; font-size: 10pt; }
  .doc-header .subtitle { font-size: 8.5pt; opacity: 0.80; }

  h2 {
    font-family: 'Outfit', sans-serif; font-size: 14pt;
    font-weight: 700; color: var(--guinda);
    border-bottom: 2px solid var(--guinda);
    padding-bottom: 6px; margin: 28px 0 14px; page-break-after: avoid;
  }
  h3 {
    font-family: 'Outfit', sans-serif; font-size: 11.5pt;
    font-weight: 700; color: var(--guinda-light);
    margin: 20px 0 10px; page-break-after: avoid;
  }

  p { margin-bottom: 10px; text-align: justify; }
  ul, ol { padding-left: 22px; margin-bottom: 12px; }
  li { margin-bottom: 5px; }
  strong { color: var(--guinda); }
  code { background: var(--guinda-pale); padding: 1px 5px; border-radius: 4px; font-size: 9pt; }

  table {
    width: 100%; border-collapse: collapse;
    margin: 14px 0 20px; font-size: 9.3pt;
    page-break-inside: auto;
  }
  thead tr { background: var(--guinda); color: white; }
  thead th {
    padding: 9px 10px; text-align: left;
    font-weight: 700; font-size: 8.8pt;
  }
  tbody tr:nth-child(even) { background: var(--guinda-pale); }
  tbody td {
    padding: 8px 10px; border-bottom: 1px solid var(--border);
    vertical-align: top;
  }

  .badge {
    display: inline-block; padding: 3px 9px; border-radius: 12px;
    font-size: 8.3pt; font-weight: 700; white-space: nowrap;
  }
  .badge-ok { background: var(--ok-bg); color: var(--ok-fg); }
  .badge-curso { background: var(--curso-bg); color: var(--curso-fg); }
  .badge-pend { background: var(--pend-bg); color: var(--pend-fg); }

  .info-box {
    background: var(--guinda-pale); border-left: 4px solid var(--guinda);
    padding: 14px 18px; border-radius: 0 8px 8px 0;
    margin: 14px 0 20px;
  }
  .info-box p:last-child { margin-bottom: 0; }
  .info-box.warn { background: #fff7ed; border-left-color: #c2410c; }

  .kpi-row { display: flex; gap: 12px; margin: 14px 0 20px; }
  .kpi-box {
    flex: 1; border: 1.5px solid var(--border); border-radius: 10px;
    padding: 12px 14px; text-align: center;
  }
  .kpi-num { font-family: 'Outfit', sans-serif; font-size: 20pt; font-weight: 800; color: var(--guinda); }
  .kpi-label { font-size: 8.3pt; color: var(--muted); font-weight: 600; margin-top: 2px; }

  .timeline { margin: 14px 0 20px; }
  .tl-item {
    display: flex; gap: 14px; padding: 9px 0;
    border-bottom: 1px dashed var(--border);
  }
  .tl-date {
    min-width: 78px; font-weight: 700; color: var(--guinda);
    font-size: 9pt; padding-top: 1px;
  }
  .tl-body { flex: 1; font-size: 9.5pt; }
  .tl-body strong { display: block; color: var(--text); font-size: 9.8pt; margin-bottom: 1px; }

  .page-footer {
    margin-top: 30px; border-top: 1px solid var(--border);
    padding-top: 8px; display: flex; justify-content: space-between;
    font-size: 8.5pt; color: var(--muted);
  }
`;

function docHeader(subtitle) {
  return `
  <div class="doc-header">
    <div><div class="title">UNSAAC — Plataforma Web TUPA</div><div class="subtitle">${subtitle}</div></div>
    <div class="subtitle">Desarrollo de Software I · 2026-I</div>
  </div>`;
}

function pageFooter() {
  return `
  <div class="page-footer">
    <span>UNSAAC — Plataforma Web de Gestión del TUPA · Desarrollo de Software I · Semestre 2026-I</span>
    <span>Cusco, Perú · 2026</span>
  </div>`;
}

function cover({ badge, title, subtitle, meta }) {
  return `
  <div class="cover">
    <div class="cover-header">
      <h1>UNIVERSIDAD NACIONAL DE SAN ANTONIO ABAD DEL CUSCO</h1>
      <p>Programa Académico de Ingeniería Informática y de Sistemas</p>
    </div>
    <div class="cover-body">
      <div class="cover-badge">${badge}</div>
      <div class="cover-title">${title}</div>
      <div class="cover-subtitle">${subtitle}</div>
      <div class="cover-divider"></div>
      <div class="cover-meta">
        ${meta.map(([k, v]) => `<div class="cover-meta-row"><span class="label">${k}:</span><span>${v}</span></div>`).join('')}
      </div>
    </div>
    <div class="cover-footer">
      Cusco, Perú · 2026 &nbsp;|&nbsp; Plataforma Web de Gestión del TUPA UNSAAC
    </div>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════
// INFORME DE AVANCE N.º 1 — Corte: 07 de julio de 2026
// ═══════════════════════════════════════════════════════════════

const informe1 = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><style>${CSS}</style></head>
<body>

${cover({
  badge: 'Informe de Avance N.º 1 — Desarrollo de Software I',
  title: 'Plataforma Web para la Optimización de la Gestión del TUPA de la UNSAAC',
  subtitle: 'Informe de Avance N.º 1 · Corte al 07 de julio de 2026',
  meta: [
    ['Asignatura', 'Desarrollo de Software I'],
    ['Docentes', 'Luis Álvaro Monzón Condori<br>Julio Vladimir Quispe Sota'],
    ['Periodo cubierto', 'Semanas Abr S3 — Jun S1 (2026-I)'],
    ['Integrantes', 'José Francisco Puma Potosino'],
  ]
})}

<div class="page-break"></div>
${docHeader('Informe de Avance N.º 1 — Resumen Ejecutivo')}

<h2>1. Objeto del Informe</h2>
<p>Este documento reporta el avance del proyecto <strong>Plataforma Web de Gestión del TUPA UNSAAC</strong> a la fecha de corte del <strong>07 de julio de 2026</strong>, estableciendo la correspondencia entre el cronograma planificado en el Plan de Proyecto (Entregable 1) y las actividades efectivamente realizadas hasta este punto del semestre.</p>

<h2>2. Resumen Ejecutivo</h2>
<p>A la fecha, el equipo completó íntegramente la <strong>Fase I</strong> del cronograma: análisis de requerimientos, diseño del modelo de datos, prototipado de interfaces y la implementación de las interfaces gráficas (portal estudiante y portal administrativo) como <strong>prototipo funcional de alta fidelidad basado en datos mock</strong>. Se generó y entregó la documentación correspondiente a los Entregables 1 y 2.</p>
<p>La <strong>Fase II</strong> (backend Node.js, integración con MySQL, pruebas, despliegue) <strong>aún no se ha iniciado</strong>. Según el cronograma original, esta fase estaba prevista entre Jun S1 y Jun S4; al 07 de julio se encuentra pendiente en su totalidad.</p>

<div class="kpi-row">
  <div class="kpi-box"><div class="kpi-num">7 / 13</div><div class="kpi-label">Actividades del cronograma completadas</div></div>
  <div class="kpi-box"><div class="kpi-num">2 / 2</div><div class="kpi-label">Entregables parciales presentados (1 y 2)</div></div>
  <div class="kpi-box"><div class="kpi-num">0%</div><div class="kpi-label">Avance de Fase II (backend real)</div></div>
</div>

<div class="info-box">
  <p><strong>Nota metodológica:</strong> el proyecto aún no cuenta con un repositorio Git inicializado, por lo que este seguimiento se elaboró a partir de las fechas de creación/modificación de los artefactos entregados (documentos, scripts y datasets), en ausencia de un historial de commits formal.</p>
</div>

<h2>3. Cronograma de Referencia (Plan de Proyecto — Entregable 1)</h2>
<table style="font-size:8pt;">
  <thead>
    <tr>
      <th style="min-width:130px;">Actividad</th>
      <th>Abr S3</th><th>Abr S4</th><th>May S1</th><th>May S2</th>
      <th>May S3</th><th>May S4</th><th>Jun S1</th><th>Jun S2</th>
      <th>Jun S3</th><th>Jun S4</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Análisis de requerimientos</td><td style="background:#7B1828;"></td><td style="background:#7B1828;"></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
    <tr><td>Diseño de BD y modelo</td><td></td><td style="background:#7B1828;"></td><td style="background:#7B1828;"></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
    <tr><td>Prototipado de interfaces</td><td></td><td></td><td style="background:#7B1828;"></td><td style="background:#7B1828;"></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
    <tr><td><strong>Entregable 1 y 2</strong></td><td></td><td></td><td></td><td style="background:#A52035;"></td><td style="background:#A52035;"></td><td></td><td></td><td></td><td></td><td></td></tr>
    <tr><td>Implementación GUI</td><td></td><td></td><td style="background:#7B1828;"></td><td style="background:#7B1828;"></td><td style="background:#7B1828;"></td><td></td><td></td><td></td><td></td><td></td></tr>
    <tr><td>Backend API REST</td><td></td><td></td><td></td><td></td><td></td><td style="background:#7B1828;"></td><td style="background:#7B1828;"></td><td></td><td></td><td></td></tr>
    <tr><td>Integración BD + Módulos</td><td></td><td></td><td></td><td></td><td></td><td></td><td style="background:#7B1828;"></td><td style="background:#7B1828;"></td><td></td><td></td></tr>
    <tr><td>Pruebas y correcciones</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td style="background:#7B1828;"></td><td style="background:#7B1828;"></td><td></td></tr>
    <tr><td>Despliegue en la nube</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td style="background:#7B1828;"></td><td></td></tr>
    <tr><td><strong>Entregable 3 + Sustentación</strong></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td style="background:#A52035;"></td></tr>
  </tbody>
</table>
<p style="font-size:8.5pt; color:var(--muted);">▲ Posición del corte de este informe: primera semana de julio (Jun S1 concluido), es decir, en el límite entre la Fase I y el inicio previsto de la Fase II.</p>

<div class="page-break"></div>
${docHeader('Informe de Avance N.º 1 — Correspondencia Cronograma / Ejecución')}

<h2>4. Correspondencia entre Cronograma y Actividad Realizada</h2>
<table>
  <thead><tr><th style="width:22px;">#</th><th>Actividad planificada</th><th style="width:78px;">Semana prevista</th><th style="width:78px;">Estado al 07-jul</th><th>Evidencia</th></tr></thead>
  <tbody>
    <tr><td>1</td><td>Análisis de requerimientos funcionales del TUPA</td><td>Abr S3–S4</td><td><span class="badge badge-ok">Completado</span></td><td>RF-01 a RF-11, RNF-01 a RNF-05, HU-01 a HU-05 y CU-01 a CU-06 documentados en <code>DOCUMENTACION_INGENIERIA.md</code></td></tr>
    <tr><td>2</td><td>Diseño del modelo de datos relacional (BD MySQL)</td><td>Abr S4–May S1</td><td><span class="badge badge-ok">Completado</span></td><td><code>database_schema.txt</code> y <code>scratch_schema.js</code>, derivados del dump oficial <code>bdtupa20260511.sql</code></td></tr>
    <tr><td>3</td><td>Prototipado de interfaces (mockups)</td><td>May S1–S2</td><td><span class="badge badge-ok">Completado</span></td><td>Dataset de soporte <code>public/extracted_tupa_data.json</code> y prototipo descrito en la sección 11 del Informe</td></tr>
    <tr><td>4</td><td><strong>Entregable 1 — Plan de Proyecto</strong></td><td>May S2</td><td><span class="badge badge-ok">Entregado</span></td><td><code>PLAN_PROYECTO.md</code></td></tr>
    <tr><td>5</td><td>Implementación GUI — Portal Estudiante</td><td>May S1–S3</td><td><span class="badge badge-ok">Completado (mock)</span></td><td>Prototipo de alta fidelidad HTML/CSS/JS sobre datos mock, sin backend real aún</td></tr>
    <tr><td>6</td><td>Implementación GUI — Portal Administrativo</td><td>May S2–S4</td><td><span class="badge badge-ok">Completado (mock)</span></td><td>Dashboard, bandeja y analíticas funcionando sobre datos simulados</td></tr>
    <tr><td>7</td><td><strong>Entregable 2 — GUIs Implementadas</strong></td><td>May S3</td><td><span class="badge badge-ok">Entregado</span></td><td><code>Informe_TUPA_UNSAAC_2026.pdf</code> (Parte I y II) y <code>Guion_Exposicion_TUPA.pdf</code></td></tr>
    <tr><td>8</td><td>Configuración del servidor Node.js y API REST</td><td>Jun S1–S2</td><td><span class="badge badge-pend">No iniciado</span></td><td>—</td></tr>
    <tr><td>9</td><td>Integración del catálogo TUPA con MySQL</td><td>Jun S2–S3</td><td><span class="badge badge-pend">No iniciado</span></td><td>—</td></tr>
    <tr><td>10</td><td>Pruebas funcionales por caso de uso</td><td>Jun S3–S4</td><td><span class="badge badge-pend">No iniciado</span></td><td>—</td></tr>
    <tr><td>11</td><td>Despliegue en la nube (Render / Railway)</td><td>Jun S3</td><td><span class="badge badge-pend">No iniciado</span></td><td>—</td></tr>
    <tr><td>12</td><td><strong>Entregable 3 — Sistema Funcional</strong></td><td>Jun S4</td><td><span class="badge badge-pend">Pendiente</span></td><td>—</td></tr>
    <tr><td>13</td><td>Documentación final y sustentación</td><td>Jun S3–S4</td><td><span class="badge badge-curso">Parcial</span></td><td><code>RECOMENDACIONES_DESARROLLO.md</code> y <code>ESTRATEGIA_PRODUCTO_MERCADO.md</code> adelantan insumos, pero documentan la fase mock, no el sistema final</td></tr>
  </tbody>
</table>

<h2>5. Detalle de Artefactos Generados</h2>
<div class="timeline">
  <div class="tl-item"><div class="tl-date">26 may</div><div class="tl-body"><strong>Insumos oficiales del TUPA</strong>Incorporación del dump oficial <code>bdtupa20260511.sql</code> (63 trámites, ~1850 solicitudes históricas) y del formato oficial <code>TUPAUNSAAC_NuevoFormato2021.pdf</code>.</div></div>
  <div class="tl-item"><div class="tl-date">29 may</div><div class="tl-body"><strong>Extracción y modelado de datos</strong>Scripts de análisis (<code>scratch_parse_pdf.js</code>, <code>scratch_schema.js</code>, <code>scratch_parse_data.js</code>), esquema documentado (<code>database_schema.txt</code>) y dataset consolidado para el prototipo (<code>public/extracted_tupa_data.json</code>).</div></div>
  <div class="tl-item"><div class="tl-date">29 may</div><div class="tl-body"><strong>Planificación complementaria</strong><code>Proyecto_Semestre_2026-I.txt</code>, <code>RECOMENDACIONES_DESARROLLO.md</code> y <code>ESTRATEGIA_PRODUCTO_MERCADO.md</code>.</div></div>
  <div class="tl-item"><div class="tl-date">04 jun</div><div class="tl-body"><strong>Entregables 1 y 2</strong><code>DOCUMENTACION_INGENIERIA.md</code>, <code>PLAN_PROYECTO.md</code>, <code>Informe_TUPA_UNSAAC_2026.pdf</code> y <code>Guion_Exposicion_TUPA.pdf</code> (con sus scripts generadores).</div></div>
</div>

<h2>6. Riesgos y Observaciones</h2>
<div class="info-box warn">
  <p><strong>Riesgo de cronograma:</strong> la Fase II (backend, integración BD, pruebas, despliegue y Entregable 3) no ha iniciado y, según el plan original, debía completarse a más tardar en Jun S4. Se requiere iniciar de inmediato la configuración del servidor Node.js/Express para no comprometer la fecha del Entregable 3.</p>
  <p><strong>Ausencia de control de versiones:</strong> no existe todavía un repositorio Git, contrario a lo establecido en la sección 4.1 del Plan de Proyecto (ramas <code>feature/</code>, pull requests). Se recomienda inicializarlo antes de comenzar la Fase II.</p>
</div>

<h2>7. Próximos Pasos</h2>
<ol>
  <li>Inicializar repositorio Git y definir la convención de ramas <code>feature/</code>.</li>
  <li>Configurar el servidor Node.js/Express y las rutas base de la API REST.</li>
  <li>Conectar la API a una base de datos MySQL real e importar el dump oficial.</li>
  <li>Sustituir el consumo de datos mock del prototipo por llamadas a la API real.</li>
</ol>

${pageFooter()}
</body>
</html>`;

// ═══════════════════════════════════════════════════════════════
// INFORME DE AVANCE N.º 2 — Corte: 21 de julio de 2026 (hoy)
// ═══════════════════════════════════════════════════════════════

const informe2 = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><style>${CSS}</style></head>
<body>

${cover({
  badge: 'Informe de Avance N.º 2 — Desarrollo de Software I',
  title: 'Plataforma Web para la Optimización de la Gestión del TUPA de la UNSAAC',
  subtitle: 'Informe de Avance N.º 2 · Corte al 21 de julio de 2026',
  meta: [
    ['Asignatura', 'Desarrollo de Software I'],
    ['Docentes', 'Luis Álvaro Monzón Condori<br>Julio Vladimir Quispe Sota'],
    ['Periodo cubierto', 'Continuación del Informe de Avance N.º 1 (08 jul — 21 jul 2026)'],
    ['Integrantes', 'José Francisco Puma Potosino'],
  ]
})}

<div class="page-break"></div>
${docHeader('Informe de Avance N.º 2 — Resumen Ejecutivo')}

<h2>1. Objeto del Informe</h2>
<p>Este documento da continuidad al <strong>Informe de Avance N.º 1</strong> (corte al 07 de julio de 2026) y reporta el progreso registrado hasta el <strong>21 de julio de 2026</strong>, periodo en el que se ejecutó la Fase II del cronograma: backend, integración con MySQL y preparación de despliegue.</p>

<h2>2. Resumen Ejecutivo</h2>
<p>Desde el último corte, el equipo implementó el <strong>backend completo en Node.js/Express</strong> bajo una arquitectura por capas (config, middleware, repositories, services, controllers, routes) y lo conectó a una base de datos <strong>MySQL real</strong>, reutilizando los <em>stored procedures</em> oficiales del dump de la UNSAAC (<code>tupa_sp_registrar_solicitud_tramite</code>, <code>tupa_sp_registrar_pago_solicitud_tramite</code>, etc.) para las operaciones ya cubiertas por SQL, y añadiendo lógica propia donde el dump no alcanzaba (autenticación con bcrypt/JWT, cambios de estado generales, trazabilidad).</p>
<p>El frontend del portal estudiante y administrativo se re-conectó para consumir la API real en lugar de los datos mock. Se preparó también la infraestructura de contenedores (Dockerfile, <code>docker-compose.yml</code>) y los manifiestos de despliegue (Railway, Procfile), aunque el despliegue público en la nube todavía no se ha verificado.</p>

<div class="kpi-row">
  <div class="kpi-box"><div class="kpi-num">11 / 13</div><div class="kpi-label">Actividades del cronograma completadas o en curso</div></div>
  <div class="kpi-box"><div class="kpi-num">100%</div><div class="kpi-label">RF implementados sobre backend real (11/11)</div></div>
  <div class="kpi-box"><div class="kpi-num">2</div><div class="kpi-label">Actividades aún pendientes: despliegue y documentación final</div></div>
</div>

<div class="info-box">
  <p><strong>Nota metodológica:</strong> al igual que en el Informe N.º 1, no existe todavía un repositorio Git; el avance se reconstruyó a partir de las fechas de creación de los archivos del backend, todos generados en una única sesión de trabajo el <strong>15 de julio de 2026</strong> (11:34–12:30). Entre el 16 y el 21 de julio no se registran cambios adicionales en el proyecto.</p>
</div>

<h2>3. Cronograma de Referencia — Estado Actualizado</h2>
<table style="font-size:8pt;">
  <thead>
    <tr>
      <th style="min-width:130px;">Actividad</th>
      <th>Abr S3</th><th>Abr S4</th><th>May S1</th><th>May S2</th>
      <th>May S3</th><th>May S4</th><th>Jun S1</th><th>Jun S2</th>
      <th>Jun S3</th><th>Jun S4</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Análisis de requerimientos</td><td style="background:#166534;"></td><td style="background:#166534;"></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
    <tr><td>Diseño de BD y modelo</td><td></td><td style="background:#166534;"></td><td style="background:#166534;"></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
    <tr><td>Prototipado de interfaces</td><td></td><td></td><td style="background:#166534;"></td><td style="background:#166534;"></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
    <tr><td><strong>Entregable 1 y 2</strong></td><td></td><td></td><td></td><td style="background:#166534;"></td><td style="background:#166534;"></td><td></td><td></td><td></td><td></td><td></td></tr>
    <tr><td>Implementación GUI</td><td></td><td></td><td style="background:#166534;"></td><td style="background:#166534;"></td><td style="background:#166534;"></td><td></td><td></td><td></td><td></td><td></td></tr>
    <tr><td>Backend API REST</td><td></td><td></td><td></td><td></td><td></td><td style="background:#166534;"></td><td style="background:#166534;"></td><td></td><td></td><td></td></tr>
    <tr><td>Integración BD + Módulos</td><td></td><td></td><td></td><td></td><td></td><td></td><td style="background:#166534;"></td><td style="background:#166534;"></td><td></td><td></td></tr>
    <tr><td>Pruebas y correcciones</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td style="background:#92400e;"></td><td style="background:#92400e;"></td><td></td></tr>
    <tr><td>Despliegue en la nube</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td style="background:#94a3b8;"></td><td></td></tr>
    <tr><td><strong>Entregable 3 + Sustentación</strong></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td style="background:#92400e;"></td></tr>
  </tbody>
</table>
<p style="font-size:8.5pt; color:var(--muted);">Verde = completado · Ámbar = en curso / parcial · Gris = pendiente. El trabajo real de Fase II se concentró el 15 de julio (fuera de las semanas Jun S1–S2 originalmente previstas), evidenciando un desfase de aproximadamente tres semanas respecto del plan.</p>

<div class="page-break"></div>
${docHeader('Informe de Avance N.º 2 — Correspondencia Cronograma / Ejecución')}

<h2>4. Correspondencia entre Cronograma y Actividad Realizada</h2>
<table>
  <thead><tr><th style="width:22px;">#</th><th>Actividad planificada</th><th style="width:78px;">Semana prevista</th><th style="width:78px;">Estado al 21-jul</th><th>Evidencia</th></tr></thead>
  <tbody>
    <tr><td>1–7</td><td>Análisis, diseño de BD, prototipado, GUI y Entregables 1–2</td><td>Abr S3–May S3</td><td><span class="badge badge-ok">Completado</span></td><td>Sin cambios respecto al Informe de Avance N.º 1</td></tr>
    <tr><td>8</td><td>Configuración del servidor Node.js y rutas de la API REST</td><td>Jun S1–S2</td><td><span class="badge badge-ok">Completado</span></td><td><code>backend/src/server.js</code>, <code>app.js</code> y <code>routes/index.js</code> con rutas de auth, catálogo, unidades, solicitudes y dashboard</td></tr>
    <tr><td>9</td><td>Integración del catálogo TUPA con MySQL</td><td>Jun S2–S3</td><td><span class="badge badge-ok">Completado</span></td><td><code>config/db.js</code>, <code>scripts/importDump.js</code>, <code>scripts/migrate.js</code> + <code>database/migrations.sql</code>, repositorios (<code>catalogoRepository.js</code>, <code>solicitudRepository.js</code>, <code>authRepository.js</code>) sobre <code>bdtupa20260511.sql</code></td></tr>
    <tr><td>10</td><td>Pruebas funcionales por caso de uso</td><td>Jun S3–S4</td><td><span class="badge badge-curso">Parcial</span></td><td>Prueba manual del endpoint de carga de archivos (<code>uploads/1784135424468-*.pdf</code>); no existe todavía un plan de pruebas formal ni evidencia de validación de los 6 casos de uso</td></tr>
    <tr><td>11</td><td>Despliegue en servidor en la nube (Render / Railway)</td><td>Jun S3</td><td><span class="badge badge-pend">Pendiente</span></td><td><code>Dockerfile</code>, <code>docker-compose.yml</code>, <code>railway.json</code> y <code>Procfile</code> preparados, pero el propio <code>README.md</code> indica que <code>docker compose up</code> no pudo ejecutarse en esta máquina (sin Docker instalado) y no hay evidencia de una URL pública activa</td></tr>
    <tr><td>12</td><td><strong>Entregable 3 — Sistema Funcional</strong></td><td>Jun S4</td><td><span class="badge badge-curso">En curso</span></td><td>Sistema funcional en entorno local (backend + BD + frontend integrado); falta el criterio de accesibilidad pública para darlo por cerrado</td></tr>
    <tr><td>13</td><td>Documentación final y sustentación</td><td>Jun S3–S4</td><td><span class="badge badge-curso">En curso</span></td><td><code>README.md</code> actualizado para reflejar el backend real; <code>PLAN_PROYECTO.md</code>, <code>DOCUMENTACION_INGENIERIA.md</code>, el Informe y el Guion de Exposición aún describen la fase mock y no fueron regenerados</td></tr>
  </tbody>
</table>

<h2>5. Detalle de Artefactos Generados (08 jul — 21 jul)</h2>
<div class="timeline">
  <div class="tl-item"><div class="tl-date">15 jul<br>11:34</div><div class="tl-body"><strong>Configuración base</strong><code>.env</code>, <code>.env.example</code>, <code>.gitignore</code>, <code>package.json</code>, <code>backend/src/config/{env,db}.js</code>.</div></div>
  <div class="tl-item"><div class="tl-date">15 jul<br>11:36</div><div class="tl-body"><strong>Scripts de datos</strong><code>scripts/seedDemoUsers.js</code> e <code>importDump.js</code> para poblar y sembrar credenciales de demostración.</div></div>
  <div class="tl-item"><div class="tl-date">15 jul<br>11:45</div><div class="tl-body"><strong>Middleware</strong><code>auth.js</code> (JWT), <code>rbac.js</code>, <code>upload.js</code> (multer) y <code>errorHandler.js</code>.</div></div>
  <div class="tl-item"><div class="tl-date">15 jul<br>12:02</div><div class="tl-body"><strong>Migraciones propias</strong><code>database/migrations.sql</code> (tabla de trazabilidad y columnas de contacto) y <code>scripts/migrate.js</code>.</div></div>
  <div class="tl-item"><div class="tl-date">15 jul<br>12:03–12:12</div><div class="tl-body"><strong>Módulos de autenticación, catálogo y solicitudes</strong>Repositorios, servicios, controladores y rutas para <code>auth</code>, <code>catalogo</code>, <code>unidades</code>, <code>solicitudes</code> y <code>dashboard</code>.</div></div>
  <div class="tl-item"><div class="tl-date">15 jul<br>12:10</div><div class="tl-body"><strong>Prueba de carga de archivo</strong>Archivo <code>uploads/1784135424468-6959df730d26.pdf</code>, evidencia de una prueba manual del endpoint de adjuntos.</div></div>
  <div class="tl-item"><div class="tl-date">15 jul<br>12:20–12:30</div><div class="tl-body"><strong>Ensamblado final y despliegue</strong><code>app.js</code>, <code>public/index.html</code> reconectado a la API real, <code>Dockerfile</code>, <code>docker-compose.yml</code>, <code>railway.json</code>, <code>Procfile</code> y <code>README.md</code> actualizado.</div></div>
  <div class="tl-item"><div class="tl-date">16–21 jul</div><div class="tl-body"><strong>Sin cambios registrados</strong>No se detectan modificaciones adicionales en el proyecto durante esta semana.</div></div>
</div>

<h2>6. Riesgos y Observaciones</h2>
<div class="info-box warn">
  <p><strong>Despliegue no verificado:</strong> la infraestructura de contenedores existe pero no se probó en esta máquina (sin Docker). Es la actividad crítica pendiente para cerrar el Entregable 3.</p>
  <p><strong>Datos sensibles reales:</strong> el dump importado contiene datos reales de alumnos (DNI, teléfono, correo, dirección). El propio <code>README.md</code> advierte anonimizar <code>talumno</code> y las tablas de solicitantes antes de exponer una URL pública duradera.</p>
  <p><strong>Adjuntos sin autenticación:</strong> los archivos en <code>/uploads</code> se sirven públicamente protegidos solo por nombre aleatorio; es una simplificación académica documentada, no apta para producción real.</p>
  <p><strong>Documentación desactualizada:</strong> los documentos de entregables previos (Plan, Informe, Guion) describen la fase mock y deben actualizarse o aclararse antes de la sustentación final.</p>
  <p><strong>Ausencia de control de versiones:</strong> persiste desde el Informe N.º 1; sigue sin existir un repositorio Git pese a ser requisito metodológico del Plan de Proyecto.</p>
</div>

<h2>7. Próximos Pasos</h2>
<ol>
  <li>Ejecutar y documentar las pruebas funcionales de los 6 casos de uso (CU-01 a CU-06).</li>
  <li>Verificar el despliegue con Docker (u otra máquina con Docker disponible) y completar el despliegue público en Railway.</li>
  <li>Actualizar <code>PLAN_PROYECTO.md</code>, el Informe y el Guion de Exposición para reflejar la arquitectura real, o aclarar explícitamente qué secciones siguen vigentes.</li>
  <li>Inicializar el repositorio Git con el historial acumulado, cumpliendo el control de versiones exigido por el Plan de Proyecto.</li>
  <li>Evaluar la anonimización de datos reales de alumnos antes de exponer el sistema en una URL pública permanente.</li>
</ol>

${pageFooter()}
</body>
</html>`;

async function generate(browser, html, outputPath, label) {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="width:100%; font-size:8pt; color:#7A3040; padding:0 25mm; display:flex; justify-content:space-between;">
        <span>UNSAAC — Plataforma Web TUPA · Desarrollo de Software I · 2026-I</span>
        <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
      </div>`,
    margin: { top: '15mm', right: '20mm', bottom: '18mm', left: '25mm' }
  });
  await page.close();
  console.log(`✅  ${label} generado: ${outputPath}`);
}

async function main() {
  console.log('Iniciando generación de los informes de avance...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    await generate(browser, informe1, path.join(__dirname, 'Informe_Avance_1_TUPA_UNSAAC.pdf'), 'Informe de Avance N.º 1 (corte 07-jul-2026)');
    await generate(browser, informe2, path.join(__dirname, 'Informe_Avance_2_TUPA_UNSAAC.pdf'), 'Informe de Avance N.º 2 (corte 21-jul-2026)');
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('❌ Error al generar los informes:', err.message);
  process.exit(1);
});
