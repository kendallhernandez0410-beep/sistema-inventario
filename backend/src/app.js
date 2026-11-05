const express = require('express');
const cors = require('cors');
const path = require('node:path');
const rutasProducto = require('./routes/producto.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../../frontend')));
app.use('/api/productos', rutasProducto);

app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada.' });
});

module.exports = app;
