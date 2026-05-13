import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import ShopOraImage from '../components/ShopOraImage';
import SupportLinkStrip from '../components/SupportLinkStrip';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';
import { getCustomerRetentionLinks } from '../utils/customerRetention';
import { idsMatch } from '../utils/idUtils';
import { getOrderItemImage } from '../utils/orderItemUtils';
import { getSupportLinks } from '../utils/supportLinks';
import {
  getOrderStatusClass,
  getOrderStatusLabel,
  getPaymentStatusLabel,
  normalizeStatusValue,
} from '../utils/statusUtils';

function formatDateTime(value) {
  if (!value) return '';

  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return value;
  }
}

function formatAddress(address = {}) {
  const lines = [
    [address.firstName, address.lastName].filter(Boolean).join(' '),
    address.street,
    [address.city, address.state, address.zip].filter(Boolean).join(', '),
  ].filter(Boolean);

  return lines;
}

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatMoney(value) {
  return `$${safeNumber(value).toFixed(2)}`;
}

function hasMoneyValue(value) {
  return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
}

function getItemName(item) {
  return item?.name || item?.product?.name || item?.product_name || 'Order item';
}

function getItemDetails(item) {
  const details = [`Qty ${safeNumber(item?.quantity, 1)}`];
  if (item?.size) details.push(`Size ${item.size}`);
  if (item?.color) details.push(item.color);
  return details.join(' | ');
}

function getTimelineState(orderStatus, step) {
  const orderRank = {
    pending: 1,
    processing: 2,
    shipped: 3,
    delivered: 4,
  };

  const stepRank = {
    pending: 1,
    processing: 2,
    shipped: 3,
    delivered: 4,
  };

  const currentStatus = normalizeStatusValue(orderStatus);
  const currentStep = normalizeStatusValue(step);
  const orderValue = orderRank[currentStatus] ?? 0;
  const stepValue = stepRank[currentStep] ?? 0;

  return {
    complete: orderValue >= stepValue && currentStatus !== 'cancelled' && currentStatus !== 'canceled',
    active: currentStatus === currentStep,
  };
}

function ReceiptItem({ item }) {
  const image = getOrderItemImage(item);
  const itemName = getItemName(item);

  return (
    <div className="receipt-item">
      <ShopOraImage src={image} alt={itemName} className="receipt-item-image" fallbackText="ShopOra" />
      <div className="receipt-item-copy">
        <strong>{itemName}</strong>
        <p>{getItemDetails(item)}</p>
      </div>
      <div className="receipt-item-total">
        <strong>{formatMoney(safeNumber(item?.unitPrice) * safeNumber(item?.quantity, 1))}</strong>
      </div>
    </div>
  );
}

