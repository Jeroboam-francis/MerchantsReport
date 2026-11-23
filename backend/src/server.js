require('dotenv').config({ path: require('node:path').resolve(__dirname, '..', '..', '.env') });

const { getConfig } = require('./config/env');
const logger = require('./config/logger');
const { createApp } = require('./app');
const { createDummyRepository } = require('./repositories/dummy-repository');
const { createOracleRepository } = require('./repositories/oracle-repository');

async function start() {
  const config = getConfig();
  let repository;
  let pool;
  if (config.mode === 'oracle') {
    const oracledb = require('oracledb');
    pool = await oracledb.createPool({
      user: config.oracle.user,
      password: config.oracle.password,
      connectString: config.oracle.connectString,
      poolMin: config.oracle.poolMin,
      poolMax: config.oracle.poolMax
    });
    repository = createOracleRepository(pool, config.alertThresholds);
  } else {
    repository = createDummyRepository(undefined, config.alertThresholds);
  }

  const app = createApp({ config, repository });
  const server = app.listen(config.port, () => logger.info('API listening', { port: config.port, mode: config.mode }));
  const shutdown = async (signal) => {
    logger.info('Shutting down', { signal });
    server.close(async () => {
      if (pool) await pool.close(10);
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((error) => {
  logger.error('API startup failed', { error });
  process.exitCode = 1;
});
