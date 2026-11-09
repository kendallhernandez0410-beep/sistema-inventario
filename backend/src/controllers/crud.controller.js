const MAX_SQL_INT = 2147483647;

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function createCrudController(model) {
  function validateBody(body) {
    if (!isObject(body)) {
      return ['El cuerpo de la solicitud debe ser un objeto JSON.'];
    }

    const errors = model.validate(body);
    for (const field of model.fields) {
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

  function respondWithError(res, error, action) {
    if (error.code === 'DEPENDENCY_CONFLICT') {
      return res.status(409).json({
        mensaje: `No se puede eliminar ${model.label.toLowerCase()} porque hay productos relacionados.`,
      });
    }

    if (error.number === 2601 || error.number === 2627) {
      return res.status(409).json({ mensaje: `${model.label} ya existe.` });
    }

    if (error.number === 547) {
      return res.status(409).json({
        mensaje: `No se puede ${action} ${model.label.toLowerCase()} porque tiene relaciones dependientes.`,
      });
    }

    console.error(`Error al ${action} ${model.label.toLowerCase()}:`, error);
    return res.status(500).json({ mensaje: `No se pudo ${action} ${model.label.toLowerCase()}.` });
  }

  async function listar(req, res) {
    try {
      const rows = await model.listar();
      return res.status(200).json(rows);
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
      const row = await model.obtenerPorId(id);
      if (!row) {
        return res.status(404).json({ mensaje: `${model.label} no encontrado.` });
      }
      return res.status(200).json(row);
    } catch (error) {
      return respondWithError(res, error, 'consultar');
    }
  }

  async function crear(req, res) {
    const errors = validateBody(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ mensaje: `Los datos de ${model.label.toLowerCase()} no son válidos.`, errores: errors });
    }

    try {
      const referenceErrors = await model.validarReferencias(req.body);
      if (referenceErrors.length > 0) {
        return res.status(400).json({ mensaje: 'Hay referencias inválidas.', errores: referenceErrors });
      }

      const row = await model.crear(req.body);
      return res.status(201).json(row);
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
      return res.status(400).json({ mensaje: `Los datos de ${model.label.toLowerCase()} no son válidos.`, errores: errors });
    }

    try {
      const referenceErrors = await model.validarReferencias(req.body);
      if (referenceErrors.length > 0) {
        return res.status(400).json({ mensaje: 'Hay referencias inválidas.', errores: referenceErrors });
      }

      const row = await model.actualizar(id, req.body);
      if (!row) {
        return res.status(404).json({ mensaje: `${model.label} no encontrado.` });
      }
      return res.status(200).json(row);
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
      const deleted = await model.eliminar(id);
      if (!deleted) {
        return res.status(404).json({ mensaje: `${model.label} no encontrado.` });
      }
      return res.status(200).json({ mensaje: `${model.label} eliminado correctamente.` });
    } catch (error) {
      return respondWithError(res, error, 'eliminar');
    }
  }

  return { listar, obtenerPorId, crear, actualizar, eliminar };
}

module.exports = { createCrudController };
