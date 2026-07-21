# Plataforma Web TUPA - UNSAAC

Plataforma para la gestión digital del Texto Único de Procedimientos Administrativos (TUPA) de la UNSAAC: catálogo de trámites, registro de solicitudes con adjuntos, trazabilidad pública, panel administrativo con autenticación y control de roles, y analíticas con exportación CSV.

## Arquitectura

Topología de 3 capas sobre un único proceso Node.js (capa API + estáticos) y MySQL:

```
public/            Frontend (HTML/CSS/JS vanilla, sin build step)
backend/src/
  config/          Conexión a MySQL y variables de entorno
  middleware/       auth (JWT), rbac, upload (multer), errores
  repositories/     Acceso a datos (SQL directo + stored procedures oficiales)
  services/         Reglas de negocio y validación
  controllers/      Request/response HTTP
  routes/           Definición de endpoints REST
  scripts/          Importación del dump, migraciones propias, seed de demo
database/
  migrations.sql    Extensiones propias del esquema (no oficiales de la UNSAAC)
uploads/            Archivos adjuntos (voucher, fotos, PDFs) - no versionado
bdtupa20260511.sql  Dump oficial de la UNSAAC (63 trámites, ~1850 solicitudes históricas)
```

El backend reutiliza los **stored procedures reales del dump** (`tupa_sp_registrar_solicitud_tramite`, `tupa_sp_registrar_pago_solicitud_tramite`, etc.) para las operaciones que ya estaban correctamente implementadas en SQL, y añade lógica propia en Node.js donde el dump no cubre el flujo (autenticación con bcrypt, cambios de estado generales, trazabilidad).

> **Nota:** los archivos `PLAN_PROYECTO.md`, `DOCUMENTACION_INGENIERIA.md`, `Informe_TUPA_UNSAAC_2026.pdf` y `Guion_Exposicion_TUPA.pdf` describen la fase de solo-frontend/mock del proyecto. Este README documenta el estado actual (backend real conectado a MySQL); los PDFs no se regeneraron automáticamente.

## Requisitos

- Node.js 20+
- MySQL 8.0+ (o MariaDB compatible) accesible localmente o en la nube
- El dump `bdtupa20260511.sql` (ver nota debajo — **no está incluido en este repositorio**)

## El dump de la base de datos no está en este repositorio

`bdtupa20260511.sql` contiene datos reales de alumnos (nombres completos, DNI usado como código de alumno) y hashes de contraseñas de las cuentas administrativas de `tlogin`. Por esa razón está excluido vía `.gitignore` y **no se sube a este repositorio público**.

Para correr el proyecto localmente:
1. Solicita el archivo `bdtupa20260511.sql` a quien administra el proyecto (no se distribuye por este medio).
2. Colócalo en la raíz del repositorio, junto a `package.json`.
3. Continúa con `npm run setup` como se indica abajo.

Si no cuentas con el dump, puedes igualmente explorar el código del backend/frontend; solo no podrás levantar una base de datos con contenido real.

## Configuración local (sin Docker)

```bash
npm install
cp .env.example .env      # ajusta DB_PASSWORD y JWT_SECRET
npm run setup             # importa el dump + migraciones propias + credenciales demo
npm start                 # http://localhost:3000
```

`npm run setup` ejecuta en orden:
1. `db:import` — crea la base `bdtupa` e importa `bdtupa20260511.sql` (usa el cliente `mysql` del sistema). Requiere que el archivo exista en la raíz del proyecto (ver sección anterior).
2. `db:migrate` — aplica `database/migrations.sql` (tabla de trazabilidad + columnas de contacto en `tsolicitante`).
3. `db:seed` — sobrescribe la contraseña de 4 cuentas de demostración ya existentes en `tlogin` (ver credenciales abajo).

## Configuración con Docker

```bash
docker compose up --build
```

Esto levanta MySQL (con el dump importado automáticamente en el primer arranque vía `docker-entrypoint-initdb.d`) y la app en `http://localhost:3000`. El contenedor de la app espera a que la base esté lista, aplica las migraciones propias y siembra las credenciales de demo antes de iniciar el servidor.

