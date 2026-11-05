const { randomUUID } = require('node:crypto');

/**
 * Construye un producto con la estructura que utiliza la aplicación.
 * La persistencia puede sustituirse sin cambiar el contrato del modelo.
 */
function crearProducto({
  id = randomUUID(),
  sku,
  nombre,
  precio,
  stock,
  categoria_id = null,
  proveedor_id = null,
}) {
  return {
    id,
    sku,
    nombre,
    precio,
    stock,
    categoria_id,
    proveedor_id,
  };
}

module.exports = { crearProducto };
