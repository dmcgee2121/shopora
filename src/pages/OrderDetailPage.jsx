import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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

function getStatusClass(status) {
  switch (status) {
    case 'Pending':
      return 'order-status-pending';
    case 'Processing':
      return 'order-status-processing';
    case 'Shipped':
      return 'order-status-shipped';
    case 'Delivered':
      return 'order-status-delivered';
    case 'Cancelled':
      return 'order-status-cancelled';
    default:
      return '';
  }
}

function getTimelineState(orderStatus, step) {
  const orderRank = {
    Pending: 1,
    Processing: 2,
    Shipped: 3,
    Delivered: 4,
  };

  const stepRank = {
    Pending: 1,
    Processing: 2,
    Shipped: 3,
    Delivered: 4,
  };

  const orderValue = orderRank[orderStatus] ?? 0;
  const stepValue = stepRank[step] ?? 0;
  return {
    complete: orderValue >= stepValue && orderStatus !== 'Cancelled',
    active: orderStatus === step,
  };
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
  const provider = order.paymentProvider && order.paymentProvider !== 'Demo' ? ` · ${order.paymentProvider}` : '';
  const currency = order.currency ? ` · ${order.currency}` : '';
  return `${order.paymentStatus}${provider}${currency}`;
}

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const { currentUser } = useAuth();
  const { getOrderById, fetchOrderById, cancelOrder, isOrdersLoading, ordersError, ordersSource } = useOrders();
  const [resolvedOrder, setResolvedOrder] = useState(() => getOrderById(orderId));

  useEffect(() => {
    let cancelled = false;

    const resolveOrder = async () => {
      const existingOrder = getOrderById(orderId);
      if (existingOrder) {
        if (!cancelled) {
          setResolvedOrder(existingOrder);
        }
        return;
      }

      if (ordersSource !== 'supabase' || isOrdersLoading) {
        if (!cancelled) {
          setResolvedOrder(null);
        }
        return;
      }

      const nextOrder = await fetchOrderById(orderId);
      if (!cancelled) {
        setResolvedOrder(nextOrder);
      }
    };

    void resolveOrder();

    return () => {
      cancelled = true;
    };
  }, [fetchOrderById, getOrderById, isOrdersLoading, orderId, ordersSource]);

  const order = resolvedOrder;
  const orderItems = Array.isArray(order?.items) ? order.items : [];
  const isOwner = order && idsMatch(order.userId, currentUser?.id);

  const handleCancel = () => {
    if (!order || !order.demoMode || order.status !== 'Pending') {
      return;
    }

    const confirmed = window.confirm('Cancel this demo order?');
    if (!confirmed) {
      return;
    }

    cancelOrder(order.id);
  };

  if (isOrdersLoading && !order) {
    return (
      <section className="container order-detail-page">
        <div className="order-detail-shell">
          <div className="order-detail-brand">
            <BrandLogo variant="bag" alt="ShopOra" className="page-heading-brand" />
            <div>
              <p className="eyebrow">ShopOra</p>
              <h1>Loading order</h1>
              <p>We are loading your order details right now.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!order || !isOwner) {
    return (
      <section className="container order-detail-page">
        <div className="order-detail-shell">
          <div className="order-detail-brand">
            <BrandLogo variant="bag" alt="ShopOra" className="page-heading-brand" />
            <div>
              <p className="eyebrow">ShopOra</p>
              <h1>Order unavailable</h1>
              <p>
                We could not load that order for this account. It may not exist or it may belong to a
                different customer.
              </p>
            </div>
          </div>

          {ordersError ? <div className="auth-message auth-message-error">{ordersError}</div> : null}

          <div className="empty-state order-detail-empty">
            <h2>Receipt not available</h2>
            <p>
              This storefront only shows order details to the account that placed the order.
            </p>
            <div className="order-detail-actions">
              <Link to="/account/orders" className="btn btn-dark">
                Back to Orders
              </Link>
              <Link to="/women" className="btn btn-ghost">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container order-detail-page">
      <div className="order-detail-shell">
        <div className="order-detail-brand">
          <BrandLogo variant="bag" alt="ShopOra" className="page-heading-brand" />
          <div>
            <p className="eyebrow">{order.demoMode ? 'Account Orders' : 'Order history'}</p>
            <h1>Order receipt</h1>
            <p>
              {order.demoMode
                ? 'Detailed receipt view for a single demo order.'
                : 'Detailed receipt view for a single customer order.'}
            </p>
          </div>
        </div>

        <div className="order-receipt-card">
          <div className="order-status-timeline-panel">
            {order.status === 'Cancelled' ? (
              <div className="order-cancelled-state">
                <span className={`status-badge ${getStatusClass(order.status)}`}>Cancelled</span>
                <strong>This demo order was cancelled.</strong>
                <p>The order is no longer active. No fulfillment steps will continue.</p>
              </div>
            ) : (
              <div className="order-status-timeline" aria-label="Order timeline">
                {['Pending', 'Processing', 'Shipped', 'Delivered'].map((step, index) => {
                  const state = getTimelineState(order.status, step);
                  return (
                    <div
                      key={step}
                      className={[
                        'order-status-step',
                        state.complete ? 'is-complete' : '',
                        state.active ? 'active' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <span className="order-status-step-index">{index + 1}</span>
                      <div className="order-status-step-copy">
                        <strong>{step}</strong>
                        <p>
                          {step === 'Pending'
                            ? 'Order placed'
                            : step === 'Processing'
                              ? 'Being prepared'
                              : step === 'Shipped'
                                ? 'On the way'
                                : 'Delivered to customer'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="order-receipt-header">
            <div className="order-receipt-brandline">
              <BrandLogo variant="wordmark" alt="ShopOra" className="order-receipt-logo" />
              <p className="order-receipt-kicker">Email-style receipt</p>
            </div>
            <div className="order-receipt-actions no-print">
              <button type="button" className="btn btn-dark btn-small" onClick={() => window.print()}>
                Print Receipt
              </button>
              <Link to="/account/orders" className="btn btn-ghost btn-small">
                Back to Orders
              </Link>
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
              <span className={`status-badge ${getStatusClass(order.status)}`}>{order.status}</span>
                <span className="status-badge">{formatPaymentLabel(order)}</span>
              </div>
            </section>

            <section className="order-receipt-panel">
              <h3>Payment</h3>
              <p>{formatPaymentLabel(order)}</p>
              {order.paidAt ? <p>Paid at {formatDateTime(order.paidAt)}</p> : <p>Payment is not complete yet.</p>}
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

          {order.demoMode && order.status === 'Pending' ? (
            <div className="order-detail-actions no-print">
              <button type="button" className="btn btn-outline" onClick={handleCancel}>
                Cancel Order
              </button>
            </div>
          ) : null}

          <div className="order-detail-actions no-print">
            <button type="button" className="btn btn-dark" onClick={() => window.print()}>
              Print Receipt
            </button>
            <Link to="/account/orders" className="btn btn-ghost">
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
