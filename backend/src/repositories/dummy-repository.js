const { generateDummyData } = require('../data/generate-dummy-data');
const { scoreMerchantRisk } = require('../analytics/fraud-scoring');
const { parseDateBound } = require('../utils/date-filters');

function createDummyRepository(dataset = generateDummyData(), thresholds = {}) {
  const dormancyDays = thresholds.dormancyDays || 90;
  return {
    mode: 'dummy',
    listMerchants({ offset, limit, search, status }) {
      const filtered = dataset.merchants.filter((merchant) =>
        (!search || merchant.name.toLowerCase().includes(search.toLowerCase()) || merchant.msisdn.includes(search)) &&
        (!status || merchant.status === status.toUpperCase()));
      return { rows: filtered.slice(offset, offset + limit), total: filtered.length };
    },
    getMerchant(id) {
      return dataset.merchants.find((merchant) => merchant.id === Number(id)) || null;
    },
    listTransactions({ offset, limit, merchantId, from, to }) {
      const fromDate = parseDateBound(from);
      const toDate = parseDateBound(to, true);
      const filtered = dataset.transactions.filter((item) =>
        (!merchantId || item.merchantId === Number(merchantId)) &&
        (!fromDate || Date.parse(item.transactionDate) >= fromDate.getTime()) &&
        (!toDate || Date.parse(item.transactionDate) <= toDate.getTime()));
      return { rows: filtered.slice(offset, offset + limit), total: filtered.length };
    },
    dashboardSummary() {
      const successful = dataset.transactions.filter((item) => item.status === 'SUCCESS');
      const totalRevenue = successful.reduce((sum, item) => sum + item.revenue, 0);
      const totalAmount = successful.reduce((sum, item) => sum + item.totalAmount, 0);
      const revenueByMonth = new Map();
      successful.forEach((item) => {
        const month = item.transactionDate.slice(0, 7);
        revenueByMonth.set(month, (revenueByMonth.get(month) || 0) + item.revenue);
      });
      const revenueMonths = Array.from(revenueByMonth.entries()).sort(([a], [b]) => a.localeCompare(b));
      const subscriberMonths = Array.from(dataset.monthlySubscribers.reduce((totals, row) => {
        totals.set(row.month, (totals.get(row.month) || 0) + row.uniqueSubscribers);
        return totals;
      }, new Map()).entries()).sort(([a], [b]) => a.localeCompare(b));
      const growth = (current, previous) => previous ? Math.round((current - previous) / previous * 10000) / 100 : 0;
      return {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        revenueGrowthPercentage: growth(revenueMonths[revenueMonths.length - 1]?.[1] || 0, revenueMonths[revenueMonths.length - 2]?.[1] || 0),
        totalTransactions: successful.length,
        averageTicketSize: successful.length ? Math.round(totalAmount / successful.length * 100) / 100 : 0,
        activeMerchants: dataset.merchants.filter((item) => item.active).length,
        dormantMerchants: dataset.merchants.filter((item) => !item.active).length,
        subscriberCount: subscriberMonths[subscriberMonths.length - 1]?.[1] || 0,
        subscriberGrowthPercentage: growth(subscriberMonths[subscriberMonths.length - 1]?.[1] || 0, subscriberMonths[subscriberMonths.length - 2]?.[1] || 0)
      };
    },
    revenueSeries({ from, to, interval }) {
      const buckets = new Map();
      dataset.transactions.forEach((item) => {
        if (item.status !== 'SUCCESS' || (from && item.transactionDate < from) || (to && item.transactionDate > to)) return;
        const date = new Date(item.transactionDate);
        let key;
        if (interval === 'month') key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
        else if (interval === 'quarter') key = `${date.getUTCFullYear()}-Q${Math.floor(date.getUTCMonth() / 3) + 1}`;
        else if (interval === 'year') key = String(date.getUTCFullYear());
        else if (interval === 'week') {
          const week = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
          week.setUTCDate(week.getUTCDate() - ((week.getUTCDay() + 6) % 7));
          key = week.toISOString().slice(0, 10);
        } else key = date.toISOString().slice(0, 10);
        const bucket = buckets.get(key) || { period: key, revenue: 0, transactionCount: 0 };
        bucket.revenue += item.revenue;
        bucket.transactionCount += 1;
        buckets.set(key, bucket);
      });
      return Array.from(buckets.values()).sort((a, b) => a.period.localeCompare(b.period)).map((item) => ({ ...item, revenue: Math.round(item.revenue * 100) / 100 }));
    },
    subscriberSeries() {
      const totals = new Map();
      dataset.monthlySubscribers.forEach((item) => totals.set(item.month, (totals.get(item.month) || 0) + item.uniqueSubscribers));
      return Array.from(totals, ([period, subscribers]) => ({ period, subscribers })).sort((a, b) => a.period.localeCompare(b.period));
    },
    alerts() {
      const alerts = [];
      dataset.merchants.filter((merchant) => (Date.now() - Date.parse(merchant.lastTransactionOn)) / 86400000 > dormancyDays).forEach((merchant) => alerts.push({
        id: `dormancy-${merchant.id}`, type: 'DORMANCY', severity: 'MEDIUM', merchantId: merchant.id,
        merchantName: merchant.name, message: 'No recent transaction activity', createdOn: merchant.lastTransactionOn
      }));
      dataset.merchants.filter((merchant) => merchant.segment === 'fraudulent').forEach((merchant) => alerts.push({
        id: `risk-${merchant.id}`, type: 'RISK_REVIEW', severity: 'HIGH', merchantId: merchant.id,
        merchantName: merchant.name, message: 'Synthetic high-risk profile flagged for analyst review', createdOn: new Date().toISOString()
      }));
      return alerts;
    },
    fraudSummary() {
      const since = Date.now() - 30 * 86400000;
      const signals = new Map();
      dataset.transactions.forEach((transaction) => {
        const transactionTime = Date.parse(transaction.transactionDate);
        if (transactionTime < since) return;
        const signal = signals.get(transaction.merchantId) || { failedCount: 0, transactionCount: 0, hourlyCounts: new Map() };
        signal.transactionCount += 1;
        if (transaction.status === 'FAILED') signal.failedCount += 1;
        const hour = transaction.transactionDate.slice(0, 13);
        signal.hourlyCounts.set(hour, (signal.hourlyCounts.get(hour) || 0) + 1);
        signals.set(transaction.merchantId, signal);
      });
      return dataset.merchants.map((merchant) => {
        const signal = signals.get(merchant.id) || { failedCount: 0, transactionCount: 0, hourlyCounts: new Map() };
        const dormantDays = Math.floor((Date.now() - Date.parse(merchant.lastTransactionOn)) / 86400000);
        const result = scoreMerchantRisk({
          failedCount: signal.failedCount,
          transactionCount: signal.transactionCount,
          maxHourlyTransactions: Math.max(0, ...signal.hourlyCounts.values()),
          dormantDays,
          dormancyThresholdDays: dormancyDays,
          syntheticRiskProfile: merchant.segment === 'fraudulent'
        });
        return { merchantId: merchant.id, merchantName: merchant.name, ...result };
      }).filter((merchant) => merchant.riskScore >= 40).sort((a, b) => b.riskScore - a.riskScore);
    }
  };
}

module.exports = { createDummyRepository };
