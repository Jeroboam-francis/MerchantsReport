const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const { requestContext } = require('./middleware/request-context');
const { createAuthMiddleware } = require('./middleware/auth');
const { createApiRouter } = require('./routes/api');
const { notFound, errorHandler } = require('./middleware/error-handler');

const openApi = {
  openapi: '3.0.3',
  info: { title: 'Merchant Analytics Platform API', version: '1.0.0' },
  servers: [{ url: '/api/v1' }],
  components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
  paths: {
    '/auth/login': { post: { summary: 'Authenticate user', responses: { 200: { description: 'Tokens and user profile' }, 401: { description: 'Invalid credentials' } } } },
    '/dashboard/summary': { get: { security: [{ bearerAuth: [] }], summary: 'Dashboard KPIs', responses: { 200: { description: 'Summary metrics' } } } },
    '/merchants': { get: { security: [{ bearerAuth: [] }], summary: 'List merchants', responses: { 200: { description: 'Paged merchants' } } } },
    '/transactions': { get: { security: [{ bearerAuth: [] }], summary: 'List transactions', responses: { 200: { description: 'Paged transactions' } } } },
    '/analytics/revenue': { get: { security: [{ bearerAuth: [] }], summary: 'Revenue time series', responses: { 200: { description: 'Time-series data' } } } },
    '/analytics/subscribers': { get: { security: [{ bearerAuth: [] }], summary: 'Subscriber time series', responses: { 200: { description: 'Time-series data' } } } },
    '/alerts': { get: { security: [{ bearerAuth: [] }], summary: 'List monitoring alerts', responses: { 200: { description: 'Alerts' } } } },
    '/fraud/summary': { get: { security: [{ bearerAuth: [] }], summary: 'Fraud risk summary', responses: { 200: { description: 'Risk-ranked merchants' } } } }
  }
};

function createApp({ config, repository }) {
  const app = express();
  const { createAuthService } = require('./auth/auth-service');
  const { createPlatformService } = require('./services/platform-service');
  const authService = createAuthService(config);
  const service = createPlatformService(repository, config.alertThresholds);

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(requestContext);
  app.use(helmet());
  app.use(cors({ origin: config.frontendOrigin.split(',').map((item) => item.trim()), credentials: false }));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));
  app.get('/health', (_req, res) => res.json({ status: 'ok', mode: repository.mode }));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApi));
  app.get('/api-docs.json', (_req, res) => res.json(openApi));
  app.use('/api/v1', createApiRouter({ service, authService, auth: createAuthMiddleware(config) }));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
