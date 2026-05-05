import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { createStripeCheckoutSession } from '../services/stripeCheckoutService';

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
  const { isAuthenticated, currentUser, authSource } = useAuth();
  const { createOrder } = useOrders();
  const navigate = useNavigate();
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
      <div className="section-heading">
        <div className="page-heading-brand-wrap">
          <BrandLogo variant="bag" alt="ShopOra" className="page-heading-brand" />
          <div>
            <h1>Checkout</h1>
            <p>
              {isStripeCheckout
                ? 'Review your order, then continue to Stripe to enter payment details securely.'
                : 'Demo mode only. No payment will be processed.'}
            </p>
          </div>
        </div>
        <span className="count-badge">{isStripeCheckout ? 'Secure Stripe checkout' : 'Demo order'}</span>
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
          <h2>Order summary</h2>
          <div className="checkout-items">
            {items.length ? (
              items.map((item) => (
                <div key={item.key} className="checkout-item">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <strong>${(item.unitPrice * item.quantity).toFixed(2)}</strong>
                </div>
              ))
            ) : (
              <p className="muted">Your cart is empty.</p>
            )}
          </div>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>${subtotal.toFixed(2)}</strong>
          </div>
          <div className="summary-row">
            <span>Estimated shipping</span>
            <strong>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</strong>
          </div>
          <div className="summary-row">
            <span>Estimated tax</span>
            <strong>${tax.toFixed(2)}</strong>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <strong>${total.toFixed(2)}</strong>
          </div>
          <p className="checkout-demo-note">
            {isStripeCheckout
              ? 'You’ll review and enter payment details securely with Stripe before the order is completed.'
              : 'This is a frontend-only demo checkout flow. No payment will be processed.'}
          </p>
          <button
            type="button"
            className="btn btn-dark full-width"
            onClick={handlePlaceOrder}
            disabled={!items.length}
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
