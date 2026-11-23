const required = (key) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

function getConfig() {
  const mode = process.env.APP_MODE || 'dummy';
  if (!['dummy', 'oracle'].includes(mode)) {
    throw new Error('APP_MODE must be either "dummy" or "oracle"');
  }
  if (mode === 'oracle') {
    required('ORACLE_USER');
    required('ORACLE_PASSWORD');
    required('ORACLE_CONNECT_STRING');
  }
  const spikeThreshold = Number(process.env.ALERT_SPIKE_THRESHOLD || 0.3);
  const dropThreshold = Number(process.env.ALERT_DROP_THRESHOLD || -0.2);
  const dormancyDays = Number(process.env.DORMANCY_DAYS || 90);
  if (!Number.isFinite(spikeThreshold) || spikeThreshold <= 0 ||
      !Number.isFinite(dropThreshold) || dropThreshold >= 0 ||
      !Number.isInteger(dormancyDays) || dormancyDays < 1) {
    throw new Error('Alert thresholds must be valid positive spike, negative drop, and positive integer dormancy values');
  }
  return {
    mode,
    port: Number(process.env.PORT || 4000),
    frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessTtl: process.env.JWT_ACCESS_TTL || '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL || '7d',
    seedEmail: process.env.SEED_ADMIN_EMAIL || 'admin@merchant-analytics.local',
    seedPassword: required('SEED_ADMIN_PASSWORD'),
    alertThresholds: { spikeThreshold, dropThreshold, dormancyDays },
    oracle: mode === 'oracle' ? {
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING,
      poolMin: Number(process.env.ORACLE_POOL_MIN || 1),
      poolMax: Number(process.env.ORACLE_POOL_MAX || 10)
    } : null
  };
}

module.exports = { getConfig };
