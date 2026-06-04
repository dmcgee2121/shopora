import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ShopOraImage from '../../components/ShopOraImage';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrdersContext';
import { getOrderAttentionInfo, getOrderOperationsSummary } from '../../utils/catalogReadiness';
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
  Processing: 'Orders currently being prepared.',
  Shipped: 'Orders in transit.',
  Delivered: 'Orders completed.',
  Cancelled: 'Orders stopped before completion.',
};

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

function isOrderRecent(order) {
  const createdAt = new Date(order?.createdAt).getTime();
  if (!Number.isFinite(createdAt)) return false;

  return Date.now() - createdAt <= 24 * 60 * 60 * 1000;
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

function getContactContextLines(order) {
  if (!order) return [];

  const lines = [
    safeText(order.customerName, 'Guest customer'),
    safeText(order.customerEmail, 'No email provided'),
  ];

  if (order.customerPhone) {
    lines.push(order.customerPhone);
  } else {
    lines.push('No phone number provided.');
  }

  const shippingLines = formatAddress(order.shippingAddress);
  if (shippingLines.length) {
    lines.push(...shippingLines);
  } else {
    lines.push('No shipping address provided.');
  }

  return lines;
}

function getOwnerViewMatchesOrder(order, ownerView) {
  if (ownerView === 'all') return true;

  const attention = getOrderAttentionInfo(order);
  const status = normalizeOrderStatusValue(order.status);

  if (ownerView === 'needs-action') return attention.needsAction;
  if (ownerView === 'processing') return status === 'processing';
  if (ownerView === 'payment-pending') return attention.key === 'payment-pending';
  if (ownerView === 'recent') return isOrderRecent(order);

  return true;
}

function getFulfillmentReadiness(order, attention) {
  if (!order) {
    return {
      label: 'No order selected',
      detail: 'Open a quick view to inspect fulfillment readiness.',
    };
  }

  switch (attention?.key) {
    case 'customer-info':
      return {
        label: 'Hold for customer review',
        detail: 'Missing customer or shipping data should be checked before fulfillment can move forward.',
      };
    case 'payment-pending':
      return {
        label: 'Await payment clearance',
        detail: 'Payment is still pending, so the order should stay in a waiting state.',
      };
    case 'ready-to-process':
      return {
        label: 'Ready to pick and pack',
        detail: 'Payment is complete and the order can move into the packing queue.',
      };
    case 'needs-fulfillment':
      return {
        label: 'In fulfillment',
        detail: 'The order is already being prepared and should stay on the active packing list.',
      };
    case 'shipped-complete':
      return {
        label: 'Post-shipment review',
        detail: 'The order is shipped or complete and only needs lightweight follow-up.',
      };
    case 'cancelled-refunded':
      return {
        label: 'Closed order',
        detail: 'No fulfillment action is expected for a cancelled or refunded order.',
      };
    default:
      return {
        label: 'Review before action',
        detail: 'Scan the order details and confirm the next operational step.',
      };
  }
}

function getNextOperationalStep(order, attention) {
  if (!order) {
    return 'No order is selected yet.';
  }

  switch (attention?.key) {
    case 'customer-info':
      return 'Confirm the shipping snapshot and contact details before the order enters fulfillment.';
    case 'payment-pending':
      return 'Wait for payment to clear, then revisit the order queue.';
    case 'ready-to-process':
      return 'Move the order into the packing queue.';
    case 'needs-fulfillment':
      return 'Continue packing and preparing the order.';
    case 'shipped-complete':
      return 'Use the receipt and support links only for customer follow-up.';
    case 'cancelled-refunded':
      return 'Leave the order closed unless customer support needs context.';
    default:
      return 'Review the order details and confirm the next step for the team.';
  }
}

function getDetailBannerLabels(order, attention, ordersSource) {
  if (!order) return [];

  return [
    getOrderSourceLabel(ordersSource),
    getOrderStatusLabel(order.status) || 'No status available',
    getPaymentStatusLabel(order.paymentStatus, { demoMode: order.demoMode }),
    attention?.label ?? 'No attention flag',
  ];
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

function OrderQueueCard({ order, attention, ordersSource, onOpen }) {
  const customer = getCustomerSummary(order);
  const paymentLabel = getPaymentStatusLabel(order.paymentStatus, { demoMode: order.demoMode });
  const paymentClass = getPaymentBadgeClass(order.paymentStatus, order.demoMode);

  return (
    <article className="admin-work-queue-card">
      <div className="admin-work-queue-card-head">
        <div>
          <strong>{safeText(order.orderNumber, 'Order')}</strong>
          <p>
            {customer.name}
            {' • '}
            {customer.email}
          </p>
        </div>
        <span className={`status-badge ${attention.tone}`.trim()}>{attention.label}</span>
      </div>

      <div className="admin-work-queue-card-meta">
        <span className={`status-badge ${getOrderStatusClass(order.status)}`.trim()}>
          {getOrderStatusLabel(order.status)}
        </span>
        <span className={`status-badge ${paymentClass}`.trim()}>{paymentLabel}</span>
        <span className="admin-table-subtle">
          {formatMoney(order.total)} | {getOrderItemCount(order)} item{getOrderItemCount(order) === 1 ? '' : 's'} | {formatDate(order.createdAt)}
        </span>
      </div>

      <p>{attention.detail}</p>

      <div className="admin-work-queue-card-actions">
        <button type="button" className="text-button" onClick={onOpen}>
          Quick view
        </button>
        <Link to={`/order-confirmation/${order.id}`} className="text-button">
          Open receipt
        </Link>
        <span className="admin-table-subtle">{getOrderSourceLabel(ordersSource)}</span>
      </div>
    </article>
  );
}

export default function AdminOrdersPage() {
  const { orders, ordersSource, updateOrderStatus, isOrdersLoading, ordersError } = useOrders();
  const { currentUser } = useAuth();
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ownerView, setOwnerView] = useState('needs-action');
  const orderSourceNote =
    currentUser?.role === 'admin'
      ? ordersSource === 'supabase'
        ? 'Live Supabase orders are visible here, but status updates remain read-only in this release.'
        : 'This view is reading local demo orders in this mode. Status changes stay local-only.'
      : '';
  const canUpdateOrderStatus = ordersSource === 'local';

  const ordered = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders],
  );
  const operationsSummary = useMemo(() => getOrderOperationsSummary(ordered), [ordered]);

  const filteredOrders = useMemo(() => {
    const term = query.trim().toLowerCase();

    return ordered.filter((order) => {
      const statusMatches = statusFilter === 'all' || normalizeOrderStatusValue(order.status) === normalizeOrderStatusValue(statusFilter);
      const ownerViewMatches = getOwnerViewMatchesOrder(order, ownerView);
      const searchable = [
        order.orderNumber,
        order.customerName,
        order.customerEmail,
        order.paymentStatus,
        order.status,
      ]
        .join(' ')
        .toLowerCase();

      return ownerViewMatches && statusMatches && (!term || searchable.includes(term));
    });
  }, [ordered, ownerView, query, statusFilter]);

  const selectedOrder = ordered.find((order) => idsMatch(order.id, selectedOrderId)) ?? null;
  const selectedOrderAttention = selectedOrder ? getOrderAttentionInfo(selectedOrder) : null;
  const selectedOrderDetailBannerLabels = selectedOrder
    ? getDetailBannerLabels(selectedOrder, selectedOrderAttention, ordersSource)
    : [];

  const counts = useMemo(
    () =>
      statusOptions.reduce((result, status) => {
        result[status] = ordered.filter(
          (order) => normalizeOrderStatusValue(order.status) === normalizeOrderStatusValue(status),
        ).length;
        return result;
      }, {}),
    [ordered],
  );

  const orderWorkQueue = useMemo(() => {
    return operationsSummary.attentionOrders
      .slice()
      .sort((left, right) => {
        if (right.attention.priority !== left.attention.priority) {
          return right.attention.priority - left.attention.priority;
        }

        return new Date(right.order.createdAt).getTime() - new Date(left.order.createdAt).getTime();
      })
      .slice(0, 5);
  }, [operationsSummary.attentionOrders]);

  const totalRevenue = ordered.reduce((total, order) => total + Number(order.total ?? 0), 0);
  const shippedFulfilled = operationsSummary.shippedOrders;
  const pendingOrders = counts.Pending ?? 0;
  const processingOrders = counts.Processing ?? 0;
  const recentOrders = operationsSummary.recentlyPlacedOrders;
  const ownerViews = [
    { key: 'needs-action', label: 'Needs action', count: operationsSummary.ordersNeedingAttention },
    { key: 'processing', label: 'Processing', count: processingOrders },
    { key: 'payment-pending', label: 'Payment pending', count: operationsSummary.paymentPendingOrders },
    { key: 'recent', label: 'Recent', count: recentOrders },
  ];

  const hasOrders = ordered.length > 0;
  const hasFilters = Boolean(query.trim() || statusFilter !== 'all' || ownerView !== 'needs-action');
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
        subtitle="Track customer orders and see what needs action."
        actions={(
          <>
            <button
              type="button"
              className="btn btn-dark"
              onClick={() => {
                setOwnerView('all');
                setStatusFilter('Pending');
              }}
            >
              Review pending
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setOwnerView('processing');
                setStatusFilter('all');
              }}
            >
              View processing
            </button>
            <Link to="/" className="btn btn-outline">
              Open storefront
            </Link>
          </>
        )}
      />

      {orderSourceNote ? (
        <div className="admin-notice admin-catalog-error" role="note">
          <p>{orderSourceNote}</p>
        </div>
      ) : null}

      <section className="admin-owner-workbench-panel">
        <div className="admin-owner-workbench-main">
          <div className="admin-dashboard-section-heading">
            <span>Order snapshot</span>
            <p>Start with the orders waiting on a customer, payment, or fulfillment step.</p>
          </div>

          <div className="admin-status-grid admin-owner-summary-grid">
            <div className="admin-status-card">
              <span>Need action</span>
              <strong>{operationsSummary.ordersNeedingAttention}</strong>
              <p>Orders that should be reviewed first.</p>
            </div>
            <div className="admin-status-card">
              <span>Pending orders</span>
              <strong>{pendingOrders}</strong>
              <p>Orders waiting for the next step.</p>
            </div>
            <div className="admin-status-card">
              <span>Processing</span>
              <strong>{processingOrders}</strong>
              <p>Orders already in the packing queue.</p>
            </div>
            <div className="admin-status-card">
              <span>Payment pending</span>
              <strong>{operationsSummary.paymentPendingOrders}</strong>
              <p>Orders waiting for payment clearance.</p>
            </div>
          </div>
        </div>

        <aside className="admin-owner-workbench-side admin-dashboard-panel">
          <div className="admin-dashboard-section-heading compact">
            <span>Work queue</span>
            <p>The next five orders most likely to need owner attention.</p>
          </div>

          {orderWorkQueue.length ? (
            <div className="admin-work-queue-list">
              {orderWorkQueue.map(({ order, attention }) => (
                <OrderQueueCard
                  key={order.id}
                  order={order}
                  attention={attention}
                  ordersSource={ordersSource}
                  onOpen={() => setSelectedOrderId(order.id)}
                />
              ))}
            </div>
          ) : (
            <div className="admin-empty-state-tight">
              <h3>Queue looks clear.</h3>
              <p>No orders are currently flagged for owner attention.</p>
            </div>
          )}
        </aside>
      </section>

      <section className="admin-dashboard-panel">
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
              onChange={(event) => {
                setOwnerView('all');
                setStatusFilter(event.target.value);
              }}
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
                setOwnerView('needs-action');
              }}
            >
              Clear filters
            </button>
            <Link to="/" className="btn btn-outline">
              Open storefront
            </Link>
          </div>
        </div>

        <div className="admin-status-chip-row">
          {ownerViews.map((view) => (
            <button
              key={view.key}
              type="button"
              className={`admin-status-chip ${ownerView === view.key ? 'is-active' : ''}`}
              onClick={() => {
                setOwnerView(view.key);
                setStatusFilter('all');
              }}
            >
              <span>{view.label}</span>
              <strong>{view.count}</strong>
            </button>
          ))}
          {statusOptions.map((status) => (
            <button
              key={status}
              type="button"
              className={`admin-status-chip ${statusFilter === status ? 'is-active' : ''}`}
              onClick={() => {
                setOwnerView('all');
                setStatusFilter(status);
              }}
            >
              <span>{status}</span>
              <strong>{counts[status] ?? 0}</strong>
            </button>
          ))}
          <div className="admin-status-chip total">
            <span>Shipped / fulfilled</span>
            <strong>{shippedFulfilled}</strong>
          </div>
          <div className="admin-status-chip total">
            <span>Total revenue</span>
            <strong>{formatMoney(totalRevenue)}</strong>
          </div>
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
                <table className="admin-table admin-owner-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Items</th>
                      <th>Status</th>
                      <th>Payment</th>
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
                            <div className="admin-status-stack">
                              <strong className="admin-order-ref">{safeText(order.orderNumber, 'Order')}</strong>
                            </div>
                          </td>
                          <td>
                            <div className="admin-status-stack">
                              <strong>{customer.name}</strong>
                              <span className="admin-table-subtle">{customer.email}</span>
                            </div>
                          </td>
                          <td>{formatDate(order.createdAt)}</td>
                          <td>
                            <strong>{formatMoney(order.total)}</strong>
                          </td>
                          <td>{getOrderItemCount(order)}</td>
                          <td>
                            <div className="admin-status-stack">
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
                              <span className={`status-badge ${orderStatusClass}`.trim()}>{orderStatusLabel}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${paymentClass}`.trim()}>{paymentLabel}</span>
                          </td>
                          <td>
                            <div className="admin-row-actions">
                              <button type="button" className="text-button" onClick={() => setSelectedOrderId(order.id)}>
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
                          <strong className="admin-order-ref">{safeText(order.orderNumber, 'Order')}</strong>
                          <span>{customer.name}</span>
                          <span>{customer.email}</span>
                        </div>
                        <div className="admin-status-stack">
                          <span className={`status-badge ${orderStatusClass}`.trim()}>{orderStatusLabel}</span>
                          <span className={`status-badge ${paymentClass}`.trim()}>{paymentLabel}</span>
                        </div>
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

                      <div className="admin-row-actions">
                        <button type="button" className="btn btn-ghost btn-small" onClick={() => setSelectedOrderId(order.id)}>
                          Quick view
                        </button>
                        <Link to={`/order-confirmation/${order.id}`} className="btn btn-outline btn-small">
                          Open receipt
                        </Link>
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
                    setOwnerView('needs-action');
                  }}
                >
                  Clear filters
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
                    ? 'Orders will appear here after checkout. This admin view is showing browser-local demo orders in this prototype.'
                    : 'Orders will appear here after checkout.'}
            </p>
            <div className="admin-empty-state-actions">
              {hasFilters ? (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setQuery('');
                    setStatusFilter('all');
                    setOwnerView('needs-action');
                  }}
                >
                  Clear filters
                </button>
              ) : null}
              <Link to="/" className="btn btn-ghost">
                Open storefront
              </Link>
              <Link to="/admin" className="btn btn-ghost">
                Open dashboard
              </Link>
              <Link to="/checkout" className="btn btn-dark">
                View checkout
              </Link>
            </div>
          </div>
        )}
      </section>

      {selectedOrder ? (
        <div className="admin-order-modal-overlay" role="presentation" onClick={() => setSelectedOrderId(null)}>
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

            <section className="admin-order-detail-banner" aria-label="Order detail summary">
              <div className="admin-order-detail-banner-copy">
                <span>Order detail</span>
                <p>Review status, payment, customer context, and the next operational step from one place.</p>
              </div>
              <div className="admin-order-detail-banner-meta">
                <strong>{safeText(selectedOrder.orderNumber, 'Order')}</strong>
                <span>Placed {formatDateTime(selectedOrder.createdAt)}</span>
                <span>Updated {formatDateTime(selectedOrder.updatedAt)}</span>
              </div>
              <div className="admin-order-detail-banner-badges">
                {selectedOrderDetailBannerLabels.map((label, index) => (
                  <span key={`${label}-${index}`} className="status-badge status-badge-muted">
                    {label}
                  </span>
                ))}
              </div>
            </section>

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
                <p className="admin-order-source-label">{getOrderSourceLabel(ordersSource)}</p>
                <p className="admin-status-subtext">
                  {ordersSource === 'supabase'
                    ? 'Live Supabase orders are visible here. Status updates remain read-only until backend support is added.'
                    : 'Local demo orders can be updated in browser storage only. This does not affect a live order system.'}
                </p>
              </section>

              <section className="admin-order-modal-panel">
                <h3>Customer contact context</h3>
                {getContactContextLines(selectedOrder).map((line, index) => (
                  <p key={`${line}-${index}`}>{line}</p>
                ))}
              </section>

              <section className="admin-order-modal-panel">
                <h3>Fulfillment readiness</h3>
                <p>
                  <strong>Readiness:</strong> {getFulfillmentReadiness(selectedOrder, selectedOrderAttention).label}
                </p>
                <p>{getFulfillmentReadiness(selectedOrder, selectedOrderAttention).detail}</p>
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
                <p className="admin-status-subtext">{getNextOperationalStep(selectedOrder, selectedOrderAttention)}</p>
              </section>

              <section className="admin-order-modal-panel">
                <h3>Order attention</h3>
                <p>
                  <strong>Attention:</strong>{' '}
                  <span className={`status-badge ${selectedOrderAttention.tone}`.trim()}>
                    {selectedOrderAttention.label}
                  </span>
                </p>
                <p>{selectedOrderAttention.detail}</p>
                <p>
                  <strong>Notes:</strong> This page is for review. It does not add any new backend mutation path.
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
                <p className="admin-status-subtext">Keep the order number handy when following up with support or fulfillment.</p>
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
