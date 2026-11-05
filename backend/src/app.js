const express = require('express');
const cors = require('cors');
const path = require('node:path');
const rutasProducto = require('./routes/producto.routes');
const rutasCategoria = require('./routes/categoria.routes');
const rutasProveedor = require('./routes/proveedor.routes');
const rutasAuth = require('./routes/auth.routes');

const app = express();

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use(express.static(path.join(__dirname, '../../frontend')));
app.use('/api/auth', rutasAuth);
app.use('/api/productos', rutasProducto);
app.use('/api/categorias', rutasCategoria);
app.use('/api/proveedores', rutasProveedor);

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ mensaje: 'El cuerpo debe contener JSON válido.' });
  }
  console.error('Error no controlado en la solicitud:', error);
  return res.status(500).json({ mensaje: 'Ocurrió un error interno.' });
});

app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada.' });
});

module.exports = app;
