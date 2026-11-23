const { body, param, query } = require('express-validator');

const paginationRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100')
];

const dateRules = [
  query('from').optional().isISO8601().withMessage('from must be an ISO 8601 date'),
  query('to').optional().isISO8601().withMessage('to must be an ISO 8601 date')
];

module.exports = {
  paginationRules,
  merchantIdRule: [param('id').isInt({ min: 1 }).withMessage('id must be a positive integer')],
  transactionRules: [...paginationRules, ...dateRules, query('merchantId').optional().isInt({ min: 1 })],
  merchantListRules: [
    ...paginationRules,
    query('search').optional().isString().isLength({ max: 120 }).withMessage('search must be at most 120 characters'),
    query('status').optional().isIn(['ACTIVE', 'DORMANT', 'active', 'dormant'])
  ],
  revenueRules: [...dateRules, query('interval').optional().isIn(['day', 'week', 'month', 'quarter', 'year'])],
  loginRules: [body('email').isEmail().normalizeEmail(), body('password').isString().isLength({ min: 1, max: 200 })],
  refreshRules: [body('refreshToken').isString().isLength({ min: 20 })]
};
