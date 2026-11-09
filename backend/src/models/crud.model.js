const { sql, connectToDatabase } = require('../db');

function createCrudModel(config) {
  const fieldNames = config.fields.map((field) => field.name);
  const insertColumns = fieldNames.join(', ');
  const insertParameters = fieldNames.map((name) => `@${name}`).join(', ');
  const updateFields = fieldNames.map((name) => `${name} = @${name}`).join(', ');

  function bindFields(request, body) {
    for (const field of config.fields) {
      const value = body[field.name];
      request.input(
        field.name,
        field.type,
        typeof value === 'string' ? value.trim() || null : value ?? null,
      );
    }
    return request;
  }

  async function listar() {
    const pool = await connectToDatabase();
    const result = await pool.request().query(config.selectList);
    return result.recordset;
  }

  async function obtenerPorId(id) {
    const pool = await connectToDatabase();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(config.selectOne);
    return result.recordset[0] || null;
  }

  async function validarReferencias(body) {
    const pool = await connectToDatabase();
    const errors = [];

    for (const reference of config.references || []) {
      const id = body[reference.field];
      if (id == null) continue;

      const result = await pool
        .request()
        .input('referenceId', sql.Int, id)
        .query(`SELECT 1 AS existe FROM ${reference.table} WHERE ${reference.idColumn} = @referenceId`);

      if (result.recordset.length === 0) {
        errors.push(`El ${reference.label} indicado no existe.`);
      }
    }

    return errors;
  }

  async function crear(body) {
    const pool = await connectToDatabase();
    const result = await bindFields(pool.request(), body).query(`
      INSERT INTO ${config.table} (${insertColumns})
      OUTPUT INSERTED.*
      VALUES (${insertParameters})
    `);
    return result.recordset[0];
  }

  async function actualizar(id, body) {
    const pool = await connectToDatabase();
    const result = await bindFields(pool.request(), body)
      .input('id', sql.Int, id)
      .query(`
        UPDATE ${config.table}
        SET ${updateFields}
        OUTPUT INSERTED.*
        WHERE ${config.idColumn} = @id
      `);
    return result.recordset[0] || null;
  }

  async function eliminar(id) {
    const pool = await connectToDatabase();

    if (config.dependency) {
      const dependent = await pool
        .request()
        .input('id', sql.Int, id)
        .query(`
          SELECT TOP (1) 1 AS existe
          FROM ${config.dependency.table}
          WHERE ${config.dependency.foreignKey} = @id
        `);

      if (dependent.recordset.length > 0) {
        const error = new Error('El registro tiene dependencias.');
        error.code = 'DEPENDENCY_CONFLICT';
        throw error;
      }
    }

    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        DELETE FROM ${config.table}
        OUTPUT DELETED.${config.idColumn}
        WHERE ${config.idColumn} = @id
      `);

    return result.recordset.length > 0;
  }

  return {
    ...config,
    listar,
    obtenerPorId,
    validarReferencias,
    crear,
    actualizar,
    eliminar,
  };
}

module.exports = { createCrudModel };
