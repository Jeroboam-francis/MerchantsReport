const { validationResult } = require('express-validator');
const { AppError } = require('../utils/errors');

function validate(req, _res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(new AppError(400, 'VALIDATION_ERROR', 'Request validation failed', result.array().map(({ path, msg }) => ({ field: path, message: msg }))));
  }
  return next();
}

module.exports = { validate };
