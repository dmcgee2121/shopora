import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ShopOraImage from '../../components/ShopOraImage';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrdersContext';
import { idsMatch } from '../../utils/idUtils';
import { getOrderItemImage } from '../../utils/orderItemUtils';
import {
  getOrderStatusClass,
  getOrderStatusLabel,
  getPaymentStatusLabel,
  normalizeOrderStatusValue,
} from '../../utils/statusUtils';

const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const statusCopy = {
  Pending: 'Orders awaiting action.',
  Processing: 'Orders being prepared.',
  Shipped: 'Orders in transit.',
  Delivered: 'Orders completed.',
  Cancelled: 'Orders stopped before completion.',
};

const fulfillmentStatuses = new Set(['pending', 'processing', 'shipped']);

function safeText(value, fallback = '-') {
  const text = typeof value === 'string' ? value.trim() : '';
  return text || fallback;
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
    return safeText(value, 'Date unavailable');
  }
}

function formatDateTime(value) {
  if (!value) return 'Not available';

  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return safeText(value, 'Not available');
  }
}

function formatMoney(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : '-';
}

function formatAddress(address = {}) {
  return [
    [address.firstName, address.lastName].filter(Boolean).join(' '),
    address.street,
    [address.city, address.state, address.zip].filter(Boolean).join(', '),
  ].filter(Boolean);
}

function getOrderItemCount(order) {
  return Array.isArray(order?.items) ? order.items.length : 0;
}

function getCustomerSummary(order) {
  return {
    name: safeText(order?.customerName, 'Guest customer'),
    email: safeText(order?.customerEmail, 'No email provided'),
  };
}

function getPaymentBadgeClass(paymentStatus, demoMode) {
  const label = getPaymentStatusLabel(paymentStatus, { demoMode }).toLowerCase();

  if (label.includes('paid') || label === 'demo order') return 'stock-in';
  if (label.includes('pending')) return 'stock-low';
  if (label.includes('failed') || label.includes('expired') || label.includes('canceled')) return 'stock-out';
  return '';
}

function getOrderStatusOptionValue(status) {
  const normalized = normalizeOrderStatusValue(status);
  return statusOptions.find((option) => normalizeOrderStatusValue(option) === normalized) ?? 'Pending';
}

function getOrderSourceLabel(ordersSource) {
  return ordersSource === 'supabase' ? 'Live Supabase order' : 'Local demo order';
}

function OrderItemRow({ item }) {
  const image = getOrderItemImage(item);
  const quantity = Number(item?.quantity ?? 0);
  const unitPrice = Number(item?.unitPrice ?? 0);

  return (
    <div className="admin-order-item-row">
      <ShopOraImage
        src={image}
        alt={safeText(item?.name, 'Order item')}
        className="admin-order-item-image"
        fallbackText="ShopOra"
      />
      <div className="admin-order-item-copy">
        <strong>{safeText(item?.name, 'Unnamed item')}</strong>
        <p>
          Qty {quantity}
          {item?.size ? ` | Size ${item.size}` : ''}
          {item?.color ? ` | ${item.color}` : ''}
        </p>
      </div>
      <strong className="admin-order-item-total">{formatMoney(unitPrice * quantity)}</strong>
    </div>
  );
}

