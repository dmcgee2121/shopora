import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { createStripeCheckoutSession } from '../services/stripeCheckoutService';
import { getSupportLinks } from '../utils/supportLinks';

const defaultForm = {
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  cardNumber: '',
  expiration: '',
  cvc: '',
};

function formatMoney(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : '$0.00';
}

function getItemOptions(item) {
  return [item?.size ? `Size ${item.size}` : '', item?.color ? `${item.color}` : '']
    .filter(Boolean)
    .join(' | ');
}

function isLocalDebugMode() {
  if (import.meta.env.DEV) {
    return true;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  return ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  useDocumentTitle('ShopOra | Checkout');
  const { isAuthenticated, currentUser, authSource } = useAuth();
  const { createOrder } = useOrders();
  const navigate = useNavigate();
  const supportLinks = getSupportLinks(currentUser);
  const checkoutHelpLinks = supportLinks.slice(0, 4);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');
  const [placedOrderId, setPlacedOrderId] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const fieldRefs = {
    email: useRef(null),
    firstName: useRef(null),
    lastName: useRef(null),
    address: useRef(null),
    city: useRef(null),
    state: useRef(null),
    zip: useRef(null),
  };

  const shipping = subtotal > 75 ? 0 : 7.95;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  const isStripeCheckout = authSource === 'supabase';
  const hasItems = items.length > 0;

  useEffect(() => {
    if (!currentUser) {
      setForm(defaultForm);
      return;
    }

    setForm({
      email: currentUser.email ?? '',
      phone: currentUser.phone ?? '',
      firstName: currentUser.firstName ?? '',
      lastName: currentUser.lastName ?? '',
      address: currentUser.defaultShippingAddress?.street ?? '',
      city: currentUser.defaultShippingAddress?.city ?? '',
      state: currentUser.defaultShippingAddress?.state ?? '',
      zip: currentUser.defaultShippingAddress?.zip ?? '',
      cardNumber: '',
      expiration: '',
      cvc: '',
    });
  }, [currentUser]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (error) setError('');
    setFieldErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
    setForm((current) => ({ ...current, [name]: value }));
  };

  const validateCheckout = () => {
    const nextErrors = {};
    const emailValue = form.email.trim();
    const firstNameValue = form.firstName.trim();
    const lastNameValue = form.lastName.trim();
    const addressValue = form.address.trim();
    const cityValue = form.city.trim();
    const stateValue = form.state.trim();
    const zipValue = form.zip.trim();

    if (!firstNameValue) nextErrors.firstName = 'First name is required.';
    if (!lastNameValue) nextErrors.lastName = 'Last name is required.';
    if (!emailValue) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!addressValue) nextErrors.address = 'Street address is required.';
    if (!cityValue) nextErrors.city = 'City is required.';
    if (!stateValue) nextErrors.state = 'State is required.';
    if (!zipValue) {
      nextErrors.zip = 'ZIP/postal code is required.';
    } else if (zipValue.length < 5) {
      nextErrors.zip = 'ZIP/postal code must be at least 5 characters.';
    }

    return nextErrors;
  };

  const focusFirstInvalidField = (errors) => {
    const order = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zip'];
    const firstInvalid = order.find((key) => errors[key]);
    if (!firstInvalid) return;

    window.requestAnimationFrame(() => {
      fieldRefs[firstInvalid]?.current?.focus?.();
      fieldRefs[firstInvalid]?.current?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
    });
  };

  const handlePlaceOrder = async () => {
    if (!items.length) {
      setError(
        isStripeCheckout
          ? 'Your cart is empty. Add items before placing an order.'
          : 'Your cart is empty. Add items before placing a demo order.',
      );
      return;
    }

    const nextErrors = validateCheckout();
    if (Object.keys(nextErrors).length) {
      setError(
        isStripeCheckout
          ? 'Please fix the highlighted fields before continuing to secure payment.'
          : 'Please fix the highlighted fields before placing your demo order.',
      );
      setFieldErrors(nextErrors);
      focusFirstInvalidField(nextErrors);
      return;
    }

    const shippingAddress = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      street: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      zip: form.zip.trim(),
    };

    const customerEmail = form.email.trim();
    const customerPhone = form.phone.trim();
    const customerName =
      [shippingAddress.firstName, shippingAddress.lastName].filter(Boolean).join(' ') ||
      'ShopOra Customer';

    try {
      setPlacedOrderId('');
      const order = await createOrder({
        userId: currentUser?.id ?? null,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        items: items.map((item) => ({
          ...item,
          lineTotal: item.unitPrice * item.quantity,
        })),
        subtotal,
        shipping,
        tax,
        total,
        status: isStripeCheckout ? 'Processing' : 'Pending',
        paymentStatus: isStripeCheckout ? 'Pending' : 'Demo Paid',
        paymentProvider: isStripeCheckout ? 'Stripe' : 'Demo',
        currency: 'USD',
      });

      setPlacedOrderId(order.id);

      if (isStripeCheckout) {
        try {
          const session = await createStripeCheckoutSession(order.id);
          clearCart();
          setForm(defaultForm);
          setFieldErrors({});
          setError('');
          window.location.assign(session.url);
          return;
        } catch (stripeError) {
          if (isLocalDebugMode()) {
            console.warn('Stripe Checkout start failed', stripeError);
          }
          setError(
            'Your order was saved, but secure payment could not start right now. Please try again in a few minutes.',
          );
          return;
        }
      }

      clearCart();
      setForm(defaultForm);
      setFieldErrors({});
      setError('');
      navigate(`/order-confirmation/${order.id}`);
    } catch (err) {
      if (isLocalDebugMode()) {
        console.warn('Order placement failed', err);
      }
      setError('We could not place your order right now. Please check your information and try again.');
    }
  };

  return (
    <section className="container checkout-page">
      <div className="checkout-hero">
        <div className="section-heading">
          <div className="page-heading-brand-wrap">
            <BrandLogo variant="bag" alt="ShopOra" className="page-heading-brand" />
            <div>
              <h1>Checkout</h1>
              <p>
                {isStripeCheckout
                  ? 'Review your order, then continue to Stripe for secure payment entry.'
                  : 'Demo mode only. No payment will be processed.'}
              </p>
            </div>
          </div>
          <div className="checkout-hero-badges">
            <span className="count-badge">{isStripeCheckout ? 'Secure Stripe checkout' : 'Demo order'}</span>
            <span className="count-badge checkout-badge-muted">Shipping calculated at checkout</span>
          </div>
        </div>

        <div className="checkout-confidence-strip">
          <div className="checkout-confidence-item">
            <strong>Secure checkout</strong>
            <span>
              {isStripeCheckout
                ? 'Stripe handles payment on the next step.'
                : 'Demo payments stay in the prototype and do not charge a card.'}
            </span>
          </div>
          <div className="checkout-confidence-item">
            <strong>Shipping</strong>
            <span>Free over $75, otherwise a flat $7.95.</span>
          </div>
          <div className="checkout-confidence-item">
            <strong>Support</strong>
            <span>
              Questions before placing the order? <Link to="/contact">Contact support</Link>.
            </span>
          </div>
        </div>
      </div>

      {!isAuthenticated ? (
        <div className="checkout-login-prompt">
          <p>
            Have an account? <Link to="/login">Sign in for faster checkout.</Link>
          </p>
        </div>
      ) : (
        <div className="checkout-login-prompt is-signed-in">
          <p>
            Signed in as <strong>{currentUser.firstName}</strong>. Shipping fields are prefilled from
            your account.
          </p>
        </div>
      )}

      <div className="checkout-layout">
        <form
          className="checkout-form"
          onSubmit={(event) => {
            event.preventDefault();
            handlePlaceOrder();
          }}
        >
          {error ? <div className="auth-message auth-message-error">{error}</div> : null}

          <div className="form-card">
            <h2>Contact information</h2>
            <p className="checkout-card-note">We’ll use this for order updates and receipt emails.</p>
            <div className="form-grid">
              <label>
                Email
                <input
                  ref={fieldRefs.email}
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'checkout-email-error' : undefined}
                />
                {fieldErrors.email ? (
                  <span className="field-error" id="checkout-email-error">
                    {fieldErrors.email}
                  </span>
                ) : null}
              </label>
              <label>
                Phone
                <input
                  name="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={form.phone}
                  onChange={handleChange}
                />
              </label>
            </div>
          </div>

          <div className="form-card">
            <h2>Shipping address</h2>
            <p className="checkout-card-note">Use the destination where you want this order delivered.</p>
            <div className="form-grid">
              <label>
                First name
                <input
                  ref={fieldRefs.firstName}
                  name="firstName"
                  type="text"
                  placeholder="Jordan"
                  value={form.firstName}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.firstName)}
                  aria-describedby={fieldErrors.firstName ? 'checkout-first-name-error' : undefined}
                />
                {fieldErrors.firstName ? (
                  <span className="field-error" id="checkout-first-name-error">
                    {fieldErrors.firstName}
                  </span>
                ) : null}
              </label>
              <label>
                Last name
                <input
                  ref={fieldRefs.lastName}
                  name="lastName"
                  type="text"
                  placeholder="Lee"
                  value={form.lastName}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.lastName)}
                  aria-describedby={fieldErrors.lastName ? 'checkout-last-name-error' : undefined}
                />
                {fieldErrors.lastName ? (
                  <span className="field-error" id="checkout-last-name-error">
                    {fieldErrors.lastName}
                  </span>
                ) : null}
              </label>
              <label className="full-span">
                Address
                <input
                  ref={fieldRefs.address}
                  name="address"
                  type="text"
                  placeholder="123 Main Street"
                  value={form.address}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.address)}
                  aria-describedby={fieldErrors.address ? 'checkout-address-error' : undefined}
                />
                {fieldErrors.address ? (
                  <span className="field-error" id="checkout-address-error">
                    {fieldErrors.address}
                  </span>
                ) : null}
              </label>
              <label>
                City
                <input
                  ref={fieldRefs.city}
                  name="city"
                  type="text"
                  placeholder="Chicago"
                  value={form.city}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.city)}
                  aria-describedby={fieldErrors.city ? 'checkout-city-error' : undefined}
                />
                {fieldErrors.city ? (
                  <span className="field-error" id="checkout-city-error">
                    {fieldErrors.city}
                  </span>
                ) : null}
              </label>
              <label>
                State
                <input
                  ref={fieldRefs.state}
                  name="state"
                  type="text"
                  placeholder="IL"
                  value={form.state}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.state)}
                  aria-describedby={fieldErrors.state ? 'checkout-state-error' : undefined}
                />
                {fieldErrors.state ? (
                  <span className="field-error" id="checkout-state-error">
                    {fieldErrors.state}
                  </span>
                ) : null}
              </label>
              <label>
                ZIP code
                <input
                  ref={fieldRefs.zip}
                  name="zip"
                  type="text"
                  placeholder="60601"
                  value={form.zip}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.zip)}
                  aria-describedby={fieldErrors.zip ? 'checkout-zip-error' : undefined}
                />
                {fieldErrors.zip ? (
                  <span className="field-error" id="checkout-zip-error">
                    {fieldErrors.zip}
                  </span>
                ) : null}
              </label>
            </div>
          </div>

          <div className="form-card">
            <h2>Payment</h2>
            <p className="checkout-card-note">
              {isStripeCheckout
                ? 'You’ll complete payment securely on Stripe in the next step.'
                : 'This checkout stays in demo mode and will not process a card.'}
            </p>
            {isStripeCheckout ? (
              <div className="checkout-secure-payment-note">
                <strong>Secure payment</strong>
                <p>Payment is securely processed by Stripe. You’ll enter your card details on the next screen.</p>
              </div>
            ) : (
              <div className="checkout-secure-payment-note">
                <strong>Demo payment</strong>
                <p>This demo checkout will not charge a card or process a real payment.</p>
              </div>
            )}
          </div>
        </form>

        <aside className="cart-summary checkout-summary">
          <div className="checkout-summary-header">
            <div>
              <h2>Order summary</h2>
              <p className="checkout-card-note">
                {hasItems
                  ? `${items.length} item${items.length === 1 ? '' : 's'} ready to review before placing the order.`
                  : 'Your cart is empty. Add items before continuing to checkout.'}
              </p>
            </div>
            <Link to="/cart" className="text-button">
              Edit cart
            </Link>
          </div>

          <div className="checkout-items">
            {hasItems ? (
              items.map((item) => (
                <article key={item.key} className="checkout-item">
                  <div className="checkout-item-copy">
                    <strong>{item.name}</strong>
                    <span>
                      Qty {item.quantity}
                      {getItemOptions(item) ? ` • ${getItemOptions(item)}` : ''}
                    </span>
                  </div>
                  <strong>{formatMoney(item.unitPrice * item.quantity)}</strong>
                </article>
              ))
            ) : (
              <div className="checkout-empty-state">
                <p>Your cart is empty.</p>
                <Link to="/cart" className="btn btn-dark full-width">
                  Return to cart
                </Link>
              </div>
            )}
          </div>

          <div className="checkout-pricing">
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{formatMoney(subtotal)}</strong>
            </div>
            <div className="summary-row">
              <span>Estimated shipping</span>
              <strong>{shipping === 0 ? 'Free' : formatMoney(shipping)}</strong>
            </div>
            <div className="summary-row">
              <span>Estimated tax</span>
              <strong>{formatMoney(tax)}</strong>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <strong>{formatMoney(total)}</strong>
            </div>
          </div>

          <div className="checkout-support-note">
            <p>
              {isStripeCheckout
                ? 'Stripe handles secure card entry on the next step. You can return to your cart before confirming.'
                : 'This is a frontend-only demo checkout flow. No payment will be processed.'}
            </p>
            <p>
              Need help before placing the order? <Link to="/shipping">Shipping</Link>,{' '}
              <Link to="/returns">Returns</Link>, or <Link to="/contact">Contact support</Link>.
            </p>
          </div>

          <section className="checkout-help-card" aria-labelledby="checkout-help-title">
            <p className="checkout-help-kicker">Need help?</p>
            <h3 id="checkout-help-title">Before you pay</h3>
            <p className="checkout-help-copy">
              Quick links for shipping, returns, privacy, and support before the final step.
            </p>
            <nav className="checkout-help-links" aria-label="Checkout help links">
              {checkoutHelpLinks.map((link) => (
                <Link key={`${link.to}-${link.label}`} to={link.to} className="checkout-help-link">
                  {link.label}
                </Link>
              ))}
            </nav>
          </section>

          <button
            type="button"
            className="btn btn-dark full-width"
            onClick={handlePlaceOrder}
            disabled={!hasItems}
          >
            {isStripeCheckout ? 'Continue to Secure Payment' : 'Place Demo Order'}
          </button>
          {placedOrderId && error ? (
            <Link to={`/order-confirmation/${placedOrderId}`} className="btn btn-ghost full-width">
              View Order Confirmation
            </Link>
          ) : null}
          <Link to="/cart" className="btn btn-ghost full-width">
            Back to cart
          </Link>
        </aside>
      </div>
    </section>
  );
}
