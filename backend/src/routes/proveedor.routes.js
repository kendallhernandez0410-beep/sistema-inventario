const express = require('express');
const proveedorController = require('../controllers/proveedor.controller');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/', proveedorController.listar);
router.get('/:id', proveedorController.obtenerPorId);
router.post('/', requireRole('admin'), proveedorController.crear);
router.put('/:id', requireRole('admin'), proveedorController.actualizar);
router.delete('/:id', requireRole('admin'), proveedorController.eliminar);

module.exports = router;
