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
  Processing: 'Orders being prepared.',
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
        detail: 'The order can be scanned for the next operational step without any live mutation.',
      };
  }
}

function getNextOperationalStep(order, attention) {
  if (!order) {
    return 'No order is selected yet.';
  }

  switch (attention?.key) {
    case 'customer-info':
      return 'Confirm the shipping snapshot and contact details before the order could enter fulfillment.';
    case 'payment-pending':
      return 'Wait for payment to clear, then revisit the order queue.';
    case 'ready-to-process':
      return 'Move the order into a future pick-and-pack workflow when live writes are available.';
    case 'needs-fulfillment':
      return 'Continue packing and preparing the order while keeping the admin view read-only.';
    case 'shipped-complete':
      return 'Use the receipt and support links only for customer follow-up or post-shipment review.';
    case 'cancelled-refunded':
      return 'Leave the order closed and use it as a prototype reference for non-active workflow states.';
    default:
      return 'Review the order details and confirm how a future live action should be staged.';
  }
}

function getPrototypeWorkflowFlags(order, attention) {
  if (!order) return [];

  return [
    order.demoMode ? 'Local simulation only' : 'Live order, read-only in UI',
    attention?.label ? attention.label : 'No attention flag',
    order.customerPhone ? 'Customer phone provided' : 'Phone missing',
    formatAddress(order.shippingAddress).length ? 'Shipping snapshot present' : 'Shipping snapshot missing',
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

export default function AdminOrdersPage() {
  const { orders, ordersSource, updateOrderStatus, isOrdersLoading, ordersError } = useOrders();
  const { currentUser } = useAuth();
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const orderSourceNote =
    currentUser?.role === 'admin'
      ? ordersSource === 'supabase'
        ? 'Prototype note: live Supabase orders are visible here, but status updates remain read-only until admin write support is added.'
        : 'Prototype note: this admin order list is reading browser-local demo orders only. Those local demo orders can be adjusted in browser storage.'
      : '';
  const canUpdateOrderStatus = ordersSource === 'local';
  const ordersSubtitle =
    ordersSource === 'supabase'
      ? 'Review live Supabase orders, spot fulfillment gaps, and open receipts while status changes remain read-only in this prototype.'
      : 'Review completed demo orders, simulate status changes locally, and open receipts without leaving the admin area.';

  const ordered = useMemo(
    () =>
      [...orders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [orders],
  );
  const operationsSummary = useMemo(() => getOrderOperationsSummary(ordered), [ordered]);
  const attentionPreviewOrders = operationsSummary.attentionOrders.slice(0, 3);

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
  const selectedOrderAttention = selectedOrder ? getOrderAttentionInfo(selectedOrder) : null;
  const workflowPreviewOrder = selectedOrder ?? ordered[0] ?? null;
  const workflowPreviewAttention = workflowPreviewOrder ? getOrderAttentionInfo(workflowPreviewOrder) : null;
  const workflowPreviewReadiness = getFulfillmentReadiness(workflowPreviewOrder, workflowPreviewAttention);
  const workflowPreviewFlags = getPrototypeWorkflowFlags(workflowPreviewOrder, workflowPreviewAttention);
  const workflowPreviewContactLines = getContactContextLines(workflowPreviewOrder);
  const workflowPreviewNextStep = getNextOperationalStep(workflowPreviewOrder, workflowPreviewAttention);

  const counts = statusOptions.reduce((result, status) => {
    result[status] = ordered.filter(
      (order) => normalizeOrderStatusValue(order.status) === normalizeOrderStatusValue(status),
    ).length;
    return result;
  }, {});

  const processingOrders = operationsSummary.processingOrders;
  const shippedOrders = operationsSummary.shippedOrders;
  const cancelledOrders = operationsSummary.cancelledOrders;
  const refundedOrders = operationsSummary.refundedOrders;
  const totalRevenue = ordered.reduce((total, order) => total + Number(order.total ?? 0), 0);
  const sourceLabel = ordersSource === 'supabase' ? 'Live Supabase orders' : 'Local demo orders';
  const closedOrders = cancelledOrders + refundedOrders;

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
        actionLabel="Open dashboard"
        actionTo="/admin"
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
          <strong>{operationsSummary.totalOrders}</strong>
          <p>{sourceLabel} currently visible in this session. Local status edits are simulation-only.</p>
        </div>
        <div className="admin-status-card">
          <span>Paid / payment pending</span>
          <strong>
            {operationsSummary.paidOrders}/{operationsSummary.paymentPendingOrders}
          </strong>
          <p>Orders that have cleared payment versus orders still waiting.</p>
        </div>
        <div className="admin-status-card">
          <span>Processing</span>
          <strong>{processingOrders}</strong>
          <p>{statusCopy.Processing}</p>
        </div>
        <div className="admin-status-card">
          <span>Shipped / fulfilled</span>
          <strong>{shippedOrders}</strong>
          <p>Orders that have moved out of the packing queue.</p>
        </div>
        <div className="admin-status-card">
          <span>Cancelled / refunded</span>
          <strong>{closedOrders}</strong>
          <p>
            {cancelledOrders} cancelled and {refundedOrders} refunded orders.
          </p>
        </div>
        <div className="admin-status-card">
          <span>Needs attention</span>
          <strong>{operationsSummary.ordersNeedingAttention}</strong>
          <p>Orders with missing customer, payment, or fulfillment details.</p>
        </div>
        <div className="admin-status-card">
          <span>Recent activity</span>
          <strong>{operationsSummary.recentlyPlacedOrders}</strong>
          <p>Orders placed in the last 24 hours.</p>
        </div>
        <div className="admin-status-card">
          <span>Total revenue</span>
          <strong>{formatMoney(totalRevenue)}</strong>
          <p>Gross order value across the current result set.</p>
        </div>
      </div>

      <section className="admin-order-workflow-panel">
        <div className="admin-dashboard-section-heading compact">
          <span>Prototype workflow preview</span>
          <p>
            Read-only layout for a future order-management flow. These cards show how fulfillment, contact,
            notes, and next-step details could be staged without mutating order data yet.
          </p>
        </div>
        {workflowPreviewOrder ? (
          <div className="admin-order-workflow-grid">
            <article className="admin-order-workflow-card">
              <span>Fulfillment readiness</span>
              <strong>{workflowPreviewReadiness.label}</strong>
              <p>{workflowPreviewReadiness.detail}</p>
              <div className="admin-workflow-chip-row">
                <span className={`status-badge ${workflowPreviewAttention?.tone ?? ''}`.trim()}>
                  {workflowPreviewAttention?.label ?? 'No attention flag'}
                </span>
                <span className="status-badge status-badge-muted">Prototype-only</span>
              </div>
            </article>
            <article className="admin-order-workflow-card">
              <span>Customer contact context</span>
              <strong>{safeText(workflowPreviewOrder.customerName, 'Guest customer')}</strong>
              <div className="admin-workflow-list">
                {workflowPreviewContactLines.map((line, index) => (
                  <span key={`${line}-${index}`}>{line}</span>
                ))}
              </div>
            </article>
            <article className="admin-order-workflow-card">
              <span>Order attention flags</span>
              <strong>{workflowPreviewAttention?.label ?? 'No attention flag'}</strong>
              <p>{workflowPreviewAttention?.detail ?? 'No attention details available.'}</p>
              <div className="admin-workflow-chip-row">
                {workflowPreviewFlags.map((flag, index) => (
                  <span key={`${flag}-${index}`} className="admin-workflow-chip">
                    {flag}
                  </span>
                ))}
              </div>
            </article>
            <article className="admin-order-workflow-card">
              <span>Internal notes placeholder</span>
              <strong>Not wired yet</strong>
              <p>
                This is a prototype-only placeholder for future fulfillment notes, escalation comments, and
                audit context.
              </p>
              <div className="admin-notes-placeholder" aria-label="Prototype internal notes placeholder">
                Internal notes will be added here when a live write path exists.
              </div>
            </article>
            <article className="admin-order-workflow-card">
              <span>Next operational step</span>
              <strong>{safeText(workflowPreviewOrder.orderNumber, 'Order')}</strong>
              <p>{workflowPreviewNextStep}</p>
              <div className="admin-workflow-chip-row">
                <span className="admin-workflow-chip">Read-only preview</span>
                <span className="admin-workflow-chip">Local-first planning</span>
                <span className="admin-workflow-chip">No live mutation</span>
              </div>
            </article>
          </div>
        ) : (
          <div className="admin-empty-state-tight admin-readiness-empty">
            <h3>Workflow preview is waiting for an order.</h3>
            <p>
              Open checkouts or local demo orders to preview fulfillment readiness, contact context, notes, and
              next-step planning in a prototype-only layout.
            </p>
          </div>
        )}
      </section>

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

      <section className="admin-order-ops-panel">
        <div className="admin-dashboard-section-heading compact">
          <span>Store readiness</span>
          <p>
            A quick snapshot of the current order queue, with the items that need a closer look first.
          </p>
        </div>
        <div className="admin-order-attention-list">
          {attentionPreviewOrders.length ? (
            attentionPreviewOrders.map(({ order, attention }) => {
              const customer = getCustomerSummary(order);

              return (
                <article key={order.id} className="admin-order-attention-item">
                  <div className="admin-order-attention-copy">
                    <div className="admin-order-attention-row">
                      <strong>{safeText(order.orderNumber, 'Order')}</strong>
                      <span className={`status-badge ${attention.tone}`.trim()}>{attention.label}</span>
                    </div>
                    <p>{attention.detail}</p>
                    <span>
                      {customer.name} - {customer.email}
                    </span>
                    <span className="admin-status-caption">
                      Placed {formatDate(order.createdAt)} | {getOrderSourceLabel(ordersSource)}
                    </span>
                  </div>
                  <div className="admin-order-attention-actions">
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
                </article>
              );
            })
          ) : (
            <div className="admin-empty-state-tight admin-readiness-empty">
              <h3>Storefront queue looks healthy.</h3>
              <p>
                No order issues are being flagged right now. New checkouts will still appear here as they come
                in.
              </p>
            </div>
          )}
        </div>
        <div className="admin-panel-footer">
          <div className="admin-quick-actions">
            <Link to="/admin/orders" className="text-button">
              Review all orders
            </Link>
            <Link to="/admin" className="text-button">
              Open dashboard
            </Link>
          </div>
        </div>
      </section>

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
                    const attention = getOrderAttentionInfo(order);

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
                          <div className={`status-badge ${attention.tone}`.trim()}>{attention.label}</div>
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
                const attention = getOrderAttentionInfo(order);
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
                      <div className="admin-status-stack">
                        <span className={`status-badge ${paymentClass}`.trim()}>{paymentLabel}</span>
                        <span className={`status-badge ${attention.tone}`.trim()}>{attention.label}</span>
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
                }}
              >
                Clear Filters
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
                    : 'Local demo orders can be updated in browser storage only. This is a prototype simulation, not a live order workflow.'}
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
                <p className="admin-status-subtext">
                  Use the order summary above to judge whether a future live workflow should move this order forward.
                </p>
              </section>

              <section className="admin-order-modal-panel">
                <h3>Order attention flags</h3>
                <p>
                  <strong>Attention:</strong>{' '}
                  <span className={`status-badge ${selectedOrderAttention.tone}`.trim()}>
                    {selectedOrderAttention.label}
                  </span>
                </p>
                <p>{selectedOrderAttention.detail}</p>
                <p>
                  <strong>Prototype flag:</strong> live writes remain disabled in this view.
                </p>
              </section>

              <section className="admin-order-modal-panel">
                <h3>Internal notes placeholder</h3>
                <p>
                  This panel is reserved for future fulfillment notes, escalation comments, or customer follow-up
                  context.
                </p>
                <div className="admin-notes-placeholder" aria-label="Prototype internal notes placeholder">
                  No notes are stored yet. This area stays read-only until a safe live write path exists.
                </div>
              </section>

              <section className="admin-order-modal-panel">
                <h3>Next operational step</h3>
                <p>{getNextOperationalStep(selectedOrder, selectedOrderAttention)}</p>
                <div className="admin-workflow-chip-row">
                  <span className="admin-workflow-chip">Prototype-only</span>
                  <span className="admin-workflow-chip">Read-only</span>
                  <span className="admin-workflow-chip">No backend writes</span>
                </div>
                <p>
                  <strong>Storefront order number:</strong> {safeText(selectedOrder.orderNumber, 'Order')}
                </p>
                <p className="admin-status-subtext">
                  Use this area to stage a future workflow, but do not treat it as a live admin action surface yet.
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
