const express = require('express');
const { parsePagination } = require('../utils/pagination');
const { validate } = require('../middleware/validate');
const {
  paginationRules, merchantIdRule, transactionRules, merchantListRules,
  revenueRules, loginRules, refreshRules
} = require('../validations/routes');

function createApiRouter({ service, authService, auth }) {
  const router = express.Router();
  const protectedRoute = [auth.authenticate];
  const merchantReaders = ['Administrator', 'Operations', 'Regional Manager', 'Read Only'];
  const transactionReaders = ['Administrator', 'Operations', 'Finance', 'Fraud Analyst', 'Regional Manager', 'Read Only'];
  const analyticsReaders = ['Administrator', 'Finance', 'Regional Manager', 'Read Only'];
  const alertReaders = ['Administrator', 'Operations', 'Fraud Analyst'];
  const fraudReaders = ['Administrator', 'Fraud Analyst'];

  router.post('/auth/login', loginRules, validate, async (req, res, next) => {
    try { res.json({ data: await authService.login(req.body.email, req.body.password) }); } catch (error) { next(error); }
  });
  router.post('/auth/refresh', refreshRules, validate, (req, res, next) => {
    try { res.json({ data: authService.refresh(req.body.refreshToken) }); } catch (error) { next(error); }
  });
  router.get('/auth/me', ...protectedRoute, (req, res) => {
    res.json({ data: { id: req.user.sub, email: req.user.email, name: req.user.name, role: req.user.role, permissions: authService.rolePermissions[req.user.role] || [] } });
  });

  router.get('/dashboard/summary', ...protectedRoute, auth.authorize(...analyticsReaders), async (_req, res, next) => {
    try { res.json({ data: await service.dashboardSummary() }); } catch (error) { next(error); }
  });
  router.get('/merchants', ...protectedRoute, auth.authorize(...merchantReaders), merchantListRules, validate, async (req, res, next) => {
    try {
      const pagination = parsePagination(req.query);
      const result = await service.listMerchants({ ...pagination, search: req.query.search, status: req.query.status });
      res.json({ data: result.rows, pagination: { page: pagination.page, limit: pagination.limit, total: result.total } });
    } catch (error) { next(error); }
  });
  router.get('/merchants/:id', ...protectedRoute, auth.authorize(...merchantReaders), merchantIdRule, validate, async (req, res, next) => {
    try { res.json({ data: await service.getMerchant(req.params.id) }); } catch (error) { next(error); }
  });
  router.get('/transactions', ...protectedRoute, auth.authorize(...transactionReaders), transactionRules, validate, async (req, res, next) => {
    try {
      const pagination = parsePagination(req.query);
      const result = await service.listTransactions({ ...pagination, merchantId: req.query.merchantId, from: req.query.from, to: req.query.to });
      res.json({ data: result.rows, pagination: { page: pagination.page, limit: pagination.limit, total: result.total } });
    } catch (error) { next(error); }
  });
  router.get('/analytics/revenue', ...protectedRoute, auth.authorize(...analyticsReaders), revenueRules, validate, async (req, res, next) => {
    try { res.json({ data: await service.revenueSeries({ from: req.query.from, to: req.query.to, interval: req.query.interval || 'month' }) }); } catch (error) { next(error); }
  });
  router.get('/analytics/subscribers', ...protectedRoute, auth.authorize(...analyticsReaders), async (_req, res, next) => {
    try { res.json({ data: await service.subscriberSeries() }); } catch (error) { next(error); }
  });
  router.get('/alerts', ...protectedRoute, auth.authorize(...alertReaders), paginationRules, validate, async (req, res, next) => {
    try {
      const pagination = parsePagination(req.query);
      const alerts = await service.alerts();
      res.json({ data: alerts.slice(pagination.offset, pagination.offset + pagination.limit), pagination: { page: pagination.page, limit: pagination.limit, total: alerts.length } });
    } catch (error) { next(error); }
  });
  router.get('/fraud/summary', ...protectedRoute, auth.authorize(...fraudReaders), paginationRules, validate, async (req, res, next) => {
    try {
      const pagination = parsePagination(req.query);
      const merchants = await service.fraudSummary();
      res.json({ data: merchants.slice(pagination.offset, pagination.offset + pagination.limit), pagination: { page: pagination.page, limit: pagination.limit, total: merchants.length } });
    } catch (error) { next(error); }
  });

  return router;
}

module.exports = { createApiRouter };
