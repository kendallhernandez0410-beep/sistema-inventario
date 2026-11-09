const { sql } = require('../db');
const { createCrudModel } = require('./crud.model');

module.exports = createCrudModel({
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