export default function AdminOrdersPage() {
  const { orders, ordersSource, updateOrderStatus, isOrdersLoading, ordersError } = useOrders();
  const { currentUser } = useAuth();
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const orderSourceNote =
    currentUser?.role === 'admin'
      ? ordersSource === 'supabase'
        ? 'This admin order list is reading live Supabase orders through the protected admin RPC. Status updates remain local-demo only for now.'
        : 'This prototype admin order list is reading browser-local demo orders only. Supabase customer orders stay visible in customer accounts, but they are not exposed to this local admin login.'
      : '';
  const canUpdateOrderStatus = ordersSource === 'local';
  const ordersSubtitle =
    ordersSource === 'supabase'
      ? 'Review live Supabase orders and open receipts without leaving the admin area.'
      : 'Review completed orders, update status, and open receipts without leaving the admin area.';

  const ordered = useMemo(
    () =>
      [...orders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [orders],
  );

  const filteredOrders = useMemo(() => {
    const term = query.trim().toLowerCase();

    return ordered.filter((order) => {
      const statusMatches = statusFilter === 'all' || normalizeOrderStatusValue(order.status) === normalizeOrderStatusValue(statusFilter);
      const searchable = [
        order.orderNumber,
        order.customerName,
        order.customerEmail,
        order.paymentStatus,
        order.status,
      ]
        .join(' ')
        .toLowerCase();

      return statusMatches && (!term || searchable.includes(term));
    });
  }, [ordered, query, statusFilter]);

  const selectedOrder = ordered.find((order) => idsMatch(order.id, selectedOrderId)) ?? null;

  const counts = statusOptions.reduce((result, status) => {
    result[status] = ordered.filter(
      (order) => normalizeOrderStatusValue(order.status) === normalizeOrderStatusValue(status),
    ).length;
    return result;
  }, {});

  const pendingOrders = counts.Pending;
  const processingOrders = counts.Processing;
  const shippedOrders = counts.Shipped;
  const deliveredOrders = counts.Delivered;
  const cancelledOrders = counts.Cancelled;
  const activeFulfillmentOrders = ordered.filter((order) =>
    fulfillmentStatuses.has(normalizeOrderStatusValue(order.status)),
  ).length;
  const totalRevenue = ordered.reduce((total, order) => total + Number(order.total ?? 0), 0);
  const sourceLabel = ordersSource === 'supabase' ? 'Live Supabase orders' : 'Local demo orders';

  const hasOrders = ordered.length > 0;
  const hasFilters = Boolean(query.trim() || statusFilter !== 'all');
  const hasFilteredOrders = filteredOrders.length > 0;
  const shouldShowLoadingState = isOrdersLoading && !hasOrders;

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
        subtitle={ordersSubtitle}
        actionLabel="View Checkout"
        actionTo="/checkout"
        actionClassName="btn btn-dark"
      />

      {orderSourceNote ? (
        <div className="admin-notice admin-catalog-error" role="note">
          <p>{orderSourceNote}</p>
        </div>
      ) : null}

      <div className="admin-status-grid">
        <div className="admin-status-card">
          <span>Total orders</span>
          <strong>{ordered.length}</strong>
          <p>{sourceLabel} currently visible in this session.</p>
        </div>
        <div className="admin-status-card">
          <span>Pending</span>
          <strong>{pendingOrders}</strong>
          <p>{statusCopy.Pending}</p>
        </div>
        <div className="admin-status-card">
          <span>Processing</span>
          <strong>{processingOrders}</strong>
          <p>{statusCopy.Processing}</p>
        </div>
        <div className="admin-status-card">
          <span>Fulfillment flow</span>
          <strong>{activeFulfillmentOrders}</strong>
          <p>
            Pending, processing, and shipped orders in motion. {shippedOrders} shipped orders are currently
            active.
          </p>
        </div>
        <div className="admin-status-card">
          <span>Delivered / Cancelled</span>
          <strong>
            {deliveredOrders}/{cancelledOrders}
          </strong>
          <p>Completed versus stopped orders.</p>
        </div>
        <div className="admin-status-card">
          <span>Total revenue</span>
          <strong>{formatMoney(totalRevenue)}</strong>
          <p>Gross order value across the current result set.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <input
            className="admin-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search order number, customer, email, or status"
            aria-label="Search orders"
          />

          <select
            className="admin-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by order status"
          >
            <option value="all">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-toolbar-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setQuery('');
              setStatusFilter('all');
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="admin-status-grid">
        {statusOptions.map((status) => (
          <section key={status} className="admin-status-card">
            <span>{status}</span>
            <strong>{counts[status]}</strong>
            <p>{statusCopy[status]}</p>
          </section>
        ))}
      </div>

      {ordersError ? (
        <div className="admin-catalog-error" role="alert">
          {ordersSource === 'supabase'
            ? 'Supabase orders could not be loaded right now. Refresh the page and verify the admin RPC and permissions.'
            : 'Orders could not be loaded right now. Refresh the page and try again.'}
        </div>
      ) : null}

      {shouldShowLoadingState ? (
        <div className="admin-empty-state" aria-live="polite">
          <h2>Loading orders...</h2>
          <p>
            {ordersSource === 'supabase'
              ? 'Retrieving the latest live Supabase orders for this admin view.'
              : 'Retrieving the latest local demo orders for this admin view.'}
          </p>
        </div>
      ) : hasOrders ? (
        hasFilteredOrders ? (
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
                  {filteredOrders.map((order) => {
                    const customer = getCustomerSummary(order);
                    const orderStatusLabel = getOrderStatusLabel(order.status);
                    const paymentLabel = getPaymentStatusLabel(order.paymentStatus, { demoMode: order.demoMode });
                    const orderStatusClass = getOrderStatusClass(order.status);
                    const paymentClass = getPaymentBadgeClass(order.paymentStatus, order.demoMode);

                    return (
                      <tr key={order.id}>
                    <td>
                      <strong>{safeText(order.orderNumber, 'Order')}</strong>
                      <p>{safeText(order.id, 'No order id')}</p>
                      <p className="admin-order-source-label">{getOrderSourceLabel(ordersSource)}</p>
                    </td>
                        <td>
                          <strong>{customer.name}</strong>
                          <p>{customer.email}</p>
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>
                          <select
                            className="admin-status-select"
                            value={getOrderStatusOptionValue(order.status)}
                            onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                            disabled={!canUpdateOrderStatus}
                            aria-label={`Update status for ${safeText(order.orderNumber, 'this order')}`}
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          <div className="admin-status-subtext">
                            {canUpdateOrderStatus
                              ? orderStatusLabel || 'No status available'
                              : 'Read-only for live Supabase orders.'}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${paymentClass}`.trim()}>{paymentLabel}</span>
                        </td>
                        <td>{getOrderItemCount(order)}</td>
                        <td>{formatMoney(order.total)}</td>
                        <td>
                          <div className="admin-row-actions">
                            <button
                              type="button"
                              className="text-button"
                              onClick={() => setSelectedOrderId(order.id)}
                            >
                              Quick view
                            </button>
                            <Link to={`/order-confirmation/${order.id}`} className="text-button">
                              Open receipt
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="admin-record-list admin-order-cards">
              {filteredOrders.map((order) => {
                const customer = getCustomerSummary(order);
                const orderStatusLabel = getOrderStatusLabel(order.status);
                const paymentLabel = getPaymentStatusLabel(order.paymentStatus, { demoMode: order.demoMode });
                const orderStatusClass = getOrderStatusClass(order.status);
                const paymentClass = getPaymentBadgeClass(order.paymentStatus, order.demoMode);
                const items = Array.isArray(order.items) ? order.items : [];

                return (
                  <article key={order.id} className="admin-record-card">
                    <div className="admin-record-row">
                      <div className="admin-record-meta">
                        <strong>{safeText(order.orderNumber, 'Order')}</strong>
                        <span>{customer.name}</span>
                        <span>{customer.email}</span>
                        <span className="admin-order-source-label">
                          {getOrderSourceLabel(ordersSource)}
                        </span>
                      </div>
                      <span className={`status-badge ${paymentClass}`.trim()}>{paymentLabel}</span>
                    </div>

                    <div className="admin-record-row">
                      <div className="admin-record-meta">
                        <span>{formatDate(order.createdAt)}</span>
                        <strong>{formatMoney(order.total)}</strong>
                        <span>
                          {getOrderItemCount(order)} item{getOrderItemCount(order) === 1 ? '' : 's'}
                        </span>
                      </div>
                      <select
                        className="admin-status-select"
                        value={getOrderStatusOptionValue(order.status)}
                        onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                        disabled={!canUpdateOrderStatus}
                        aria-label={`Update status for ${safeText(order.orderNumber, 'this order')}`}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="order-mini-items">
                      {items.slice(0, 3).map((item) => (
                        <div key={item.key} className="order-mini-item">
                          <ShopOraImage
                            src={getOrderItemImage(item)}
                            alt={safeText(item?.name, 'Order item')}
                            className="order-mini-item-image"
                            fallbackText="ShopOra"
                          />
                          <div className="admin-record-meta">
                            <strong>{safeText(item?.name, 'Unnamed item')}</strong>
                            <span>
                              Qty {Number(item?.quantity ?? 0)}
                              {item?.size ? ` | ${item.size}` : ''}
                              {item?.color ? ` | ${item.color}` : ''}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="admin-record-row">
                      <span className={`status-badge ${orderStatusClass}`.trim()}>{orderStatusLabel}</span>
                      {!canUpdateOrderStatus ? (
                        <span className="admin-status-subtext">Read-only for live Supabase orders.</span>
                      ) : null}
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="btn btn-ghost btn-small"
                          onClick={() => setSelectedOrderId(order.id)}
                        >
                          Quick view
                        </button>
                        <Link to={`/order-confirmation/${order.id}`} className="btn btn-outline btn-small">
                          Open receipt
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <div className="admin-empty-state">
            <h2>No matching orders.</h2>
            <p>Try a different order number, customer name, email, or status filter.</p>
            <div className="admin-empty-state-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setQuery('');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )
      ) : (
        <div className="admin-empty-state">
          <h2>{hasFilters ? 'No matching orders.' : 'No orders yet.'}</h2>
              <p>
                {hasFilters
                  ? 'Try a different order number, customer name, email, or status filter.'
                  : ordersSource === 'supabase'
                    ? 'Live Supabase customer orders appear here when the admin session is connected to the protected admin RPC.'
                    : currentUser?.role === 'admin'
                      ? 'This admin view only reflects browser-local demo orders. Supabase customer orders are not exposed here yet.'
                      : 'Completed checkouts will appear here once a customer places an order.'}
              </p>
          <div className="admin-empty-state-actions">
            {hasFilters ? (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setQuery('');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </button>
            ) : null}
            <Link to="/checkout" className="btn btn-dark">
              View checkout
            </Link>
          </div>
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
                <h2 id="admin-order-modal-title">{safeText(selectedOrder.orderNumber, 'Order details')}</h2>
              </div>
              <button
                type="button"
                className="admin-order-modal-close"
                aria-label="Close order details"
                onClick={() => setSelectedOrderId(null)}
              >
                x
              </button>
            </div>

            <div className="admin-order-modal-grid">
              <section className="admin-order-modal-panel">
                <h3>Order summary</h3>
                <p>
                  <strong>Order number:</strong> {safeText(selectedOrder.orderNumber, 'Order')}
                </p>
                <p>
                  <strong>Date:</strong> {formatDateTime(selectedOrder.createdAt)}
                </p>
                <p>
                  <strong>Updated:</strong> {formatDateTime(selectedOrder.updatedAt)}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`status-badge ${getOrderStatusClass(selectedOrder.status)}`}>
                    {getOrderStatusLabel(selectedOrder.status)}
                  </span>
                </p>
                <p>
                  <strong>Payment:</strong>{' '}
                  <span
                    className={`status-badge ${getPaymentBadgeClass(
                      selectedOrder.paymentStatus,
                      selectedOrder.demoMode,
                    )}`.trim()}
                  >
                    {getPaymentStatusLabel(selectedOrder.paymentStatus, { demoMode: selectedOrder.demoMode })}
                  </span>
                </p>
                <p>
                  <strong>Items:</strong> {getOrderItemCount(selectedOrder)}
                </p>
                <p className="admin-order-source-label">
                  {getOrderSourceLabel(ordersSource)}
                </p>
                <p className="admin-status-subtext">
                  {ordersSource === 'supabase'
                    ? 'Live Supabase orders are visible here. Status updates remain read-only until backend support is added.'
                    : 'Local demo orders can be updated from this admin view.'}
                </p>
              </section>

              <section className="admin-order-modal-panel">
                <h3>Customer</h3>
                <p>{safeText(selectedOrder.customerName, 'Guest customer')}</p>
                <p>{safeText(selectedOrder.customerEmail, 'No email provided')}</p>
                {selectedOrder.customerPhone ? (
                  <p>{selectedOrder.customerPhone}</p>
                ) : (
                  <p>No phone number provided.</p>
                )}
              </section>

              <section className="admin-order-modal-panel">
                <h3>Shipping address</h3>
                {formatAddress(selectedOrder.shippingAddress).length ? (
                  formatAddress(selectedOrder.shippingAddress).map((line) => <p key={line}>{line}</p>)
                ) : (
                  <p>No shipping address provided.</p>
                )}
              </section>

              <section className="admin-order-modal-panel">
                <h3>Fulfillment summary</h3>
                <p>
                  <strong>Current status:</strong>{' '}
                  <span className={`status-badge ${getOrderStatusClass(selectedOrder.status)}`}>
                    {getOrderStatusLabel(selectedOrder.status)}
                  </span>
                </p>
                <p>
                  <strong>Payment state:</strong>{' '}
                  <span
                    className={`status-badge ${getPaymentBadgeClass(
                      selectedOrder.paymentStatus,
                      selectedOrder.demoMode,
                    )}`.trim()}
                  >
                    {getPaymentStatusLabel(selectedOrder.paymentStatus, { demoMode: selectedOrder.demoMode })}
                  </span>
                </p>
                <p>
                  <strong>Order source:</strong> {getOrderSourceLabel(ordersSource)}
                </p>
                <p>
                  <strong>Receipt:</strong>{' '}
                  <Link to={`/order-confirmation/${selectedOrder.id}`} className="text-button">
                    Open receipt
                  </Link>
                </p>
                <p className="admin-status-subtext">
                  Use the status summary above to confirm what needs fulfillment attention next.
                </p>
              </section>

              <section className="admin-order-modal-panel">
                <h3>Totals</h3>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <strong>{formatMoney(selectedOrder.subtotal)}</strong>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <strong>{Number(selectedOrder.shipping ?? 0) === 0 ? 'Free' : formatMoney(selectedOrder.shipping)}</strong>
                </div>
                <div className="summary-row">
                  <span>Tax</span>
                  <strong>{formatMoney(selectedOrder.tax)}</strong>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <strong>{formatMoney(selectedOrder.total)}</strong>
                </div>
              </section>

              <section className="admin-order-modal-panel">
                <h3>Support</h3>
                <p>
                  <strong>Customer help:</strong> Use the contact page for shipping, return, and order questions.
                </p>
                <p>
                  <strong>Support link:</strong>{' '}
                  <Link to="/contact" className="text-button">
                    Open contact page
                  </Link>
                </p>
                <p>
                  <strong>Receipt link:</strong>{' '}
                  <Link to={`/order-confirmation/${selectedOrder.id}`} className="text-button">
                    Open receipt
                  </Link>
                </p>
                <p>
                  <strong>Storefront order number:</strong> {safeText(selectedOrder.orderNumber, 'Order')}
                </p>
                <p className="admin-status-subtext">
                  Keep the order number handy when following up with support or fulfillment.
                </p>
              </section>
            </div>

            <section className="admin-order-modal-panel">
              <h3>Items</h3>
              {Array.isArray(selectedOrder.items) && selectedOrder.items.length ? (
                <div className="admin-order-modal-items">
                  {selectedOrder.items.map((item) => (
                    <OrderItemRow key={item.key} item={item} />
                  ))}
                </div>
              ) : (
                <p>No items available for this order.</p>
              )}
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
