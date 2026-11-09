const express = require('express');
const categoriaController = require('../controllers/categoria.controller');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/', categoriaController.listar);
router.get('/:id', categoriaController.obtenerPorId);
router.post('/', requireRole('admin'), categoriaController.crear);
router.put('/:id', requireRole('admin'), categoriaController.actualizar);
router.delete('/:id', requireRole('admin'), categoriaController.eliminar);

module.exports = router;
