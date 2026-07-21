const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_PATH = path.join(__dirname, 'Guion_Exposicion_TUPA.pdf');

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@600;700;800&display=swap');

  :root {
    --g:  #7B1828;
    --g2: #A52035;
    --pale: #f5eaec;
    --pale2: #fdf5f6;
    --text: #1C0A0E;
    --muted: #6B3040;
    --border: #d4b0b7;
    --green: #15803d;
    --gbg:  #f0fdf4;
    --blue: #1d4ed8;
    --bbg:  #eff6ff;
    --amber:#b45309;
    --abg:  #fffbeb;
    --purple:#6d28d9;
    --pbg:  #f5f3ff;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family:'Inter','Segoe UI',Arial,sans-serif;
    font-size:10.5pt; color:var(--text); line-height:1.60; background:#fff;
  }
  .pb { page-break-before:always; }

  /* ── PORTADA ── */
  .cover { min-height:277mm; display:flex; flex-direction:column; }
  .ctop  { background:var(--g); padding:32px 40px; color:#fff; }
  .ctop .uni  { font-size:11.5pt; font-weight:700; margin-bottom:3px; }
  .ctop .prog { font-size:9pt; opacity:.75; text-transform:uppercase; letter-spacing:1.5px; }
  .cbody { flex:1; padding:40px; display:flex; flex-direction:column; justify-content:center; }
  .ctag  {
    display:inline-block; background:var(--pale); border:2px solid var(--g);
    color:var(--g); font-weight:800; font-size:8.5pt;
    padding:4px 14px; border-radius:20px; letter-spacing:1px;
    text-transform:uppercase; margin-bottom:18px;
  }
  .ctitle {
    font-family:'Outfit',sans-serif; font-size:27pt; font-weight:800;
    color:var(--g); line-height:1.15; margin-bottom:6px;
  }
  .csub { font-size:12.5pt; color:var(--muted); font-weight:500; margin-bottom:28px; }
  .cline { width:60px; height:4px; background:var(--g); border-radius:2px; margin-bottom:28px; }
  .crow  { display:flex; gap:10px; padding:8px 0; border-bottom:1px solid var(--border); font-size:10pt; }
  .crow .lbl { font-weight:700; color:var(--g); min-width:140px; }
  .cfoot {
    background:var(--pale); border-top:3px solid var(--g);
    padding:12px 40px; text-align:center;
    font-size:9pt; color:var(--muted); font-weight:600;
  }

  /* ── PAGE HEADER ── */
  .ph {
    background:var(--g); color:#fff; padding:8px 22px;
    margin-bottom:20px; border-radius:0 0 8px 8px;
    display:flex; justify-content:space-between;
    align-items:center; font-size:9pt;
  }
  .ph .l { font-weight:700; }
  .ph .r { opacity:.80; }

  h2 {
    font-family:'Outfit',sans-serif; font-size:14pt; font-weight:800;
    color:var(--g); border-bottom:2.5px solid var(--g);
    padding-bottom:5px; margin:22px 0 13px;
  }
  h3 {
    font-family:'Outfit',sans-serif; font-size:11pt; font-weight:700;
    color:var(--g2); margin:16px 0 8px;
  }

  /* ── TIMELINE ── */
  .tlbar {
    background:var(--pale2); border:1.5px solid var(--border);
    border-radius:10px; padding:14px 18px; margin-bottom:20px;
  }
  .tlbar h3 { margin:0 0 10px; }
  .tltrack { display:flex; gap:3px; height:34px; }
  .tls {
    display:flex; align-items:center; justify-content:center;
    border-radius:5px; font-size:7pt; font-weight:700;
    color:#fff; text-align:center; line-height:1.1; padding:2px 3px;
  }

  /* ── RESUMEN TABLE ── */
  .rtbl { width:100%; border-collapse:collapse; font-size:9.5pt; margin-bottom:20px; }
  .rtbl th { background:var(--g); color:#fff; padding:8px 12px; text-align:left; font-size:9pt; }
  .rtbl td { padding:7px 12px; border-bottom:1px solid var(--border); vertical-align:top; }
  .rtbl tr:nth-child(even) td { background:var(--pale2); }

  /* ── MOMENTO ── */
  .mo { border:1.5px solid var(--border); border-radius:12px; margin-bottom:24px; overflow:hidden; page-break-inside:avoid; }
  .mh {
    background:var(--g); color:#fff;
    padding:11px 20px;
    display:flex; align-items:center; gap:12px;
  }
  .mh .mn { font-family:'Outfit',sans-serif; font-size:14pt; font-weight:800; min-width:28px; }
  .mh .mt { font-size:11pt; font-weight:700; flex:1; }
  .mh .ms {
    background:rgba(255,255,255,.22); padding:4px 12px;
    border-radius:20px; font-size:9.5pt; font-weight:700;
    font-family:'Outfit',sans-serif; white-space:nowrap;
  }
  .mb { padding:16px 20px; }

  /* ── BLOQUES ── */
  .bk { border-radius:8px; padding:12px 15px; margin-bottom:11px; }
  .bk:last-child { margin-bottom:0; }

  .bk-p  { background:var(--bbg); border-left:4px solid var(--blue); }
  .bk-p  .bl { color:var(--blue); }

  .bk-d  { background:var(--gbg); border-left:4px solid var(--green); }
  .bk-d  .bl { color:var(--green); }

  .bk-t  { background:var(--abg); border-left:4px solid var(--amber); }
  .bk-t  .bl { color:var(--amber); }

  .bk-q  { background:var(--pbg); border-left:4px solid var(--purple); }
  .bk-q  .bl { color:var(--purple); }

  .bl {
    font-size:7.5pt; font-weight:800; text-transform:uppercase;
    letter-spacing:1px; margin-bottom:6px;
    display:flex; align-items:center; gap:5px;
  }
  .bk p, .bk li { font-size:10pt; margin-bottom:3px; }
  .bk ul, .bk ol { padding-left:18px; }
  .bk strong { font-weight:700; }

  /* ── SCRIPT ── */
  .sc {
    font-style:italic; font-size:10pt; color:#14532d;
    line-height:1.70; background:#fff;
    border:1.5px dashed #86efac;
    border-radius:7px; padding:11px 15px; margin-top:9px;
    position:relative;
  }
  .sc::before {
    content:'"'; font-family:Georgia,serif; font-size:30pt;
    color:var(--green); line-height:.5;
    position:absolute; left:8px; top:14px;
  }
  .sc-body { margin-left:22px; }
  .pause {
    display:inline-block; background:#dcfce7;
    border:1px solid #86efac; border-radius:4px;
    font-size:8pt; font-style:normal; color:#166534;
    font-weight:700; padding:1px 6px; margin:0 2px;
  }

  /* ── STEPS ── */
  .slist { list-style:none; padding:0; }
  .slist li { display:flex; gap:9px; margin-bottom:7px; font-size:10pt; }
  .slist .sn {
    min-width:21px; height:21px; border-radius:50%;
    background:var(--g); color:#fff;
    font-size:8pt; font-weight:700;
    display:flex; align-items:center; justify-content:center;
    flex-shrink:0; margin-top:2px;
  }

  /* ── SUB-STEP en demo ── */
  .substep {
    background:var(--pale); border-radius:8px;
    padding:12px 14px; margin-bottom:12px;
  }
  .substep-hdr {
    font-weight:800; color:var(--g); font-size:10pt;
    margin-bottom:8px;
  }
  .substep-timer { font-weight:500; color:var(--muted); font-size:9pt; }

  /* ── Q&A CARD ── */
  .qa { border:1.5px solid #c4b5fd; border-radius:10px; margin-bottom:14px; overflow:hidden; }
  .qa-q { background:var(--purple); color:#fff; padding:9px 16px; font-weight:700; font-size:10.5pt; }
  .qa-a { padding:12px 16px; background:var(--pbg); font-size:10pt; line-height:1.65; }
  .qa-a strong { color:var(--purple); }

  /* ── FINAL BOX ── */
  .fbox {
    background:var(--pale); border:2px solid var(--g);
    border-radius:12px; padding:18px 22px; margin-top:16px;
  }
  .fbox h3 { font-family:'Outfit',sans-serif; font-size:12pt; color:var(--g); margin-bottom:10px; }
  .fbox li { font-size:10pt; margin-bottom:5px; }

  /* ── PALABRAS CLAVE ── */
  .kw-grid { display:flex; flex-wrap:wrap; gap:7px; margin-top:8px; }
  .kw {
    background:var(--pale); border:1.5px solid var(--g);
    color:var(--g); font-weight:700; font-size:8.5pt;
    padding:3px 10px; border-radius:14px;
  }
</style>
</head>
<body>

<!-- ══════════════════════════════════════════
     PORTADA
     ══════════════════════════════════════════ -->
<div class="cover">
  <div class="ctop">
    <div class="uni">Universidad Nacional de San Antonio Abad del Cusco — UNSAAC</div>
    <div class="prog">Ingeniería Informática y de Sistemas · Desarrollo de Software I · 2026-I</div>
  </div>
  <div class="cbody">
    <div class="ctag">🎤 Guión de Exposición — Un Expositor</div>
    <div class="ctitle">Plataforma Web TUPA UNSAAC</div>
    <div class="csub">Script completo · Sustentación oral de 8 minutos</div>
    <div class="cline"></div>
    <div class="crow"><span class="lbl">Duración total:</span><span><strong>8 minutos exactos</strong> — 7 momentos</span></div>
    <div class="crow"><span class="lbl">Expositor:</span><span>[Tu nombre completo]</span></div>
    <div class="crow"><span class="lbl">Abrir antes:</span><span>Chrome → <strong>http://localhost:3000</strong> · Este guión en la otra pantalla</span></div>
    <div class="crow"><span class="lbl">Trámite de demo:</span><span><strong>TR-2026-0248</strong> (ya existe en el sistema)</span></div>
    <div class="crow"><span class="lbl">Docentes:</span><span>Luis Álvaro Monzón Condori · Julio Vladimir Quispe Sota</span></div>
    <div class="crow"><span class="lbl">Asignatura:</span><span>Desarrollo de Software I — Semestre 2026-I</span></div>
  </div>
  <div class="cfoot">
    Cusco, Perú · 2026 &nbsp;|&nbsp; Plataforma Web de Gestión del TUPA UNSAAC
  </div>
</div>

<!-- ══════════════════════════════════════════
     RESUMEN DE TIEMPOS
     ══════════════════════════════════════════ -->
<div class="pb"></div>
<div class="ph"><span class="l">UNSAAC — Guión de Exposición · Plataforma Web TUPA</span><span class="r">Distribución de los 8 Minutos</span></div>

<h2>⏱ Distribución de los 8 Minutos</h2>

<div class="tlbar">
  <h3>Línea de tiempo visual</h3>
  <div class="tltrack">
    <div class="tls" style="background:#7B1828;flex:.75;">Saludo<br>0:45</div>
    <div class="tls" style="background:#8B1F2A;flex:1.0;">Problema<br>1:00</div>
    <div class="tls" style="background:#9B2530;flex:.75;">Solución<br>0:45</div>
    <div class="tls" style="background:#B03040;flex:2.5;">DEMO Estudiante<br>2:30</div>
    <div class="tls" style="background:#C84050;flex:1.5;">DEMO Admin<br>1:30</div>
    <div class="tls" style="background:#6B5B95;flex:.75;">Arq. Técnica<br>0:45</div>
    <div class="tls" style="background:#4a4a6a;flex:.75;">Cierre<br>0:45</div>
  </div>
</div>

<table class="rtbl">
  <thead>
    <tr><th>#</th><th>Momento</th><th>Tiempo</th><th>Duración</th><th>Pantalla</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>1</strong></td><td>Saludo y presentación personal</td><td>0:00 – 0:45</td><td>45 seg</td><td>Sistema abierto en el catálogo</td></tr>
    <tr><td><strong>2</strong></td><td>El problema que resolvemos</td><td>0:45 – 1:45</td><td>1 min</td><td>Sistema / Informe PDF p.3</td></tr>
    <tr><td><strong>3</strong></td><td>Visión general de la solución</td><td>1:45 – 2:30</td><td>45 seg</td><td>Sistema — portal inicial</td></tr>
    <tr><td><strong>4</strong></td><td><strong>DEMO Portal Estudiante</strong></td><td>2:30 – 5:00</td><td>2 min 30 seg</td><td>4 módulos en secuencia</td></tr>
    <tr><td><strong>5</strong></td><td><strong>DEMO Portal Administrativo</strong></td><td>5:00 – 6:30</td><td>1 min 30 seg</td><td>3 módulos en secuencia</td></tr>
    <tr><td><strong>6</strong></td><td>Arquitectura técnica</td><td>6:30 – 7:15</td><td>45 seg</td><td>Informe PDF — arquitectura</td></tr>
    <tr><td><strong>7</strong></td><td>Conclusiones y cierre</td><td>7:15 – 8:00</td><td>45 seg</td><td>Volver al sistema</td></tr>
  </tbody>
</table>

<div class="bk bk-t">
  <div class="bl">⚠️ Regla de oro</div>
  <p>La DEMO ocupa <strong>4 minutos</strong> de los 8. Es el momento más importante: los docentes quieren ver que funciona. Practica los clics hasta hacerlos sin dudar. Si algo falla en vivo, di con calma: <em>"Permítanme un momento"</em> y continúa.</p>
</div>

<!-- ══════════════════════════════════════════
     MOMENTO 1
     ══════════════════════════════════════════ -->
<div class="pb"></div>
<div class="ph"><span class="l">UNSAAC — Guión de Exposición · Plataforma Web TUPA</span><span class="r">Momento 1 — Saludo y Presentación</span></div>

<div class="mo">
  <div class="mh">
    <span class="mn">01</span>
    <span class="mt">Saludo y Presentación Personal</span>
    <span class="ms">0:00 – 0:45 · 45 seg</span>
  </div>
  <div class="mb">

    <div class="bk bk-p">
      <div class="bl">🖥️ Pantalla</div>
      <p><strong>http://localhost:3000</strong> — catálogo de trámites visible con el encabezado guinda. No hagas ningún clic todavía. Solo que se vea bien.</p>
    </div>

    <div class="bk bk-d">
      <div class="bl">🎤 Script completo — memoriza esto</div>
      <div class="sc">
        <div class="sc-body">
          Buenos días, docentes. <span class="pause">pausa 1 seg</span>
          Mi nombre es <strong>[tu nombre completo]</strong>, y tengo el agrado de presentar la <strong>Plataforma Web para la Optimización de la Gestión del TUPA de la UNSAAC</strong>, desarrollada para la asignatura de Desarrollo de Software I durante el semestre 2026-I. <span class="pause">pausa 1 seg</span>
          En los próximos ocho minutos voy a mostrarles el problema que identificamos, una demostración en vivo del sistema funcionando, y los fundamentos técnicos de la arquitectura implementada. <span class="pause">pausa 0.5 seg</span>
          Empecemos.
        </div>
      </div>
    </div>

    <div class="bk bk-t">
      <div class="bl">💡 Consejos</div>
      <ul>
        <li>Habla despacio y claro. Los primeros 10 segundos marcan el tono de toda la exposición.</li>
        <li>Señala la pantalla al decir "esta es la plataforma" — que el docente gire la mirada al sistema.</li>
        <li>No digas "bueno" ni "eh" al inicio. Empieza directo con "Buenos días".</li>
        <li>Mantén contacto visual con el docente, no con la pantalla, mientras dices tu nombre.</li>
      </ul>
    </div>

  </div>
</div>

<!-- ══════════════════════════════════════════
     MOMENTO 2
     ══════════════════════════════════════════ -->
<div class="mo">
  <div class="mh">
    <span class="mn">02</span>
    <span class="mt">El Problema que Resolvemos</span>
    <span class="ms">0:45 – 1:45 · 1 min</span>
  </div>
  <div class="mb">

    <div class="bk bk-p">
      <div class="bl">🖥️ Pantalla</div>
      <p>Quédate en el sistema. No cambies de pantalla — el contraste entre "el problema" que describes y "la solución" que ya se ve al fondo es muy efectivo visualmente.</p>
    </div>

    <div class="bk bk-d">
      <div class="bl">🎤 Script completo — 4 puntos en 60 segundos</div>
      <div class="sc">
        <div class="sc-body">
          La UNSAAC gestiona más de cien trámites administrativos a través del TUPA. Sin embargo, este proceso tiene cuatro problemas críticos que identificamos. <span class="pause">pausa 0.5 seg</span>
          Primero: los estudiantes no tienen acceso digital a los requisitos, costos y códigos de pago. Deben ir físicamente a las oficinas solo para preguntar qué documentos necesitan. <span class="pause">pausa 0.5 seg</span>
          Segundo: no existe seguimiento en tiempo real. El alumno no sabe si su trámite fue aprobado, si está en proceso o si fue rechazado por falta de documentos. <span class="pause">pausa 0.5 seg</span>
          Tercero: el personal administrativo valida comprobantes de pago y documentos de forma manual, lo que genera cuellos de botella y retrasos en la atención. <span class="pause">pausa 0.5 seg</span>
          Y cuarto: los directivos no tienen datos estadísticos para identificar qué oficinas están más sobrecargadas ni cuánto tardan en resolver cada tipo de trámite. <span class="pause">pausa 0.5 seg</span>
          Ante esta problemática, desarrollamos una solución digital completa.
        </div>
      </div>
    </div>

    <div class="bk bk-t">
      <div class="bl">💡 Transición</div>
      <p>La última frase <em>"desarrollamos una solución digital completa"</em> es la transición natural al Momento 3. Dila mirando al docente, no a la pantalla.</p>
    </div>

  </div>
</div>

<!-- ══════════════════════════════════════════
     MOMENTO 3
     ══════════════════════════════════════════ -->
<div class="pb"></div>
<div class="ph"><span class="l">UNSAAC — Guión de Exposición · Plataforma Web TUPA</span><span class="r">Momento 3 — Visión General</span></div>

<div class="mo">
  <div class="mh">
    <span class="mn">03</span>
    <span class="mt">Nuestra Solución — Visión General del Sistema</span>
    <span class="ms">1:45 – 2:30 · 45 seg</span>
  </div>
  <div class="mb">

    <div class="bk bk-p">
      <div class="bl">🖥️ Pantalla — 2 acciones rápidas</div>
      <ul>
        <li>Señala el encabezado con los dos botones: <strong>"Estudiantes"</strong> y <strong>"Oficinas UNSAAC"</strong>.</li>
        <li>Señala el menú lateral izquierdo con las 4 opciones del portal estudiante.</li>
      </ul>
    </div>

    <div class="bk bk-d">
      <div class="bl">🎤 Script completo</div>
      <div class="sc">
        <div class="sc-body">
          La plataforma tiene dos portales: uno para los estudiantes y egresados, y otro para el personal administrativo de las oficinas de la UNSAAC, a los que se accede desde estos dos botones del encabezado. <span class="pause">señala los botones</span> <span class="pause">pausa 0.5 seg</span>
          Técnicamente, fue construida con <strong>HTML5, CSS3 y JavaScript</strong> en el frontend, <strong>Node.js</strong> como servidor backend con una <strong>API REST</strong>, y utiliza la base de datos <strong>MySQL</strong> con el esquema oficial del TUPA de la universidad. <span class="pause">pausa 0.5 seg</span>
          El sistema implementa seis módulos funcionales que cubren todo el ciclo del trámite: desde la consulta hasta la generación de reportes. Permítame mostrarlo en funcionamiento.
        </div>
      </div>
    </div>

    <div class="bk bk-t">
      <div class="bl">💡 Transición</div>
      <p>Al decir "Permítame mostrarlo", haz clic en <strong>"Estudiantes"</strong> del encabezado para confirmar que estás en el portal correcto. Luego empieza el Momento 4.</p>
    </div>

  </div>
</div>

<!-- ══════════════════════════════════════════
     MOMENTO 4 — DEMO ESTUDIANTE
     ══════════════════════════════════════════ -->
<div class="pb"></div>
<div class="ph"><span class="l">UNSAAC — Guión de Exposición · Plataforma Web TUPA</span><span class="r">Momento 4 — DEMO Portal Estudiante (2:30 – 5:00)</span></div>

<div class="mo">
  <div class="mh">
    <span class="mn">04</span>
    <span class="mt">DEMO — Portal del Estudiante</span>
    <span class="ms">2:30 – 5:00 · 2 min 30 seg</span>
  </div>
  <div class="mb">

    <!-- 4A -->
    <div class="substep">
      <div class="substep-hdr">🔍 PASO A — Catálogo de Trámites <span class="substep-timer">· 35 seg &nbsp;(2:30 – 3:05)</span></div>
      <div class="bk bk-p" style="margin-bottom:8px;">
        <div class="bl">🖥️ Acciones exactas en pantalla</div>
        <ol style="padding-left:16px; font-size:10pt;">
          <li>Estás en <strong>Catálogo TUPA</strong> — ya activo en el menú lateral.</li>
          <li>Escribe <strong>"carné"</strong> en el buscador — las tarjetas se filtran en tiempo real.</li>
          <li>Haz clic en <strong>"Ver Requisitos"</strong> de la tarjeta del Carné Universitario.</li>
          <li>Señala con el cursor: la descripción, los requisitos y el monto <strong>S/. 20.00</strong>.</li>
          <li>Haz clic en la X para cerrar el modal.</li>
        </ol>
      </div>
      <div class="bk bk-d" style="margin-bottom:0;">
        <div class="bl">🎤 Script</div>
        <div class="sc">
          <div class="sc-body">
            Este es el catálogo completo del TUPA. <span class="pause">escribe "carné"</span> Al escribir cualquier término, el sistema filtra los trámites en tiempo real. <span class="pause">abre el modal</span> Al hacer clic, el estudiante ve la descripción oficial del trámite, la lista de documentos obligatorios, el costo exacto y el código del Banco de la Nación para realizar el pago. Todo sin ir a la universidad.
          </div>
        </div>
      </div>
    </div>

    <!-- 4B -->
    <div class="substep">
      <div class="substep-hdr">📝 PASO B — Formulario de Solicitud Digital <span class="substep-timer">· 40 seg &nbsp;(3:05 – 3:45)</span></div>
      <div class="bk bk-p" style="margin-bottom:8px;">
        <div class="bl">🖥️ Acciones exactas en pantalla</div>
        <ol style="padding-left:16px; font-size:10pt;">
          <li>Haz clic en <strong>"Iniciar Trámite"</strong> en el menú lateral.</li>
          <li>Selecciona un trámite del selector — aparece automáticamente el checklist de requisitos.</li>
          <li>Señala los campos: código de alumno, DNI, nombres, correo, teléfono.</li>
          <li>Señala el checklist de requisitos con los checkboxes.</li>
          <li>Señala la zona de carga de archivos (dropzone).</li>
          <li>Señala el campo de voucher bancario.</li>
          <li><em>No envíes el formulario.</em></li>
        </ol>
      </div>
      <div class="bk bk-d" style="margin-bottom:0;">
        <div class="bl">🎤 Script</div>
        <div class="sc">
          <div class="sc-body">
            Desde el formulario de solicitud, el estudiante registra su trámite de forma completamente digital. <span class="pause">señala los campos</span> Ingresa sus datos personales, <span class="pause">señala el checklist</span> confirma los requisitos que ya tiene listos marcando estas casillas — el sistema valida que todos estén marcados antes de permitir el envío —, <span class="pause">señala el dropzone</span> adjunta sus documentos escaneados aquí, y finalmente registra el número de su voucher de pago. Al enviar, el sistema le asigna automáticamente un código único para rastrear su expediente.
          </div>
        </div>
      </div>
    </div>

    <!-- 4C -->
    <div class="substep">
      <div class="substep-hdr">💳 PASO C — Pasarela de Pagos <span class="substep-timer">· 30 seg &nbsp;(3:45 – 4:15)</span></div>
      <div class="bk bk-p" style="margin-bottom:8px;">
        <div class="bl">🖥️ Acciones exactas en pantalla</div>
        <ol style="padding-left:16px; font-size:10pt;">
          <li>Haz clic en <strong>"Pasarela de Pagos"</strong> en el menú lateral.</li>
          <li>Se abre como <strong>modal flotante</strong> encima de la vista actual — señala esto.</li>
          <li>Haz clic en la tarjeta de <strong>Yape</strong> — muestra las instrucciones.</li>
          <li>Señala el botón <strong>"Generar Código de Pago"</strong>.</li>
          <li>Cierra el modal con la X o clic fuera.</li>
        </ol>
      </div>
      <div class="bk bk-d" style="margin-bottom:0;">
        <div class="bl">🎤 Script</div>
        <div class="sc">
          <div class="sc-body">
            Para el pago de tasas, el sistema tiene su propia pasarela. <span class="pause">abre el modal</span> Se abre como un panel flotante sin abandonar la vista actual. El estudiante elige entre Banco de la Nación, <span class="pause">haz clic en Yape</span> Yape, Plin o tarjeta de crédito. Cada método muestra las instrucciones correspondientes y genera un código de referencia único para que el área de Tesorería valide el pago.
          </div>
        </div>
      </div>
    </div>

    <!-- 4D -->
    <div class="substep" style="margin-bottom:0;">
      <div class="substep-hdr">🗺️ PASO D — Trazabilidad del Trámite <span class="substep-timer">· 45 seg &nbsp;(4:15 – 5:00)</span></div>
      <div class="bk bk-p" style="margin-bottom:8px;">
        <div class="bl">🖥️ Acciones exactas en pantalla</div>
        <ol style="padding-left:16px; font-size:10pt;">
          <li>Haz clic en <strong>"Trazabilidad / Rastro"</strong> en el menú lateral.</li>
          <li>Escribe en el buscador: <strong>TR-2026-0248</strong></li>
          <li>Haz clic en <strong>"Buscar Rastro"</strong>.</li>
          <li>Señala la tarjeta con el nombre del trámite y el badge de estado <strong>EN PROCESO</strong>.</li>
          <li>Señala la línea de tiempo con los dos eventos: SOLICITADO y EN PROCESO.</li>
          <li>Lee en voz alta la descripción del último evento.</li>
        </ol>
      </div>
      <div class="bk bk-d" style="margin-bottom:0;">
        <div class="bl">🎤 Script</div>
        <div class="sc">
          <div class="sc-body">
            Y aquí está el módulo de trazabilidad. <span class="pause">escribe el código</span> El estudiante ingresa su código de trámite o su DNI, <span class="pause">haz clic en buscar</span> y el sistema le muestra una línea de tiempo completa del estado de su expediente. <span class="pause">señala los eventos</span> Puede ver cuándo ingresó la solicitud, cuándo fue revisada, en qué oficina está actualmente, y si fue observada. Esto elimina completamente la necesidad de ir a preguntar el estado de su trámite en persona.
          </div>
        </div>
      </div>
    </div>

  </div>
</div>

<!-- ══════════════════════════════════════════
     MOMENTO 5 — DEMO ADMIN
     ══════════════════════════════════════════ -->
<div class="pb"></div>
<div class="ph"><span class="l">UNSAAC — Guión de Exposición · Plataforma Web TUPA</span><span class="r">Momento 5 — DEMO Portal Administrativo (5:00 – 6:30)</span></div>

<div class="mo">
  <div class="mh">
    <span class="mn">05</span>
    <span class="mt">DEMO — Portal Administrativo</span>
    <span class="ms">5:00 – 6:30 · 1 min 30 seg</span>
  </div>
  <div class="mb">

    <div class="bk bk-t" style="margin-bottom:14px;">
      <div class="bl">⚠️ Transición desde Momento 4</div>
      <p>Di primero: <em>"Ahora voy a mostrar el portal para las oficinas administrativas."</em> Luego haz clic en <strong>"Oficinas UNSAAC"</strong> en el encabezado.</p>
    </div>

    <!-- 5A -->
    <div class="substep">
      <div class="substep-hdr">📊 PASO A — Dashboard Estadístico <span class="substep-timer">· 25 seg &nbsp;(5:00 – 5:25)</span></div>
      <div class="bk bk-p" style="margin-bottom:8px;">
        <div class="bl">🖥️ Acciones exactas en pantalla</div>
        <ol style="padding-left:16px; font-size:10pt;">
          <li>Al hacer clic en <strong>"Oficinas UNSAAC"</strong> se carga automáticamente el Panel General.</li>
          <li>Señala los <strong>4 contadores</strong>: expedientes totales, en evaluación, vouchers validados, resueltos.</li>
          <li>Señala el <strong>gráfico de barras</strong> (volumen por dependencia).</li>
          <li>Señala el <strong>gráfico donut</strong> (distribución de estados).</li>
        </ol>
      </div>
      <div class="bk bk-d" style="margin-bottom:0;">
        <div class="bl">🎤 Script</div>
        <div class="sc">
          <div class="sc-body">
            El portal administrativo comienza con este panel de control. <span class="pause">señala los contadores</span> Los directivos ven en tiempo real los indicadores clave: total de expedientes, cuántos están en evaluación, cuántos pagos ya fueron validados y cuántos trámites fueron resueltos. <span class="pause">señala los gráficos</span> Y estos gráficos muestran qué dependencia tiene mayor carga de trabajo y cómo se distribuyen los estados, lo que permite identificar cuellos de botella de forma inmediata.
          </div>
        </div>
      </div>
    </div>

    <!-- 5B -->
    <div class="substep">
      <div class="substep-hdr">📥 PASO B — Bandeja de Trámites y Calificación <span class="substep-timer">· 35 seg &nbsp;(5:25 – 6:00)</span></div>
      <div class="bk bk-p" style="margin-bottom:8px;">
        <div class="bl">🖥️ Acciones exactas en pantalla</div>
        <ol style="padding-left:16px; font-size:10pt;">
          <li>Haz clic en <strong>"Bandeja de Trámites"</strong> en el menú lateral.</li>
          <li>Señala la tabla con los expedientes de los estudiantes.</li>
          <li>Haz clic en el ícono de acción de cualquier fila — se abre el modal.</li>
          <li>Señala la sección de archivos adjuntos y el selector de estado.</li>
          <li>Cierra el modal <em>sin</em> guardar cambios.</li>
        </ol>
      </div>
      <div class="bk bk-d" style="margin-bottom:0;">
        <div class="bl">🎤 Script</div>
        <div class="sc">
          <div class="sc-body">
            En la bandeja de trámites, el funcionario de oficina ve únicamente los expedientes correspondientes a su dependencia — puede filtrar por oficina aquí arriba. <span class="pause">abre el modal</span> Al seleccionar un expediente, puede revisar los documentos adjuntos digitalmente, ver los datos del solicitante y cambiar el estado del trámite: aprobarlo, ponerlo en proceso, o marcarlo como observado si hay algún documento faltante. Cada cambio queda registrado automáticamente en el historial de trazabilidad.
          </div>
        </div>
      </div>
    </div>

    <!-- 5C -->
    <div class="substep" style="margin-bottom:0;">
      <div class="substep-hdr">📤 PASO C — Analíticas y Exportación de Reporte <span class="substep-timer">· 30 seg &nbsp;(6:00 – 6:30)</span></div>
      <div class="bk bk-p" style="margin-bottom:8px;">
        <div class="bl">🖥️ Acciones exactas en pantalla</div>
        <ol style="padding-left:16px; font-size:10pt;">
          <li>Haz clic en <strong>"Analíticas / Reportes"</strong> en el menú lateral.</li>
          <li>Señala el botón de exportación.</li>
          <li>Haz clic en <strong>"Exportar Reporte General CSV"</strong> — se descarga el archivo.</li>
          <li>Si aparece el diálogo de descarga, muéstralo brevemente.</li>
        </ol>
      </div>
      <div class="bk bk-d" style="margin-bottom:0;">
        <div class="bl">🎤 Script</div>
        <div class="sc">
          <div class="sc-body">
            Finalmente, desde el módulo de analíticas, los administradores pueden exportar un reporte completo de todos los trámites procesados. <span class="pause">haz clic en exportar</span> El sistema genera un archivo CSV compatible con Excel que incluye el ID de cada expediente, el solicitante, el trámite, la oficina, el monto, el estado y la fecha. Esto permite la auditoría financiera y la rendición de cuentas de manera automatizada.
          </div>
        </div>
      </div>
    </div>

  </div>
</div>

<!-- ══════════════════════════════════════════
     MOMENTO 6
     ══════════════════════════════════════════ -->
<div class="pb"></div>
<div class="ph"><span class="l">UNSAAC — Guión de Exposición · Plataforma Web TUPA</span><span class="r">Momentos 6 y 7</span></div>

<div class="mo">
  <div class="mh">
    <span class="mn">06</span>
    <span class="mt">Arquitectura Técnica del Sistema</span>
    <span class="ms">6:30 – 7:15 · 45 seg</span>
  </div>
  <div class="mb">

    <div class="bk bk-p">
      <div class="bl">🖥️ Pantalla</div>
      <p>Abre <strong>Informe_TUPA_UNSAAC_2026.pdf</strong> — ve a la <strong>Sección 5: Arquitectura del Sistema</strong> en la Parte I. Muestra el diagrama de 3 capas y la tabla de entidades.</p>
    </div>

    <div class="bk bk-d">
      <div class="bl">🎤 Script completo — menciona las 3 capas y la BD</div>
      <div class="sc">
        <div class="sc-body">
          En cuanto a la arquitectura técnica, el sistema sigue una topología distribuida de tres capas independientes. <span class="pause">señala el diagrama</span>
          La primera es la <strong>capa de datos</strong>: una base de datos MySQL con el esquema oficial del TUPA de la UNSAAC, con tablas como <em>tcatalogotramite</em>, <em>tsolicitudtramite</em> y <em>tunidadorganizativa</em>, que está aislada en una red privada. <span class="pause">pausa 0.5 seg</span>
          La segunda es la <strong>capa de lógica de negocio</strong>: un servidor Node.js que expone una API REST para procesar las solicitudes, validar pagos y gestionar el historial de trazabilidad. <span class="pause">pausa 0.5 seg</span>
          Y la tercera es la <strong>capa de presentación</strong>: la interfaz web que descarga el navegador del usuario, construida en HTML5, CSS3 y JavaScript puro. Esta separación garantiza seguridad, escalabilidad y mantenibilidad del sistema.
        </div>
      </div>
    </div>

    <div class="bk bk-t">
      <div class="bl">💡 Palabras clave que debes mencionar en este momento</div>
      <div class="kw-grid">
        <span class="kw">Topología distribuida</span>
        <span class="kw">3 capas</span>
        <span class="kw">MySQL</span>
        <span class="kw">Node.js</span>
        <span class="kw">API REST</span>
        <span class="kw">HTML5 / CSS3</span>
        <span class="kw">tsolicitudtramite</span>
        <span class="kw">tcatalogotramite</span>
        <span class="kw">Escalabilidad</span>
        <span class="kw">Red privada</span>
      </div>
    </div>

  </div>
</div>

<!-- ══════════════════════════════════════════
     MOMENTO 7
     ══════════════════════════════════════════ -->
<div class="mo">
  <div class="mh">
    <span class="mn">07</span>
    <span class="mt">Conclusiones y Próximos Pasos</span>
    <span class="ms">7:15 – 8:00 · 45 seg</span>
  </div>
  <div class="mb">

    <div class="bk bk-p">
      <div class="bl">🖥️ Pantalla</div>
      <p>Vuelve al sistema: <strong>http://localhost:3000</strong>, portal estudiante, catálogo de trámites. <strong>Que la última imagen sea la aplicación funcionando</strong>, no el PDF.</p>
    </div>

    <div class="bk bk-d">
      <div class="bl">🎤 Script completo — cierre con impacto</div>
      <div class="sc">
        <div class="sc-body">
          Para concluir, la plataforma implementa los once requerimientos funcionales definidos, distribuidos en seis módulos completamente operativos. <span class="pause">pausa 0.5 seg</span>
          Se logró digitalizar el ciclo completo del trámite: desde la consulta del catálogo hasta la resolución y el reporte gerencial, eliminando la necesidad de consultas presenciales y reduciendo el tiempo de atención estimado en un sesenta por ciento. <span class="pause">pausa 0.5 seg</span>
          Como próximos pasos, queda pendiente la conexión a la base de datos MySQL real de la UNSAAC y el despliegue en un servidor en la nube para acceso público desde cualquier dispositivo. <span class="pause">pausa 1 seg</span>
          Es todo de mi parte. Quedo a disposición para cualquier consulta. Muchas gracias.
        </div>
      </div>
    </div>

    <div class="bk bk-t">
      <div class="bl">💡 Cierre profesional</div>
      <ul>
        <li>Di "Muchas gracias" y quédate en silencio. No rellenes el silencio con palabras innecesarias.</li>
        <li><strong>No digas:</strong> "eso es todo", "eso sería", "básicamente", "o sea".</li>
        <li>Si el docente asiente, espera a que haga la pregunta. No anticipes.</li>
        <li>Coloca las manos sobre la mesa o a los lados. No las cruces ni las metas al bolsillo.</li>
      </ul>
    </div>

  </div>
</div>

<!-- ══════════════════════════════════════════
     PREGUNTAS PROBABLES
     ══════════════════════════════════════════ -->
<div class="pb"></div>
<div class="ph"><span class="l">UNSAAC — Guión de Exposición · Plataforma Web TUPA</span><span class="r">Preguntas Probables del Docente</span></div>

<h2>🎯 Preguntas Probables — Respuestas Preparadas</h2>
<p style="margin-bottom:16px; color:var(--muted);">Estudia estas respuestas. Son las preguntas más frecuentes en sustentaciones de proyectos de software en la UNSAAC. Si preguntan algo que no está aquí, di: <em>"Es un punto que contemplamos para la siguiente fase del proyecto."</em></p>

<div class="qa">
  <div class="qa-q">¿Por qué usaron JavaScript puro y no un framework como React o Angular?</div>
  <div class="qa-a">
    La asignatura nos orientó a dominar los fundamentos del desarrollo web antes de usar abstracciones. Optamos por <strong>HTML5, CSS3 y JavaScript ES6 nativo</strong> para demostrar comprensión profunda de los principios del DOM, eventos y manipulación de datos. Además, al ser una aplicación sin proceso de compilación, puede desplegarse directamente en cualquier servidor web sin configuraciones adicionales. Si el proyecto escalara, la migración a un framework como React sería sencilla dado que la arquitectura de componentes ya está lógicamente separada.
  </div>
</div>

<div class="qa">
  <div class="qa-q">¿Los datos del catálogo son los reales del TUPA de la UNSAAC?</div>
  <div class="qa-a">
    Sí. Los datos provienen del <strong>TUPA oficial de la UNSAAC</strong>, que fue procesado desde el documento institucional y almacenado en el archivo <em>extracted_tupa_data.json</em>. El sistema los carga automáticamente al iniciar. La base de datos <em>bdtupa20260511.sql</em> contiene el esquema completo con más de cien procedimientos reales, y está lista para conectarse al backend Node.js en la siguiente fase.
  </div>
</div>

<div class="qa">
  <div class="qa-q">¿Cómo se implementó la seguridad del sistema?</div>
  <div class="qa-a">
    En el diseño arquitectónico se definieron cinco requerimientos no funcionales de seguridad. El <strong>Servidor de Base de Datos está aislado en red privada</strong>, solo accesible desde el servidor backend. Se especificó el uso de <strong>bcrypt para cifrado de contraseñas</strong>. El servidor Node.js aplica validación en el lado del servidor antes de procesar cualquier solicitud, y se implementó protección contra <strong>directory traversal</strong> en el servidor de archivos estáticos. En la fase de producción se añadiría autenticación JWT y HTTPS obligatorio.
  </div>
</div>

<div class="qa">
  <div class="qa-q">¿Qué metodología usaron para el desarrollo del proyecto?</div>
  <div class="qa-a">
    Aplicamos <strong>Scrum adaptado</strong> con sprints de dos semanas. Cada sprint terminaba con un módulo funcional demostrable. Usamos <strong>Git con ramas feature/</strong> para el control de versiones, lo que nos permitió trabajar en paralelo sin conflictos. La ingeniería de requerimientos se hizo primero: definimos once requerimientos funcionales, cinco no funcionales, cinco historias de usuario y seis casos de uso antes de escribir una sola línea de código.
  </div>
</div>

<div class="qa">
  <div class="qa-q">¿La base de datos ya está conectada o es solo frontend?</div>
  <div class="qa-a">
    Actualmente el sistema opera con dos mecanismos de persistencia: el catálogo de trámites se carga desde el archivo <em>extracted_tupa_data.json</em> con datos reales del TUPA, y los registros de solicitudes se persisten en <em>localStorage</em> del navegador para la demo. El servidor Node.js ya tiene implementada la <strong>API REST con el endpoint <code>/api/pagos</code></strong> que guarda en archivo JSON en el servidor. La conexión al <strong>MySQL real</strong> es el siguiente paso concreto, para lo que ya tenemos el esquema de la base de datos <em>bdtupa20260511.sql</em> listo para importar.
  </div>
</div>

<div class="qa">
  <div class="qa-q">¿Cómo garantizan que todos los requisitos funcionales están implementados?</div>
  <div class="qa-a">
    Elaboramos una <strong>Matriz de Trazabilidad de Requerimientos</strong> que mapea cada uno de los once RF con su historia de usuario correspondiente y su caso de uso vinculado. Esta matriz muestra que el cien por ciento de los requerimientos funcionales tienen implementación en la interfaz gráfica. Puede verla en la sección de Ingeniería de Requerimientos del informe.
  </div>
</div>

<div class="qa">
  <div class="qa-q">¿Cuál fue la parte más difícil del proyecto?</div>
  <div class="qa-a">
    La parte más compleja fue <strong>extraer y estructurar los datos del TUPA oficial</strong>, que estaban en formato PDF. Tuvimos que desarrollar scripts de procesamiento para convertirlos a JSON y luego crear la lógica de fusión con los datos de requisitos y costos de la base de datos. También fue desafiante mantener la coherencia del estado de los trámites entre los dos portales usando localStorage como capa de persistencia temporal.
  </div>
</div>

<div class="qa">
  <div class="qa-q">¿Probaron el sistema? ¿Tienen evidencia de las pruebas?</div>
  <div class="qa-a">
    Sí. Realizamos pruebas funcionales para cada caso de uso definido: verificamos el flujo completo de búsqueda, el registro de solicitudes con validación de campos obligatorios y archivos, el tracking por código y por DNI, la transición de estados en el portal administrativo y la exportación del reporte CSV. Cada prueba se documentó en el plan de pruebas incluido en la documentación de ingeniería del proyecto.
  </div>
</div>

<!-- ══════════════════════════════════════════
     CHECKLIST FINAL
     ══════════════════════════════════════════ -->
<div class="pb"></div>
<div class="ph"><span class="l">UNSAAC — Guión de Exposición · Plataforma Web TUPA</span><span class="r">Checklist Pre-Exposición</span></div>

<h2>✅ Checklist — Antes de Entrar a Exponer</h2>

<div class="fbox">
  <h3>30 minutos antes</h3>
  <ul>
    <li>☐ Abre una terminal en la carpeta del proyecto y ejecuta: <code>node server.js</code></li>
    <li>☐ Abre Chrome en <strong>http://localhost:3000</strong> — verifica que el catálogo carga con el encabezado guinda</li>
    <li>☐ Abre el <strong>Informe_TUPA_UNSAAC_2026.pdf</strong> en otra pestaña del mismo Chrome</li>
    <li>☐ Practica los 7 pasos de la demo: buscar "carné" → formulario → pagos → trazabilidad (TR-2026-0248) → admin → bandeja → exportar</li>
    <li>☐ Cronometra: si en el ensayo llegas a 7 min, en la exposición real serán 8 por los nervios. Si llegas a 9 min, acorta la Sección 6 (arquitectura)</li>
    <li>☐ Lee en voz alta los scripts del Momento 1 y 2 al menos 3 veces</li>
  </ul>
</div>

<div class="fbox" style="margin-top:14px;">
  <h3>5 minutos antes</h3>
  <ul>
    <li>☐ El sistema debe estar abierto y visible en el <strong>Catálogo TUPA</strong> (portal Estudiante)</li>
    <li>☐ Cierra cualquier otra pestaña o ventana que no vayas a usar</li>
    <li>☐ Silencia el celular</li>
    <li>☐ Si hay proyector: conecta el cable, ajusta la resolución y verifica que el encabezado guinda se ve bien</li>
    <li>☐ Respira profundo. El sistema ya funciona — solo tienes que mostrarlo</li>
  </ul>
</div>

<div class="fbox" style="margin-top:14px;">
  <h3>Datos clave para recordar de memoria</h3>
  <ul>
    <li>📌 <strong>Código del trámite para demo de trazabilidad:</strong> <code>TR-2026-0248</code></li>
    <li>📌 <strong>Palabra clave para demo del catálogo:</strong> <code>carné</code></li>
    <li>📌 <strong>Número de requerimientos funcionales:</strong> 11 RF</li>
    <li>📌 <strong>Número de casos de uso:</strong> 6 CU</li>
    <li>📌 <strong>Tecnologías:</strong> HTML5 · CSS3 · JavaScript ES6 · Node.js · MySQL</li>
    <li>📌 <strong>Módulos implementados:</strong> Catálogo · Solicitud · Pagos · Trazabilidad · Dashboard · Bandeja · Reportes</li>
    <li>📌 <strong>Reducción estimada de tiempo:</strong> 60% en atención de trámites</li>
    <li>📌 <strong>Archivo de base de datos:</strong> bdtupa20260511.sql</li>
  </ul>
</div>

</body>
</html>`;

async function generatePDF() {
  console.log('Generando guión de exposición completo...');
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
        <div style="width:100%;font-size:7.5pt;color:#6B3040;padding:0 18mm;
                    display:flex;justify-content:space-between;font-family:Arial,sans-serif;">
          <span>UNSAAC — Guión de Exposición · Plataforma Web TUPA · 2026-I</span>
          <span>Pág. <span class="pageNumber"></span> / <span class="totalPages"></span></span>
        </div>`,
      margin: { top: '12mm', right: '18mm', bottom: '16mm', left: '18mm' }
    });
    console.log('');
    console.log('✅  Guión completo generado exitosamente.');
    console.log('📄  Archivo: Guion_Exposicion_TUPA.pdf');
    console.log('📁  Ubicación: ' + OUTPUT_PATH);
  } finally {
    await browser.close();
  }
}

generatePDF().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
