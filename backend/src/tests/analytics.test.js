const { detectMovements } = require('../analytics/trend-analyzer');
const { scoreMerchantRisk } = require('../analytics/fraud-scoring');

test('detects configured spikes and drops from sequential periods', () => {
  const movements = detectMovements([
    { period: '2026-01', revenue: 100 },
    { period: '2026-02', revenue: 140 },
    { period: '2026-03', revenue: 100 }
  ], { metric: 'revenue' });
  expect(movements.map((item) => item.direction)).toEqual(['SPIKE', 'DROP']);
  expect(movements[0].changePercentage).toBe(40);
});

test('scores explainable risk indicators and caps the score', () => {
  const result = scoreMerchantRisk({
    failedCount: 4,
    transactionCount: 10,
    maxHourlyTransactions: 40,
    dormantDays: 120,
    syntheticRiskProfile: true
  });
  expect(result.riskScore).toBe(100);
  expect(result.indicators).toContain('high hourly transaction velocity');
});