function formatPaymentMessage(order) {
  const status = normalizeStatusValue(order.paymentStatus);

  if (status === 'paid') {
    return order.paidAt ? `Payment completed on ${formatDateTime(order.paidAt)}.` : 'Payment completed.';
  }

  if (status === 'failed') {
    return 'Payment failed. Your order is still saved and can be retried later.';
  }

  if (status === 'expired') {
    return 'Payment expired. Your order is still saved and can be retried later.';
  }

  if (status === 'pending' || status === 'processing') {
    return 'Payment is pending confirmation.';
  }

  return order.demoMode ? 'This is a demo receipt. No payment was processed.' : 'Payment is pending.';
}

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const { currentUser } = useAuth();
  const { getOrderById, fetchOrderById, cancelOrder, isOrdersLoading, ordersError, ordersSource } = useOrders();
  const [resolvedOrder, setResolvedOrder] = useState(() => getOrderById(orderId));
  const retentionLinks = getCustomerRetentionLinks(currentUser);
  const supportLinks = getSupportLinks(currentUser);

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
  const orderStatusLabel = getOrderStatusLabel(order?.status);
  const paymentStatusLabel = getPaymentStatusLabel(order?.paymentStatus, { demoMode: Boolean(order?.demoMode) });
  const orderStatusClass = getOrderStatusClass(order?.status);
  const orderDate = formatDateTime(order?.createdAt);
  const isCancelled = orderStatusLabel === 'Canceled';

  const handleCancel = () => {
    if (!order || !order.demoMode || normalizeStatusValue(order.status) !== 'pending') {
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
                We could not load that order for this account. It may not exist or it may belong to a different
                customer.
              </p>
            </div>
          </div>

          {ordersError ? <div className="auth-message auth-message-error">{ordersError}</div> : null}

          <div className="empty-state order-detail-empty">
            <h2>Receipt not available</h2>
            <p>This order can only be viewed by the account that placed it.</p>
            <div className="order-detail-actions">
              <Link to="/account/orders" className="btn btn-dark">
                Back to Orders
              </Link>
              <Link to="/women" className="btn btn-ghost">
                Continue Shopping
              </Link>
              <Link to={retentionLinks.savedItems.to} className="btn btn-ghost">
                {retentionLinks.savedItems.label}
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
            <p className="eyebrow">{order.demoMode ? 'Demo orders' : 'Order history'}</p>
            <h1>Order receipt</h1>
            <p>{order.demoMode ? 'Detailed receipt view for a demo order.' : 'Detailed receipt view for your order.'}</p>
          </div>
        </div>

        <div className="order-receipt-card">
          <div className="order-status-timeline-panel">
            {isCancelled ? (
              <div className="order-cancelled-state">
                <span className={`status-badge ${orderStatusClass}`}>{orderStatusLabel}</span>
                <strong>This order has been canceled.</strong>
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
              <p className="order-receipt-kicker">Receipt</p>
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
              <p>{formatPaymentMessage(order)}</p>
            </div>
            <div className="order-receipt-meta">
              <div>
                <span>Order number</span>
                <strong>{order.orderNumber}</strong>
              </div>
              <div>
                <span>Date</span>
                <strong>{orderDate || 'Unavailable'}</strong>
              </div>
            </div>
          </div>

          <div className="order-receipt-overview" aria-label="Order overview">
            <div>
              <span>Customer</span>
              <strong>{order.customerName || order.customerEmail || 'Customer unavailable'}</strong>
            </div>
            <div>
              <span>Items</span>
              <strong>
                {orderItems.length} item{orderItems.length === 1 ? '' : 's'}
              </strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{orderStatusLabel || 'Pending'}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>{hasMoneyValue(order.total) ? formatMoney(order.total) : 'Unavailable'}</strong>
            </div>
          </div>

          <div className="order-receipt-grid">
            <section className="order-receipt-panel">
              <h3>Shipping info</h3>
              <p>{order.customerName || 'Customer name unavailable'}</p>
              <p>{order.customerEmail || 'Email unavailable'}</p>
              {order.customerPhone ? <p>{order.customerPhone}</p> : null}
              {formatAddress(order.shippingAddress).length ? (
                formatAddress(order.shippingAddress).map((line) => <p key={line}>{line}</p>)
              ) : (
                <p>Shipping address unavailable</p>
              )}
            </section>

            <section className="order-receipt-panel">
              <h3>Status</h3>
              <div className="receipt-status-row">
                <span className={`status-badge ${orderStatusClass}`}>{orderStatusLabel || 'Pending'}</span>
                <span className="status-badge">{paymentStatusLabel}</span>
              </div>
            </section>

            <section className="order-receipt-panel">
              <h3>Payment</h3>
              <p>{paymentStatusLabel}</p>
              <p>{formatPaymentMessage(order)}</p>
            </section>

            <section className="order-receipt-panel">
              <h3>Order summary</h3>
              <p>
                {orderItems.length} item{orderItems.length === 1 ? '' : 's'}
              </p>
              <p>{order.demoMode ? 'Demo order saved locally' : 'Customer order receipt'}</p>
            </section>
          </div>

          <section className="order-receipt-panel order-receipt-items-panel">
            <h3>Items</h3>
            <div className="receipt-items">
              {orderItems.length ? (
                orderItems.map((item, index) => <ReceiptItem key={item.key || item.id || index} item={item} />)
              ) : (
                <p>Item details are unavailable for this order.</p>
              )}
            </div>
          </section>

          <section className="order-receipt-panel order-receipt-totals">
            <h3>Totals</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{hasMoneyValue(order.subtotal) ? formatMoney(order.subtotal) : 'Unavailable'}</strong>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <strong>
                {order.shipping === 0
                  ? 'Free'
                  : hasMoneyValue(order.shipping)
                    ? formatMoney(order.shipping)
                    : 'Unavailable'}
              </strong>
            </div>
            <div className="summary-row">
              <span>Tax</span>
              <strong>{hasMoneyValue(order.tax) ? formatMoney(order.tax) : 'Unavailable'}</strong>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <strong>{hasMoneyValue(order.total) ? formatMoney(order.total) : 'Unavailable'}</strong>
            </div>
            <p className="checkout-demo-note">
              {order.demoMode ? 'This is a demo receipt. No payment was processed.' : 'This receipt is ready for your records.'}
            </p>
          </section>

          <section className="order-receipt-panel">
            <h3>Keep browsing</h3>
            <p>
              Use this receipt to revisit favorites, compare new finds, or continue shopping from the same account.
            </p>
            <div className="empty-state-actions">
              <Link to={retentionLinks.continueShopping.to} className="btn btn-dark btn-small">
                {retentionLinks.continueShopping.label}
              </Link>
              <Link to={retentionLinks.browseSale.to} className="btn btn-ghost btn-small">
                {retentionLinks.browseSale.label}
              </Link>
              <Link to={retentionLinks.savedItems.to} className="btn btn-ghost btn-small">
                {retentionLinks.savedItems.label}
              </Link>
            </div>
          </section>

          <SupportLinkStrip
            title="Need help with this order?"
            description="Have the order number, receipt, or shipping address ready if you need support with tracking, returns, or account details."
            links={supportLinks}
            className="order-support-strip"
          />

          {order.demoMode && normalizeStatusValue(order.status) === 'pending' ? (
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
