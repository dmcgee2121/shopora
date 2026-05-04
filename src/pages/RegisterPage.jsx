import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import { useAuth } from '../context/AuthContext';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegisterPage() {
  const { register, isAuthenticated, authError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    setError('');
    setStatusMessage('');
  }, [form]);

  if (isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { firstName, lastName, email, password, confirmPassword } = form;

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setError('Please complete all required fields.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const result = await register({ firstName, lastName, email, password });
      if (result?.needsEmailConfirmation) {
        setStatusMessage(result.message ?? 'Check your email to confirm your account before signing in.');
        return;
      }

      navigate('/account', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create your account right now.');
    }
  };

  return (
    <section className="container auth-page">
      <div className="auth-shell">
        <div className="auth-intro">
          <BrandLogo variant="wordmark" alt="ShopOra" className="auth-brandmark" />
          <p className="eyebrow">Join ShopOra</p>
          <h1>Create your account</h1>
          <p>
            Track orders, save items, and keep your profile ready for faster checkout. Customer
            auth uses Supabase when configured; the demo admin login stays local.
          </p>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Register</h2>
          {statusMessage ? <div className="auth-message auth-message-success">{statusMessage}</div> : null}
          {error || authError ? (
            <div className="auth-message auth-message-error">{error || authError}</div>
          ) : null}
          <div className="form-grid">
            <label>
              First name
              <input
                name="firstName"
                type="text"
                autoComplete="given-name"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Jordan"
              />
            </label>
            <label>
              Last name
              <input
                name="lastName"
                type="text"
                autoComplete="family-name"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Lee"
              />
            </label>
          </div>
          <label>
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password"
            />
          </label>
          <label>
            Confirm password
            <input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
            />
          </label>
          <button type="submit" className="btn btn-dark full-width">
            Create Account
          </button>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
