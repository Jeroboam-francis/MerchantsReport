import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

export default function AppShell() {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">Merchant Analytics <span>/</span> <b>Performance workspace</b></div>
          <div className="topbar__actions">
            <button type="button" className="icon-button" aria-label="Notifications">♧<i /></button>
            <div className="user-chip"><div className="avatar">{user?.name?.slice(0, 1) || 'A'}</div><div><b>{user?.name || 'Administrator'}</b><span>{user?.role}</span></div></div>
            <button type="button" className="logout-button" onClick={logout}>Sign out</button>
          </div>
        </header>
        <div className="page-content"><Outlet /></div>
      </main>
    </div>
  );
}
