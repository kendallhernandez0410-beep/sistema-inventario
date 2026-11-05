const { crearProducto } = require('../models/producto.model');

// Almacenamiento temporal. Puede reemplazarse por un ORM/ODM más adelante.
const productos = [];

function listarProductos() {
  return [...productos];
}

function buscarProductoPorId(id) {
  return productos.find((producto) => producto.id === id) || null;
}

function guardarProducto(datosProducto) {
  const producto = crearProducto(datosProducto);
  productos.push(producto);
  return producto;
}

module.exports = {
  listarProductos,
  buscarProductoPorId,
  guardarProducto,
};
