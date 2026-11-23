const logger = require('../config/logger');

function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  error.code = 'NOT_FOUND';
  next(error);
}

function errorHandler(error, req, res, _next) {
  const status = error.status || 500;
  const code = error.code || 'INTERNAL_ERROR';
  if (status >= 500) logger.error('Request failed', { requestId: req.id, method: req.method, path: req.path, error });
  res.status(status).json({
    error: {
      code,
      message: status >= 500 ? 'An unexpected error occurred' : error.message,
      ...(error.details ? { details: error.details } : {}),
      requestId: req.id
    }
  });
}

module.exports = { notFound, errorHandler };
