import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';
import {
  getOrderStatusClass,
  getOrderStatusLabel,
  getPaymentStatusLabel,
} from '../utils/statusUtils';

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
  const { getOrdersByUser } = useOrders();
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
  const recentOrders = useMemo(() => {
    if (!currentUser?.id) return [];
    return getOrdersByUser(currentUser.id).slice(0, 3);
  }, [currentUser?.id, getOrdersByUser]);

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

  const profileName = [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') || 'Account profile';
  const address = currentUser?.defaultShippingAddress ?? {};
  const addressLines = [
    [address.firstName, address.lastName].filter(Boolean).join(' '),
    address.street,
    [address.city, address.state, address.zip].filter(Boolean).join(', '),
  ].filter(Boolean);
  const addressSummary = addressLines.length ? addressLines.join(' • ') : 'Add a default shipping address for faster checkout.';
  const memberSince = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : 'Unavailable';
  const recentOrderLabel = recentOrders.length ? `${recentOrders.length} recent order${recentOrders.length === 1 ? '' : 's'}` : 'No recent orders';

  return (
    <section className="container account-page">
      <div className="section-heading">
        <div className="page-heading-brand-wrap">
          <BrandLogo variant="bag" alt="ShopOra" className="page-heading-brand" />
          <div>
            <p className="eyebrow">Account</p>
            <h1>Welcome{currentUser ? `, ${currentUser.firstName}` : ''}</h1>
            <p>Manage your profile, saved styles, order history, and shipping details.</p>
          </div>
        </div>
        <button type="button" className="btn btn-ghost" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="account-overview-grid">
        <article className="account-overview-card">
          <span className="account-card-label">Profile summary</span>
          <h2>{profileName}</h2>
          <p>{currentUser?.email || 'Email unavailable'}</p>
          <ul className="account-overview-list">
            <li>{currentUser?.phone || 'No phone on file'}</li>
            <li>Customer since {memberSince}</li>
            <li>{recentOrderLabel}</li>
          </ul>
        </article>

        <article className="account-overview-card">
          <span className="account-card-label">Default shipping</span>
          <h2>{addressSummary}</h2>
          <p>Saved shipping information helps keep checkout fast.</p>
          <Link to="/account" className="text-button">
            Update profile
          </Link>
        </article>

        <article className="account-overview-card">
          <span className="account-card-label">Saved items</span>
          <h2>
            {safeSavedProductIds.length} saved style{safeSavedProductIds.length === 1 ? '' : 's'}
          </h2>
          <p>Favorites are ready whenever you want to come back to them.</p>
          <Link to="/account/saved" className="text-button">
            View wishlist
          </Link>
        </article>

        <article className="account-overview-card">
          <span className="account-card-label">Recent orders</span>
          <h2>{recentOrderLabel}</h2>
          {recentOrders.length ? (
            <div className="account-mini-order-list">
              {recentOrders.map((order) => {
                const orderStatusLabel = getOrderStatusLabel(order.status);
                const paymentStatusLabel = getPaymentStatusLabel(order.paymentStatus, {
                  demoMode: Boolean(order.demoMode),
                });
                const orderStatusClass = getOrderStatusClass(order.status);
                const orderDate = order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Date unavailable';
                const itemCount = Array.isArray(order.items) ? order.items.length : 0;

                return (
                  <Link key={order.id} to={`/account/orders/${order.id}`} className="account-mini-order">
                    <div>
                      <strong>{order.orderNumber}</strong>
                      <p>
                        {orderDate} • {itemCount} item{itemCount === 1 ? '' : 's'}
                      </p>
                    </div>
                    <div className="status-badges">
                      <span className={`status-badge ${orderStatusClass}`}>{orderStatusLabel || 'Pending'}</span>
                      <span className="status-badge">{paymentStatusLabel}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="account-overview-note">Your latest orders will show here after checkout.</p>
          )}
          <Link to="/account/orders" className="text-button">
            View all orders
          </Link>
        </article>
      </div>

      <div className="account-layout">
        <form className="form-card account-form" onSubmit={handleSubmit}>
          <h2>Edit profile</h2>
          <p className="account-form-note">Keep your name, contact info, and default shipping address current.</p>
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

          <h3 className="account-section-title">Default shipping address</h3>
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
            Save changes
          </button>
        </form>

        <aside className="account-sidebar">
          <div className="form-card account-summary-card">
            <h2>Quick actions</h2>
            <p className="account-summary-note">Common account shortcuts for demo browsing.</p>
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
