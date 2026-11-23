function detectMovements(series, options = {}) {
  const { spikeThreshold = 0.3, dropThreshold = -0.2, metric = 'value' } = options;
  const movements = [];
  for (let index = 1; index < series.length; index += 1) {
    const previous = Number(series[index - 1][metric]);
    const current = Number(series[index][metric]);
    if (!Number.isFinite(previous) || !Number.isFinite(current) || previous <= 0) continue;
    const change = (current - previous) / previous;
    if (change >= spikeThreshold || change <= dropThreshold) {
      movements.push({
        period: series[index].period,
        previousPeriod: series[index - 1].period,
        previousValue: previous,
        currentValue: current,
        changePercentage: Math.round(change * 10000) / 100,
        direction: change >= spikeThreshold ? 'SPIKE' : 'DROP'
      });
    }
  }
  return movements;
}

module.exports = { detectMovements };
