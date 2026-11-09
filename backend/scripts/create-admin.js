const bcrypt = require('bcryptjs');
const { sql, connectToDatabase } = require('../src/db');

async function main() {
  const nombre = process.env.ADMIN_NAME?.trim();
  const correo = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!nombre || !correo || !password) {
    throw new Error('Configura ADMIN_NAME, ADMIN_EMAIL y ADMIN_PASSWORD en backend/.env.');
  }
  if (nombre.length > 150 || correo.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    throw new Error('ADMIN_NAME o ADMIN_EMAIL no tienen un formato válido.');
  }
  if (password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('ADMIN_PASSWORD debe tener al menos 12 caracteres y no superar 72 bytes.');
  }

  const pool = await connectToDatabase();
  try {
    const existing = await pool
      .request()
      .input('correo', sql.NVarChar(254), correo)
      .query(`
        SELECT usuario_id
        FROM dbo.usuarios
        WHERE LOWER(correo) = @correo
      `);

    if (existing.recordset.length > 0) {
      await pool
        .request()
        .input('usuario_id', sql.Int, existing.recordset[0].usuario_id)
        .query("UPDATE dbo.usuarios SET rol = N'admin' WHERE usuario_id = @usuario_id");
      console.log(`La cuenta ${correo} ahora tiene rol admin. Conserva su contraseña actual.`);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await pool
      .request()
      .input('nombre', sql.NVarChar(150), nombre)
      .input('correo', sql.NVarChar(254), correo)
      .input('password_hash', sql.NVarChar(60), passwordHash)
      .query(`
        INSERT INTO dbo.usuarios (nombre, correo, password_hash, rol)
        VALUES (@nombre, @correo, @password_hash, N'admin')
      `);

    console.log(`Cuenta administradora ${correo} creada. La contraseña no se muestra en la consola.`);
  } finally {
    await pool.close();
  }
}

main().catch((error) => {
  console.error('No se pudo crear o promover la cuenta administradora:', error.message);
  process.exitCode = 1;
});
