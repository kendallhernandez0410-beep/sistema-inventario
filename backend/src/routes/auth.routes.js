const express = require('express');
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', authController.registrar);
router.post('/login', authController.iniciarSesion);
router.get('/me', authMiddleware, authController.obtenerUsuarioActual);

module.exports = router;
