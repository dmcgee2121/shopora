import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import ShopOraImage from '../components/ShopOraImage';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';
import { idsMatch } from '../utils/idUtils';
import { getOrderItemImage } from '../utils/orderItemUtils';

function formatDateTime(value) {
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return value;
  }
}

function formatAddress(address) {
  const lines = [
    [address.firstName, address.lastName].filter(Boolean).join(' '),
    address.street,
    [address.city, address.state, address.zip].filter(Boolean).join(', '),
  ].filter(Boolean);

  return lines;
}

function ReceiptItem({ item }) {
  const image = getOrderItemImage(item);
  return (
    <div className="receipt-item">
      <ShopOraImage
        src={image}
        alt={item.name || 'Order item'}
        className="receipt-item-image"
        fallbackText="ShopOra"
      />
      <div className="receipt-item-copy">
        <strong>{item.name}</strong>
        <p>
          Qty {item.quantity}
          {item.size ? ` | Size ${item.size}` : ''}
          {item.color ? ` | ${item.color}` : ''}
        </p>
      </div>
      <div className="receipt-item-total">
        <strong>${(item.unitPrice * item.quantity).toFixed(2)}</strong>
      </div>
    </div>
  );
}

function formatPaymentLabel(order) {
  const provider = order.paymentProvider && order.paymentProvider !== 'Demo' ? ` | ${order.paymentProvider}` : '';
  const currency = order.currency ? ` | ${order.currency}` : '';
  return `${order.paymentStatus}${provider}${currency}`;
}

