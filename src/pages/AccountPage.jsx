import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import ShopOraImage from '../components/ShopOraImage';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';
import { useProductCatalog } from '../context/ProductCatalogContext';
import { getProductImage } from '../data/products';
import { idsMatch } from '../utils/idUtils';
import { filterRecentlyViewedProducts, readRecentlyViewedIds } from '../utils/recentlyViewed';
import { getRecommendedProducts } from '../utils/recommendations';
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

const shoppingLinks = [
  { to: '/women', label: 'Women' },
  { to: '/men', label: 'Men' },
  { to: '/shoes', label: 'Shoes' },
  { to: '/accessories', label: 'Accessories' },
  { to: '/sale', label: 'Sale' },
];

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatMoney(value) {
  return `$${safeNumber(value).toFixed(2)}`;
}

function formatDate(value) {
  if (!value) return 'Date unavailable';

  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Date unavailable';
  }
}

function getItemCount(order) {
  return Array.isArray(order?.items) ? order.items.length : 0;
}

function ProductPreviewList({ products = [] }) {
  return (
    <div className="account-product-preview-list">
      {products.map((product) => {
        const price = product.salePrice ?? product.price ?? 0;

        return (
          <Link key={product.id} to={`/product/${product.id}`} className="account-product-preview">
            <ShopOraImage
              src={getProductImage(product)}
              alt={product.name}
              className="account-product-preview-image"
              fallbackText="ShopOra"
            />
            <div>
              <span>{product.brand || 'ShopOra'}</span>
              <strong>{product.name || 'ShopOra style'}</strong>
              <p>
                {product.department || 'ShopOra'} / {product.category || 'Style'} / {formatMoney(price)}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function EmptyAccountCard({ title, text, primaryLink, primaryLabel, secondaryLink, secondaryLabel }) {
  return (
    <div className="account-empty-card">
      <h3>{title}</h3>
      <p>{text}</p>
      <div className="empty-state-actions">
        <Link to={primaryLink} className="btn btn-dark btn-small">
          {primaryLabel}
        </Link>
        {secondaryLink && secondaryLabel ? (
          <Link to={secondaryLink} className="btn btn-ghost btn-small">
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { currentUser, logout, updateProfile, savedProductIds, authSource, authError } = useAuth();
  const { getOrdersByUser } = useOrders();
  const { products } = useProductCatalog();
  const safeSavedProductIds = useMemo(
    () => (Array.isArray(savedProductIds) ? savedProductIds : []),
    [savedProductIds],
  );
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
  const savedProducts = useMemo(
    () =>
      products
        .filter((product) => safeSavedProductIds.some((id) => idsMatch(id, product.id)))
        .slice(0, 3),
    [products, safeSavedProductIds],
  );
  const recentlyViewedProducts = useMemo(
    () => filterRecentlyViewedProducts(products, readRecentlyViewedIds(8)).slice(0, 3),
    [products],
  );
  const accountPickProducts = useMemo(() => {
    if (recentlyViewedProducts.length) return recentlyViewedProducts;

    return getRecommendedProducts(products, savedProducts, {
      excludeIds: safeSavedProductIds,
      limit: 3,
    });
  }, [products, recentlyViewedProducts, safeSavedProductIds, savedProducts]);

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
  const addressSummary = addressLines.length ? addressLines.join(' / ') : 'Add a default shipping address for faster checkout.';
  const memberSince = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : 'Unavailable';
  const recentOrderLabel = recentOrders.length ? `${recentOrders.length} recent order${recentOrders.length === 1 ? '' : 's'}` : 'No recent orders';
  const latestOrder = recentOrders[0];
  const profileDetails = [
    currentUser?.email ? 'Email saved' : 'Add email',
    currentUser?.phone ? 'Phone saved' : 'Add phone',
    addressLines.length ? 'Shipping saved' : 'Add shipping',
  ];
  const accountPickTitle = recentlyViewedProducts.length ? 'Recently viewed' : 'Recommended for you';
  const accountPickDescription = recentlyViewedProducts.length
    ? 'Jump back into styles you checked out earlier.'
    : 'A small edit based on saved styles and popular ShopOra favorites.';

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

      <section className="account-dashboard-hero" aria-labelledby="account-dashboard-title">
        <div className="account-dashboard-copy">
          <p className="eyebrow">Account dashboard</p>
          <h2 id="account-dashboard-title">Your ShopOra snapshot</h2>
          <p>
            Keep orders, saved styles, profile details, and shopping shortcuts together in one polished account view.
          </p>
          <div className="account-dashboard-stats" aria-label="Account summary">
            <div>
              <span>Orders</span>
              <strong>{recentOrders.length}</strong>
            </div>
            <div>
              <span>Saved</span>
              <strong>{safeSavedProductIds.length}</strong>
            </div>
            <div>
              <span>Member since</span>
              <strong>{memberSince}</strong>
            </div>
          </div>
        </div>
        <div className="account-dashboard-panel">
          <span className="account-card-label">Profile readiness</span>
          <h3>{profileName}</h3>
          <p>{addressSummary}</p>
          <div className="account-profile-chips" aria-label="Profile readiness details">
            {profileDetails.map((detail) => (
              <span key={detail} className="query-chip">
                {detail}
              </span>
            ))}
          </div>
        </div>
      </section>

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
          <span className="account-card-label">Continue shopping</span>
          <h2>Browse by department</h2>
          <p>Jump back into a focused edit whenever you are ready to shop.</p>
          <div className="recommendation-links account-overview-links" aria-label="Browse departments">
            {shoppingLinks.map((link) => (
              <Link key={link.to} to={link.to} className="query-chip">
                {link.label}
              </Link>
            ))}
          </div>
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
                        {orderDate} / {itemCount} item{itemCount === 1 ? '' : 's'}
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

      <div className="account-dashboard-grid">
        <section className="account-dashboard-section" aria-labelledby="account-order-preview-title">
          <div className="account-dashboard-section-head">
            <div>
              <span className="account-card-label">Orders</span>
              <h2 id="account-order-preview-title">Latest purchase</h2>
            </div>
            <Link to="/account/orders" className="text-button">
              View orders
            </Link>
          </div>
          {latestOrder ? (
            <Link to={`/account/orders/${latestOrder.id}`} className="account-featured-order">
              <div>
                <span className="account-order-number">{latestOrder.orderNumber}</span>
                <p>
                  {formatDate(latestOrder.createdAt)} / {getItemCount(latestOrder)} item
                  {getItemCount(latestOrder) === 1 ? '' : 's'}
                </p>
              </div>
              <strong>{formatMoney(latestOrder.total)}</strong>
            </Link>
          ) : (
            <EmptyAccountCard
              title="No orders yet."
              text="Start with a current edit, then your order history and receipts will collect here."
              primaryLink="/women"
              primaryLabel="Shop new arrivals"
              secondaryLink="/sale"
              secondaryLabel="View sale"
            />
          )}
        </section>

        <section className="account-dashboard-section" aria-labelledby="account-saved-preview-title">
          <div className="account-dashboard-section-head">
            <div>
              <span className="account-card-label">Saved items</span>
              <h2 id="account-saved-preview-title">Wishlist preview</h2>
            </div>
            <Link to="/account/saved" className="text-button">
              View saved
            </Link>
          </div>
          {savedProducts.length ? (
            <ProductPreviewList products={savedProducts} />
          ) : (
            <EmptyAccountCard
              title="No saved styles yet."
              text="Use the heart on product cards to build a shortlist before you buy."
              primaryLink="/shoes"
              primaryLabel="Browse shoes"
              secondaryLink="/accessories"
              secondaryLabel="Browse accessories"
            />
          )}
        </section>
      </div>

      <section className="account-dashboard-section account-shopping-section" aria-labelledby="account-shopping-title">
        <div className="account-dashboard-section-head">
          <div>
            <span className="account-card-label">Continue shopping</span>
            <h2 id="account-shopping-title">{accountPickTitle}</h2>
            <p>{accountPickDescription}</p>
          </div>
          <div className="recommendation-links account-shopping-links" aria-label="Browse departments">
            {shoppingLinks.map((link) => (
              <Link key={link.to} to={link.to} className="query-chip">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        {accountPickProducts.length ? (
          <ProductPreviewList products={accountPickProducts} />
        ) : (
          <EmptyAccountCard
            title="Start a fresh browse."
            text="A few account recommendations will appear here as you save and view products."
            primaryLink="/women"
            primaryLabel="Shop women"
            secondaryLink="/men"
            secondaryLabel="Shop men"
          />
        )}
      </section>

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
            <Link to="/sale" className="btn btn-ghost full-width">
              View Sale
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
