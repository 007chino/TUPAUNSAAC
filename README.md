# Plataforma Web TUPA — UNSAAC

Plataforma para la gestión digital del **Texto Único de Procedimientos Administrativos (TUPA)** de la Universidad Nacional de San Antonio Abad del Cusco (UNSAAC): catálogo público de trámites, registro de solicitudes con adjuntos, rastreo de expedientes, panel administrativo con autenticación y control de roles, y analíticas exportables en CSV.

Proyecto académico de la asignatura **Desarrollo de Software I** (Programa Académico de Ingeniería Informática y de Sistemas, UNSAAC — Semestre 2026-I).

---

## Tabla de contenidos

- [¿Qué resuelve?](#qué-resuelve)
- [Características principales](#características-principales)
- [Arquitectura](#arquitectura)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Stack tecnológico](#stack-tecnológico)
- [Requisitos](#requisitos)
- [El dump de la base de datos no está en este repositorio](#el-dump-de-la-base-de-datos-no-está-en-este-repositorio)
- [Configuración local (sin Docker)](#configuración-local-sin-docker)
- [Configuración con Docker](#configuración-con-docker)
- [Variables de entorno](#variables-de-entorno)
- [Modelo de datos](#modelo-de-datos)
- [Referencia de la API](#referencia-de-la-api)
- [Autenticación y roles](#autenticación-y-roles)
- [Credenciales de demostración](#credenciales-de-demostración)
- [Despliegue en la nube](#despliegue-en-la-nube)
- [Seguridad y privacidad](#seguridad-y-privacidad)

---

## ¿Qué resuelve?

Actualmente, la gestión de trámites TUPA en la UNSAAC depende de consultas presenciales para conocer requisitos y costos, verificación manual de comprobantes de pago, y ausencia de un canal para que el estudiante sepa en qué estado se encuentra su expediente. Esta plataforma digitaliza ese flujo de punta a punta:

1. El **administrado** (estudiante, egresado o público externo) consulta el catálogo, registra su solicitud con los archivos requeridos, paga la tasa y rastrea el estado de su expediente — todo sin login.
2. La **oficina administrativa** (Decanato, Secretaría General, Registro Académico, Caja, etc.) revisa las solicitudes que le corresponden, valida documentos y cambia el estado del expediente desde un panel autenticado.

## Características principales

**Portal del estudiante (público, sin login):**
- Búsqueda y filtrado dinámico del catálogo de trámites por código, denominación u oficina.
- Ficha de detalle con requisitos, montos vigentes y código de banco de cada trámite.
- Registro de solicitud con carga de archivos (PDF/JPG/PNG) y datos del solicitante.
- Registro de pago de tasas de forma independiente, con comprobante y número de voucher.
- Rastreo público del expediente por DNI o por código de trámite, con línea de tiempo de estados.

**Panel administrativo (requiere autenticación):**
- Bandeja de solicitudes filtrable por oficina, estado y búsqueda libre.
- Cambio de estado del expediente (`SOLICITADO` → `EN PROCESO` → `PAGADO` → `CERRADO` / `ANULADO`) con trazabilidad.
- Dashboard con KPIs y distribución de solicitudes por oficina y por estado.
- Exportación del reporte general de solicitudes en CSV.

## Arquitectura

Topología lógica de 3 capas, servidas por un único proceso Node.js (API + estáticos) contra una base de datos MySQL:

```
┌────────────────────────────┐
│   Cliente Web (navegador)  │   Estudiante · Funcionario UNSAAC
└──────────────┬─────────────┘
               │ HTTP / fetch (JSON, multipart)
┌──────────────▼─────────────┐
│  Capa de Presentación       │   public/  — HTML5 · CSS3 · JS vanilla (sin build step)
└──────────────┬─────────────┘
               │ servido como estático por el mismo proceso Express
┌──────────────▼─────────────┐
│  Capa de Lógica de Negocio  │   backend/src/ — Node.js · Express · API REST bajo /api
│  routes → controllers       │
│  → services → repositories  │
└──────────────┬─────────────┘
               │ mysql2 (pool de conexiones)
┌──────────────▼─────────────┐
│  Capa de Datos               │   MySQL 8.x — esquema oficial de la UNSAAC
└────────────────────────────┘
```

El backend está organizado en capas dentro de `backend/src/`:

- **`routes/`** — define los endpoints REST y qué middleware aplica a cada uno (auth, upload).
- **`controllers/`** — traducen petición/respuesta HTTP, sin lógica de negocio.
- **`services/`** — reglas de negocio y validación (p. ej. exigir requisitos antes de crear una solicitud).
- **`repositories/`** — acceso a datos: SQL directo y *stored procedures* oficiales del dump de la UNSAAC.
- **`middleware/`** — autenticación JWT, control de roles (RBAC), carga de archivos (multer), manejo de errores.
- **`config/`** — variables de entorno y pool de conexión a MySQL.
- **`scripts/`** — importación del dump, migraciones propias y siembra de credenciales de demostración.

El backend **reutiliza los stored procedures reales del dump** (`tupa_sp_registrar_solicitud_tramite`, `tupa_sp_registrar_pago_solicitud_tramite`, etc.) para las operaciones que ya estaban correctamente implementadas en SQL, y añade lógica propia en Node.js donde el dump no cubre el flujo (autenticación con bcrypt/JWT, cambios de estado generales, trazabilidad).

## Estructura del proyecto

```
public/                       Frontend (HTML/CSS/JS vanilla, sin build step)
  index.html
backend/src/
  app.js                      Configuración de Express (middlewares, rutas, estáticos, SPA fallback)
  server.js                   Punto de entrada (arranca el servidor HTTP)
  config/
    env.js                    Carga y valida variables de entorno
    db.js                     Pool de conexiones MySQL
  middleware/
    auth.js                   Verificación de JWT (requireAuth)
    rbac.js                   Control de acceso por perfil (requireRole)
    upload.js                 Configuración de multer para adjuntos
    errorHandler.js           Manejo centralizado de errores y 404
  routes/                     Definición de endpoints REST por dominio
  controllers/                Request/response HTTP
  services/                   Reglas de negocio y validación
  repositories/                Acceso a datos (SQL directo + stored procedures oficiales)
  scripts/
    importDump.js             Crea la BD e importa el dump oficial
    migrate.js                Aplica database/migrations.sql
    seedDemoUsers.js           Sobrescribe contraseñas de cuentas demo existentes
  utils/
    AppError.js                Clase de error de dominio con código HTTP
database/
  migrations.sql               Extensiones propias del esquema (no oficiales de la UNSAAC)
uploads/                       Archivos adjuntos (voucher, fotos, PDFs) — no versionado
Dockerfile, docker-compose.yml, docker-entrypoint.sh, railway.json, Procfile
                                Infraestructura de contenedores y despliegue
```

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | HTML5, CSS3, JavaScript ES6+ (sin framework, sin build step) |
| Backend | Node.js 20+, Express 4 |
| Base de datos | MySQL 8.x / MariaDB compatible |
| Autenticación | JWT (`jsonwebtoken`) + hash de contraseñas con `bcryptjs` |
| Carga de archivos | `multer` |
| Acceso a datos | `mysql2` (pool de conexiones, promesas) |
| Contenedores | Docker, Docker Compose |
| Despliegue sugerido | Railway (Dockerfile + plugin MySQL) o Render + MySQL externo |

## Requisitos

- Node.js 20+
- MySQL 8.0+ (o MariaDB compatible) accesible localmente o en la nube
- El dump `bdtupa20260511.sql` (ver sección siguiente — **no está incluido en este repositorio**)

## El dump de la base de datos no está en este repositorio

`bdtupa20260511.sql` contiene datos reales de alumnos (nombres completos, DNI usado como código de alumno) y hashes de contraseñas de las cuentas administrativas de `tlogin`. Por esa razón está excluido vía `.gitignore` y **no se sube a este repositorio público**.

Para correr el proyecto localmente:
1. Solicita el archivo `bdtupa20260511.sql` a quien administra el proyecto (no se distribuye por este medio).
2. Colócalo en la raíz del repositorio, junto a `package.json`.
3. Continúa con `npm run setup` como se indica abajo.

## Configuración local (sin Docker)

```bash
npm install
cp .env.example .env      # ajusta DB_PASSWORD y JWT_SECRET
npm run setup             # importa el dump + migraciones propias + credenciales demo
npm start                 # http://localhost:3000
```

`npm run setup` ejecuta en orden:
1. `db:import` — crea la base `bdtupa` e importa `bdtupa20260511.sql` (usa el cliente `mysql` del sistema). Requiere que el archivo exista en la raíz del proyecto.
2. `db:migrate` — aplica `database/migrations.sql` (tabla de trazabilidad + columnas de contacto en `tsolicitante`).
3. `db:seed` — sobrescribe la contraseña de 4 cuentas de demostración ya existentes en `tlogin` (ver credenciales abajo).

Scripts adicionales disponibles en `package.json`:
- `npm run dev` — arranca el servidor con recarga automática (`node --watch`).
- `npm run db:import` / `db:migrate` / `db:seed` — pasos individuales de `setup`, por si necesitas repetir solo uno.

## Configuración con Docker

```bash
docker compose up --build
```

Esto levanta MySQL (con el dump importado automáticamente en el primer arranque vía `docker-entrypoint-initdb.d`, tomando `bdtupa20260511.sql` y `database/migrations.sql` desde la raíz del proyecto) y la app en `http://localhost:3000`. El contenedor de la app espera a que la base esté lista (`docker-entrypoint.sh`), aplica las migraciones propias y siembra las credenciales de demo antes de iniciar el servidor.

> Igual que en la instalación sin Docker, necesitas colocar `bdtupa20260511.sql` en la raíz del proyecto antes de levantar los contenedores: `docker-compose.yml` lo monta como script de inicialización de MySQL.

## Variables de entorno

Definidas en `.env.example`:

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `PORT` | Puerto HTTP del servidor | `3000` |
| `NODE_ENV` | Entorno (`development` / `production`) | `development` |
| `CORS_ORIGIN` | Origen permitido si el frontend se sirve desde otro dominio | `http://localhost:3000` |
| `DB_HOST` / `DB_PORT` | Host y puerto de MySQL | `127.0.0.1` / `3306` |
| `DB_USER` / `DB_PASSWORD` / `DB_NAME` | Credenciales y nombre de la base | `root` / — / `bdtupa` |
| `DB_CONNECTION_LIMIT` | Tamaño máximo del pool de conexiones | `10` |
| `JWT_SECRET` | Clave de firma de sesiones administrativas. **Obligatoria y sin valor por defecto — cámbiala en producción.** | — |
| `JWT_EXPIRES_IN` | Vigencia del token de sesión | `8h` |
| `UPLOAD_DIR` | Carpeta donde se guardan los adjuntos | `uploads` |
| `MAX_UPLOAD_MB` | Tamaño máximo por archivo adjunto (MB) | `15` |

## Modelo de datos

El esquema se deriva del dump oficial de la UNSAAC (`bdtupa20260511.sql`, 63 trámites, ~1850 solicitudes históricas), extendido con una migración propia (`database/migrations.sql`) que agrega la tabla de trazabilidad y columnas de contacto que el esquema original no contemplaba.

| Tabla | Descripción |
|---|---|
| `tcatalogotramite` | Catálogo oficial de trámites, con códigos y clasificación |
| `trequisitotramite` | Requisitos legales de cada trámite (documentos, fotos, formularios) |
| `tmontotramite` | Vigencia y cuantía de los costos por trámite |
| `tunidadorganizativa` | Dependencias responsables (Decanatos, Secretaría General, etc.) |
| `tunidadtramite` | Relación entre trámites y la dependencia que los resuelve |
| `tsolicitante` | Datos del administrado: código de alumno, DNI, nombres, contacto (contacto añadido por migración propia) |
| `tsolicitudtramite` | Solicitudes registradas, con estado (`SOLICITADO`, `EN PROCESO`, `PAGADO`, `CERRADO`, `ANULADO`) |
| `tsolicitudtramitedetalle` | Archivos digitales asociados a cada solicitud |
| `tsolicitudtramitehistorial` *(propia)* | Historial de cambios de estado — soporta el rastreo/trazabilidad |
| `tlogin` | Cuentas del panel administrativo (usuario + hash de contraseña + perfil) |

## Referencia de la API

Prefijo base: `/api`.

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/catalogo` | No | Catálogo completo de trámites con requisitos y montos vigentes |
| `GET` | `/catalogo/:codigo` | No | Detalle de un trámite por código |
| `GET` | `/unidades` | No | Lista de unidades organizativas |
| `POST` | `/solicitudes` | No | Crea una solicitud (`multipart/form-data`, campo `files`, máx. 5 archivos) |
| `GET` | `/solicitudes/rastreo?q=` | No | Rastreo público por DNI o código de trámite |
| `POST` | `/auth/login` | No | Login administrativo (devuelve JWT) |
| `GET` | `/auth/me` | JWT | Datos de la sesión administrativa activa |
| `GET` | `/solicitudes` | JWT | Bandeja administrativa (`?estado=&officeId=&search=`) |
| `PATCH` | `/solicitudes/:id/estado` | JWT | Cambia el estado de un expediente |
| `GET` | `/dashboard/stats` | JWT | KPIs y distribución de solicitudes por oficina/estado |
| `GET` | `/dashboard/export.csv` | JWT | Exporta el reporte general en CSV |

Adicionalmente, `GET /uploads/<nombre-de-archivo>` sirve los adjuntos subidos: son públicos, protegidos únicamente por un nombre de archivo aleatorio no enumerable (128 bits) — ver [Seguridad y privacidad](#seguridad-y-privacidad).

## Autenticación y roles

- El login (`POST /api/auth/login`) valida contra `tlogin` con `bcryptjs` y devuelve un JWT firmado con `JWT_SECRET`.
- El middleware `requireAuth` (`backend/src/middleware/auth.js`) protege las rutas administrativas verificando ese token.
- Existe además un middleware `requireRole` (`backend/src/middleware/rbac.js`) preparado para restringir acciones por perfil (`req.user.perfil`); actualmente las rutas solo exigen sesión válida (`requireAuth`), sin restricción adicional por perfil.

## Credenciales de demostración

Sembradas por `npm run db:seed` sobre cuentas **ya existentes** en el dump (no se crean alumnos ni cuentas nuevas):

| Usuario | Contraseña | Perfil |
|---|---|---|
| `ADMIN` | `Admin#2026` | ADMINISTRADOR |
| `24007146` | `Demo#2026` | USUARIO DE RECAUDACIÓN |
| `44760467` | `Demo#2026` | COORDINADOR DE TESORERÍA |
| `OTI_RECAUDACION` | `Demo#2026` | OPERADOR DE OTI |

El portal de estudiantes (catálogo, registro de solicitud, pagos, rastreo) es público y no requiere login, igual que en el sistema real de la UNSAAC.

## Despliegue en la nube

MySQL no está disponible como base de datos gestionada en Render, así que la ruta recomendada es **Railway** (soporta Dockerfile + plugin de MySQL en el mismo proyecto):

1. Crea un proyecto en Railway y añade un servicio **MySQL** (plugin nativo).
2. Añade un segundo servicio desde este repositorio (Railway detecta `railway.json` / el `Dockerfile` automáticamente).
3. Copia las variables `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE` que Railway genera para el servicio MySQL a las variables `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` del servicio de la app.
4. Define `JWT_SECRET` con un valor propio y aleatorio (no reutilices el de tu `.env` local).
5. Importa el dump una sola vez apuntando tu `.env` local al host público de Railway y ejecutando `npm run setup` desde tu máquina (Railway no ejecuta `docker-entrypoint-initdb.d` de un servicio de plugin administrado).
6. Despliega. Railway expone automáticamente una URL pública HTTPS.

**Alternativa con Render:** crea un "Web Service" desde este repo (detecta el Dockerfile), y provee la base de datos MySQL en un proveedor externo (Railway, Aiven, PlanetScale, o tu propio VPS), configurando `DB_HOST`/`DB_PORT`/etc. como variables de entorno del servicio.

`Procfile` está disponible como alternativa para plataformas basadas en buildpacks en vez de Docker.

## Seguridad y privacidad

- El dump `bdtupa20260511.sql` incluye datos reales de alumnos (DNI, teléfono, correo, dirección) y cuentas administrativas; por eso no se distribuye en este repositorio (ver arriba). Si lo obtienes por otro medio, **no lo subas a un repositorio público** y evalúa anonimizar `talumno` y las tablas de solicitantes/solicitudes antes de exponer un despliegue en una URL pública de forma duradera.
- Los archivos adjuntos (`/uploads/<nombre-aleatorio>`) se sirven públicamente sin autenticación, protegidos únicamente por nombres de archivo no adivinables (aleatorios de 128 bits). Es una simplificación deliberada para este proyecto académico; en producción real se recomienda almacenamiento firmado (S3/Cloudinary).
- Las contraseñas se almacenan con hash `bcrypt`; los tokens de sesión administrativa usan JWT firmado con `JWT_SECRET`, que debe definirse con un valor propio y aleatorio en cada entorno (nunca reutilizar el valor de ejemplo).
