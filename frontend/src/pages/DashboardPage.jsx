import { useEffect, useState } from 'react';
import api from '../services/api';
import MetricCard from '../components/MetricCard';
import ChartPanel from '../components/ChartPanel';

const currency = new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 });
const number = new Intl.NumberFormat('en-UG');

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get('/dashboard/summary'),
      api.get('/analytics/revenue?interval=month'),
      api.get('/analytics/subscribers'),
      api.get('/alerts')
    ]).then(([summaryResponse, revenueResponse, subscriberResponse, alertResponse]) => {
      if (!active) return;
      setSummary(summaryResponse.data.data);
      setRevenue(revenueResponse.data.data);
      setSubscribers(subscriberResponse.data.data);
      setAlerts(alertResponse.data.data);
    }).catch(() => {
      if (active) setError('Dashboard data could not be loaded. Please retry in a moment.');
    });
    return () => { active = false; };
  }, []);

  return (
    <>
      <div className="page-heading">
        <div>
  <p className="eyebrow">EXECUTIVE OVERVIEW</p>
  <h1>
    {new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 17
      ? "Good afternoon"
      : "Good evening"}
  </h1>
  <p className="page-subtitle">
    Here’s how your merchant network is performing.
  </p>
</div>
        <div className="date-filter"><span>◷</span> Last 24 months <span className="chevron">⌄</span></div>
      </div>
      {error && <div role="alert" className="inline-error">{error}</div>}
      {!summary ? <div className="loading-panel">Loading analytics…</div> : (
        <>
          <div className="metric-grid">
            <MetricCard label="Total revenue" value={currency.format(summary.totalRevenue)} detail={`${summary.revenueGrowthPercentage >= 0 ? '+' : ''}${summary.revenueGrowthPercentage}% latest month`} icon="↗" />
            <MetricCard label="Transactions" value={number.format(summary.totalTransactions)} detail="Successful payments" icon="⇄" tone="blue" />
            <MetricCard label="Active merchants" value={number.format(summary.activeMerchants)} detail={`${summary.dormantMerchants} dormant merchants`} icon="♙" tone="green" />
            <MetricCard label="Subscribers" value={number.format(summary.subscriberCount)} detail={`${summary.subscriberGrowthPercentage >= 0 ? '+' : ''}${summary.subscriberGrowthPercentage}% latest month`} icon="◎" tone="purple" />
          </div>
          <div className="chart-grid">
            <ChartPanel title="Revenue performance" data={revenue} dataKey="revenue" formatValue={(value) => currency.format(value)} />
            <ChartPanel title="Subscriber growth" data={subscribers} dataKey="subscribers" color="#4263eb" formatValue={(value) => number.format(value)} />
          </div>
          <div className="bottom-grid">
            <section className="panel activity-panel">
              <div className="panel__heading"><div><h2>Monitoring alerts</h2><p>Signals requiring your attention</p></div><a href="/alerts">View all <span>→</span></a></div>
              <div className="alert-list">
                {alerts.slice(0, 4).map((alert) => <div className="alert-row" key={alert.id}><span className={`severity severity--${alert.severity.toLowerCase()}`} /><div><b>{alert.merchantName}</b><span>{alert.message}</span></div><time>{alert.severity}</time></div>)}
                {!alerts.length && <div className="empty-state">No alerts at this time.</div>}
              </div>
            </section>
            <section className="panel insight-panel">
              <div className="panel__heading"><div><h2>Network health</h2><p>Current portfolio status</p></div><span className="health-mark">✓</span></div>
              <div className="health-score"><strong>Healthy</strong><span>Operational status</span></div>
              <div className="health-bar"><i /></div>
              <p className="health-note">Continue monitoring merchant activity and transaction patterns.</p>
            </section>
          </div>
        </>
      )}
    </>
  );
}
