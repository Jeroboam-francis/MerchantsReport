const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errors');

const rolePermissions = {
  Administrator: ['*'],
  Operations: ['merchants:read', 'transactions:read', 'alerts:read'],
  Finance: ['analytics:read', 'reports:read', 'transactions:read'],
  'Fraud Analyst': ['fraud:read', 'alerts:read', 'transactions:read'],
  'Regional Manager': ['analytics:read', 'merchants:read', 'transactions:read'],
  'Read Only': ['analytics:read', 'merchants:read', 'transactions:read']
};

function createAuthService(config) {
  const user = {
    id: 'seed-admin',
    email: config.seedEmail.toLowerCase(),
    name: 'Platform Administrator',
    role: 'Administrator',
    passwordHash: bcrypt.hashSync(config.seedPassword, 12)
  };

  function issueTokens(account) {
    const claims = { sub: account.id, email: account.email, name: account.name, role: account.role };
    return {
      accessToken: jwt.sign(claims, config.accessSecret, { expiresIn: config.accessTtl, issuer: 'merchant-analytics' }),
      refreshToken: jwt.sign({ sub: account.id, type: 'refresh' }, config.refreshSecret, { expiresIn: config.refreshTtl, issuer: 'merchant-analytics' }),
      tokenType: 'Bearer'
    };
  }

  return {
    async login(email, password) {
      const valid = email.toLowerCase() === user.email && await bcrypt.compare(password, user.passwordHash);
      if (!valid) throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
      return { ...issueTokens(user), user: this.profile(user) };
    },
    refresh(token) {
      try {
        const claims = jwt.verify(token, config.refreshSecret, { issuer: 'merchant-analytics' });
        if (claims.type !== 'refresh' || claims.sub !== user.id) throw new Error('invalid refresh claim');
        return issueTokens(user);
      } catch (_error) {
        throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'The refresh token is invalid or expired');
      }
    },
    profile(account) {
      return { id: account.id, email: account.email, name: account.name, role: account.role, permissions: rolePermissions[account.role] };
    },
    rolePermissions
  };
}

module.exports = { createAuthService, rolePermissions };
