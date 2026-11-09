const { createCrudController } = require('./crud.controller');

module.exports = {
  categorias: createCrudController(require('../models/categoria.model')),
  proveedores: createCrudController(require('../models/proveedor.model')),
  productos: createCrudController(require('../models/producto.model')),
};
