const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_PATH = path.join(__dirname, 'Informe_TUPA_UNSAAC_2026.pdf');

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@600;700;800&display=swap');

  :root {
    --guinda: #7B1828;
    --guinda-light: #A52035;
    --guinda-pale: #f5eaec;
    --text: #1C0A0E;
    --muted: #6B3040;
    --border: #d4b0b7;
    --white: #ffffff;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
    font-size: 10.5pt;
    color: var(--text);
    line-height: 1.6;
    background: white;
  }

  /* ── PAGE BREAKS ── */
  .page-break { page-break-before: always; }

  /* ── COVER PAGE ── */
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
    line-height: 1.25; margin-bottom: 30px; max-width: 480px;
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
    font-weight: 700; color: var(--guinda); min-width: 160px;
  }
  .cover-footer {
    background: var(--guinda-pale); width: 100%; padding: 14px 40px;
    border-top: 3px solid var(--guinda); text-align: center;
    font-size: 9pt; color: var(--muted); font-weight: 600;
  }

  /* ── DOCUMENT HEADER (all pages except cover) ── */
  .doc-header {
    background: var(--guinda); color: white; padding: 10px 30px;
    margin-bottom: 28px; display: flex; justify-content: space-between;
    align-items: center; border-radius: 0 0 8px 8px;
  }
  .doc-header .title { font-weight: 700; font-size: 10pt; }
  .doc-header .subtitle { font-size: 8.5pt; opacity: 0.80; }

  /* ── PART TITLE ── */
  .part-title {
    background: var(--guinda); color: white; padding: 18px 28px;
    border-radius: 10px; margin-bottom: 26px;
  }
  .part-title .part-label {
    font-size: 8pt; letter-spacing: 2px; text-transform: uppercase;
    opacity: 0.80; margin-bottom: 4px;
  }
  .part-title h2 {
    font-family: 'Outfit', sans-serif; font-size: 16pt;
    font-weight: 800;
  }

  /* ── SECTION HEADINGS ── */
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
  h4 {
    font-size: 10.5pt; font-weight: 700; color: var(--text);
    margin: 16px 0 8px; page-break-after: avoid;
  }

  /* ── PARAGRAPH & LISTS ── */
  p { margin-bottom: 10px; text-align: justify; }
  ul, ol { padding-left: 22px; margin-bottom: 12px; }
  li { margin-bottom: 5px; }
  strong { color: var(--guinda); }

  /* ── TABLES ── */
  table {
    width: 100%; border-collapse: collapse;
    margin: 14px 0 20px; font-size: 9.5pt;
    page-break-inside: auto;
  }
  thead tr { background: var(--guinda); color: white; }
  thead th {
    padding: 9px 12px; text-align: left;
    font-weight: 700; font-size: 9pt;
  }
  tbody tr:nth-child(even) { background: var(--guinda-pale); }
  tbody td {
    padding: 8px 12px; border-bottom: 1px solid var(--border);
    vertical-align: top;
  }
  .badge {
    display: inline-block; padding: 2px 8px; border-radius: 12px;
    font-size: 8.5pt; font-weight: 700;
  }
  .badge-alta { background: #fee2e2; color: #991b1b; }
  .badge-media { background: #fef3c7; color: #92400e; }

  /* ── INFO BOX ── */
  .info-box {
    background: var(--guinda-pale); border-left: 4px solid var(--guinda);
    padding: 14px 18px; border-radius: 0 8px 8px 0;
    margin: 14px 0 20px;
  }
  .info-box p { margin-bottom: 0; text-align: left; }

  /* ── USE CASE DIAGRAM ── */
  .uc-diagram {
    border: 2px solid var(--border); border-radius: 12px;
    padding: 24px; margin: 14px 0 20px;
    background: #fafafa; display: flex; gap: 20px; align-items: flex-start;
  }
  .uc-actor {
    display: flex; flex-direction: column; align-items: center;
    gap: 6px; min-width: 90px;
  }
  .uc-actor-icon {
    width: 48px; height: 48px; border-radius: 50%;
    background: var(--guinda); color: white; font-size: 22pt;
    display: flex; align-items: center; justify-content: center;
  }
  .uc-actor-label {
    font-size: 8.5pt; font-weight: 700; color: var(--guinda);
    text-align: center;
  }
  .uc-arrow {
    display: flex; align-items: center; padding-top: 8px;
    color: var(--muted); font-size: 16pt; font-weight: 300;
  }
  .uc-list {
    flex: 1; display: flex; flex-direction: column; gap: 8px;
  }
  .uc-box {
    background: white; border: 1.5px solid var(--guinda);
    border-radius: 24px; padding: 7px 16px; font-size: 9pt;
    font-weight: 600; color: var(--text); text-align: center;
  }
  .uc-box.admin { border-color: var(--guinda-light); }
  .uc-separator {
    height: 1px; background: var(--border); margin: 6px 0;
  }

  /* ── USE CASE CARD ── */
  .uc-card {
    border: 1px solid var(--border); border-radius: 10px;
    margin: 14px 0 20px; overflow: hidden; page-break-inside: avoid;
  }
  .uc-card-header {
    background: var(--guinda); color: white;
    padding: 10px 18px; display: flex; gap: 14px; align-items: center;
  }
  .uc-card-header .uc-id {
    background: rgba(255,255,255,0.25); padding: 3px 10px;
    border-radius: 12px; font-size: 8.5pt; font-weight: 700;
  }
  .uc-card-header .uc-name { font-weight: 700; font-size: 11pt; }
  .uc-card-body { padding: 14px 18px; }
  .uc-field { margin-bottom: 10px; }
  .uc-field .field-label {
    font-weight: 700; color: var(--guinda); font-size: 9pt;
    text-transform: uppercase; letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  .uc-steps { padding-left: 18px; }
  .uc-steps li { margin-bottom: 4px; font-size: 9.5pt; }

  /* ── ARCH DIAGRAM ── */
  .arch-diagram {
    display: flex; flex-direction: column; align-items: center;
    gap: 10px; margin: 14px 0 20px;
  }
  .arch-layer {
    background: var(--guinda-pale); border: 2px solid var(--guinda);
    border-radius: 8px; padding: 12px 24px; width: 100%;
    max-width: 440px; text-align: center;
  }
  .arch-layer .layer-name {
    font-weight: 800; font-size: 10pt; color: var(--guinda);
  }
  .arch-layer .layer-tech {
    font-size: 9pt; color: var(--muted); margin-top: 2px;
  }
  .arch-arrow { font-size: 18pt; color: var(--guinda); }

  /* ── FOOTER ── */
  .page-footer {
    margin-top: 30px; border-top: 1px solid var(--border);
    padding-top: 8px; display: flex; justify-content: space-between;
    font-size: 8.5pt; color: var(--muted);
  }

  /* ── TOC ── */
  .toc-entry {
    display: flex; justify-content: space-between;
    padding: 5px 0; border-bottom: 1px dotted var(--border);
    font-size: 10pt;
  }
  .toc-entry.part { font-weight: 700; color: var(--guinda); margin-top: 10px; }
  .toc-entry.section { padding-left: 20px; }
  .toc-entry.subsection { padding-left: 38px; color: var(--muted); font-size: 9.5pt; }
</style>
</head>
<body>

<!-- ════════════════════════════════════════════════════
     PORTADA
     ════════════════════════════════════════════════════ -->
<div class="cover">
  <div class="cover-header">
    <h1>UNIVERSIDAD NACIONAL DE SAN ANTONIO ABAD DEL CUSCO</h1>
    <p>Programa Académico de Ingeniería Informática y de Sistemas</p>
  </div>
  <div class="cover-body">
    <div class="cover-badge">Entregable Semestral — Desarrollo de Software I</div>
    <div class="cover-title">Plataforma Web para la Optimización de la Gestión del TUPA de la UNSAAC</div>
    <div class="cover-divider"></div>
    <div class="cover-meta">
      <div class="cover-meta-row"><span class="label">Asignatura:</span><span>Desarrollo de Software I</span></div>
      <div class="cover-meta-row"><span class="label">Docentes:</span><span>Luis Álvaro Monzón Condori<br>Julio Vladimir Quispe Sota</span></div>
      <div class="cover-meta-row"><span class="label">Atributo del Graduado:</span><span>AG_C12 — Aplica Teoría de la Ciencia de la Computación y fundamentos de desarrollo de software</span></div>
      <div class="cover-meta-row"><span class="label">Integrantes:</span><span>[Nombres del equipo]</span></div>
      <div class="cover-meta-row"><span class="label">Fecha de Entrega:</span><span>Mayo 2026 — Semestre 2026-I</span></div>
    </div>
  </div>
  <div class="cover-footer">
    Cusco, Perú · 2026 &nbsp;|&nbsp; Plataforma Web de Gestión del TUPA UNSAAC
  </div>
</div>

<!-- ════════════════════════════════════════════════════
     TABLA DE CONTENIDOS
     ════════════════════════════════════════════════════ -->
<div class="page-break"></div>
<div class="doc-header">
  <div><div class="title">UNSAAC — Plataforma Web TUPA</div><div class="subtitle">Índice de Contenidos</div></div>
  <div class="subtitle">Desarrollo de Software I · 2026-I</div>
</div>

<h2>Tabla de Contenidos</h2>
<div class="toc-entry part"><span>PARTE I — PLAN DE PROYECTO</span></div>
<div class="toc-entry section"><span>1. Presentación y Ámbito de Aplicación</span></div>
<div class="toc-entry section"><span>2. Descripción de la Problemática</span></div>
<div class="toc-entry section"><span>3. Objetivos del Proyecto</span></div>
<div class="toc-entry section"><span>4. Metodología y Actividades Principales</span></div>
<div class="toc-entry section"><span>5. Arquitectura del Sistema y Diseño de BD</span></div>
<div class="toc-entry section"><span>6. Cronograma Semestral</span></div>
<div class="toc-entry section"><span>7. Presupuesto Estimado</span></div>
<div class="toc-entry section"><span>8. Evaluación y Monitoreo</span></div>
<div class="toc-entry section"><span>9. Participantes del Proyecto</span></div>
<div class="toc-entry section"><span>10. Aspectos Administrativos</span></div>
<div class="toc-entry section"><span>11. Prototipado Funcional</span></div>
<div class="toc-entry section"><span>12. Resultados Esperados</span></div>

<div class="toc-entry part"><span>PARTE II — INGENIERÍA DE REQUERIMIENTOS</span></div>
<div class="toc-entry section"><span>1. Requerimientos Funcionales (RF-01 a RF-11)</span></div>
<div class="toc-entry section"><span>2. Requerimientos No Funcionales (RNF-01 a RNF-05)</span></div>
<div class="toc-entry section"><span>3. Historias de Usuario (HU-01 a HU-05)</span></div>
<div class="toc-entry section"><span>4. Casos de Uso (CU-01 a CU-06)</span></div>
<div class="toc-entry subsection"><span>4.1 Diagrama General de Casos de Uso</span></div>
<div class="toc-entry subsection"><span>4.2 Descripciones de Alto Nivel</span></div>
<div class="toc-entry section"><span>5. Matriz de Trazabilidad de Requerimientos</span></div>
<div class="toc-entry section"><span>6. Arquitectura del Sistema (Topología 3 Capas)</span></div>

<!-- ════════════════════════════════════════════════════
     PARTE I — PLAN DE PROYECTO
     ════════════════════════════════════════════════════ -->
<div class="page-break"></div>
<div class="doc-header">
  <div><div class="title">UNSAAC — Plataforma Web TUPA</div><div class="subtitle">Parte I: Plan de Proyecto</div></div>
  <div class="subtitle">Desarrollo de Software I · 2026-I</div>
</div>
<div class="part-title">
  <div class="part-label">Parte I</div>
  <h2 style="color:white;border:none;margin:0;padding:0;">Plan de Proyecto</h2>
</div>

<h2>1. Presentación y Ámbito de Aplicación</h2>
<p>La presente propuesta técnica detalla el diseño, planificación y estrategia de desarrollo de la <strong>Plataforma Web de Gestión del TUPA</strong> (Texto Único de Procedimientos Administrativos) de la <strong>Universidad Nacional de San Antonio Abad del Cusco (UNSAAC)</strong>.</p>
<p>La plataforma está diseñada para ser implantada en la comunidad universitaria, abarcando a:</p>
<ul>
  <li><strong>Administrados:</strong> Estudiantes de pregrado/posgrado, egresados y público externo. Interactúan con la plataforma para realizar consultas de requisitos, costos y el registro y seguimiento digital de sus trámites.</li>
  <li><strong>Oficinas Administrativas:</strong> Decanatos, Direcciones de Escuela, Secretaría General, Dirección de Registro y Servicios Académicos, Unidad de Caja. Operan el panel de control para la recepción, evaluación, validación de documentos y resolución de solicitudes.</li>
</ul>

<h2>2. Descripción de la Problemática</h2>
<p>Actualmente, la gestión de trámites administrativos basados en el TUPA en la UNSAAC presenta serias limitaciones:</p>
<ul>
  <li><strong>Falta de accesibilidad e información centralizada:</strong> Estudiantes y egresados encuentran confusa la información sobre requisitos, códigos de pago y flujos de trámites, recurriendo a consultas presenciales reiteradas.</li>
  <li><strong>Procesos manuales e ineficientes:</strong> La verificación manual de comprobantes de pago y documentos ralentiza la atención y sobrecarga al personal administrativo.</li>
  <li><strong>Carencia de seguimiento en tiempo real:</strong> Los solicitantes no disponen de un canal digital para conocer el estado exacto de su trámite (SOLICITADO, EN PROCESO, PAGADO, OBSERVADO, CERRADO).</li>
  <li><strong>Limitada visibilidad directiva:</strong> Las oficinas carecen de paneles con reportes gráficos y estadísticas para identificar cuellos de botella.</li>
</ul>

<h2>3. Objetivos del Proyecto</h2>
<h3>3.1 Objetivo General</h3>
<p>Desarrollar e implementar una <strong>Plataforma Web Moderna, Intuitiva y Centralizada</strong> para la gestión del TUPA de la UNSAAC, optimizando la administración de trámites, el acceso a la información y el seguimiento de procedimientos administrativos en tiempo real.</p>
<h3>3.2 Objetivos Específicos</h3>
<ol>
  <li>Diseñar una interfaz responsiva de alta fidelidad que garantice una excelente experiencia de usuario.</li>
  <li>Implementar buscadores avanzados y filtros interactivos para el catálogo TUPA.</li>
  <li>Desarrollar un portal seguro para el registro digital de solicitudes y comprobantes de pago.</li>
  <li>Crear un sistema transparente de trazabilidad con indicadores del estado de la solicitud.</li>
  <li>Proveer al personal administrativo de herramientas eficientes para validar documentos y resolver solicitudes.</li>
  <li>Construir un dashboard con estadísticas en tiempo real sobre tiempos de atención y volumen de trámites.</li>
</ol>

<h2>4. Metodología y Actividades Principales</h2>
<h3>4.1 Marco de Trabajo Ágil (Scrum adaptado)</h3>
<ul>
  <li><strong>Sprints de 2 semanas:</strong> Desarrollo de módulos funcionales e independientes.</li>
  <li><strong>Control de versiones (Git & GitHub):</strong> Ramas por funcionalidad (<code>feature/</code>) y pull requests controlados.</li>
  <li><strong>Pruebas continuas:</strong> Validación de cada caso de uso antes del despliegue.</li>
</ul>
<h3>4.2 Actividades Principales por Fase</h3>
<table>
  <thead><tr><th>#</th><th>Actividad</th><th>Fase</th></tr></thead>
  <tbody>
    <tr><td>1</td><td>Levantamiento y análisis de requerimientos funcionales del TUPA</td><td>I</td></tr>
    <tr><td>2</td><td>Diseño del modelo de datos relacional (BD MySQL)</td><td>I</td></tr>
    <tr><td>3</td><td>Diseño de prototipos de interfaces (mockups)</td><td>I</td></tr>
    <tr><td>4</td><td>Implementación de GUIs — Portal Estudiante (HTML/CSS/JS)</td><td>I</td></tr>
    <tr><td>5</td><td>Implementación de GUIs — Portal Administrativo</td><td>I</td></tr>
    <tr><td>6</td><td>Configuración del servidor Node.js y rutas de la API REST</td><td>II</td></tr>
    <tr><td>7</td><td>Integración del catálogo TUPA con la base de datos MySQL</td><td>II</td></tr>
    <tr><td>8</td><td>Desarrollo del módulo de solicitudes y trazabilidad</td><td>II</td></tr>
    <tr><td>9</td><td>Desarrollo del módulo de pagos y validación de vouchers</td><td>II</td></tr>
    <tr><td>10</td><td>Pruebas funcionales por caso de uso</td><td>II</td></tr>
    <tr><td>11</td><td>Despliegue en servidor en la nube (Render / Railway)</td><td>II</td></tr>
    <tr><td>12</td><td>Documentación final y sustentación</td><td>II</td></tr>
  </tbody>
</table>

<div class="page-break"></div>
<div class="doc-header">
  <div><div class="title">UNSAAC — Plataforma Web TUPA</div><div class="subtitle">Parte I: Plan de Proyecto (continuación)</div></div>
  <div class="subtitle">Desarrollo de Software I · 2026-I</div>
</div>

<h2>5. Arquitectura del Sistema y Diseño de Base de Datos</h2>
<p>El sistema se fundamenta en un modelo relacional robusto derivado de la base de datos <code>bdtupa20260511.sql</code> y una arquitectura distribuida de 3 capas.</p>
<div class="arch-diagram">
  <div class="arch-layer" style="background:#f5eaec; border-color:#7B1828;">
    <div class="layer-name">👤 Cliente Web (Navegador)</div>
    <div class="layer-tech">Estudiante / Funcionario UNSAAC</div>
  </div>
  <div class="arch-arrow">↕ HTTPS</div>
  <div class="arch-layer">
    <div class="layer-name">Servidor 3 — Capa de Presentación</div>
    <div class="layer-tech">HTML5 · CSS3 · JavaScript ES6+ · Nginx</div>
  </div>
  <div class="arch-arrow">↕ AJAX / JSON API</div>
  <div class="arch-layer">
    <div class="layer-name">Servidor 2 — Capa de Lógica de Negocio</div>
    <div class="layer-tech">Node.js · Express.js · API REST · Puerto 443</div>
  </div>
  <div class="arch-arrow">↕ SQL · Puerto 3306</div>
  <div class="arch-layer">
    <div class="layer-name">Servidor 1 — Capa de Datos</div>
    <div class="layer-tech">MySQL 8.0 / MariaDB · Red privada UNSAAC</div>
  </div>
</div>
<h3>Entidades Clave de la Base de Datos</h3>
<table>
  <thead><tr><th>Tabla</th><th>Descripción</th></tr></thead>
  <tbody>
    <tr><td><code>tcatalogotramite</code></td><td>Catálogo oficial de procedimientos TUPA con códigos, denominaciones y clasificación.</td></tr>
    <tr><td><code>trequisitotramite</code></td><td>Requisitos legales de cada trámite (documentos, fotos, formularios).</td></tr>
    <tr><td><code>tmontotramite</code></td><td>Vigencia y cuantía de los costos administrativos por trámite.</td></tr>
    <tr><td><code>tsolicitudtramite</code></td><td>Solicitudes de los administrados con control de estados (SOLICITADO, EN PROCESO, PAGADO, CERRADO, ANULADO).</td></tr>
    <tr><td><code>tsolicitudtramitedetalle</code></td><td>Archivos digitales y trazabilidad del historial de cada solicitud.</td></tr>
    <tr><td><code>tunidadorganizativa</code></td><td>Mapa de dependencias responsables (Decanatos, Secretaría General, etc.).</td></tr>
    <tr><td><code>tunidadtramite</code></td><td>Relación entre trámites y la dependencia encargada de resolverlos.</td></tr>
    <tr><td><code>tsolicitante</code></td><td>Datos del administrado: código de alumno, DNI, nombres, contacto.</td></tr>
  </tbody>
</table>

<h2>6. Cronograma Semestral (2026-I)</h2>
<table style="font-size:8.5pt;">
  <thead>
    <tr>
      <th style="min-width:140px;">Actividad</th>
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

<h2>7. Presupuesto Estimado del Proyecto</h2>
<table>
  <thead><tr><th>Categoría</th><th>Recurso</th><th>Cant.</th><th>Costo Unit. (S/.)</th><th>Total (S/.)</th></tr></thead>
  <tbody>
    <tr><td>Hardware</td><td>Laptop de desarrollo (uso compartido)</td><td>2</td><td>0.00</td><td>0.00</td></tr>
    <tr><td>Software</td><td>VS Code, Git, MySQL Workbench (gratuitos)</td><td>—</td><td>0.00</td><td>0.00</td></tr>
    <tr><td>Hosting</td><td>Servidor en la nube — Render/Railway (plan gratuito)</td><td>4 meses</td><td>0.00</td><td>0.00</td></tr>
    <tr><td>Base de datos</td><td>MySQL gestionado en la nube (plan gratuito)</td><td>4 meses</td><td>0.00</td><td>0.00</td></tr>
    <tr><td>Materiales</td><td>Impresión de documentación para entrega</td><td>50 páginas</td><td>0.20</td><td>10.00</td></tr>
    <tr><td>Transporte</td><td>Coordinación presencial entre integrantes</td><td>10 pasajes</td><td>2.00</td><td>20.00</td></tr>
    <tr><td>Internet</td><td>Datos móviles y conexión para desarrollo</td><td>4 meses</td><td>30.00</td><td>120.00</td></tr>
    <tr style="background:#7B1828; color:white;"><td colspan="4"><strong>TOTAL ESTIMADO</strong></td><td><strong>S/. 150.00</strong></td></tr>
  </tbody>
</table>
<div class="info-box"><p>El proyecto utiliza exclusivamente herramientas gratuitas (open-source y planes free-tier), por lo que el costo económico directo es mínimo. El principal recurso invertido es el tiempo del equipo de desarrollo.</p></div>

<h2>8. Evaluación y Monitoreo del Proyecto</h2>
<h3>8.1 Indicadores de Desempeño (KPIs)</h3>
<table>
  <thead><tr><th>Indicador</th><th>Descripción</th><th>Meta</th></tr></thead>
  <tbody>
    <tr><td>Cobertura de requerimientos</td><td>Porcentaje de RF implementados sobre el total definido</td><td>100%</td></tr>
    <tr><td>Funcionalidades operativas</td><td>Casos de uso completamente funcionales al cierre</td><td>6 / 6</td></tr>
    <tr><td>Tiempo de respuesta de búsqueda</td><td>Tiempo máximo de filtrado del catálogo TUPA</td><td>&lt; 1.5 s</td></tr>
    <tr><td>Reducción de consultas presenciales</td><td>Estimación de reducción por digitalización</td><td>60%</td></tr>
    <tr><td>Despliegue en producción</td><td>Sistema accesible desde URL pública en la nube</td><td>Sí</td></tr>
  </tbody>
</table>
<h3>8.2 Mecanismos de Monitoreo</h3>
<ul>
  <li><strong>Reuniones quincenales:</strong> Revisión del avance de cada sprint mediante lista de actividades completadas vs. planificadas.</li>
  <li><strong>Control de versiones:</strong> Historial de commits en GitHub como evidencia de progreso continuo.</li>
  <li><strong>Pruebas por entregable:</strong> Validación funcional de cada módulo antes de marcarlo como completado.</li>
  <li><strong>Retroalimentación del docente:</strong> Incorporación de observaciones de las entregas parciales en la versión final.</li>
</ul>

<div class="page-break"></div>
<div class="doc-header">
  <div><div class="title">UNSAAC — Plataforma Web TUPA</div><div class="subtitle">Parte I: Plan de Proyecto (continuación)</div></div>
  <div class="subtitle">Desarrollo de Software I · 2026-I</div>
</div>

<h2>9. Participantes del Proyecto</h2>
<h3>9.1 Equipo Interno (Desarrolladores)</h3>
<table>
  <thead><tr><th>Rol</th><th>Apellidos y Nombres</th><th>Código UNSAAC</th><th>Correo Institucional</th></tr></thead>
  <tbody>
    <tr><td>Desarrollador Líder / BD</td><td>[Apellido, Nombre]</td><td>[Código]</td><td>[codigo]@unsaac.edu.pe</td></tr>
    <tr><td>Desarrollador Frontend / Docs</td><td>[Apellido, Nombre]</td><td>[Código]</td><td>[codigo]@unsaac.edu.pe</td></tr>
  </tbody>
</table>
<h3>9.2 Equipo Externo (Asesores y Stakeholders)</h3>
<table>
  <thead><tr><th>Rol</th><th>Apellidos y Nombres</th><th>Institución / Cargo</th></tr></thead>
  <tbody>
    <tr><td>Docente responsable</td><td>Monzón Condori, Luis Álvaro</td><td>UNSAAC — Docente Desarrollo de Software I</td></tr>
    <tr><td>Docente responsable</td><td>Quispe Sota, Julio Vladimir</td><td>UNSAAC — Docente Desarrollo de Software I</td></tr>
    <tr><td>Usuario piloto (administrado)</td><td>Estudiante representativo</td><td>UNSAAC — Alumno de pregrado</td></tr>
    <tr><td>Usuario piloto (oficina)</td><td>Personal administrativo</td><td>UNSAAC — Dirección de Registro Académico</td></tr>
  </tbody>
</table>

<h2>10. Aspectos Administrativos</h2>
<h3>10.1 Modalidad de Trabajo</h3>
<p>El proyecto se desarrolla en modalidad <strong>híbrida</strong> (presencial y remota), con coordinación a través de GitHub (código), WhatsApp (comunicación inmediata) y reuniones en las instalaciones de la UNSAAC.</p>
<h3>10.2 Gestión de Riesgos</h3>
<table>
  <thead><tr><th>Riesgo Identificado</th><th>Prob.</th><th>Impacto</th><th>Estrategia de Mitigación</th></tr></thead>
  <tbody>
    <tr><td>Falta de disponibilidad del equipo por evaluaciones</td><td>Alta</td><td>Medio</td><td>Distribución equitativa de tareas con anticipación a semanas de exámenes</td></tr>
    <tr><td>Problemas de conectividad o acceso a la nube</td><td>Media</td><td>Alto</td><td>Mantener versión local funcional; usar múltiples proveedores gratuitos</td></tr>
    <tr><td>Cambios en requisitos por el docente</td><td>Baja</td><td>Alto</td><td>Documentación versionada en Git para revertir o ajustar fácilmente</td></tr>
    <tr><td>Incompatibilidades en la estructura SQL del TUPA</td><td>Media</td><td>Medio</td><td>Uso de datos extraídos y validados (<code>extracted_tupa_data.json</code>) como respaldo</td></tr>
    <tr><td>Pérdida de código por fallo de hardware</td><td>Baja</td><td>Alto</td><td>Repositorio remoto en GitHub como respaldo permanente</td></tr>
  </tbody>
</table>
<h3>10.3 Restricciones del Proyecto</h3>
<ul>
  <li>Tecnologías limitadas a: HTML, CSS, JavaScript, Node.js y MySQL.</li>
  <li>Presupuesto disponible: S/. 150.00 (prioridad en herramientas gratuitas).</li>
  <li>Plazo máximo: último mes del semestre 2026-I.</li>
</ul>

<h2>11. Prototipado Funcional</h2>
<p>El prototipo se desarrolló como una <strong>interfaz web funcional de alta fidelidad</strong> implementada en HTML5, CSS3 y JavaScript. Cubre todos los flujos definidos en los casos de uso.</p>
<table>
  <thead><tr><th>Vista / Módulo</th><th>Portal</th><th>Descripción</th></tr></thead>
  <tbody>
    <tr><td>Catálogo de Trámites TUPA</td><td>Estudiante</td><td>Búsqueda dinámica con tarjetas, filtro por oficina y modal de detalle con requisitos y costos</td></tr>
    <tr><td>Formulario de Solicitud Digital</td><td>Estudiante</td><td>Datos del alumno, checklist de requisitos obligatorios, carga de archivos y registro de voucher</td></tr>
    <tr><td>Pasarela de Pagos</td><td>Estudiante</td><td>Selección de método (Banco, Yape, Plin, Visa, Mastercard), generación de código de pago</td></tr>
    <tr><td>Trazabilidad del Trámite</td><td>Estudiante</td><td>Búsqueda por código de trámite o DNI, línea de tiempo del historial de estados</td></tr>
    <tr><td>Panel de Control / Dashboard</td><td>Administrativo</td><td>Contadores KPI, gráfico de barras por dependencia y gráfico donut de estados</td></tr>
    <tr><td>Bandeja de Recepción</td><td>Administrativo</td><td>Tabla filtrable por oficina, modal de calificación y cambio de estado del expediente</td></tr>
    <tr><td>Analíticas y Reportes</td><td>Administrativo</td><td>Exportación de reporte consolidado en formato CSV</td></tr>
  </tbody>
</table>

<h2>12. Resultados Esperados</h2>
<ul>
  <li>Plataforma web estable, responsiva y estéticamente sobresaliente que reduce el tiempo de atención de trámites en un <strong>60%</strong>.</li>
  <li>Centralización del catálogo TUPA, eliminando las consultas físicas redundantes.</li>
  <li>Trazabilidad completa y transparente del trámite para el estudiante, con notificaciones visuales en tiempo real.</li>
  <li>Panel directivo que permite identificar retrasos y cuellos de botella mediante estadísticas claras.</li>
  <li>Sistema desplegado en la nube, accesible desde cualquier dispositivo con conexión a internet.</li>
</ul>

<!-- ════════════════════════════════════════════════════
     PARTE II — INGENIERÍA DE REQUERIMIENTOS
     ════════════════════════════════════════════════════ -->
<div class="page-break"></div>
<div class="doc-header">
  <div><div class="title">UNSAAC — Plataforma Web TUPA</div><div class="subtitle">Parte II: Ingeniería de Requerimientos</div></div>
  <div class="subtitle">Desarrollo de Software I · 2026-I</div>
</div>
<div class="part-title">
  <div class="part-label">Parte II</div>
  <h2 style="color:white;border:none;margin:0;padding:0;">Ingeniería de Requerimientos</h2>
</div>

<h2>1. Requerimientos Funcionales (RF)</h2>
<table>
  <thead><tr><th style="width:70px;">Código</th><th>Nombre</th><th>Descripción</th><th style="width:65px;">Prioridad</th></tr></thead>
  <tbody>
    <tr><td><strong>RF-01</strong></td><td>Búsqueda Dinámica de Trámites</td><td>El sistema debe permitir buscar trámites TUPA por código, denominación o palabras clave en tiempo real.</td><td><span class="badge badge-alta">Alta</span></td></tr>
    <tr><td><strong>RF-02</strong></td><td>Consulta de Requisitos y Tasas</td><td>El sistema debe mostrar la descripción, requisitos obligatorios, costos y código de banco de cada trámite.</td><td><span class="badge badge-alta">Alta</span></td></tr>
    <tr><td><strong>RF-03</strong></td><td>Registro Digital de Solicitudes</td><td>Permitir a los administrados iniciar solicitudes registrando datos personales, código de alumno, DNI y adjuntando archivos digitales.</td><td><span class="badge badge-alta">Alta</span></td></tr>
    <tr><td><strong>RF-04</strong></td><td>Carga y Validación de Archivos</td><td>Validar la carga de archivos (PDF, JPG, PNG) con peso máximo de 15MB para evitar sobrecarga del servidor.</td><td><span class="badge badge-media">Media</span></td></tr>
    <tr><td><strong>RF-05</strong></td><td>Validación de Comprobante de Pago</td><td>Exigir el registro de un número de voucher bancario único para cada solicitud ingresada.</td><td><span class="badge badge-alta">Alta</span></td></tr>
    <tr><td><strong>RF-06</strong></td><td>Registro Independiente de Pago</td><td>Permitir registrar el pago de tasas de forma separada, adjuntar el comprobante y generar un código de seguimiento.</td><td><span class="badge badge-alta">Alta</span></td></tr>
    <tr><td><strong>RF-07</strong></td><td>Rastreo y Trazabilidad</td><td>Permitir consultar el estado del expediente (SOLICITADO, EN PROCESO, PAGADO, CERRADO, ANULADO) mediante DNI o código único.</td><td><span class="badge badge-alta">Alta</span></td></tr>
    <tr><td><strong>RF-08</strong></td><td>Bandeja de Gestión por Oficina</td><td>Proveer bandeja de entrada exclusiva para el personal administrativo, filtrable por dependencia organizativa.</td><td><span class="badge badge-alta">Alta</span></td></tr>
    <tr><td><strong>RF-09</strong></td><td>Calificación y Cambio de Estado</td><td>El personal de oficina puede validar documentos, registrar observaciones y actualizar el estado de trazabilidad.</td><td><span class="badge badge-alta">Alta</span></td></tr>
    <tr><td><strong>RF-10</strong></td><td>Panel de Estadísticas y Analíticas</td><td>Dashboard visual con gráficos del volumen de trámites por oficina y distribución de estados de solicitudes.</td><td><span class="badge badge-media">Media</span></td></tr>
    <tr><td><strong>RF-11</strong></td><td>Generación de Reportes Financieros</td><td>Exportar reporte consolidado de trámites y pagos verificados en formato CSV/Excel.</td><td><span class="badge badge-media">Media</span></td></tr>
  </tbody>
</table>

<h2>2. Requerimientos No Funcionales (RNF)</h2>
<table>
  <thead><tr><th style="width:70px;">Código</th><th style="width:120px;">Categoría</th><th>Descripción</th></tr></thead>
  <tbody>
    <tr><td><strong>RNF-01</strong></td><td>Seguridad</td><td>Los datos sensibles (contraseñas, DNI) deben almacenarse cifrados en la BD mediante algoritmos hash (bcrypt).</td></tr>
    <tr><td><strong>RNF-02</strong></td><td>Disponibilidad</td><td>El sistema debe garantizar disponibilidad mínima del 99.5% durante el periodo académico.</td></tr>
    <tr><td><strong>RNF-03</strong></td><td>Rendimiento</td><td>El tiempo de respuesta del catálogo no debe exceder 1.5 segundos bajo carga normal de usuarios concurrentes.</td></tr>
    <tr><td><strong>RNF-04</strong></td><td>Usabilidad</td><td>La interfaz web debe ser responsiva y cumplir con contrastes de color accesibles según directrices WCAG 2.1.</td></tr>
    <tr><td><strong>RNF-05</strong></td><td>Arquitectura</td><td>El sistema debe estructurarse en topología distribuida de tres capas: Datos, Lógica y Presentación.</td></tr>
  </tbody>
</table>

<div class="page-break"></div>
<div class="doc-header">
  <div><div class="title">UNSAAC — Plataforma Web TUPA</div><div class="subtitle">Parte II: Historias de Usuario</div></div>
  <div class="subtitle">Desarrollo de Software I · 2026-I</div>
</div>

<h2>3. Historias de Usuario (HU)</h2>

<div class="uc-card">
  <div class="uc-card-header"><span class="uc-id">HU-01</span><span class="uc-name">Consulta de Requisitos — Estudiante</span></div>
  <div class="uc-card-body">
    <div class="uc-field"><div class="field-label">Como</div>Estudiante egresado de la UNSAAC</div>
    <div class="uc-field"><div class="field-label">Quiero</div>Consultar de manera rápida y en línea los costos y documentos requeridos para el trámite de Grado de Bachiller.</div>
    <div class="uc-field"><div class="field-label">Para</div>Evitar trasladarme físicamente a la universidad y realizar colas solo para recabar información básica.</div>
    <div class="uc-field"><div class="field-label">Criterios de Aceptación</div>
      <ul class="uc-steps">
        <li>Al ingresar "bachiller", el sistema debe listar los trámites coincidentes en menos de 1 segundo.</li>
        <li>Al seleccionar el trámite, se visualizan las tasas en soles, el código del Banco de la Nación y los 5 requisitos oficiales.</li>
      </ul>
    </div>
  </div>
</div>

<div class="uc-card">
  <div class="uc-card-header"><span class="uc-id">HU-02</span><span class="uc-name">Registro de Solicitud Digital — Estudiante</span></div>
  <div class="uc-card-body">
    <div class="uc-field"><div class="field-label">Como</div>Alumno regular de la UNSAAC</div>
    <div class="uc-field"><div class="field-label">Quiero</div>Enviar mi solicitud de carné universitario adjuntando mi foto formal y el voucher de pago desde mi hogar.</div>
    <div class="uc-field"><div class="field-label">Para</div>Ahorrar tiempo y formalizar mi derecho al carné sin trámites presenciales.</div>
    <div class="uc-field"><div class="field-label">Criterios de Aceptación</div>
      <ul class="uc-steps">
        <li>El sistema obliga a marcar todos los requisitos antes de habilitar el botón de envío.</li>
        <li>Rechaza archivos de más de 15MB.</li>
        <li>Genera automáticamente un código único alfanumérico (ej. TR-2026-X) al enviar.</li>
      </ul>
    </div>
  </div>
</div>

<div class="uc-card">
  <div class="uc-card-header"><span class="uc-id">HU-03</span><span class="uc-name">Seguimiento de Trámite — Estudiante</span></div>
  <div class="uc-card-body">
    <div class="uc-field"><div class="field-label">Como</div>Estudiante solicitante de un traslado de sede</div>
    <div class="uc-field"><div class="field-label">Quiero</div>Conocer en tiempo real en qué oficina se encuentra mi expediente o si ha sido observado.</div>
    <div class="uc-field"><div class="field-label">Para</div>Tener la certeza del avance y corregir a tiempo cualquier inconveniente sin ir a las oficinas de rectorado.</div>
    <div class="uc-field"><div class="field-label">Criterios de Aceptación</div>
      <ul class="uc-steps">
        <li>Ingresando el DNI o código de trámite se muestra una línea de tiempo visual con etapas completadas e historial de logs.</li>
      </ul>
    </div>
  </div>
</div>

<div class="uc-card">
  <div class="uc-card-header"><span class="uc-id">HU-04</span><span class="uc-name">Validación y Calificación de Expediente — Funcionario</span></div>
  <div class="uc-card-body">
    <div class="uc-field"><div class="field-label">Como</div>Funcionario administrativo del Decanato de Facultad</div>
    <div class="uc-field"><div class="field-label">Quiero</div>Ver únicamente las solicitudes asignadas a mi facultad, evaluar los archivos digitalizados y aprobar o registrar observaciones.</div>
    <div class="uc-field"><div class="field-label">Para</div>Agilizar la validación de expedientes y notificar de inmediato al estudiante el resultado.</div>
    <div class="uc-field"><div class="field-label">Criterios de Aceptación</div>
      <ul class="uc-steps">
        <li>La bandeja autofiltrar los trámites de competencia de su oficina.</li>
        <li>El funcionario puede visualizar el archivo adjunto y cambiar el estado en un solo formulario.</li>
      </ul>
    </div>
  </div>
</div>

<div class="uc-card">
  <div class="uc-card-header"><span class="uc-id">HU-05</span><span class="uc-name">Registro de Pago Independiente — Estudiante</span></div>
  <div class="uc-card-body">
    <div class="uc-field"><div class="field-label">Como</div>Estudiante que ya pagó la tasa de un trámite</div>
    <div class="uc-field"><div class="field-label">Quiero</div>Registrar el voucher y adjuntar el comprobante bancario por separado del envío inicial de la solicitud.</div>
    <div class="uc-field"><div class="field-label">Para</div>Que Tesorería valide el pago rápidamente y el trámite quede asociado correctamente al pago.</div>
    <div class="uc-field"><div class="field-label">Criterios de Aceptación</div>
      <ul class="uc-steps">
        <li>Permite seleccionar el trámite y muestra el monto exacto a pagar.</li>
        <li>Valida que el voucher no esté vacío y el comprobante sea PDF/JPG/PNG de máx. 15MB.</li>
        <li>Genera un código de seguimiento de pago para usar en el rastreo.</li>
      </ul>
    </div>
  </div>
</div>

<!-- CASOS DE USO -->
<div class="page-break"></div>
<div class="doc-header">
  <div><div class="title">UNSAAC — Plataforma Web TUPA</div><div class="subtitle">Parte II: Casos de Uso</div></div>
  <div class="subtitle">Desarrollo de Software I · 2026-I</div>
</div>

<h2>4. Casos de Uso (CU)</h2>
<h3>4.1 Diagrama General de Casos de Uso</h3>

<div class="uc-diagram">
  <div style="display:flex; flex-direction:column; align-items:center; gap:6px; min-width:100px;">
    <div class="uc-actor-icon">👤</div>
    <div class="uc-actor-label">Administrado<br>(Estudiante)</div>
  </div>
  <div class="uc-arrow">→</div>
  <div class="uc-list">
    <div class="uc-box">UC-01: Buscar Trámites y Requisitos</div>
    <div class="uc-box">UC-02: Registrar Solicitud de Trámite</div>
    <div class="uc-box">UC-03: Rastrear Estado de Solicitud</div>
    <div class="uc-box">UC-06: Registrar Pago de Tasas</div>
    <div class="uc-separator"></div>
    <div class="uc-box admin">UC-04: Validar y Calificar Expediente</div>
    <div class="uc-box admin">UC-05: Generar Analíticas e Informes</div>
  </div>
  <div class="uc-arrow">←</div>
  <div style="display:flex; flex-direction:column; align-items:center; gap:6px; min-width:100px;">
    <div class="uc-actor-icon">🏛️</div>
    <div class="uc-actor-label">Funcionario<br>UNSAAC</div>
  </div>
</div>

<h3>4.2 Descripciones de Alto Nivel</h3>

<div class="uc-card">
  <div class="uc-card-header"><span class="uc-id">UC-01</span><span class="uc-name">Buscar Trámites y Requisitos en el TUPA</span></div>
  <div class="uc-card-body">
    <div class="uc-field"><div class="field-label">Actor</div>Administrado (Estudiante / Egresado)</div>
    <div class="uc-field"><div class="field-label">Descripción</div>El estudiante ingresa criterios de búsqueda y visualiza la ficha técnica del procedimiento TUPA con descripción, dependencias, costos y requisitos.</div>
    <div class="uc-field"><div class="field-label">Flujo Básico</div>
      <ol class="uc-steps">
        <li>El estudiante abre el portal web de la UNSAAC.</li>
        <li>El sistema despliega el catálogo de trámites completo por defecto.</li>
        <li>El estudiante escribe un término ("carnet") en el buscador.</li>
        <li>El sistema filtra dinámicamente las tarjetas de trámites en pantalla.</li>
        <li>El estudiante hace clic en "Ver Requisitos".</li>
        <li>El sistema abre un modal emergente con la descripción legal, tasa del Banco de la Nación y documentos a adjuntar.</li>
      </ol>
    </div>
    <div class="uc-field"><div class="field-label">RF Relacionados</div>RF-01, RF-02</div>
  </div>
</div>

<div class="uc-card">
  <div class="uc-card-header"><span class="uc-id">UC-02</span><span class="uc-name">Registrar Solicitud de Trámite Digital</span></div>
  <div class="uc-card-body">
    <div class="uc-field"><div class="field-label">Actor</div>Administrado (Estudiante / Egresado)</div>
    <div class="uc-field"><div class="field-label">Descripción</div>El estudiante rellena sus datos, marca el cumplimiento de requisitos, carga documentos digitalizados y registra el voucher bancario para crear el expediente electrónico.</div>
    <div class="uc-field"><div class="field-label">Flujo Básico</div>
      <ol class="uc-steps">
        <li>El estudiante hace clic en "Iniciar Trámite" desde el catálogo.</li>
        <li>El sistema carga el formulario con los datos del trámite seleccionado.</li>
        <li>El estudiante ingresa código de alumno, DNI, nombres, apellidos, correo y teléfono.</li>
        <li>El estudiante marca las casillas de verificación de los requisitos obligatorios.</li>
        <li>El estudiante carga archivos (solicitud firmada, fotos, recibos) en la zona de dropzone.</li>
        <li>El estudiante ingresa el código único del voucher de pago.</li>
        <li>El sistema valida y guarda la solicitud, retornando un código alfanumérico único.</li>
      </ol>
    </div>
    <div class="uc-field"><div class="field-label">RF Relacionados</div>RF-03, RF-04, RF-05</div>
  </div>
</div>

<div class="uc-card">
  <div class="uc-card-header"><span class="uc-id">UC-03</span><span class="uc-name">Rastrear Trazabilidad del Trámite</span></div>
  <div class="uc-card-body">
    <div class="uc-field"><div class="field-label">Actor</div>Administrado (Estudiante / Egresado)</div>
    <div class="uc-field"><div class="field-label">Descripción</div>Permite al solicitante auditar en qué estado operativo se encuentra su expediente electrónico sin requerir atención presencial.</div>
    <div class="uc-field"><div class="field-label">Flujo Básico</div>
      <ol class="uc-steps">
        <li>El estudiante ingresa a la sección "Trazabilidad".</li>
        <li>Escribe el código único del trámite (ej. TR-2026-0391) o su DNI.</li>
        <li>Hace clic en "Buscar Rastro".</li>
        <li>El sistema busca el registro en la tabla <code>tsolicitudtramite</code>.</li>
        <li>Renderiza una línea de tiempo gráfica indicando SOLICITADO, EN PROCESO, PAGADO, CERRADO u OBSERVADO.</li>
      </ol>
    </div>
    <div class="uc-field"><div class="field-label">RF Relacionados</div>RF-07</div>
  </div>
</div>

<div class="page-break"></div>
<div class="doc-header">
  <div><div class="title">UNSAAC — Plataforma Web TUPA</div><div class="subtitle">Parte II: Casos de Uso (continuación)</div></div>
  <div class="subtitle">Desarrollo de Software I · 2026-I</div>
</div>

<div class="uc-card">
  <div class="uc-card-header"><span class="uc-id">UC-04</span><span class="uc-name">Validar y Calificar Expediente</span></div>
  <div class="uc-card-body">
    <div class="uc-field"><div class="field-label">Actor</div>Funcionario UNSAAC (Personal Administrativo)</div>
    <div class="uc-field"><div class="field-label">Descripción</div>El personal administrativo filtra las solicitudes de su dependencia, inspecciona los archivos digitales cargados y cambia el estado de la solicitud para avanzar el flujo o rechazarla.</div>
    <div class="uc-field"><div class="field-label">Flujo Básico</div>
      <ol class="uc-steps">
        <li>El funcionario ingresa al portal administrativo y selecciona su oficina en el filtro.</li>
        <li>El sistema carga los trámites correspondientes.</li>
        <li>El funcionario selecciona una solicitud y hace clic en "Calificar".</li>
        <li>El sistema despliega un modal con los datos, voucher y archivos digitales adjuntos.</li>
        <li>El funcionario valida los archivos visualmente.</li>
        <li>Cambia el estado (SOLICITADO → EN PROCESO / CERRADO / ANULADO) y presiona "Guardar Resolución".</li>
        <li>El sistema actualiza la BD e inserta una nueva entrada en el historial de trazabilidad.</li>
      </ol>
    </div>
    <div class="uc-field"><div class="field-label">RF Relacionados</div>RF-08, RF-09</div>
  </div>
</div>

<div class="uc-card">
  <div class="uc-card-header"><span class="uc-id">UC-05</span><span class="uc-name">Generar Analíticas e Informes del Sistema</span></div>
  <div class="uc-card-body">
    <div class="uc-field"><div class="field-label">Actor</div>Funcionario UNSAAC (Director de Oficina / Administrador del Sistema)</div>
    <div class="uc-field"><div class="field-label">Descripción</div>El director accede al panel de control estadístico, visualiza KPIs y gráficos de volumen por dependencia y distribución de estados, y exporta informes auditables en CSV para la toma de decisiones.</div>
    <div class="uc-field"><div class="field-label">Flujo Básico</div>
      <ol class="uc-steps">
        <li>El funcionario ingresa al portal administrativo y selecciona "Panel General".</li>
        <li>El sistema carga el dashboard con cuatro contadores: expedientes totales, en evaluación, vouchers validados y trámites resueltos.</li>
        <li>El sistema renderiza el gráfico de barras con el volumen por dependencia (Decanato, Secretaría General, Registro Académico, Caja).</li>
        <li>El sistema renderiza el gráfico donut con la distribución porcentual de estados.</li>
        <li>El funcionario navega a "Analíticas / Reportes" y hace clic en "Exportar Reporte General CSV".</li>
        <li>El sistema descarga automáticamente el archivo .csv con todos los registros de solicitudes.</li>
      </ol>
    </div>
    <div class="uc-field"><div class="field-label">Flujo Alternativo</div>Si no existen solicitudes, los indicadores se muestran en cero y el botón de exportación se deshabilita.</div>
    <div class="uc-field"><div class="field-label">RF Relacionados</div>RF-10, RF-11</div>
  </div>
</div>

<div class="uc-card">
  <div class="uc-card-header"><span class="uc-id">UC-06</span><span class="uc-name">Registrar Pago de Tasas Independiente</span></div>
  <div class="uc-card-body">
    <div class="uc-field"><div class="field-label">Actor</div>Administrado (Estudiante / Egresado)</div>
    <div class="uc-field"><div class="field-label">Descripción</div>El estudiante que ya realizó el depósito bancario registra el pago por separado, envía el voucher y el comprobante, y obtiene un código para que Tesorería valide la operación.</div>
    <div class="uc-field"><div class="field-label">Flujo Básico</div>
      <ol class="uc-steps">
        <li>El estudiante abre la "Pasarela de Pagos" desde el portal de estudiantes.</li>
        <li>Selecciona el trámite correspondiente al pago.</li>
        <li>El sistema muestra el monto y el código de banco.</li>
        <li>El estudiante selecciona el método de pago (Banco de la Nación, Yape, Plin, Visa, Mastercard).</li>
        <li>Ingresa sus datos personales y adjunta el comprobante en PDF/JPG/PNG.</li>
        <li>Ingresa el número de voucher bancario y genera el código de referencia.</li>
        <li>El sistema registra el pago y genera el código de seguimiento con estado PENDIENTE.</li>
      </ol>
    </div>
    <div class="uc-field"><div class="field-label">RF Relacionados</div>RF-06</div>
  </div>
</div>

<!-- MATRIZ DE TRAZABILIDAD -->
<div class="page-break"></div>
<div class="doc-header">
  <div><div class="title">UNSAAC — Plataforma Web TUPA</div><div class="subtitle">Parte II: Matriz de Trazabilidad</div></div>
  <div class="subtitle">Desarrollo de Software I · 2026-I</div>
</div>

<h2>5. Matriz de Trazabilidad de Requerimientos</h2>
<p>La siguiente matriz mapea los Requerimientos Funcionales (RF), las Historias de Usuario (HU) y los Casos de Uso (CU), asegurando la cobertura completa del alcance del software.</p>
<table style="font-size:9pt;">
  <thead>
    <tr>
      <th style="width:70px;">RF</th>
      <th>Nombre del Requerimiento</th>
      <th style="width:70px;">HU Asociada</th>
      <th style="width:70px;">CU Vinculado</th>
      <th style="width:100px;">Estado</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><strong>RF-01</strong></td><td>Búsqueda Dinámica de Trámites</td><td>HU-01</td><td>CU-01</td><td style="color:#16a34a; font-weight:700;">✅ Implementado</td></tr>
    <tr><td><strong>RF-02</strong></td><td>Consulta de Requisitos y Tasas</td><td>HU-01</td><td>CU-01</td><td style="color:#16a34a; font-weight:700;">✅ Implementado</td></tr>
    <tr><td><strong>RF-03</strong></td><td>Registro Digital de Solicitudes</td><td>HU-02</td><td>CU-02</td><td style="color:#16a34a; font-weight:700;">✅ Implementado</td></tr>
    <tr><td><strong>RF-04</strong></td><td>Carga y Validación de Archivos</td><td>HU-02</td><td>CU-02</td><td style="color:#16a34a; font-weight:700;">✅ Implementado</td></tr>
    <tr><td><strong>RF-05</strong></td><td>Validación de Comprobante de Pago</td><td>HU-02</td><td>CU-02</td><td style="color:#16a34a; font-weight:700;">✅ Implementado</td></tr>
    <tr><td><strong>RF-06</strong></td><td>Registro Independiente de Pago</td><td>HU-05</td><td>CU-06</td><td style="color:#16a34a; font-weight:700;">✅ Implementado</td></tr>
    <tr><td><strong>RF-07</strong></td><td>Rastreo y Trazabilidad (Tracking)</td><td>HU-03</td><td>CU-03</td><td style="color:#16a34a; font-weight:700;">✅ Implementado</td></tr>
    <tr><td><strong>RF-08</strong></td><td>Bandeja de Gestión por Oficina</td><td>HU-04</td><td>CU-04</td><td style="color:#16a34a; font-weight:700;">✅ Implementado</td></tr>
    <tr><td><strong>RF-09</strong></td><td>Calificación y Cambio de Estado</td><td>HU-04</td><td>CU-04</td><td style="color:#16a34a; font-weight:700;">✅ Implementado</td></tr>
    <tr><td><strong>RF-10</strong></td><td>Panel de Estadísticas y Analíticas</td><td>N/A (Admin)</td><td>CU-05</td><td style="color:#16a34a; font-weight:700;">✅ Implementado</td></tr>
    <tr><td><strong>RF-11</strong></td><td>Generación de Reportes Financieros</td><td>N/A (Admin)</td><td>CU-05</td><td style="color:#16a34a; font-weight:700;">✅ Implementado</td></tr>
  </tbody>
</table>

<div class="info-box">
  <p><strong>Cobertura:</strong> 11 de 11 requerimientos funcionales (100%) están vinculados a al menos un caso de uso implementado en la interfaz gráfica de la plataforma.</p>
</div>

<h2>6. Arquitectura del Sistema — Topología Distribuida de 3 Capas</h2>
<p>La plataforma se implementa bajo una arquitectura distribuida de 3 servidores independientes para garantizar seguridad, escalabilidad y separación de responsabilidades:</p>
<table>
  <thead><tr><th>Servidor</th><th>Capa</th><th>Tecnología</th><th>Función Principal</th></tr></thead>
  <tbody>
    <tr>
      <td><strong>Servidor 1</strong></td>
      <td>Datos</td>
      <td>MySQL 8.0 / MariaDB</td>
      <td>Almacena todas las entidades del sistema. Aislado en subred privada, solo acepta conexiones desde el Servidor 2 en el puerto TCP 3306.</td>
    </tr>
    <tr>
      <td><strong>Servidor 2</strong></td>
      <td>Lógica de Negocio</td>
      <td>Node.js / Express.js</td>
      <td>Aloja la API REST (<code>/api/v1/tupa</code>, <code>/api/v1/solicitudes</code>). Procesa búsquedas, valida vouchers, gestiona cargas de archivos y actualiza estados de trazabilidad.</td>
    </tr>
    <tr>
      <td><strong>Servidor 3</strong></td>
      <td>Presentación</td>
      <td>HTML5 / CSS3 / JS + Nginx</td>
      <td>Sirve los recursos de interfaz (HTML, CSS, JS) a los navegadores. El cliente realiza llamadas AJAX al Servidor 2 en segundo plano.</td>
    </tr>
  </tbody>
</table>

<div class="page-footer">
  <span>UNSAAC — Plataforma Web de Gestión del TUPA · Desarrollo de Software I · Semestre 2026-I</span>
  <span>Cusco, Perú · 2026</span>
</div>

</body>
</html>`;

async function generatePDF() {
  console.log('Iniciando generación del informe PDF...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    await page.pdf({
      path: OUTPUT_PATH,
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

    console.log('');
    console.log('✅  Informe PDF generado exitosamente.');
    console.log('📄  Archivo: Informe_TUPA_UNSAAC_2026.pdf');
    console.log('📁  Ubicación: ' + OUTPUT_PATH);
  } finally {
    await browser.close();
  }
}

generatePDF().catch(err => {
  console.error('❌ Error al generar el PDF:', err.message);
  process.exit(1);
});
