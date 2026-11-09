const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuario.model');
const { obtenerJwtSecret } = require('../middleware/auth.middleware');

const BCRYPT_ROUNDS = 12;

function validarCorreo(correo) {
  return typeof correo === 'string'
    && correo.length <= 254
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

function validarRegistro(body) {
  const errors = [];
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return ['El cuerpo de la solicitud debe ser un objeto JSON.'];
  }
  if (typeof body.nombre !== 'string' || body.nombre.trim() === '' || body.nombre.trim().length > 150) {
    errors.push('El nombre es obligatorio y no puede superar 150 caracteres.');
  }
  if (!validarCorreo(body.correo)) {
    errors.push('El correo debe tener un formato válido.');
  }
  if (typeof body.password !== 'string' || body.password.length < 8 || Buffer.byteLength(body.password, 'utf8') > 72) {
    errors.push('La contraseña debe tener al menos 8 caracteres y no superar 72 bytes.');
  }
  return errors;
}

function crearToken(usuarioId, rol) {
  return jwt.sign({ role: rol }, obtenerJwtSecret(), {
    algorithm: 'HS256',
    subject: String(usuarioId),
    issuer: 'inventario-api',
    expiresIn: '8h',
  });
}

function usuarioPublico(usuario) {
  return {
    usuario_id: usuario.usuario_id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol,
  };
}

function responderErrorDeAutenticacion(res, error, accion) {
  if (error.code === 'ETIMEOUT' || error.code === 'ESOCKET' || error.code === 'ECONNREFUSED' || error.code === 'EINSTLOOKUP' || error.code === 'ENOTFOUND') {
    console.error(`SQL Server no está disponible al ${accion}:`, error.message);
    return res.status(503).json({
      mensaje: 'No hay conexión con SQL Server. Revisa DB_SERVER, DB_PORT y la instancia de SQL Server. Si usas una instancia con nombre, configura TCP/IP o usa localhost y un puerto fijo (por ejemplo 1433).',
    });
  }

  if (error.code === 'ELOGIN') {
    console.error(`SQL Server rechazó las credenciales al ${accion}.`);
    return res.status(503).json({
      mensaje: 'SQL Server rechazó las credenciales. Revisa DB_USER y DB_PASSWORD en backend/.env.',
    });
  }

  if (error.number === 207 || error.number === 208) {
    console.error(`Falta el esquema de usuarios al ${accion}:`, error.message);
    return res.status(500).json({
      mensaje: 'No está preparada la tabla de usuarios. Ejecuta backend/sql/schema.sql y backend/sql/roles-migration.sql en inventario_db.',
    });
  }

  console.error(`Error al ${accion}:`, error);
  return res.status(500).json({ mensaje: `No se pudo ${accion}.` });
}

async function registrar(req, res) {
  const errors = validarRegistro(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ mensaje: 'Los datos de registro no son válidos.', errores: errors });
  }

  try {
    obtenerJwtSecret();
    const correo = req.body.correo.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(req.body.password, BCRYPT_ROUNDS);
    const usuario = await usuarioModel.crear({
      nombre: req.body.nombre.trim(),
      correo,
      passwordHash,
    });

    return res.status(201).json({ usuario });
  } catch (error) {
    if (error.message.startsWith('JWT_SECRET')) {
      console.error('Configuración JWT inválida:', error.message);
      return res.status(500).json({ mensaje: 'La autenticación no está configurada correctamente.' });
    }
    if (error.number === 2601 || error.number === 2627) {
      return res.status(409).json({ mensaje: 'Ya existe una cuenta registrada con ese correo.' });
    }
    return responderErrorDeAutenticacion(res, error, 'registrar la cuenta');
  }
}

async function iniciarSesion(req, res) {
  const correo = typeof req.body?.correo === 'string' ? req.body.correo.trim().toLowerCase() : '';
  const password = req.body?.password;

  if (!validarCorreo(correo)
    || typeof password !== 'string'
    || password.length === 0
    || Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({ mensaje: 'Debes proporcionar un correo y una contraseña válidos.' });
  }

  try {
    obtenerJwtSecret();
    const usuario = await usuarioModel.obtenerPorCorreo(correo);

    if (!usuario || !(await bcrypt.compare(password, usuario.password_hash))) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos.' });
    }

    const token = crearToken(usuario.usuario_id, usuario.rol);
    return res.status(200).json({ token, usuario: usuarioPublico(usuario) });
  } catch (error) {
    if (error.message.startsWith('JWT_SECRET')) {
      console.error('Configuración JWT inválida:', error.message);
      return res.status(500).json({ mensaje: 'La autenticación no está configurada correctamente.' });
    }
    return responderErrorDeAutenticacion(res, error, 'iniciar sesión');
  }
}

async function obtenerUsuarioActual(req, res) {
  try {
    const usuario = await usuarioModel.obtenerPublicoPorId(req.auth.userId);

    if (!usuario) {
      return res.status(401).json({ mensaje: 'La cuenta asociada al token ya no existe.' });
    }

    return res.status(200).json({ usuario });
  } catch (error) {
    return responderErrorDeAutenticacion(res, error, 'consultar el usuario actual');
  }
}

module.exports = { registrar, iniciarSesion, obtenerUsuarioActual };
