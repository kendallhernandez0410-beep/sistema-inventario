const express = require('express');
const proveedorController = require('../controllers/proveedor.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/', proveedorController.listar);
router.get('/:id', proveedorController.obtenerPorId);
router.post('/', proveedorController.crear);
router.put('/:id', proveedorController.actualizar);
router.delete('/:id', proveedorController.eliminar);

module.exports = router;
