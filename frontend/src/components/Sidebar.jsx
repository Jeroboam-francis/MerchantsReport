import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Overview', icon: '◫' },
  { to: '/merchants', label: 'Merchants', icon: '♙' },
  { to: '/transactions', label: 'Transactions', icon: '⇄' },
  { to: '/revenue', label: 'Revenue', icon: '↗' },
  { to: '/subscribers', label: 'Subscribers', icon: '◎' },
  { to: '/fraud', label: 'Fraud monitoring', icon: '⌁' },
  { to: '/alerts', label: 'Alerts', icon: '♧' },
  { to: '/reports', label: 'Reports', icon: '▤' },
  { to: '/admin', label: 'Administration', icon: '⚙' }
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
  <div className="brand__mark">
    <img
      src="https://cdn-webportal.airtelstream.net/website/kenya/assets/images/new/logo.svg"
      alt="Airtel Kenya Logo"
    />
  </div>
  <div>
    <strong>Airtel</strong>
    <span>Merchant Analytics</span>
  </div>
</div>
      <div className="nav-caption">WORKSPACE</div>
      <nav aria-label="Main navigation">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}>
            <span className="nav-link__icon" aria-hidden="true">{link.icon}</span>
            <span>{link.label}</span>
            {link.to === '/alerts' && <b className="nav-badge">8</b>}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar__footer"><span className="status-dot" /> Dummy data environment</div>
    </aside>
  );
}
