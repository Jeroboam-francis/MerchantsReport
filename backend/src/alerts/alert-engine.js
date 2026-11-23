const { detectMovements } = require('../analytics/trend-analyzer');

function createAlertEngine(repository, thresholds = {}) {
  const spikeThreshold = thresholds.spikeThreshold ?? 0.3;
  const dropThreshold = thresholds.dropThreshold ?? -0.2;

  return {
    async listAlerts() {
      const [existing, revenue, subscribers] = await Promise.all([
        repository.alerts(),
        repository.revenueSeries({ interval: 'month' }),
        repository.subscriberSeries()
      ]);
      const movementAlerts = [
        ...detectMovements(revenue, { spikeThreshold, dropThreshold, metric: 'revenue' }).map((movement) => ({
          id: `revenue-${movement.direction}-${movement.period}`,
          type: `REVENUE_${movement.direction}`,
          severity: movement.direction === 'DROP' ? 'HIGH' : 'MEDIUM',
          merchantName: 'Network',
          message: `Revenue changed ${movement.changePercentage}% in ${movement.period}`,
          createdOn: movement.period
        })),
        ...detectMovements(subscribers, { spikeThreshold, dropThreshold, metric: 'subscribers' }).map((movement) => ({
          id: `subscribers-${movement.direction}-${movement.period}`,
          type: `SUBSCRIBERS_${movement.direction}`,
          severity: movement.direction === 'DROP' ? 'HIGH' : 'MEDIUM',
          merchantName: 'Network',
          message: `Subscribers changed ${movement.changePercentage}% in ${movement.period}`,
          createdOn: movement.period
        }))
      ];
      return [...existing, ...movementAlerts].sort((a, b) => String(b.createdOn).localeCompare(String(a.createdOn)));
    }
  };
}

module.exports = { createAlertEngine };
