const { sql } = require('../db');
const { createCrudModel } = require('./crud.model');

module.exports = createCrudModel({
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
