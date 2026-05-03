// =============================================
// Rate Limiter Middleware
// Protege contra brute-force y abuse
// =============================================

// Almacén en memoria para rate limiting (en producción usar Redis)
const attempts = new Map();

/**
 * Limpieza periódica cada 15 minutos
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of attempts) {
    if (now - data.firstAttempt > 15 * 60 * 1000) {
      attempts.delete(key);
    }
  }
}, 15 * 60 * 1000);

/**
 * Rate limiter genérico
 * @param {number} maxAttempts - Máximo de intentos permitidos
 * @param {number} windowMs - Ventana de tiempo en milisegundos
 */
const rateLimiter = (maxAttempts = 10, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const key = `${ip}:${req.path}`;
    const now = Date.now();

    if (!attempts.has(key)) {
      attempts.set(key, { count: 1, firstAttempt: now });
      return next();
    }

    const data = attempts.get(key);

    // Resetear si la ventana expiró
    if (now - data.firstAttempt > windowMs) {
      attempts.set(key, { count: 1, firstAttempt: now });
      return next();
    }

    // Verificar límite
    if (data.count >= maxAttempts) {
      const retryAfter = Math.ceil((windowMs - (now - data.firstAttempt)) / 1000);
      return res.status(429).json({
        error: 'Demasiados intentos. Intenta de nuevo más tarde.',
        retryAfterSeconds: retryAfter
      });
    }

    data.count++;
    next();
  };
};

/**
 * Rate limiter para login: 5 intentos cada 15 minutos
 */
const loginLimiter = rateLimiter(5, 15 * 60 * 1000);

/**
 * Rate limiter para registro: 3 intentos cada hora
 */
const registerLimiter = rateLimiter(3, 60 * 60 * 1000);

/**
 * Rate limiter general para API: 100 requests por minuto
 */
const apiLimiter = rateLimiter(100, 60 * 1000);

module.exports = {
  rateLimiter,
  loginLimiter,
  registerLimiter,
  apiLimiter
};
