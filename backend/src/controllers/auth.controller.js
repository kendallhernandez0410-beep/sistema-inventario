const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql, connectToDatabase } = require('../db');
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

function crearToken(usuarioId) {
  return jwt.sign({}, obtenerJwtSecret(), {
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
  };
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
    const pool = await connectToDatabase();
    const result = await pool
      .request()
      .input('nombre', sql.NVarChar(150), req.body.nombre.trim())
      .input('correo', sql.NVarChar(254), correo)
      .input('password_hash', sql.NVarChar(60), passwordHash)
      .query(`
        INSERT INTO dbo.usuarios (nombre, correo, password_hash)
        OUTPUT INSERTED.usuario_id, INSERTED.nombre, INSERTED.correo
        VALUES (@nombre, @correo, @password_hash)
      `);

    return res.status(201).json({ usuario: result.recordset[0] });
  } catch (error) {
    if (error.message.startsWith('JWT_SECRET')) {
      console.error('Configuración JWT inválida:', error.message);
      return res.status(500).json({ mensaje: 'La autenticación no está configurada correctamente.' });
    }
    if (error.number === 2601 || error.number === 2627) {
      return res.status(409).json({ mensaje: 'Ya existe una cuenta registrada con ese correo.' });
    }
    console.error('Error al registrar usuario:', error);
    return res.status(500).json({ mensaje: 'No se pudo registrar el usuario.' });
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
    const pool = await connectToDatabase();
    const result = await pool
      .request()
      .input('correo', sql.NVarChar(254), correo)
      .query(`
        SELECT usuario_id, nombre, correo, password_hash
        FROM dbo.usuarios
        WHERE correo = @correo
      `);
    const usuario = result.recordset[0];

    if (!usuario || !(await bcrypt.compare(password, usuario.password_hash))) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos.' });
    }

    const token = crearToken(usuario.usuario_id);
    return res.status(200).json({ token, usuario: usuarioPublico(usuario) });
  } catch (error) {
    if (error.message.startsWith('JWT_SECRET')) {
      console.error('Configuración JWT inválida:', error.message);
      return res.status(500).json({ mensaje: 'La autenticación no está configurada correctamente.' });
    }
    console.error('Error al iniciar sesión:', error);
    return res.status(500).json({ mensaje: 'No se pudo iniciar sesión.' });
  }
}

async function obtenerUsuarioActual(req, res) {
  try {
    const pool = await connectToDatabase();
    const result = await pool
      .request()
      .input('usuario_id', sql.Int, req.auth.userId)
      .query(`
        SELECT usuario_id, nombre, correo
        FROM dbo.usuarios
        WHERE usuario_id = @usuario_id
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ mensaje: 'La cuenta asociada al token ya no existe.' });
    }

    return res.status(200).json({ usuario: result.recordset[0] });
  } catch (error) {
    console.error('Error al consultar el usuario autenticado:', error);
    return res.status(500).json({ mensaje: 'No se pudo consultar el usuario actual.' });
  }
}

module.exports = { registrar, iniciarSesion, obtenerUsuarioActual };
