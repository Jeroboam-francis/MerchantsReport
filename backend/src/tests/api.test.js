const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createApp } = require('../app');
const { createDummyRepository } = require('../repositories/dummy-repository');

const config = {
  mode: 'dummy',
  frontendOrigin: 'http://localhost:5173',
  accessSecret: 'test-access-secret-at-least-32-characters',
  refreshSecret: 'test-refresh-secret-at-least-32-characters',
  accessTtl: '15m',
  refreshTtl: '7d',
  seedEmail: 'admin@example.test',
  seedPassword: 'a-strong-test-password'
};

describe('API', () => {
  const app = createApp({ config, repository: createDummyRepository() });

  test('requires authentication for analytics', async () => {
    const response = await request(app).get('/api/v1/dashboard/summary');
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('AUTH_REQUIRED');
  });

  test('logs in and returns dashboard KPIs', async () => {
    const login = await request(app).post('/api/v1/auth/login').send({ email: config.seedEmail, password: config.seedPassword });
    expect(login.status).toBe(200);
    const response = await request(app).get('/api/v1/dashboard/summary').set('Authorization', `Bearer ${login.body.data.accessToken}`);
    expect(response.status).toBe(200);
    expect(response.body.data.totalTransactions).toBeGreaterThan(0);
    expect(response.body.data.activeMerchants).toBe(42);
  });

  test('rejects invalid pagination and unknown merchants', async () => {
    const login = await request(app).post('/api/v1/auth/login').send({ email: config.seedEmail, password: config.seedPassword });
    const token = login.body.data.accessToken;
    const badPage = await request(app).get('/api/v1/merchants?page=0').set('Authorization', `Bearer ${token}`);
    expect(badPage.status).toBe(400);
    const missing = await request(app).get('/api/v1/merchants/9999').set('Authorization', `Bearer ${token}`);
    expect(missing.status).toBe(404);
  });

  test('enforces role access independently of authentication', async () => {
    const token = jwt.sign(
      { sub: 'reader-1', email: 'reader@example.test', role: 'Read Only' },
      config.accessSecret,
      { expiresIn: '5m', issuer: 'merchant-analytics' }
    );
    const response = await request(app).get('/api/v1/fraud/summary').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });
});
