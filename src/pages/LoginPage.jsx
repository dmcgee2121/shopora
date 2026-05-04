import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, isAuthenticated, isAdmin, authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setError(searchParams.get('message') === 'save' ? 'Sign in to save items to your wishlist.' : '');
  }, [searchParams]);

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/account'} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const user = await login(email, password);
      const redirect =
        user.role === 'admin'
          ? '/admin'
          : location.state?.from?.pathname || searchParams.get('redirect') || '/account';
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in right now.');
    }
  };

  return (
    <section className="container auth-page">
      <div className="auth-shell">
        <div className="auth-intro">
          <BrandLogo variant="wordmark" alt="ShopOra" className="auth-brandmark" />
          <p className="eyebrow">Welcome back</p>
          <h1>Sign in to ShopOra</h1>
          <p>
            Access your account, review orders, and save your favorite styles for later. Customer
            auth uses Supabase when configured; the demo admin login stays local.
          </p>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Sign In</h2>
          {error || authError ? (
            <div className="auth-message auth-message-error">{error || authError}</div>
          ) : null}
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
            />
          </label>
          <button type="submit" className="btn btn-dark full-width">
            Sign In
          </button>
          <p className="auth-switch">
            New to ShopOra? <Link to="/register">Create a customer account</Link>
          </p>
          <p className="auth-switch auth-admin-link">
            <Link to="/admin/login">Admin sign in</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
