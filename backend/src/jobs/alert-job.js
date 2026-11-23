const cron = require('node-cron');
const logger = require('../config/logger');

function startAlertJob(runChecks, schedule = '*/15 * * * *') {
  if (!cron.validate(schedule)) throw new Error(`Invalid alert job schedule: ${schedule}`);
  return cron.schedule(schedule, async () => {
    try {
      const result = await runChecks();
      logger.info('Scheduled alert check completed', { result });
    } catch (error) {
      logger.error('Scheduled alert check failed', { error });
    }
  });
}

module.exports = { startAlertJob };
