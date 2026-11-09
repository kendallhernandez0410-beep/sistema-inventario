const jwt = require('jsonwebtoken');

function obtenerJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error('JWT_SECRET debe estar configurado con al menos 32 bytes.');
  }
  return secret;
}

function authMiddleware(req, res, next) {
  const authorization = req.get('authorization');
  const match = authorization && authorization.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return res.status(401).json({ mensaje: 'Se requiere un token Bearer válido.' });
  }

  try {
    const payload = jwt.verify(match[1], obtenerJwtSecret(), {
      algorithms: ['HS256'],
      issuer: 'inventario-api',
    });

    const userId = Number(payload.sub);
    if (!Number.isSafeInteger(userId) || userId < 1 || userId > 2147483647) {
      return res.status(401).json({ mensaje: 'El token no es válido.' });
    }
    if (!['usuario', 'admin'].includes(payload.role)) {
      return res.status(401).json({ mensaje: 'El token no contiene un rol válido. Inicia sesión de nuevo.' });
    }

    req.auth = { userId, role: payload.role };
    return next();
  } catch (error) {
    if (error.message.startsWith('JWT_SECRET')) {
      console.error('Configuración JWT inválida:', error.message);
      return res.status(500).json({ mensaje: 'La autenticación no está configurada correctamente.' });
    }

    return res.status(401).json({ mensaje: 'El token es inválido o ha expirado.' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ mensaje: 'No tienes permisos para realizar esta acción.' });
    }
    return next();
  };
}

module.exports = { authMiddleware, obtenerJwtSecret, requireRole };
