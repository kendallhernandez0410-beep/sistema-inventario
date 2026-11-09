const { sql, connectToDatabase } = require('../db');

async function crear({ nombre, correo, passwordHash }) {
  const pool = await connectToDatabase();
  const result = await pool
    .request()
    .input('nombre', sql.NVarChar(150), nombre)
    .input('correo', sql.NVarChar(254), correo)
    .input('password_hash', sql.NVarChar(60), passwordHash)
    .query(`
      INSERT INTO dbo.usuarios (nombre, correo, password_hash)
      OUTPUT INSERTED.usuario_id, INSERTED.nombre, INSERTED.correo, INSERTED.rol
      VALUES (@nombre, @correo, @password_hash)
    `);
  return result.recordset[0];
}

async function obtenerPorCorreo(correo) {
  const pool = await connectToDatabase();
  const result = await pool
    .request()
    .input('correo', sql.NVarChar(254), correo)
    .query(`
      SELECT usuario_id, nombre, correo, password_hash, rol
      FROM dbo.usuarios
      WHERE correo = @correo
    `);
  return result.recordset[0] || null;
}

async function obtenerPublicoPorId(usuarioId) {
  const pool = await connectToDatabase();
  const result = await pool
    .request()
    .input('usuario_id', sql.Int, usuarioId)
    .query(`
      SELECT usuario_id, nombre, correo, rol
      FROM dbo.usuarios
      WHERE usuario_id = @usuario_id
    `);
  return result.recordset[0] || null;
}

module.exports = { crear, obtenerPorCorreo, obtenerPublicoPorId };
