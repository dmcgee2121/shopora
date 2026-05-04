import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import { useAuth } from '../context/AuthContext';

const defaultAddress = {
  firstName: '',
  lastName: '',
  street: '',
  city: '',
  state: '',
  zip: '',
};

export default function AccountPage() {
  const { currentUser, logout, updateProfile, savedProductIds, authSource, authError } = useAuth();
  const safeSavedProductIds = Array.isArray(savedProductIds) ? savedProductIds : [];
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    defaultShippingAddress: defaultAddress,
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) return;

    setForm({
      firstName: currentUser.firstName ?? '',
      lastName: currentUser.lastName ?? '',
      phone: currentUser.phone ?? '',
      defaultShippingAddress: {
        ...defaultAddress,
        ...(currentUser.defaultShippingAddress ?? {}),
      },
    });
  }, [currentUser]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleAddressChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      defaultShippingAddress: {
        ...current.defaultShippingAddress,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      await updateProfile(form);
      setMessage(
        authSource === 'supabase'
          ? 'Your profile has been updated in Supabase.'
          : 'Your profile has been updated.',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update your profile right now.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/');
    }
  };

  const addressSummary = currentUser?.defaultShippingAddress
    ? [currentUser.defaultShippingAddress.street, currentUser.defaultShippingAddress.city, currentUser.defaultShippingAddress.state]
        .filter(Boolean)
        .join(', ')
    : 'Add a default shipping address for faster checkout.';

  return (
    <section className="container account-page">
      <div className="section-heading">
        <div className="page-heading-brand-wrap">
          <BrandLogo variant="bag" alt="ShopOra" className="page-heading-brand" />
          <div>
            <p className="eyebrow">Account</p>
            <h1>Welcome{currentUser ? `, ${currentUser.firstName}` : ''}</h1>
            <p>Manage your profile, saved styles, and shipping details.</p>
          </div>
        </div>
        <button type="button" className="btn btn-ghost" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="account-grid">
        <Link to="/account" className="account-card">
          <span className="account-card-label">Profile</span>
          <strong>
            {currentUser?.firstName} {currentUser?.lastName}
          </strong>
          <p>{currentUser?.email}</p>
        </Link>
        <Link to="/account/orders" className="account-card">
          <span className="account-card-label">Orders</span>
          <strong>View order history</strong>
          <p>Completed purchases will appear here.</p>
        </Link>
        <Link to="/account/saved" className="account-card">
          <span className="account-card-label">Saved Items</span>
          <strong>
            {safeSavedProductIds.length} saved style{safeSavedProductIds.length === 1 ? '' : 's'}
          </strong>
          <p>Keep favorites in one place.</p>
        </Link>
        <div className="account-card">
          <span className="account-card-label">Shipping Address</span>
          <strong>{addressSummary}</strong>
          <p>Use this address to speed up checkout.</p>
        </div>
      </div>

      <div className="account-layout">
        <form className="form-card account-form" onSubmit={handleSubmit}>
          <h2>Edit Profile</h2>
          {message ? <div className="auth-message auth-message-success">{message}</div> : null}
          {error ? <div className="auth-message auth-message-error">{error}</div> : null}
          {!message && !error && authError ? <div className="auth-message auth-message-error">{authError}</div> : null}
          <div className="form-grid">
            <label>
              First name
              <input name="firstName" type="text" value={form.firstName} onChange={handleProfileChange} />
            </label>
            <label>
              Last name
              <input name="lastName" type="text" value={form.lastName} onChange={handleProfileChange} />
            </label>
            <label className="full-span">
              Phone
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleProfileChange}
                placeholder="(555) 123-4567"
              />
            </label>
          </div>

          <h3 className="account-section-title">Default Shipping Address</h3>
          <div className="form-grid">
            <label>
              Shipping first name
              <input
                name="firstName"
                type="text"
                value={form.defaultShippingAddress.firstName}
                onChange={handleAddressChange}
              />
            </label>
            <label>
              Shipping last name
              <input
                name="lastName"
                type="text"
                value={form.defaultShippingAddress.lastName}
                onChange={handleAddressChange}
              />
            </label>
            <label className="full-span">
              Street address
              <input
                name="street"
                type="text"
                value={form.defaultShippingAddress.street}
                onChange={handleAddressChange}
              />
            </label>
            <label>
              City
              <input
                name="city"
                type="text"
                value={form.defaultShippingAddress.city}
                onChange={handleAddressChange}
              />
            </label>
            <label>
              State
              <input
                name="state"
                type="text"
                value={form.defaultShippingAddress.state}
                onChange={handleAddressChange}
              />
            </label>
            <label>
              ZIP
              <input
                name="zip"
                type="text"
                value={form.defaultShippingAddress.zip}
                onChange={handleAddressChange}
              />
            </label>
          </div>

          <button type="submit" className="btn btn-dark">
            Save Changes
          </button>
        </form>

        <aside className="account-sidebar">
          <div className="form-card account-summary-card">
            <h2>Quick Actions</h2>
            <Link to="/account/orders" className="btn btn-ghost full-width">
              View Orders
            </Link>
            <Link to="/account/saved" className="btn btn-ghost full-width">
              View Saved Items
            </Link>
            <Link to="/women" className="btn btn-dark full-width">
              Continue Shopping
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