function formatPaymentMessage(order) {
  const status = typeof order.paymentStatus === 'string' ? order.paymentStatus.toLowerCase() : '';

  if (status === 'paid') {
    return order.paidAt ? `Payment completed on ${formatDateTime(order.paidAt)}.` : 'Payment completed.';
  }

  if (status === 'failed') {
    return 'Stripe reported a payment failure. Your order is still saved and can be retried later.';
  }

  if (status === 'expired') {
    return 'The Stripe Checkout Session expired. Your order is still saved and can be retried later.';
  }

  if (order.paymentProvider === 'Stripe') {
    return 'Payment is pending Stripe confirmation.';
  }

  return order.demoMode ? 'This is a demo receipt. No payment was processed.' : 'Payment is pending.';
}

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = (searchParams.get('session_id') ?? '').trim();
  const { currentUser, authSource, isAuthLoading } = useAuth();
  const {
    getOrderById,
    fetchOrderById,
    fetchOrderByStripeCheckoutSessionId,
    isOrdersLoading,
    ordersError,
  } = useOrders();
  const [resolvedOrder, setResolvedOrder] = useState(() => getOrderById(orderId));
  const [lookupState, setLookupState] = useState(() => (resolvedOrder ? 'ready' : 'loading'));
  const [lookupError, setLookupError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const syncOrder = async () => {
      setLookupError('');

      const localOrder = getOrderById(orderId);
      if (localOrder) {
        if (!cancelled) {
          setResolvedOrder(localOrder);
          setLookupState('ready');
        }
        return;
      }

      if (isAuthLoading || isOrdersLoading) {
        if (!cancelled) {
          setLookupState('loading');
        }
        return;
      }

      try {
        let nextOrder = null;

        if (authSource === 'supabase' && currentUser?.id) {
          nextOrder = await fetchOrderById(orderId);
          if (!nextOrder && sessionId) {
            nextOrder = await fetchOrderByStripeCheckoutSessionId(sessionId);
          }
        } else if (sessionId) {
          nextOrder = await fetchOrderByStripeCheckoutSessionId(sessionId);
        }

        if (cancelled) {
          return;
        }

        if (nextOrder) {
          setResolvedOrder(nextOrder);
          setLookupState('ready');

          if (!idsMatch(orderId, nextOrder.id)) {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.set('session_id', sessionId || nextOrder.stripeCheckoutSessionId || '');
            nextParams.set('stripe', 'success');
            const queryString = nextParams.toString();
            navigate(
              `/order-confirmation/${nextOrder.id}${queryString ? `?${queryString}` : ''}`,
              { replace: true },
            );
          }
          return;
        }

        setResolvedOrder(null);
        setLookupState('not-found');
      } catch (error) {
        if (cancelled) {
          return;
        }

        setResolvedOrder(null);
        setLookupState('error');
        setLookupError(error instanceof Error ? error.message : 'Unable to load that order right now.');
      }
    };

    void syncOrder();

    return () => {
      cancelled = true;
    };
  }, [
    authSource,
    currentUser?.id,
    fetchOrderById,
    fetchOrderByStripeCheckoutSessionId,
    getOrderById,
    isAuthLoading,
    isOrdersLoading,
    navigate,
    orderId,
    searchParams,
    sessionId,
  ]);

  const order = resolvedOrder;
  const orderItems = Array.isArray(order?.items) ? order.items : [];
  const isLoading = lookupState === 'loading';

  if (isLoading) {
    return (
      <section className="container order-confirmation-page">
        <div className="order-confirmation-shell">
          <div className="order-confirmation-brand">
            <BrandLogo variant="bag" alt="ShopOra" className="page-heading-brand" />
            <div>
              <p className="eyebrow">ShopOra</p>
              <h1>Loading order confirmation</h1>
            </div>
          </div>
          <div className="order-confirmation-card order-not-found">
            <p>We are checking your ShopOra order and Stripe payment details now.</p>
          </div>
        </div>
      </section>
    );
  }

  if (lookupState === 'error') {
    return (
      <section className="container order-confirmation-page">
        <div className="order-confirmation-shell">
          <div className="order-confirmation-brand">
            <BrandLogo variant="bag" alt="ShopOra" className="page-heading-brand" />
            <div>
              <p className="eyebrow">ShopOra</p>
              <h1>We could not load this order</h1>
            </div>
          </div>
          <div className="order-confirmation-card order-not-found">
            <p>ShopOra could not load the confirmation details right now.</p>
            <p className="auth-message auth-message-error">{lookupError || ordersError}</p>
            <div className="order-confirmation-actions no-print">
              <Link to="/women" className="btn btn-dark">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="container order-confirmation-page">
        <div className="order-confirmation-shell">
          <div className="order-confirmation-brand">
            <BrandLogo variant="bag" alt="ShopOra" className="page-heading-brand" />
            <div>
              <p className="eyebrow">ShopOra</p>
              <h1>Order not found</h1>
            </div>
          </div>
          <div className="order-confirmation-card order-not-found">
            <p>
              We could not find that order after checking your account and Stripe checkout session
              details.
            </p>
            {lookupError ? <p className="auth-message auth-message-error">{lookupError}</p> : null}
            {ordersError ? <p className="auth-message auth-message-error">{ordersError}</p> : null}
            <div className="order-confirmation-actions no-print">
              <Link to="/women" className="btn btn-dark">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container order-confirmation-page">
      <div className="order-confirmation-shell">
        <div className="order-confirmation-brand">
          <BrandLogo variant="bag" alt="ShopOra" className="page-heading-brand" />
          <div>
            <p className="eyebrow">ShopOra</p>
            <h1>Order confirmed</h1>
            <p>
              {order.demoMode
                ? 'Thanks for placing a demo order with ShopOra. Your receipt is below.'
                : 'Thanks for placing your order with ShopOra. Your receipt is below.'}
            </p>
          </div>
        </div>

        {ordersError ? <div className="auth-message auth-message-error">{ordersError}</div> : null}

        <div className="order-confirmation-card">
          <div className="order-confirmation-header">
            <div>
              <span className="account-order-number">{order.orderNumber}</span>
              <p>{formatDateTime(order.createdAt)}</p>
            </div>
            <div className="order-confirmation-tags">
              <span className="status-badge">{order.status}</span>
              <span className="status-badge">{formatPaymentLabel(order)}</span>
            </div>
          </div>

          <section className="order-receipt-card">
            <div className="order-receipt-header">
              <div className="order-receipt-brandline">
                <BrandLogo variant="wordmark" alt="ShopOra" className="order-receipt-logo" />
                <p className="order-receipt-kicker">Email-style receipt</p>
              </div>
              <div className="order-receipt-actions no-print">
                <button type="button" className="btn btn-dark btn-small" onClick={() => window.print()}>
                  Print Receipt
                </button>
              </div>
            </div>

            <div className="order-receipt-hero">
              <div>
                <h2>Thanks for your order</h2>
                <p>
                  {order.demoMode
                    ? 'Your demo purchase has been stored locally in this storefront.'
                    : 'Your purchase has been saved to your ShopOra account.'}
                </p>
              </div>
              <div className="order-receipt-meta">
                <div>
                  <span>Order number</span>
                  <strong>{order.orderNumber}</strong>
                </div>
                <div>
                  <span>Date</span>
                  <strong>{formatDateTime(order.createdAt)}</strong>
                </div>
              </div>
            </div>

            <div className="order-receipt-grid">
              <section className="order-receipt-panel">
                <h3>Customer</h3>
                <p>{order.customerName}</p>
                <p>{order.customerEmail}</p>
                {order.customerPhone ? <p>{order.customerPhone}</p> : null}
              </section>

              <section className="order-receipt-panel">
                <h3>Shipping address</h3>
                {formatAddress(order.shippingAddress).map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </section>

              <section className="order-receipt-panel">
                <h3>Status</h3>
                <div className="receipt-status-row">
                  <span className="status-badge">{order.status}</span>
                  <span className="status-badge">{formatPaymentLabel(order)}</span>
                </div>
              </section>

              <section className="order-receipt-panel">
                <h3>Payment</h3>
                <p>{formatPaymentLabel(order)}</p>
                <p>{formatPaymentMessage(order)}</p>
              </section>

              <section className="order-receipt-panel">
                <h3>Order summary</h3>
                <p>
                  {orderItems.length} item{orderItems.length === 1 ? '' : 's'}
                </p>
                <p>{order.demoMode ? 'Frontend-only demo receipt' : 'Order record'}</p>
              </section>
            </div>

            <section className="order-receipt-panel order-receipt-items-panel">
              <h3>Items</h3>
              <div className="receipt-items">
                {orderItems.map((item) => (
                  <ReceiptItem key={item.key} item={item} />
                ))}
              </div>
            </section>

            <section className="order-receipt-panel order-receipt-totals">
              <h3>Totals</h3>
              <div className="summary-row">
                <span>Subtotal</span>
                <strong>${order.subtotal.toFixed(2)}</strong>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <strong>{order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}</strong>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <strong>${order.tax.toFixed(2)}</strong>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <strong>${order.total.toFixed(2)}</strong>
              </div>
              <p className="checkout-demo-note">
                {order.demoMode
                  ? 'This is a demo receipt. No payment was processed.'
                  : 'This receipt reflects a Supabase customer order. No payment has been processed yet.'}
              </p>
            </section>
          </section>

          <div className="order-confirmation-actions no-print">
            <Link to="/women" className="btn btn-dark">
              Continue Shopping
            </Link>
            {currentUser && idsMatch(order.userId, currentUser.id) ? (
              <Link to="/account/orders" className="btn btn-ghost">
                View My Orders
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
