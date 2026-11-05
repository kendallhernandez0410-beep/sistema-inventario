const { sql } = require('../db');
const { createCrudController } = require('./crud.controller');

const categorias = createCrudController({
  label: 'Categoría',
  table: 'dbo.categorias',
  idColumn: 'categoria_id',
  selectList: 'SELECT categoria_id, nombre, descripcion FROM dbo.categorias ORDER BY nombre',
  selectOne: 'SELECT categoria_id, nombre, descripcion FROM dbo.categorias WHERE categoria_id = @id',
  fields: [
    { name: 'nombre', type: sql.NVarChar(100), kind: 'string', maxLength: 100, required: true },
    { name: 'descripcion', type: sql.NVarChar(255), kind: 'string', maxLength: 255 },
  ],
  validate: () => [],
  dependency: { table: 'dbo.productos', foreignKey: 'categoria_id' },
});

const proveedores = createCrudController({
  label: 'Proveedor',
  table: 'dbo.proveedores',
  idColumn: 'proveedor_id',
  selectList: 'SELECT proveedor_id, nombre, contacto, telefono, email FROM dbo.proveedores ORDER BY nombre',
  selectOne: 'SELECT proveedor_id, nombre, contacto, telefono, email FROM dbo.proveedores WHERE proveedor_id = @id',
  fields: [
    { name: 'nombre', type: sql.NVarChar(150), kind: 'string', maxLength: 150, required: true },
    { name: 'contacto', type: sql.NVarChar(150), kind: 'string', maxLength: 150 },
    { name: 'telefono', type: sql.NVarChar(30), kind: 'string', maxLength: 30 },
    { name: 'email', type: sql.NVarChar(254), kind: 'string', maxLength: 254 },
  ],
  validate: (body) => {
    if (body.email != null && body.email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return ['El campo email debe tener un formato válido.'];
    }
    return [];
  },
  dependency: { table: 'dbo.productos', foreignKey: 'proveedor_id' },
});

const productos = createCrudController({
  label: 'Producto',
  table: 'dbo.productos',
  idColumn: 'producto_id',
  selectList: `
    SELECT p.*, c.nombre AS categoria, pr.nombre AS proveedor
    FROM dbo.productos p
    LEFT JOIN dbo.categorias c ON c.categoria_id = p.categoria_id
    LEFT JOIN dbo.proveedores pr ON pr.proveedor_id = p.proveedor_id
    ORDER BY p.nombre
  `,
  selectOne: `
    SELECT p.*, c.nombre AS categoria, pr.nombre AS proveedor
    FROM dbo.productos p
    LEFT JOIN dbo.categorias c ON c.categoria_id = p.categoria_id
    LEFT JOIN dbo.proveedores pr ON pr.proveedor_id = p.proveedor_id
    WHERE p.producto_id = @id
  `,
  fields: [
    { name: 'sku', type: sql.NVarChar(50), kind: 'string', maxLength: 50, required: true },
    { name: 'nombre', type: sql.NVarChar(255), kind: 'string', maxLength: 255, required: true },
    { name: 'precio', type: sql.Decimal(18, 2), kind: 'number', max: 9999999999999999, required: true },
    { name: 'stock', type: sql.Int, kind: 'integer', max: 2147483647, required: true },
    { name: 'categoria_id', type: sql.Int, kind: 'integer', min: 1, max: 2147483647 },
    { name: 'proveedor_id', type: sql.Int, kind: 'integer', min: 1, max: 2147483647 },
  ],
  references: [
    { field: 'categoria_id', table: 'dbo.categorias', idColumn: 'categoria_id', label: 'categoría' },
    { field: 'proveedor_id', table: 'dbo.proveedores', idColumn: 'proveedor_id', label: 'proveedor' },
  ],
  validate: (body) => {
    const errors = [];
    for (const field of ['categoria_id', 'proveedor_id']) {
      if (body[field] != null && (!Number.isInteger(body[field]) || body[field] < 1)) {
        errors.push(`El campo ${field} debe ser un entero positivo.`);
      }
    }
    return errors;
  },
});

module.exports = { categorias, proveedores, productos };
