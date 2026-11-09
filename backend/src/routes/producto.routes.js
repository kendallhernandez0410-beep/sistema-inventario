const express = require('express');
const productoController = require('../controllers/producto.controller');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/', productoController.listar);
router.get('/:id', productoController.obtenerPorId);
router.post('/', requireRole('admin'), productoController.crear);
router.put('/:id', requireRole('admin'), productoController.actualizar);
router.delete('/:id', requireRole('admin'), productoController.eliminar);

module.exports = router;
