const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errors');

function createAuthMiddleware(config) {
  function authenticate(req, _res, next) {
    const header = req.get('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return next(new AppError(401, 'AUTH_REQUIRED', 'Authentication is required'));
    try {
      req.user = jwt.verify(token, config.accessSecret, { issuer: 'merchant-analytics' });
      return next();
    } catch (_error) {
      return next(new AppError(401, 'INVALID_TOKEN', 'The access token is invalid or expired'));
    }
  }

  function authorize(...roles) {
    return (req, _res, next) => {
      if (!req.user) return next(new AppError(401, 'AUTH_REQUIRED', 'Authentication is required'));
      if (!roles.includes(req.user.role)) return next(new AppError(403, 'FORBIDDEN', 'You do not have permission to perform this action'));
      return next();
    };
  }

  return { authenticate, authorize };
}

module.exports = { createAuthMiddleware };
