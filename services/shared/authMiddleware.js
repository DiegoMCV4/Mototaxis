// =============================================
// JWT Auth Middleware Compartido
// Usado por todos los microservicios
// =============================================
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mototaxi-jwt-secret-key-2024';

/**
 * Middleware que verifica el token JWT en el header Authorization
 * Agrega req.user con { id, email, userType }
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticación requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado, inicia sesión de nuevo' });
      }
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = decoded; // { id, email, userType }
    next();
  });
};

/**
 * Middleware que verifica que el usuario sea pasajero
 */
const requirePassenger = (req, res, next) => {
  if (req.user.userType !== 'passenger') {
    return res.status(403).json({ error: 'Acceso solo para pasajeros' });
  }
  next();
};

/**
 * Middleware que verifica que el usuario sea conductor
 */
const requireDriver = (req, res, next) => {
  if (req.user.userType !== 'driver') {
    return res.status(403).json({ error: 'Acceso solo para conductores' });
  }
  next();
};

/**
 * Middleware que verifica que el userId del request coincida con el del JWT
 * (previene que un usuario actúe como otro)
 */
const requireSameUser = (paramName = 'userId') => {
  return (req, res, next) => {
    const targetUserId = req.params[paramName] || req.body[paramName] || req.body.passengerId || req.body.driverId;
    if (targetUserId && targetUserId !== req.user.id) {
      return res.status(403).json({ error: 'No puedes actuar en nombre de otro usuario' });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  requirePassenger,
  requireDriver,
  requireSameUser
};
