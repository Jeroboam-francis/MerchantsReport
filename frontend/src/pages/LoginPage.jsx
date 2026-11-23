import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || 'Unable to sign in. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand brand--login"><div className="brand__mark">A</div><div><strong>Airtel</strong><span>Merchant Analytics</span></div></div>
        <p className="eyebrow">WELCOME BACK</p>
        <h1>Sign in to your workspace</h1>
        <p className="login-intro">Monitor merchant performance, revenue and risk in one place.</p>
        <form onSubmit={submit}>
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error && <div role="alert" className="form-error">{error}</div>}
          <button type="submit" className="primary-button" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <p className="login-footnote">Access is provisioned by your platform administrator.</p>
      </section>
      <div className="login-aside"><div className="login-aside__content"><span>INSIGHT AT A GLANCE</span><h2>Make every merchant relationship count.</h2><p>Clear signals. Better decisions. Stronger growth.</p></div></div>
    </main>
  );
}
