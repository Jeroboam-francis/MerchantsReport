const oracledb = require('oracledb');
const { parseDateBound } = require('../utils/date-filters');

function createOracleRepository(pool, thresholds = {}) {
  const dormancyDays = thresholds.dormancyDays || 90;
  async function query(sql, binds = []) {
    const connection = await pool.getConnection();
    try {
      const result = await connection.execute(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
      return result.rows;
    } finally {
      await connection.close();
    }
  }
  return {
    mode: 'oracle',
    async listMerchants({ offset, limit, search, status }) {
      const filters = [];
      const binds = { offset, limit };
      if (search) { filters.push('(LOWER(name) LIKE :search OR msisdn LIKE :search)'); binds.search = `%${search.toLowerCase()}%`; }
      if (status) { filters.push('status = :status'); binds.status = status.toUpperCase(); }
      const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
      const rows = await query(`SELECT id, name, msisdn, status, active, segment, category_id AS "categoryCode", type AS "merchantType", created_on AS "createdOn" FROM merchants ${where} ORDER BY id OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`, binds);
      const countBinds = { ...binds };
      delete countBinds.offset;
      delete countBinds.limit;
      const count = await query(`SELECT COUNT(*) AS "total" FROM merchants ${where}`, countBinds);
      return { rows, total: count[0].total };
    },
    async getMerchant(id) {
      const rows = await query('SELECT id, name, msisdn, status, active, segment, category_id AS "categoryCode", type AS "merchantType", created_on AS "createdOn" FROM merchants WHERE id = :id', { id: Number(id) });
      return rows[0] || null;
    },
    async listTransactions({ offset, limit, merchantId, from, to }) {
      const filters = [];
      const binds = { offset, limit };
      if (merchantId) { filters.push('m.id = :merchantId'); binds.merchantId = Number(merchantId); }
      if (from) { filters.push('t.transaction_date >= :fromDate'); binds.fromDate = parseDateBound(from); }
      if (to) { filters.push('t.transaction_date <= :toDate'); binds.toDate = parseDateBound(to, true); }
      const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
      const rows = await query(`SELECT t.id, m.id AS "merchantId", m.name AS "merchantName", t.transaction_date AS "transactionDate", t.total_amount AS "totalAmount", t.revenue, t.tax, t.txn_count AS "txnCount", t.transaction_status AS "status", t.category_code AS "categoryCode" FROM merchant_transactions t JOIN merchants m ON m.id = t.merchant_id ${where} ORDER BY t.transaction_date DESC OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`, binds);
      const countBinds = { ...binds };
      delete countBinds.offset;
      delete countBinds.limit;
      const count = await query(`SELECT COUNT(*) AS "total" FROM merchant_transactions t JOIN merchants m ON m.id = t.merchant_id ${where}`, countBinds);
      return { rows, total: count[0].total };
    },
    async dashboardSummary() {
      const rows = await query('SELECT total_revenue AS "totalRevenue", revenue_growth_percentage AS "revenueGrowthPercentage", total_transactions AS "totalTransactions", average_ticket_size AS "averageTicketSize", active_merchants AS "activeMerchants", dormant_merchants AS "dormantMerchants", subscriber_count AS "subscriberCount", subscriber_growth_percentage AS "subscriberGrowthPercentage" FROM v_dashboard_summary');
      return rows[0];
    },
    async revenueSeries({ from, to, interval }) {
      const trunc = interval === 'month' ? 'MM' : interval === 'week' ? 'IW' : interval === 'quarter' ? 'Q' : interval === 'year' ? 'YYYY' : 'DD';
      const displayFormat = interval === 'quarter' ? `YYYY-"Q"Q` : interval === 'year' ? 'YYYY' : 'YYYY-MM-DD';
      const binds = {};
      const filters = ["transaction_status = 'SUCCESS'"];
      if (from) { filters.push('transaction_date >= :fromDate'); binds.fromDate = parseDateBound(from); }
      if (to) { filters.push('transaction_date <= :toDate'); binds.toDate = parseDateBound(to, true); }
      const where = `WHERE ${filters.join(' AND ')}`;
      return query(`SELECT TO_CHAR(TRUNC(transaction_date, '${trunc}'), '${displayFormat}') AS "period", SUM(revenue) AS "revenue", SUM(txn_count) AS "transactionCount" FROM merchant_transactions ${where} GROUP BY TRUNC(transaction_date, '${trunc}') ORDER BY TRUNC(transaction_date, '${trunc}')`, binds);
    },
    async subscriberSeries() {
      return query(`SELECT TO_CHAR(TRUNC(month, 'MM'), 'YYYY-MM') AS "period", SUM(unique_subscribers) AS "subscribers" FROM monthly_subscriber_summary GROUP BY TRUNC(month, 'MM') ORDER BY TRUNC(month, 'MM')`);
    },
    async alerts() {
      return query('SELECT id, alert_type AS "type", severity, merchant_id AS "merchantId", merchant_name AS "merchantName", message, created_on AS "createdOn" FROM v_active_alerts ORDER BY created_on DESC');
    },
    async fraudSummary() {
      return query(`SELECT merchant_id AS "merchantId", merchant_name AS "merchantName",
        LEAST(100, risk_score + CASE WHEN last_transaction_date IS NULL OR last_transaction_date < SYSTIMESTAMP - NUMTODSINTERVAL(:dormancyDays, 'DAY') THEN 20 ELSE 0 END) AS "riskScore",
        indicators FROM v_merchant_risk_summary
        WHERE risk_score + CASE WHEN last_transaction_date IS NULL OR last_transaction_date < SYSTIMESTAMP - NUMTODSINTERVAL(:dormancyDays, 'DAY') THEN 20 ELSE 0 END >= 60
        ORDER BY "riskScore" DESC`, { dormancyDays });
    }
  };
}

module.exports = { createOracleRepository };
