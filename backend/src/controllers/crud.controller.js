const { sql, connectToDatabase } = require('../db');

const MAX_SQL_INT = 2147483647;

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function createCrudController(config) {
  const fieldNames = config.fields.map((field) => field.name);
  const insertColumns = fieldNames.join(', ');
  const insertParameters = fieldNames.map((name) => `@${name}`).join(', ');
  const updateFields = fieldNames.map((name) => `${name} = @${name}`).join(', ');

  function validateBody(body) {
    if (!isObject(body)) {
      return ['El cuerpo de la solicitud debe ser un objeto JSON.'];
    }

    const errors = config.validate(body);
    for (const field of config.fields) {
      const value = body[field.name];

      if (value == null) {
        if (field.required) {
          errors.push(`El campo ${field.name} es obligatorio.`);
        }
        continue;
      }

      if (field.kind === 'string') {
        if (typeof value !== 'string' || value.trim() === '') {
          if (field.required || value !== '') {
            errors.push(`El campo ${field.name} debe ser texto válido.`);
          }
        } else if (value.trim().length > field.maxLength) {
          errors.push(`El campo ${field.name} no puede superar ${field.maxLength} caracteres.`);
        }
      } else if (field.kind === 'number') {
        if (typeof value !== 'number'
          || !Number.isFinite(value)
          || value < (field.min ?? 0)
          || (field.max != null && value > field.max)) {
          errors.push(`El campo ${field.name} debe ser un número válido.`);
        }
      } else if (field.kind === 'integer') {
        if (!Number.isInteger(value)
          || value < (field.min ?? 0)
          || (field.max != null && value > field.max)) {
          errors.push(`El campo ${field.name} debe ser un entero válido.`);
        }
      }
    }

    return [...new Set(errors)];
  }

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

  async function validateReferences(pool, body) {
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

  function respondWithError(res, error, action) {
    if (error.number === 2601 || error.number === 2627) {
      return res.status(409).json({ mensaje: `${config.label} ya existe.` });
    }

    if (error.number === 547) {
      return res.status(409).json({
        mensaje: `No se puede ${action} ${config.label.toLowerCase()} porque tiene relaciones dependientes.`,
      });
    }

    console.error(`Error al ${action} ${config.label.toLowerCase()}:`, error);
    return res.status(500).json({ mensaje: `No se pudo ${action} ${config.label.toLowerCase()}.` });
  }

  async function listar(req, res) {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request().query(config.selectList);
      return res.status(200).json(result.recordset);
    } catch (error) {
      return respondWithError(res, error, 'consultar');
    }
  }

  async function obtenerPorId(req, res) {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1 || id > MAX_SQL_INT) {
      return res.status(400).json({ mensaje: 'El identificador debe ser un entero positivo.' });
    }

    try {
      const pool = await connectToDatabase();
      const result = await pool
        .request()
        .input('id', sql.Int, id)
        .query(config.selectOne);

      if (result.recordset.length === 0) {
        return res.status(404).json({ mensaje: `${config.label} no encontrado.` });
      }

      return res.status(200).json(result.recordset[0]);
    } catch (error) {
      return respondWithError(res, error, 'consultar');
    }
  }

  async function crear(req, res) {
    const errors = validateBody(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ mensaje: `Los datos de ${config.label.toLowerCase()} no son válidos.`, errores: errors });
    }

    try {
      const pool = await connectToDatabase();
      const referenceErrors = await validateReferences(pool, req.body);
      if (referenceErrors.length > 0) {
        return res.status(400).json({ mensaje: 'Hay referencias inválidas.', errores: referenceErrors });
      }

      const request = bindFields(pool.request(), req.body);
      const result = await request.query(`
        INSERT INTO ${config.table} (${insertColumns})
        OUTPUT INSERTED.*
        VALUES (${insertParameters})
      `);

      return res.status(201).json(result.recordset[0]);
    } catch (error) {
      return respondWithError(res, error, 'crear');
    }
  }

  async function actualizar(req, res) {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1 || id > MAX_SQL_INT) {
      return res.status(400).json({ mensaje: 'El identificador debe ser un entero positivo.' });
    }

    const errors = validateBody(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ mensaje: `Los datos de ${config.label.toLowerCase()} no son válidos.`, errores: errors });
    }

    try {
      const pool = await connectToDatabase();
      const referenceErrors = await validateReferences(pool, req.body);
      if (referenceErrors.length > 0) {
        return res.status(400).json({ mensaje: 'Hay referencias inválidas.', errores: referenceErrors });
      }

      const request = bindFields(pool.request(), req.body).input('id', sql.Int, id);
      const result = await request.query(`
        UPDATE ${config.table}
        SET ${updateFields}
        OUTPUT INSERTED.*
        WHERE ${config.idColumn} = @id
      `);

      if (result.recordset.length === 0) {
        return res.status(404).json({ mensaje: `${config.label} no encontrado.` });
      }

      return res.status(200).json(result.recordset[0]);
    } catch (error) {
      return respondWithError(res, error, 'actualizar');
    }
  }

  async function eliminar(req, res) {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1 || id > MAX_SQL_INT) {
      return res.status(400).json({ mensaje: 'El identificador debe ser un entero positivo.' });
    }

    try {
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
          return res.status(409).json({
            mensaje: `No se puede eliminar ${config.label.toLowerCase()} porque hay productos relacionados.`,
          });
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

      if (result.recordset.length === 0) {
        return res.status(404).json({ mensaje: `${config.label} no encontrado.` });
      }

      return res.status(200).json({ mensaje: `${config.label} eliminado correctamente.` });
    } catch (error) {
      return respondWithError(res, error, 'eliminar');
    }
  }

  return { listar, obtenerPorId, crear, actualizar, eliminar };
}

module.exports = { createCrudController };
