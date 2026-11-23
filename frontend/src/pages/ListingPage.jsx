import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';

const pages = {
  '/merchants': { title: 'Merchant directory', subtitle: 'Browse and monitor merchant relationships.', endpoint: '/merchants', columns: [['name', 'Merchant'], ['msisdn', 'MSISDN'], ['categoryCode', 'Category'], ['segment', 'Segment'], ['status', 'Status']] },
  '/transactions': { title: 'Transactions', subtitle: 'Review transaction activity across the network.', endpoint: '/transactions', columns: [['transactionDate', 'Date'], ['merchantName', 'Merchant'], ['totalAmount', 'Amount'], ['revenue', 'Revenue'], ['status', 'Status']] },
  '/revenue': { title: 'Revenue analytics', subtitle: 'Understand revenue contribution and movement.', endpoint: '/analytics/revenue', columns: [['period', 'Period'], ['revenue', 'Revenue'], ['transactionCount', 'Transactions']] },
  '/subscribers': { title: 'Subscriber analytics', subtitle: 'Track subscriber reach over time.', endpoint: '/analytics/subscribers', columns: [['period', 'Period'], ['subscribers', 'Subscribers']] },
  '/fraud': { title: 'Fraud monitoring', subtitle: 'Prioritize risk indicators for analyst review.', endpoint: '/fraud/summary', columns: [['merchantName', 'Merchant'], ['riskScore', 'Risk score'], ['indicators', 'Indicators']] },
  '/alerts': { title: 'Monitoring alerts', subtitle: 'Review automated activity and risk signals.', endpoint: '/alerts', columns: [['severity', 'Severity'], ['merchantName', 'Merchant'], ['type', 'Alert type'], ['message', 'Details']] },
  '/reports': { title: 'Reports', subtitle: 'Explore the reporting workspace.', endpoint: '/alerts', columns: [['merchantName', 'Merchant'], ['type', 'Available data'], ['severity', 'Priority']] },
  '/admin': { title: 'Administration', subtitle: 'Manage platform access and configuration.', endpoint: null, columns: [] }
};

function display(value) {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return Array.isArray(value) ? value.join(', ') : JSON.stringify(value);
  return String(value);
}

export default function ListingPage() {
  const location = useLocation();
  const page = pages[location.pathname];
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!page.endpoint) return undefined;
    let active = true;
    api.get(page.endpoint).then(({ data }) => {
      if (active) setRows(data.data);
    }).catch(() => {
      if (active) setError('This data could not be loaded right now.');
    });
    return () => { active = false; };
  }, [page.endpoint]);

  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">WORKSPACE</p><h1>{page.title}</h1><p className="page-subtitle">{page.subtitle}</p></div></div>
      <section className="panel table-panel">
        {error && <div role="alert" className="inline-error">{error}</div>}
        {!page.endpoint ? <div className="empty-state empty-state--large">User provisioning and role administration are managed by your identity administrator.</div> :
          <div className="table-scroll"><table><thead><tr>{page.columns.map(([, title]) => <th key={title}>{title}</th>)}</tr></thead><tbody>
            {rows.map((row, index) => <tr key={row.id || row.merchantId || row.period || index}>{page.columns.map(([key]) => <td key={key}>{key === 'status' || key === 'severity' ? <span className={`status-pill status-pill--${display(row[key]).toLowerCase()}`}>{display(row[key])}</span> : display(row[key])}</td>)}</tr>)}
            {!rows.length && !error && <tr><td className="empty-state" colSpan={page.columns.length}>No records found.</td></tr>}
          </tbody></table></div>}
      </section>
    </>
  );
}
