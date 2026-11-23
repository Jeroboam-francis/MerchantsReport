function scoreMerchantRisk({ failedCount = 0, transactionCount = 0, maxHourlyTransactions = 0, dormantDays = 0, dormancyThresholdDays = 90, syntheticRiskProfile = false }) {
  const failedRate = transactionCount ? failedCount / transactionCount : 0;
  const indicators = [];
  let score = 0;

  if (failedRate >= 0.25) {
    score += 40;
    indicators.push('high failed-transaction ratio');
  } else if (failedRate >= 0.1) {
    score += 25;
    indicators.push('elevated failed-transaction ratio');
  }
  if (maxHourlyTransactions >= 30) {
    score += 35;
    indicators.push('high hourly transaction velocity');
  }
  if (dormantDays > dormancyThresholdDays) {
    score += 20;
    indicators.push('extended merchant dormancy');
  }
  if (syntheticRiskProfile) {
    score += 40;
    indicators.push('synthetic elevated-risk scenario');
  }

  return { riskScore: Math.min(100, score), indicators };
}

module.exports = { scoreMerchantRisk };