> Nota: este `docker-compose.yml` fue construido siguiendo las convenciones estándar de Docker, pero no se pudo ejecutar `docker compose up` en esta máquina de desarrollo porque no tiene Docker instalado. Verifica el primer arranque antes de confiar en él para producción.

## Credenciales de demostración (panel administrativo)

| Usuario | Contraseña | Perfil |
|---|---|---|
| `ADMIN` | `Admin#2026` | ADMINISTRADOR |
| `24007146` | `Demo#2026` | USUARIO DE RECAUDACION |
| `44760467` | `Demo#2026` | COORDINADOR DE TESORERIA |
| `OTI_RECAUDACION` | `Demo#2026` | OPERADOR DE OTI |

El portal de estudiantes (catálogo, registro de solicitud, pasarela de pagos, rastreo) es público y no requiere login, igual que en el sistema real de la UNSAAC.

## Variables de entorno

Ver `.env.example`. Las más importantes:

| Variable | Descripción |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexión a MySQL |
| `JWT_SECRET` | Clave de firma de sesiones administrativas. **Cambiar en producción.** |
| `UPLOAD_DIR`, `MAX_UPLOAD_MB` | Carpeta y límite de tamaño para adjuntos |
| `CORS_ORIGIN` | Origen permitido si el frontend se sirve desde otro dominio |

## Despliegue en la nube

MySQL no está disponible como base de datos gestionada en Render, así que la ruta recomendada es **Railway** (soporta Dockerfile + plugin de MySQL en el mismo proyecto):

1. Crea un proyecto en Railway y añade un servicio **MySQL** (plugin nativo).
2. Añade un segundo servicio desde este repositorio (Railway detecta el `Dockerfile` automáticamente).
3. Copia las variables `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE` que Railway genera para el servicio MySQL a las variables `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` del servicio de la app.
4. Define `JWT_SECRET` con un valor propio y aleatorio.
5. Importa el dump una sola vez apuntando tu `.env` local al host público de Railway y ejecutando `npm run setup` desde tu máquina (Railway no ejecuta `docker-entrypoint-initdb.d` de un servicio de plugin administrado).
6. Despliega. Railway expone automáticamente una URL pública HTTPS.

**Alternativa con Render:** crea un "Web Service" desde este repo (detecta el Dockerfile), y provee la base de datos MySQL en un proveedor externo (Railway, Aiven, PlanetScale, o tu propio VPS), configurando `DB_HOST`/`DB_PORT`/etc. como variables de entorno del servicio.

## Aviso de datos y privacidad

El dump `bdtupa20260511.sql` incluye datos reales de alumnos (DNI, teléfono, correo, dirección) y cuentas administrativas. Fue importado tal como se recibió, por decisión explícita del equipo, para este entorno académico. **Antes de exponer este despliegue en una URL pública de forma duradera**, evalúa anonimizar la tabla `talumno` y las tablas de solicitantes/solicitudes históricas, ya que la plataforma completa (catálogo, rastreo por DNI, bandeja administrativa) queda accesible a cualquiera con la URL.

Los archivos adjuntos (`/uploads/<nombre-aleatorio>`) se sirven públicamente sin autenticación, protegidos únicamente por nombres de archivo no adivinables (aleatorios de 128 bits). Es una simplificación deliberada para este proyecto académico; en producción real se recomienda almacenamiento firmado (S3/Cloudinary) como indica `RECOMENDACIONES_DESARROLLO.md`.

## Referencia rápida de la API

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/catalogo` | No | Catálogo completo de trámites con requisitos y montos vigentes |
| GET | `/api/unidades` | No | Lista de unidades organizativas |
| POST | `/api/solicitudes` | No | Crea una solicitud (multipart, campo `files`) |
| GET | `/api/solicitudes/rastreo?q=` | No | Rastreo público por DNI o código de trámite |
| POST | `/api/auth/login` | No | Login administrativo (devuelve JWT) |
| GET | `/api/solicitudes` | JWT | Bandeja administrativa (`?estado=&officeId=&search=`) |
| PATCH | `/api/solicitudes/:id/estado` | JWT | Cambia el estado de un expediente |
| GET | `/api/dashboard/stats` | JWT | KPIs y distribución por oficina/estado |
| GET | `/api/dashboard/export.csv` | JWT | Exporta el reporte general en CSV |
