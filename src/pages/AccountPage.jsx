import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import ShopOraImage from '../components/ShopOraImage';
import SupportLinkStrip from '../components/SupportLinkStrip';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';
import { useProductCatalog } from '../context/ProductCatalogContext';
import { getProductImage } from '../data/products';
import { getCustomerNextBestAction, getCustomerRetentionLinks } from '../utils/customerRetention';
import { idsMatch } from '../utils/idUtils';
import { filterRecentlyViewedProducts, readRecentlyViewedIds } from '../utils/recentlyViewed';
import { getRecommendedProducts } from '../utils/recommendations';
import { getSupportLinks } from '../utils/supportLinks';
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

function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
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

function toDisplayLabel(value) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) return '';

  return text
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function buildPreferenceBuckets(products = []) {
  const departmentCounts = new Map();
  const categoryCounts = new Map();
  const brandCounts = new Map();

  products.forEach((product) => {
    const department = toDisplayLabel(product?.department);
    const category = toDisplayLabel(product?.category);
    const brand = toDisplayLabel(product?.brand);

    if (department) {
      departmentCounts.set(department, (departmentCounts.get(department) ?? 0) + 1);
    }

    if (category) {
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
    }

    if (brand) {
      brandCounts.set(brand, (brandCounts.get(brand) ?? 0) + 1);
    }
  });

  const sortEntries = (map) =>
    [...map.entries()]
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .map(([label, count]) => ({ label, count }));

  return {
    departments: sortEntries(departmentCounts).slice(0, 3),
    categories: sortEntries(categoryCounts).slice(0, 3),
    brands: sortEntries(brandCounts).slice(0, 2),
  };
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
  const preferenceBuckets = useMemo(
    () => buildPreferenceBuckets([...savedProducts, ...recentlyViewedProducts]),
    [recentlyViewedProducts, savedProducts],
  );
  const retentionLinks = getCustomerRetentionLinks(currentUser);
  const supportLinks = getSupportLinks(currentUser);
  const memberSearchLinks = retentionLinks.searchLinks.slice(0, 3);

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
  const preferredDepartmentsLabel = preferenceBuckets.departments.length
    ? preferenceBuckets.departments.map((item) => item.label).join(' · ')
    : 'Browse a few products to shape this preview.';
  const preferredCategoriesLabel = preferenceBuckets.categories.length
    ? preferenceBuckets.categories.map((item) => item.label).join(' · ')
    : 'Saved items and recent views will surface style hints here.';
  const preferredBrandsLabel = preferenceBuckets.brands.length
    ? preferenceBuckets.brands.map((item) => item.label).join(' · ')
    : 'No brand pattern has been formed yet.';
  const nextBestAction = getCustomerNextBestAction({
    currentUser,
    savedCount: safeSavedProductIds.length,
    recentOrdersCount: recentOrders.length,
    recentlyViewedCount: recentlyViewedProducts.length,
  });
  const memberJourneySteps = [
    {
      label: 'Profile ready',
      detail: currentUser?.email
        ? 'Your contact details are saved for a faster return visit.'
        : 'Add your profile details so repeat visits feel smoother.',
      done: Boolean(currentUser?.firstName && currentUser?.lastName && currentUser?.email),
    },
    {
      label: 'Shipping ready',
      detail: addressLines.length
        ? 'A default shipping address is ready for checkout.'
        : 'Add a shipping address to reduce checkout friction.',
      done: addressLines.length > 0,
    },
    {
      label: 'Saved favorites',
      detail: safeSavedProductIds.length
        ? `You have ${pluralize(safeSavedProductIds.length, 'saved style')} in your wishlist.`
        : 'Save a favorite to start building a shortlist.',
      done: safeSavedProductIds.length > 0,
    },
    {
      label: 'Recently viewed',
      detail: recentlyViewedProducts.length
        ? `You have ${pluralize(recentlyViewedProducts.length, 'recently viewed style')} ready to revisit.`
        : 'Browse a few products to build a personal trail.',
      done: recentlyViewedProducts.length > 0,
    },
    {
      label: 'Order history',
      detail: recentOrders.length
        ? `You have ${pluralize(recentOrders.length, 'recent order')} on file.`
        : 'Your order history will appear after checkout.',
      done: recentOrders.length > 0,
    },
  ];
  const memberJourneyReadyCount = memberJourneySteps.filter((step) => step.done).length;
  const memberJourneyProgressLabel =
    memberJourneyReadyCount === memberJourneySteps.length
      ? 'Your account is ready for fast repeat shopping.'
      : 'A few small details will make this account feel more complete.';
  const memberBenefits = [
    {
      label: 'Saved favorites',
      headline: 'Build your wishlist',
      text: safeSavedProductIds.length
        ? `${pluralize(safeSavedProductIds.length, 'saved style')} are ready to revisit.`
        : 'Save favorites to keep a simple wishlist in one place.',
      action: 'View saved items',
      to: '/account/saved',
    },
    {
      label: 'Faster checkout setup',
      headline: 'Profile-ready checkout',
      text: addressLines.length
        ? 'Profile and shipping details are ready for a quicker checkout flow.'
        : 'Add shipping info now so checkout feels easier later.',
      action: 'Update profile',
      to: '/account',
    },
    {
      label: 'Order history',
      headline: 'Receipts at a glance',
      text: recentOrders.length
        ? `${pluralize(recentOrders.length, 'recent order')} are stored for easy review.`
        : 'Your receipts and order history will appear after checkout.',
      action: 'View orders',
      to: '/account/orders',
    },
    {
      label: 'Discovery and help',
      headline: 'Member shortcuts',
      text: recentlyViewedProducts.length
        ? 'Recently viewed products and recommendations keep browsing moving.'
        : 'Use department shortcuts, then return for a more personal next visit.',
      action: 'Browse shipping',
      to: '/shipping',
    },
  ];

  return (
    <section className="container account-page">
      <div className="section-heading">
        <div className="page-heading-brand-wrap">
          <BrandLogo variant="bag" alt="ShopOra" className="page-heading-brand" />
          <div>
            <p className="eyebrow">Account</p>
            <h1>Welcome{currentUser ? `, ${currentUser.firstName}` : ''}</h1>
            <p>Manage your profile, saved styles, order history, shopping preferences, and shipping details.</p>
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
          <div className="account-next-step">
            <span className="account-card-label">{nextBestAction.eyebrow}</span>
            <strong>{nextBestAction.title}</strong>
            <p>{nextBestAction.text}</p>
            <div className="empty-state-actions">
              <Link to={nextBestAction.to} className="btn btn-dark btn-small">
                {nextBestAction.actionLabel}
              </Link>
              <Link to={retentionLinks.browseSale.to} className="btn btn-ghost btn-small">
                {retentionLinks.browseSale.label}
              </Link>
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

      <section className="account-dashboard-section account-preferences-section" aria-labelledby="account-preferences-title">
        <div className="account-dashboard-section-head">
          <div>
            <span className="account-card-label">Shopping preferences</span>
            <h2 id="account-preferences-title">Your preference preview</h2>
            <p>
              This preview is built from saved items and recently viewed products only. No backend preference record
              is stored here.
            </p>
          </div>
          <div className="recommendation-links account-preferences-links" aria-label="Preference shortcuts">
            <Link to="/account/saved" className="query-chip">
              Saved items
            </Link>
            <Link to="/account/orders" className="query-chip">
              Orders
            </Link>
            <Link to="/women" className="query-chip">
              Women
            </Link>
            <Link to="/sale" className="query-chip">
              Sale
            </Link>
          </div>
        </div>

        <div className="account-preferences-grid">
          <article className="account-preference-card">
            <span className="account-card-label">Preferred departments</span>
            <h3>{preferredDepartmentsLabel}</h3>
            <div className="account-preference-chips" aria-label="Preferred departments">
              {preferenceBuckets.departments.length ? (
                preferenceBuckets.departments.map((item) => (
                  <span key={item.label} className="query-chip">
                    {item.label}
                  </span>
                ))
              ) : (
                <span className="query-chip">Saved locally for this demo</span>
              )}
            </div>
          </article>

          <article className="account-preference-card">
            <span className="account-card-label">Style hints</span>
            <h3>{preferredCategoriesLabel}</h3>
            <p>
              {preferenceBuckets.categories.length
                ? `${preferredBrandsLabel}. Common categories and saved brands shape this account preview without creating a backend profile.`
                : 'Browse and save a few styles to surface more useful hints here.'}
            </p>
            <div className="account-preference-chips" aria-label="Preferred brands">
              {preferenceBuckets.brands.length ? (
                preferenceBuckets.brands.map((item) => (
                  <span key={item.label} className="query-chip">
                    {item.label}
                  </span>
                ))
              ) : (
                <span className="query-chip">No brand pattern yet</span>
              )}
            </div>
          </article>

          <article className="account-preference-card account-preference-card-soft">
            <span className="account-card-label">Communication note</span>
            <h3>Keep account updates concise and practical.</h3>
            <p>
              This is a frontend note only. ShopOra does not store an email preference center or automated messaging
              workflow in this demo.
            </p>
            <div className="account-preference-note">
              <strong>Current status</strong>
              <span>{currentUser?.email ? 'Profile details are saved for this demo account.' : 'Sign in to keep a profile trail together.'}</span>
            </div>
          </article>
        </div>
      </section>

      <SupportLinkStrip
        title="Need help with your account?"
        description="Use these shortcuts if you want help with orders, shipping, returns, or profile details before reaching out."
        links={supportLinks}
      />

      <section className="account-dashboard-section account-member-section" aria-labelledby="account-member-title">
        <div className="account-dashboard-section-head">
          <div>
            <span className="account-card-label">Member benefits</span>
            <h2 id="account-member-title">Your ShopOra member experience</h2>
            <p>
              Frontend-only member cues that make the account feel more personal. There are no points, store credit,
              or redemption balances here.
            </p>
          </div>
          <div className="recommendation-links account-member-links" aria-label="Member shortcuts">
            <Link to="/account/saved" className="query-chip">
              Saved items
            </Link>
            <Link to="/account/orders" className="query-chip">
              Orders
            </Link>
            <Link to="/shipping" className="query-chip">
              Shipping
            </Link>
            <Link to="/returns" className="query-chip">
              Returns
            </Link>
          </div>
        </div>
        <div className="recommendation-links account-member-shortcuts" aria-label="Search shortcuts">
          {memberSearchLinks.map((link) => (
            <Link key={link.to} to={link.to} className="query-chip">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="account-member-benefits-grid">
          {memberBenefits.map((benefit) => (
            <article key={benefit.label} className="account-member-benefit-card">
              <span className="account-card-label">{benefit.label}</span>
              <h3>{benefit.headline}</h3>
              <p>{benefit.text}</p>
              <Link to={benefit.to} className="text-button">
                {benefit.action}
              </Link>
            </article>
          ))}
        </div>

        <div className="account-member-journey">
          <div className="account-member-journey-copy">
            <span className="account-card-label">Member journey</span>
            <h3>Readiness snapshot</h3>
            <p>{memberJourneyProgressLabel}</p>
            <div className="account-member-journey-progress" aria-label="Member readiness progress">
              <strong>
                {memberJourneyReadyCount}/{memberJourneySteps.length}
              </strong>
              <span>readiness steps complete</span>
            </div>
          </div>
          <div className="account-member-journey-steps">
            {memberJourneySteps.map((step) => (
              <article
                key={step.label}
                className={`account-member-journey-step ${step.done ? 'is-ready' : 'needs-attention'}`}
              >
                <div className="account-member-journey-step-row">
                  <strong>{step.label}</strong>
                  <span className={`status-badge ${step.done ? 'status-active' : 'status-badge-muted'}`}>
                    {step.done ? 'Ready' : 'Next'}
                  </span>
                </div>
                <p>{step.detail}</p>
              </article>
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
