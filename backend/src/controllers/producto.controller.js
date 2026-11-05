const { sql, connectToDatabase } = require('../db');

function validarProducto(datos) {
  const errores = [];

  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    return ['El cuerpo de la solicitud debe ser un objeto JSON.'];
  }

  if (typeof datos.sku !== 'string' || datos.sku.trim() === '') {
    errores.push('El campo sku es obligatorio y debe ser texto.');
  }

  if (typeof datos.nombre !== 'string' || datos.nombre.trim() === '') {
    errores.push('El campo nombre es obligatorio y debe ser texto.');
  }

  if (typeof datos.precio !== 'number' || !Number.isFinite(datos.precio) || datos.precio < 0) {
    errores.push('El campo precio es obligatorio y debe ser un número mayor o igual a 0.');
  }

  if (!Number.isInteger(datos.stock) || datos.stock < 0) {
    errores.push('El campo stock es obligatorio y debe ser un entero mayor o igual a 0.');
  }

  return errores;
}

async function listarProductos(req, res) {
  try {
    const pool = await connectToDatabase();
    const resultado = await pool.request().query('SELECT * FROM dbo.productos');

    return res.status(200).json(resultado.recordset);
  } catch (error) {
    console.error('Error al consultar productos:', error);
    return res.status(500).json({ mensaje: 'No se pudieron consultar los productos.' });
  }
}

async function crearProducto(req, res) {
  const errores = validarProducto(req.body);

  if (errores.length > 0) {
    return res.status(400).json({
      mensaje: 'Los datos del producto no son válidos.',
      errores,
    });
  }

  try {
    const pool = await connectToDatabase();
    const resultado = await pool
      .request()
      .input('sku', sql.NVarChar(50), req.body.sku.trim())
      .input('nombre', sql.NVarChar(255), req.body.nombre.trim())
      .input('precio', sql.Decimal(18, 2), req.body.precio)
      .input('stock', sql.Int, req.body.stock)
      .query(`
        INSERT INTO dbo.productos (sku, nombre, precio, stock)
        OUTPUT INSERTED.*
        VALUES (@sku, @nombre, @precio, @stock)
      `);

    return res.status(201).json(resultado.recordset[0]);
  } catch (error) {
    console.error('Error al crear el producto:', error);
    return res.status(500).json({ mensaje: 'No se pudo crear el producto.' });
  }
}

module.exports = {
  listarProductos,
  crearProducto,
};
