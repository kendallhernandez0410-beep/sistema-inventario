const express = require('express');
const productoController = require('../controllers/producto.controller');

const router = express.Router();

router.get('/', productoController.listarProductos);
router.post('/', productoController.crearProducto);

module.exports = router;
