# Sistema de inventario y proveedores

Sistema empresarial con backend Node.js/Express y SQL Server, y frontend React
con Vite, React Router y Axios. Incluye autenticación JWT y gestión de
productos, categorías y proveedores.

## Requisitos

- Node.js 20 o posterior para frontend (React Router 7); Node.js 18 o posterior
  para ejecutar únicamente el backend.
- SQL Server configurado en `backend/.env`.
- `JWT_SECRET` privado de al menos 32 bytes.
- Node.js y npm instalados en ambas carpetas.

El esquema de referencia está en [`backend/sql/schema.sql`](backend/sql/schema.sql).
Antes de ejecutar el script contra una base existente, verifica que las tablas
actuales tengan las columnas y relaciones esperadas.

## Configuración y ejecución

Configura en `backend/.env` las variables `PORT`, `DB_USER`, `DB_PASSWORD`,
`DB_SERVER`, `DB_NAME` y `JWT_SECRET`. Puedes usar
[`backend/.env.example`](backend/.env.example) como plantilla; nunca publiques
el archivo `.env`.

Si la instancia SQL Server usa TCP/IP deshabilitado o no puede resolverse por
SQL Server Browser, habilita **TCP/IP** en SQL Server Configuration Manager,
configura un puerto TCP estático en `IPAll` (por ejemplo `1433`) y reinicia el
servicio `SQL Server (SQLEXPRESS)`. Después configura `DB_SERVER=localhost` y
`DB_PORT=1433` en `backend/.env`. `DB_PORT` hace que la API conecte por puerto
directo y no dependa de SQL Server Browser.

Los registros públicos reciben rol `usuario`; la API no permite elegir admin
desde el formulario. Para preparar los dos paneles:

1. Ejecuta [`backend/sql/roles-migration.sql`](backend/sql/roles-migration.sql)
   en `inventario_db`. Las cuentas existentes se mantienen como usuarios.
2. Configura `ADMIN_NAME`, `ADMIN_EMAIL` y `ADMIN_PASSWORD` en el `.env`.
   Usa una contraseña privada de al menos 12 caracteres y no más de 72 bytes.
3. Desde `backend/`, ejecuta `npm run admin:bootstrap`. Crea la cuenta admin o
   promueve la cuenta existente de ese correo. El comando nunca imprime la
   contraseña ni reemplaza la contraseña de una cuenta existente.
4. Elimina `ADMIN_PASSWORD` de `.env` después de crear la cuenta. Inicia sesión
   con el correo y la contraseña que configuraste.

No hay credenciales predeterminadas. Crea cuentas de usuario normal en
`/registro`; solo administradores pueden crear, editar o eliminar registros.

Inicia el backend en una terminal:

```powershell
cd backend
npm install
npm run dev
```

Inicia React/Vite en otra terminal:

```powershell
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`. Vite configura el proxy `/api` hacia el backend
en `http://localhost:3000`. Para compilar y servir el frontend estático desde
Express:

```powershell
cd frontend
npm run build
```

## Frontend

- `src/services/api.js`: Axios base, token JWT e interceptor 401.
- `src/context/AuthContext.jsx`: login, registro, cierre de sesión y sesión persistente.
- `src/components/RutaProtegida.jsx`: protege las vistas privadas.
- `src/pages/Login.jsx` y `Registro.jsx`: formularios de acceso.
- `src/pages/PanelUsuario.jsx`: consulta del inventario de solo lectura.
- `src/pages/Dashboard.jsx`: panel administrador.
- `src/pages/Productos.jsx`, `Categorias.jsx` y `Proveedores.jsx`: tablas y CRUD.
- `src/components/PaginaEntidad.jsx`: flujo CRUD común y referencias dinámicas.

El frontend guarda el JWT en `localStorage` como lo solicita el contrato. Para
despliegues con mayor exigencia de seguridad se recomienda migrar a cookies
`HttpOnly`, `Secure` y `SameSite` junto con los cambios correspondientes en API.

## API

Públicas:

- `POST /api/auth/register`
- `POST /api/auth/login`

Protegida:

- `GET /api/auth/me`
- CRUD REST (`GET`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id`) para
  `/api/productos`, `/api/categorias` y `/api/proveedores`.

Todas las llamadas protegidas envían el token JWT en el encabezado
`Authorization`. El panel usuario puede consultar el inventario; solo el panel
admin puede crear, editar o eliminar productos, categorías y proveedores.
El módulo admin de productos carga las categorías y proveedores para elegir las
relaciones. Los cambios de rol requieren iniciar sesión de nuevo; los tokens
emitidos anteriormente conservan su rol hasta expirar (8 horas).

## Modelos del backend

La persistencia de las entidades existentes está organizada en
`backend/src/models/`: `producto.model.js`, `categoria.model.js`,
`proveedor.model.js` y `usuario.model.js`. Los tres modelos de inventario
comparten las operaciones SQL parametrizadas de `crud.model.js`; los
controladores conservan la validación de solicitudes y las respuestas HTTP.
El modelo de usuario centraliza las consultas usadas por registro, inicio de
sesión y consulta del perfil autenticado.

## Pruebas y dependencias

Desde `backend`, ejecuta `npm test` para las pruebas API y `npm audit` para
revisar dependencias del servidor. Desde `frontend`, ejecuta `npm run build`
para validar y compilar la aplicación.
