import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import BrandLogo from '../../components/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { getRuntimeModeLabel, isDemoAdminEnabled, isDemoRuntime, isProductionRuntime } from '../../utils/runtimeMode';

export default function AdminLoginPage() {
  const { login, logout, isAuthenticated, isAdmin, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      setError('This account does not have admin access.');
    }
  }, [isAuthenticated, isAdmin]);

  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const user = await login(email, password);
      if (user.role !== 'admin') {
        await logout();
        setError('This account does not have admin access.');
        return;
      }

      const target =
        location.state?.from?.pathname && location.state.from.pathname.startsWith('/admin')
          ? location.state.from.pathname
          : '/admin';
      navigate(target, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in right now.');
    }
  };

  const customerAccessView = isAuthenticated && !isAdmin;

  return (
    <section className="admin-auth-page">
      <div className="admin-auth-shell">
        <div className="admin-auth-intro">
          <BrandLogo variant="bag" alt="ShopOra" className="admin-auth-brand" />
          <p className="eyebrow">Back office</p>
          <h1>ShopOra Admin</h1>
          <p>Sign in to manage products, orders, and storefront operations.</p>
          <div className="admin-auth-badges" aria-hidden="true">
            <span>Catalog</span>
            <span>Orders</span>
            <span>Customers</span>
          </div>
          <div className="admin-auth-note">
            Runtime mode: {getRuntimeModeLabel()}. Demo admin access is {isDemoAdminEnabled ? 'enabled' : 'disabled'}.
          </div>
          <p className="admin-auth-hint">
            {isDemoAdminEnabled
              ? 'Demo credentials may be available in project notes. Disable demo admin before launch.'
              : 'Demo admin access is currently disabled. Use a Supabase-backed admin account.'}
          </p>
          {isDemoRuntime || isProductionRuntime ? (
            <p className="admin-auth-hint">
              This admin surface can show local or live-backed behavior depending on runtime configuration.
            </p>
          ) : null}
        </div>

        <div className="admin-auth-card">
          {customerAccessView ? (
            <div className="admin-auth-locked">
              <p className="eyebrow">Access restricted</p>
              <h2>This account does not have admin access.</h2>
              <p>
                Signed in as <strong>{currentUser?.email}</strong>. Use a demo admin account to open
                the ShopOra admin portal.
              </p>
              <div className="admin-unauthorized-actions">
                <Link to="/account" className="btn btn-ghost">
                  Go to my account
                </Link>
                <button
                  type="button"
                  className="btn btn-dark"
                  onClick={() => {
                    void logout();
                    setError('');
                  }}
                >
                  Sign out and use admin login
                </button>
              </div>
            </div>
          ) : (
            <form className="auth-card admin-login-form" onSubmit={handleSubmit}>
              <h2>Admin Sign In</h2>
              {error ? <div className="auth-message auth-message-error">{error}</div> : null}
              <label>
                Email
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={isDemoAdminEnabled ? 'admin@shopora.demo' : 'admin@yourstore.com'}
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter admin password"
                />
              </label>
              <button type="submit" className="btn btn-dark full-width">
                Sign in to admin
              </button>
              <p className="auth-switch admin-switch">
                <Link to="/">Return to Store</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
