const { sql } = require('../db');
const { createCrudModel } = require('./crud.model');

module.exports = createCrudModel({
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
