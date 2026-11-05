# Sistema de inventario y proveedores

Aplicación para que una empresa centralice usuarios, productos, existencias,
categorías y proveedores en SQL Server. La justificación del proyecto está en
[`docs/justificacion.md`](docs/justificacion.md), y el modelo entidad-relación
en [`docs/modelo-entidad-relacion.md`](docs/modelo-entidad-relacion.md).

## Entregables

- Documento breve del tema y su justificación empresarial.
- Diagrama entidad-relación con atributos, claves y relaciones.
- Estructura separada de backend Node.js/Express y frontend JavaScript.
- API con endpoints de creación y listado, pruebas automatizadas de validación
  y colección importable de Postman.
- Registro e inicio de sesión con contraseñas cifradas con bcryptjs y JWT con
  expiración de ocho horas.
- CRUD protegido para productos, categorías y proveedores.

## Requisitos

- Node.js 18 o posterior.
- SQL Server y una base de datos configurada en `backend/.env`.

## Configuración

Define estas variables en `backend/.env`:

```env
PORT=3000
DB_USER=usuario
DB_PASSWORD=contraseña
DB_SERVER=localhost
DB_NAME=inventario_db
JWT_SECRET=secreto_aleatorio_de_al_menos_32_bytes
```

Para una instancia nombrada, puedes usar `DB_SERVER=localhost\\SQLEXPRESS`.
Genera `JWT_SECRET` como un valor aleatorio privado de al menos 32 bytes. Puedes
copiar `backend/.env.example` como plantilla. No compartas ni subas `.env`; está
excluido de Git.

El esquema de referencia, incluida la tabla `usuarios`, está en
[`backend/sql/schema.sql`](backend/sql/schema.sql). El script crea únicamente
tablas faltantes: no modifica tablas que ya existan.
Antes de ejecutarlo en una base existente, compara sus columnas y relaciones con
el [modelo ER](docs/modelo-entidad-relacion.md) y adapta el esquema o las
consultas si no coinciden. El equipo no pudo confirmar la conexión a SQL Server
durante la preparación de estos entregables.

## Iniciar y probar

```powershell
cd backend
npm install
npm run dev
```

El frontend y la API estarán disponibles en `http://localhost:3000`. Las pruebas
automatizadas de validación se ejecutan con:

```powershell
npm test
```

Para probar operaciones persistentes, inicia SQL Server y ejecuta la colección
[`postman/inventario.postman_collection.json`](postman/inventario.postman_collection.json)
en Postman Runner, en orden y con el servidor iniciado. La colección registra
un usuario de prueba, inicia sesión y guarda el JWT para los siguientes
endpoints; luego crea una categoría, un proveedor y un producto relacionado, y
verifica el listado. Cada ejecución inserta datos de prueba permanentes nuevos.

## API

| Método | Ruta | Función |
| --- | --- | --- |
| POST | `/api/auth/register` | Registro público; requiere `nombre`, `correo` y `password` de al menos 8 caracteres. |
| POST | `/api/auth/login` | Inicio de sesión; entrega un JWT válido por 8 horas. |
| GET | `/api/auth/me` | Devuelve el usuario del token actual. |
| GET/POST | `/api/productos` | Lista o crea productos con referencias opcionales a categoría y proveedor. |
| GET/PUT/DELETE | `/api/productos/:id` | Consulta, reemplaza o elimina un producto. |
| GET/POST | `/api/categorias` | Lista o crea categorías. |
| GET/PUT/DELETE | `/api/categorias/:id` | Consulta, reemplaza o elimina una categoría. |
| GET/POST | `/api/proveedores` | Lista o crea proveedores. |
| GET/PUT/DELETE | `/api/proveedores/:id` | Consulta, reemplaza o elimina un proveedor. |

Todas las rutas salvo registro e inicio de sesión requieren
`Authorization: Bearer <token>`. Para editar se envía el objeto completo del
recurso. El producto requiere `sku`, `nombre`, `precio` (número mayor o igual a
cero) y `stock` (entero no negativo); sus IDs de categoría y proveedor deben
existir. Categorías y proveedores requieren `nombre`. No se pueden eliminar
categorías o proveedores vinculados a productos (409 Conflict). Correos y SKU
duplicados también responden 409.

Ejemplo de `POST /api/productos`:

```json
{
  "sku": "PROD-001",
  "nombre": "Producto de ejemplo",
  "precio": 99.5,
  "stock": 10,
  "categoria_id": 1,
  "proveedor_id": 1
}
```

Ejemplo de autenticación:

```json
{
  "correo": "usuario@empresa.com",
  "password": "una-clave-segura"
}
```
