import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ShopOraImage from '../../components/ShopOraImage';
import { useOrders } from '../../context/OrdersContext';
import { idsMatch } from '../../utils/idUtils';
import { getOrderItemImage } from '../../utils/orderItemUtils';

const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

function formatDate(value) {
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

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

function formatAddress(address = {}) {
  return [
    [address.firstName, address.lastName].filter(Boolean).join(' '),
    address.street,
    [address.city, address.state, address.zip].filter(Boolean).join(', '),
  ].filter(Boolean);
}

function OrderItemRow({ item }) {
  const image = getOrderItemImage(item);
  return (
    <div className="admin-order-item-row">
      <ShopOraImage
        src={image}
        alt={item.name || 'Order item'}
        className="admin-order-item-image"
        fallbackText="ShopOra"
      />
      <div className="admin-order-item-copy">
        <strong>{item.name}</strong>
        <p>
          Qty {item.quantity}
          {item.size ? ` | Size ${item.size}` : ''}
          {item.color ? ` | ${item.color}` : ''}
        </p>
      </div>
      <strong className="admin-order-item-total">${(item.unitPrice * item.quantity).toFixed(2)}</strong>
    </div>
  );
}

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useOrders();
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const ordered = useMemo(
    () =>
      [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [orders],
  );

  const selectedOrder = ordered.find((order) => idsMatch(order.id, selectedOrderId)) ?? null;

  const counts = statusOptions.reduce((result, status) => {
    result[status] = ordered.filter((order) => order.status === status).length;
    return result;
  }, {});

  useEffect(() => {
    if (!selectedOrderId) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedOrderId(null);
      }
    };

    document.body.classList.add('modal-open');
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedOrderId]);

  return (
    <div className="admin-page-stack">
      <AdminPageHeader
        eyebrow="Order operations"
        title="Orders"
        subtitle="Completed demo checkouts are stored locally and can be updated by status here."
        actionLabel="View Checkout"
        actionTo="/checkout"
        actionClassName="btn btn-dark"
      />

      <div className="admin-status-grid">
        {statusOptions.map((status) => (
          <section key={status} className="admin-status-card">
            <span>{status}</span>
            <strong>{counts[status]}</strong>
            <p>{status === 'Cancelled' ? 'Refunded demo orders are tracked here.' : `Orders marked ${status.toLowerCase()}.`}</p>
          </section>
        ))}
      </div>

      {ordered.length ? (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {ordered.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.orderNumber}</strong>
                      <p>{order.id}</p>
                    </td>
                    <td>
                      <strong>{order.customerName}</strong>
                      <p>{order.customerEmail}</p>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      <select
                        className="admin-status-select"
                        value={order.status}
                        onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                        aria-label={`Update status for ${order.orderNumber}`}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className="status-badge">{order.paymentStatus}</span>
                    </td>
                    <td>{Array.isArray(order.items) ? order.items.length : 0}</td>
                    <td>${Number(order.total ?? 0).toFixed(2)}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => setSelectedOrderId(order.id)}
                        >
                          View Details
                        </button>
                        <Link to={`/order-confirmation/${order.id}`} className="text-button">
                          Receipt
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-record-list admin-order-cards">
            {ordered.map((order) => (
              <article key={order.id} className="admin-record-card">
                <div className="admin-record-row">
                  <div className="admin-record-meta">
                    <strong>{order.orderNumber}</strong>
                    <span>{order.customerName}</span>
                    <span>{order.customerEmail}</span>
                  </div>
                  <span className="status-badge">{order.paymentStatus}</span>
                </div>

                <div className="admin-record-row">
                  <div className="admin-record-meta">
                    <span>{formatDate(order.createdAt)}</span>
                    <strong>${Number(order.total ?? 0).toFixed(2)}</strong>
                  </div>
                  <select
                    className="admin-status-select"
                    value={order.status}
                    onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                    aria-label={`Update status for ${order.orderNumber}`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="order-mini-items">
                  {(Array.isArray(order.items) ? order.items : []).slice(0, 3).map((item) => (
                    <div key={item.key} className="order-mini-item">
                      <ShopOraImage
                        src={getOrderItemImage(item)}
                        alt={item.name || 'Order item'}
                        className="order-mini-item-image"
                        fallbackText="ShopOra"
                      />
                      <div className="admin-record-meta">
                        <strong>{item.name}</strong>
                        <span>
                          Qty {item.quantity}
                          {item.size ? ` · ${item.size}` : ''}
                          {item.color ? ` · ${item.color}` : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="admin-record-row">
                  <span className="status-badge">{order.status}</span>
                  <div className="admin-row-actions">
                    <button
                      type="button"
                      className="btn btn-ghost btn-small"
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      View Details
                    </button>
                    <Link to={`/order-confirmation/${order.id}`} className="btn btn-outline btn-small">
                      Receipt
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="admin-empty-state">
          <h2>Demo orders only</h2>
          <p>
            This storefront does not have a backend order pipeline yet. Completed demo checkouts
            will appear here once a customer places one.
          </p>
          <Link to="/checkout" className="btn btn-dark">
            View checkout
          </Link>
        </div>
      )}

      {selectedOrder ? (
        <div
          className="admin-order-modal-overlay"
          role="presentation"
          onClick={() => setSelectedOrderId(null)}
        >
          <div
            className="admin-order-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-order-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-order-modal-header">
              <div>
                <p className="eyebrow">Order details</p>
                <h2 id="admin-order-modal-title">{selectedOrder.orderNumber}</h2>
              </div>
              <button
                type="button"
                className="admin-order-modal-close"
                aria-label="Close order details"
                onClick={() => setSelectedOrderId(null)}
              >
                ×
              </button>
            </div>

            <div className="admin-order-modal-grid">
              <section className="admin-order-modal-panel">
                <h3>Order info</h3>
                <p>
                  <strong>Date:</strong> {formatDateTime(selectedOrder.createdAt)}
                </p>
                <p>
                  <strong>Updated:</strong> {formatDateTime(selectedOrder.updatedAt)}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`status-badge ${getStatusClass(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </p>
                <p>
                  <strong>Payment:</strong> <span className="status-badge">{selectedOrder.paymentStatus}</span>
                </p>
                <p>
                  <strong>Demo mode:</strong> This is a frontend-only demo order.
                </p>
              </section>

              <section className="admin-order-modal-panel">
                <h3>Customer</h3>
                <p>{selectedOrder.customerName}</p>
                <p>{selectedOrder.customerEmail}</p>
                {selectedOrder.customerPhone ? <p>{selectedOrder.customerPhone}</p> : null}
              </section>

              <section className="admin-order-modal-panel">
                <h3>Shipping address</h3>
                {formatAddress(selectedOrder.shippingAddress).map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </section>

              <section className="admin-order-modal-panel">
                <h3>Totals</h3>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <strong>${selectedOrder.subtotal.toFixed(2)}</strong>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <strong>{selectedOrder.shipping === 0 ? 'Free' : `$${selectedOrder.shipping.toFixed(2)}`}</strong>
                </div>
                <div className="summary-row">
                  <span>Tax</span>
                  <strong>${selectedOrder.tax.toFixed(2)}</strong>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <strong>${selectedOrder.total.toFixed(2)}</strong>
                </div>
              </section>
            </div>

            <section className="admin-order-modal-panel">
              <h3>Items</h3>
              <div className="admin-order-modal-items">
                {selectedOrder.items.map((item) => (
                  <OrderItemRow key={item.key} item={item} />
                ))}
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
