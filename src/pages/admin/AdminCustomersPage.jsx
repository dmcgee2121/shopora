import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrdersContext';
import { idsMatch, normalizeId } from '../../utils/idUtils';

function safeText(value, fallback = '-') {
  const text = typeof value === 'string' ? value.trim() : '';
  return text || fallback;
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function safeDate(value) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
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

function formatMoney(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : '$0.00';
}

function formatDecimal(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(1) : '0.0';
}

function formatName(user) {
  return [user?.firstName, user?.lastName]
    .map((part) => safeText(part, ''))
    .filter(Boolean)
    .join(' ') || 'Unnamed customer';
}

function isWithinDays(value, days = 30) {
  const date = safeDate(value);
  if (!date) return false;

  return Date.now() - date.getTime() <= days * 24 * 60 * 60 * 1000;
}

function getRoleLabel(role) {
  return role === 'admin' ? 'Admin' : 'Customer';
}

function getRoleTone(role) {
  return role === 'admin' ? 'status-active' : 'status-badge-muted';
}

function getCustomerOrders(user, orders) {
  const userId = normalizeId(user?.id);
  const email = normalizeText(user?.email);
  const name = normalizeText(formatName(user));

  return orders.filter((order) => {
    const orderUserId = normalizeId(order?.userId);
    const orderEmail = normalizeText(order?.customerEmail);
    const orderName = normalizeText(order?.customerName);

    return (
      (userId && idsMatch(orderUserId, userId)) ||
      (email && orderEmail === email) ||
      (name && orderName === name)
    );
  });
}

function getMostRecentOrder(orders) {
  if (!orders.length) return null;

  return [...orders].sort((left, right) => {
    const leftTime = safeDate(left?.createdAt)?.getTime() ?? 0;
    const rightTime = safeDate(right?.createdAt)?.getTime() ?? 0;
    return rightTime - leftTime;
  })[0] ?? null;
}

function getLatestOrderDate(orders) {
  return getMostRecentOrder(orders)?.createdAt ?? null;
}

function getCustomerActivityDate(customer) {
  return customer.lastOrderDate ?? customer.joinedDate ?? null;
}

function getCustomerRelationshipInfo(customer) {
  const orderCount = Number(customer.orderCount ?? 0);
  const savedItemCount = Number(customer.savedItemCount ?? 0);
  const totalSpent = Number(customer.totalSpent ?? 0);
  const activityDate = getCustomerActivityDate(customer);
  const recentlyActive = isWithinDays(activityDate, 30);
  const badges = [];

  if (customer.role === 'admin') {
    badges.push({ label: 'Admin account', tone: 'status-active' });
    return {
      primaryLabel: 'Admin access',
      detail: 'Back-office account with no storefront customer value signals.',
      badges,
      activityLabel: recentlyActive ? 'Recently active' : 'No customer activity yet',
      valueLabel: 'Admin account',
    };
  }

  if (orderCount === 0) {
    badges.push({ label: 'New customer', tone: 'status-draft' });
  } else if (orderCount > 1) {
    badges.push({ label: 'Returning customer', tone: 'status-active' });
  } else {
    badges.push({ label: 'First order', tone: 'status-active' });
  }

  if (savedItemCount > 0) {
    badges.push({ label: 'Saved-item activity', tone: 'status-badge-sale' });
  }

  if (totalSpent >= 250 || orderCount >= 3) {
    badges.push({ label: 'High-value customer', tone: 'stock-in' });
  }

  if (recentlyActive) {
    badges.push({ label: 'Recently active', tone: 'stock-low' });
  }

  return {
    primaryLabel: orderCount > 1 ? 'Returning customer' : orderCount === 1 ? 'First order' : 'New customer',
    detail:
      orderCount > 0
        ? `${orderCount} order${orderCount === 1 ? '' : 's'} and ${formatMoney(totalSpent)} in spend.`
        : 'No order history yet, but the account can still be useful for saved-item and activity tracking.',
    badges: badges.slice(0, 3),
    activityLabel: recentlyActive ? 'Recently active' : activityDate ? 'Activity older than 30 days' : 'No recent activity',
    valueLabel:
      totalSpent >= 250 || orderCount >= 3
        ? 'High-value customer'
        : orderCount > 0
          ? 'Order history present'
          : 'No orders yet',
  };
}

function getCustomerSignalSummary(customer) {
  if (customer.role === 'admin') {
    return 'Admin access account. Keep for back-office context only.';
  }

  if (customer.openOrderCount > 0) {
    return `${customer.openOrderCount} pending or processing order${customer.openOrderCount === 1 ? '' : 's'} worth reviewing.`;
  }

  if (customer.savedItemCount > 0 && customer.orderCount > 0) {
    return `${customer.savedItemCount} saved item${customer.savedItemCount === 1 ? '' : 's'} plus order history show current interest.`;
  }

  if (customer.savedItemCount > 0) {
    return `${customer.savedItemCount} saved item${customer.savedItemCount === 1 ? '' : 's'} suggest browsing intent before purchase.`;
  }

  if (customer.recentOrderCount > 0) {
    return `${customer.recentOrderCount} recent order${customer.recentOrderCount === 1 ? '' : 's'} in the last 30 days.`;
  }

  if (customer.orderCount > 1) {
    return `${customer.orderCount} total orders show repeat behavior even without recent activity.`;
  }

  return 'Account exists, but there is little order or saved-item activity yet.';
}

function getCustomerPriorityScore(customer) {
  if (customer.role === 'admin') return 0;

  return (
    customer.openOrderCount * 100 +
    customer.recentOrderCount * 28 +
    customer.savedItemCount * 16 +
    customer.orderCount * 10 +
    (isWithinDays(customer.activityDate, 14) ? 12 : 0) +
    (customer.totalSpent >= 250 ? 18 : 0)
  );
}

function CustomerBadgeList({ badges = [] }) {
  if (!badges.length) return null;

  return (
    <div className="status-badges admin-customer-badges">
      {badges.map((badge) => (
        <span key={badge.label} className={`status-badge ${badge.tone}`.trim()}>
          {badge.label}
        </span>
      ))}
    </div>
  );
}

function CustomerMetrics({ customer }) {
  return (
    <div className="admin-customer-metrics" aria-label={`${customer.name} metrics`}>
      <div>
        <span>Orders</span>
        <strong>{customer.orderCount}</strong>
      </div>
      <div>
        <span>Saved</span>
        <strong>{customer.savedItemCount}</strong>
      </div>
      <div>
        <span>Spent</span>
        <strong>{formatMoney(customer.totalSpent)}</strong>
      </div>
      <div>
        <span>Last activity</span>
        <strong>{customer.activityDate ? formatDate(customer.activityDate) : 'None yet'}</strong>
      </div>
    </div>
  );
}

function CustomerWorkQueueCard({ customer, onFocusCustomer }) {
  return (
    <article className="admin-work-queue-card">
      <div className="admin-work-queue-card-head">
        <div className="admin-work-queue-card-title">
          <strong>{customer.name}</strong>
          <p>{customer.email}</p>
        </div>
        <span className={`status-badge ${customer.openOrderCount > 0 ? 'order-status-pending' : 'status-badge-muted'}`}>
          {customer.openOrderCount > 0 ? 'Needs review' : customer.relationship.primaryLabel}
        </span>
      </div>

      <div className="admin-work-queue-card-meta">
        <div className="admin-work-queue-card-facts">
          <span>{customer.orderCount} order{customer.orderCount === 1 ? '' : 's'}</span>
          <span>{customer.savedItemCount} saved</span>
          <span>{formatMoney(customer.totalSpent)} spent</span>
          <span>{customer.activityDate ? formatDate(customer.activityDate) : 'No activity yet'}</span>
        </div>
        <p className="admin-work-queue-card-note">{customer.signalSummary}</p>
      </div>

      <div className="admin-work-queue-card-actions">
        <button type="button" className="text-button" onClick={() => onFocusCustomer(customer)}>
          Focus customer
        </button>
        <Link to="/admin/orders" className="text-button">
          View orders
        </Link>
      </div>
    </article>
  );
}

function CustomerSignalCard({
  label,
  value,
  note,
  tone = 'status-badge-muted',
  actionLabel,
  actionTo,
  onAction,
}) {
  return (
    <article className="admin-customer-signal-card">
      <div className="admin-priority-action-header">
        <span>{label}</span>
        <span className={`status-badge ${tone}`.trim()}>{value}</span>
      </div>
      <p>{note}</p>
      {actionLabel && (actionTo || onAction) ? (
        <div className="admin-priority-action-links">
          {actionTo ? (
            <Link to={actionTo} className="btn btn-ghost">
              {actionLabel}
            </Link>
          ) : (
            <button type="button" className="btn btn-ghost" onClick={onAction}>
              {actionLabel}
            </button>
          )}
        </div>
      ) : null}
    </article>
  );
}

function CustomerSpotlightCard({ customer, onFocusCustomer }) {
  return (
    <article className="admin-customer-spotlight-card">
      <div className="admin-record-row">
        <div className="admin-record-meta">
          <strong>{customer.name}</strong>
          <span>{customer.email}</span>
        </div>
        <span className={`status-badge ${getRoleTone(customer.role)}`.trim()}>{getRoleLabel(customer.role)}</span>
      </div>

      <CustomerBadgeList badges={customer.relationship.badges} />

      <p className="admin-customer-preview-note">{customer.signalSummary}</p>

      <div className="admin-customer-preview-grid admin-customer-spotlight-grid">
        <div>
          <span>Recent orders</span>
          <strong>{customer.recentOrderCount}</strong>
        </div>
        <div>
          <span>Open orders</span>
          <strong>{customer.openOrderCount}</strong>
        </div>
        <div>
          <span>Last order</span>
          <strong>{customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'None yet'}</strong>
        </div>
      </div>

      <div className="admin-work-queue-card-actions">
        <button type="button" className="text-button" onClick={() => onFocusCustomer(customer)}>
          Focus customer
        </button>
        <Link to="/admin/orders" className="text-button">
          Review orders
        </Link>
      </div>
    </article>
  );
}

export default function AdminCustomersPage() {
  const { users } = useAuth();
  const { orders } = useOrders();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');

  const customerRecords = useMemo(() => {
    return users
      .map((user) => {
        const customerOrders = getCustomerOrders(user, orders);
        const savedItemCount = Array.isArray(user.savedProductIds) ? user.savedProductIds.length : 0;
        const orderCount = customerOrders.length;
        const totalSpent = customerOrders.reduce((total, order) => total + Number(order.total ?? 0), 0);
        const totalItemsOrdered = customerOrders.reduce(
          (total, order) => total + (Array.isArray(order.items) ? order.items.length : 0),
          0,
        );
        const recentOrders = customerOrders.filter((order) => isWithinDays(order.createdAt, 30));
        const pendingOrders = customerOrders.filter((order) => normalizeText(order.status) === 'pending');
        const processingOrders = customerOrders.filter((order) => normalizeText(order.status) === 'processing');
        const deliveredOrders = customerOrders.filter((order) => normalizeText(order.status) === 'delivered');
        const lastOrderDate = getLatestOrderDate(customerOrders);
        const activityDate = lastOrderDate ?? user.createdAt ?? null;
        const mostRecentOrder = getMostRecentOrder(customerOrders);
        const relationship = getCustomerRelationshipInfo({
          role: user.role === 'admin' ? 'admin' : 'customer',
          orderCount,
          savedItemCount,
          totalSpent,
          lastOrderDate,
          joinedDate: user.createdAt,
        });

        const record = {
          id: user.id,
          name: formatName(user),
          email: safeText(user.email, 'No email provided'),
          role: user.role === 'admin' ? 'admin' : 'customer',
          savedItemCount,
          orderCount,
          totalSpent,
          totalItemsOrdered,
          averageItemsPerOrder: orderCount > 0 ? totalItemsOrdered / orderCount : 0,
          lastOrderDate,
          activityDate,
          recentOrderCount: recentOrders.length,
          pendingOrderCount: pendingOrders.length,
          processingOrderCount: processingOrders.length,
          deliveredOrderCount: deliveredOrders.length,
          openOrderCount: pendingOrders.length + processingOrders.length,
          joinedDate: user.createdAt,
          mostRecentOrder,
          relationship,
        };

        return {
          ...record,
          signalSummary: getCustomerSignalSummary(record),
          priorityScore: getCustomerPriorityScore(record),
        };
      })
      .sort((left, right) => {
        const rightActivity = safeDate(right.activityDate)?.getTime() ?? 0;
        const leftActivity = safeDate(left.activityDate)?.getTime() ?? 0;
        return rightActivity - leftActivity;
      });
  }, [orders, users]);

  const summary = useMemo(() => {
    const customerProfiles = customerRecords.filter((customer) => customer.role !== 'admin');
    const totalOrders = customerProfiles.reduce((total, customer) => total + customer.orderCount, 0);
    const totalItemsOrdered = customerProfiles.reduce((total, customer) => total + customer.totalItemsOrdered, 0);

    return {
      totalCustomers: customerProfiles.length,
      adminUsers: customerRecords.filter((customer) => customer.role === 'admin').length,
      repeatCustomers: customerProfiles.filter((customer) => customer.orderCount > 1).length,
      savedItemCustomers: customerProfiles.filter((customer) => customer.savedItemCount > 0).length,
      savedItemActivity: customerProfiles.reduce((total, customer) => total + customer.savedItemCount, 0),
      recentActivityCustomers: customerProfiles.filter((customer) => isWithinDays(customer.activityDate, 30)).length,
      recentAccounts: customerProfiles.filter((customer) => isWithinDays(customer.joinedDate, 30)).length,
      openOrderCustomers: customerProfiles.filter((customer) => customer.openOrderCount > 0).length,
      deliveredOrderCustomers: customerProfiles.filter((customer) => customer.deliveredOrderCount > 0).length,
      customersWithOrders: customerProfiles.filter((customer) => customer.orderCount > 0).length,
      totalSpent: customerProfiles.reduce((total, customer) => total + customer.totalSpent, 0),
      averageOrderValue:
        totalOrders > 0
          ? customerProfiles.reduce((total, customer) => total + customer.totalSpent, 0) / totalOrders
          : 0,
      averageItemsPerOrder: totalOrders > 0 ? totalItemsOrdered / totalOrders : 0,
    };
  }, [customerRecords]);

  const customerWorkQueue = useMemo(() => {
    return customerRecords
      .filter((customer) => customer.role !== 'admin')
      .sort((left, right) => {
        if (right.priorityScore !== left.priorityScore) return right.priorityScore - left.priorityScore;
        return (safeDate(right.activityDate)?.getTime() ?? 0) - (safeDate(left.activityDate)?.getTime() ?? 0);
      })
      .slice(0, 4);
  }, [customerRecords]);

  const customerSpotlights = useMemo(() => {
    return customerRecords
      .filter((customer) => customer.role !== 'admin' && (customer.recentOrderCount > 0 || customer.savedItemCount > 0))
      .sort((left, right) => {
        const rightRecent = safeDate(right.activityDate)?.getTime() ?? 0;
        const leftRecent = safeDate(left.activityDate)?.getTime() ?? 0;
        if (rightRecent !== leftRecent) return rightRecent - leftRecent;
        return right.savedItemCount - left.savedItemCount;
      })
      .slice(0, 3);
  }, [customerRecords]);

  const filteredCustomers = useMemo(() => {
    const term = query.trim().toLowerCase();

    return customerRecords.filter((customer) => {
      const matchesSearch =
        !term ||
        [
          customer.name,
          customer.email,
          customer.role,
          customer.relationship.primaryLabel,
          customer.signalSummary,
        ]
          .join(' ')
          .toLowerCase()
          .includes(term);

      const matchesRole = roleFilter === 'all' || customer.role === roleFilter;
      const matchesActivity =
        activityFilter === 'all' ||
        (activityFilter === 'with-orders' && customer.orderCount > 0) ||
        (activityFilter === 'saved-items' && customer.savedItemCount > 0) ||
        (activityFilter === 'with-orders-and-saved' && customer.orderCount > 0 && customer.savedItemCount > 0) ||
        (activityFilter === 'open-orders' && customer.openOrderCount > 0) ||
        (activityFilter === 'repeat' && customer.orderCount > 1) ||
        (activityFilter === 'no-orders' && customer.orderCount === 0);

      return matchesSearch && matchesRole && matchesActivity;
    });
  }, [activityFilter, customerRecords, query, roleFilter]);

  const hasFilters = Boolean(query.trim() || roleFilter !== 'all' || activityFilter !== 'all');
  const hasCustomers = customerRecords.length > 0;
  const hasFilteredCustomers = filteredCustomers.length > 0;

  const focusCustomer = (customer) => {
    setQuery(customer.email !== 'No email provided' ? customer.email : customer.name);
    setRoleFilter(customer.role);
  };

  return (
    <div className="admin-page-stack">
      <AdminPageHeader
        eyebrow="Customer workspace"
        title="Customers"
        subtitle="Review customer activity, saved items, and order signals."
        actions={(
          <>
            <Link to="/admin/orders" className="btn btn-dark">
              View orders
            </Link>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setRoleFilter('customer');
                setActivityFilter('saved-items');
                setQuery('');
              }}
            >
              Saved-item activity
            </button>
            <Link to="/" className="btn btn-outline">
              View storefront
            </Link>
          </>
        )}
      />

      <section className="admin-owner-workbench-panel admin-customers-command-center">
        <div className="admin-owner-workbench-main">
          <div className="admin-dashboard-section-heading">
            <span>Customer snapshot</span>
            <p>See account volume, recent engagement, and the few customer signals most worth reviewing first.</p>
          </div>

          <div className="admin-status-grid admin-owner-summary-grid admin-customer-summary-grid">
            <div className="admin-status-card">
              <span>Total accounts</span>
              <strong>{summary.totalCustomers}</strong>
              <p>{summary.adminUsers} admin account{summary.adminUsers === 1 ? '' : 's'} stay visible separately for context.</p>
            </div>
            <div className="admin-status-card">
              <span>Repeat customers</span>
              <strong>{summary.repeatCustomers}</strong>
              <p>Customers with more than one order already in the account history.</p>
            </div>
            <div className="admin-status-card">
              <span>Saved-item customers</span>
              <strong>{summary.savedItemCustomers}</strong>
              <p>{summary.savedItemActivity} total saved items across visible customer accounts.</p>
            </div>
            <div className="admin-status-card">
              <span>Open order customers</span>
              <strong>{summary.openOrderCustomers}</strong>
              <p>Customers attached to pending or processing orders right now.</p>
            </div>
            <div className="admin-status-card">
              <span>Active in 30 days</span>
              <strong>{summary.recentActivityCustomers}</strong>
              <p>{summary.recentAccounts} newer account{summary.recentAccounts === 1 ? '' : 's'} also joined in the last 30 days.</p>
            </div>
            <div className="admin-status-card">
              <span>Avg items / order</span>
              <strong>{formatDecimal(summary.averageItemsPerOrder)}</strong>
              <p>{formatMoney(summary.averageOrderValue)} average order value across customer orders.</p>
            </div>
          </div>
        </div>

        <aside className="admin-owner-workbench-side admin-dashboard-panel admin-customers-queue-panel">
          <div className="admin-dashboard-section-heading compact">
            <span>Work queue</span>
            <p>The next customer records most likely to be useful for owner review.</p>
          </div>

          {customerWorkQueue.length ? (
            <div className="admin-work-queue-list">
              {customerWorkQueue.map((customer) => (
                <CustomerWorkQueueCard key={customer.id} customer={customer} onFocusCustomer={focusCustomer} />
              ))}
            </div>
          ) : (
            <div className="admin-empty-state-tight">
              <h3>No customer review queue yet.</h3>
              <p>Customer signals will move into this top area once saved items or order activity start to accumulate.</p>
            </div>
          )}
        </aside>
      </section>

      <section className="admin-orders-command-center">
        <div className="admin-dashboard-panel admin-dashboard-panel-soft admin-customer-signals-panel">
          <div className="admin-dashboard-section-heading">
            <span>Signals worth reviewing</span>
            <p>Use these quick cues to decide whether to open Orders, focus the customer directory, or check saved-item interest.</p>
          </div>

          <div className="admin-customer-signal-grid">
            <CustomerSignalCard
              label="Recent order behavior"
              value={`${customerRecords.filter((customer) => customer.recentOrderCount > 0 && customer.role !== 'admin').length} customers`}
              note="Customers with at least one order placed in the last 30 days."
              tone="stock-low"
              actionLabel="Show ordering customers"
              onAction={() => {
                setRoleFilter('customer');
                setActivityFilter('with-orders');
                setQuery('');
              }}
            />
            <CustomerSignalCard
              label="Saved-item interest"
              value={`${summary.savedItemActivity} saved`}
              note={`${summary.savedItemCustomers} customers are actively saving products for later review.`}
              tone="status-badge-sale"
              actionLabel="Filter saved-item activity"
              onAction={() => {
                setRoleFilter('customer');
                setActivityFilter('saved-items');
                setQuery('');
              }}
            />
            <CustomerSignalCard
              label="Repeat activity"
              value={`${summary.repeatCustomers} repeat`}
              note={`${summary.deliveredOrderCustomers} customers already have delivered orders in their history.`}
              tone="stock-in"
              actionLabel="View repeat customers"
              onAction={() => {
                setRoleFilter('customer');
                setActivityFilter('repeat');
                setQuery('');
              }}
            />
            <CustomerSignalCard
              label="Open order follow-up"
              value={`${summary.openOrderCustomers} linked`}
              note="Customers connected to pending or processing orders are usually the first ones worth reviewing beside the Orders page."
              tone="order-status-pending"
              actionLabel="Open orders page"
              actionTo="/admin/orders"
            />
          </div>
        </div>

        <div className="admin-orders-command-center-grid">
          <aside className="admin-dashboard-panel admin-customers-spotlight-panel">
            <div className="admin-dashboard-section-heading compact">
              <span>Recent customer activity</span>
              <p>The most active customer accounts, ordered by the latest visible activity signal.</p>
            </div>

            {customerSpotlights.length ? (
              <div className="admin-customer-spotlight-list">
                {customerSpotlights.map((customer) => (
                  <CustomerSpotlightCard key={customer.id} customer={customer} onFocusCustomer={focusCustomer} />
                ))}
              </div>
            ) : (
              <div className="admin-empty-state-tight">
                <h3>No active customer highlights yet.</h3>
                <p>Order or saved-item activity will populate this area automatically when it becomes available.</p>
              </div>
            )}
          </aside>

          <aside className="admin-dashboard-panel admin-dashboard-panel-soft admin-orders-guidance-panel">
            <div className="admin-dashboard-section-heading compact">
              <span>Owner notes</span>
              <p>Keep this page focused on relationship signals, not a raw CRM export.</p>
            </div>

            <div className="admin-orders-guidance-list">
              <div className="admin-orders-guidance-item">
                <strong>Start with customers tied to open orders.</strong>
                <p>Pending or processing orders usually give the clearest reason to jump from Customers into Orders.</p>
              </div>
              <div className="admin-orders-guidance-item">
                <strong>Saved items show browsing intent.</strong>
                <p>Use saved-item counts as a lightweight interest signal, especially when order history is still thin.</p>
              </div>
              <div className="admin-orders-guidance-item">
                <strong>Keep the posture read-only.</strong>
                <p>This page summarizes activity and account history only. It does not add CRM automation or mutation behavior.</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="admin-dashboard-panel admin-orders-history-panel admin-customers-history-panel">
        <div className="admin-dashboard-section-heading">
          <span>Customer directory</span>
          <p>Full account history stays below the summary area so names, email, order signals, and saved-item activity are easier to scan.</p>
        </div>

        <div className="admin-toolbar">
          <div className="admin-toolbar-left">
            <input
              className="admin-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search customer name, email, or relationship"
              aria-label="Search customers"
            />

            <select
              className="admin-filter"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              aria-label="Filter customers by role"
            >
              <option value="all">All roles</option>
              <option value="customer">Customers</option>
              <option value="admin">Admins</option>
            </select>

            <select
              className="admin-filter"
              value={activityFilter}
              onChange={(event) => setActivityFilter(event.target.value)}
              aria-label="Filter customers by activity"
            >
              <option value="all">All activity</option>
              <option value="with-orders">With orders</option>
              <option value="saved-items">Saved items</option>
              <option value="with-orders-and-saved">Orders and saved items</option>
              <option value="open-orders">Open orders</option>
              <option value="repeat">Repeat customers</option>
              <option value="no-orders">No orders</option>
            </select>
          </div>

          <div className="admin-toolbar-actions">
            <div className="admin-toolbar-summary" aria-live="polite">
              <strong>{filteredCustomers.length}</strong>
              <span>{filteredCustomers.length === 1 ? 'customer in view' : 'customers in view'}</span>
            </div>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setQuery('');
                setRoleFilter('all');
                setActivityFilter('all');
              }}
            >
              Clear filters
            </button>
          </div>
        </div>

        {hasCustomers ? (
          hasFilteredCustomers ? (
            <>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Signals</th>
                      <th>Orders</th>
                      <th>Saved</th>
                      <th>Spend</th>
                      <th>Last activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id}>
                        <td>
                          <strong>{customer.name}</strong>
                          <div className="admin-table-subtle">{customer.email}</div>
                          <div className="admin-table-subtle">
                            {customer.role === 'admin' ? 'Admin access account' : 'Storefront customer'}
                          </div>
                        </td>
                        <td>
                          <div className="admin-status-stack">
                            <span className={`status-badge ${getRoleTone(customer.role)}`.trim()}>
                              {getRoleLabel(customer.role)}
                            </span>
                            <span className={`status-badge ${customer.openOrderCount > 0 ? 'order-status-pending' : 'status-badge-muted'}`}>
                              {customer.openOrderCount > 0 ? `${customer.openOrderCount} open` : customer.relationship.primaryLabel}
                            </span>
                          </div>
                          <CustomerBadgeList badges={customer.relationship.badges} />
                        </td>
                        <td>
                          <strong>{customer.orderCount}</strong>
                          <div className="admin-table-subtle">
                            {customer.recentOrderCount} recent
                            {customer.deliveredOrderCount > 0 ? ` - ${customer.deliveredOrderCount} delivered` : ''}
                          </div>
                        </td>
                        <td>
                          <strong>{customer.savedItemCount}</strong>
                          <div className="admin-table-subtle">
                            {customer.savedItemCount > 0 ? 'Saved-item activity visible' : 'No saved items'}
                          </div>
                        </td>
                        <td>
                          <strong>{formatMoney(customer.totalSpent)}</strong>
                          <div className="admin-table-subtle">
                            Avg {formatMoney(customer.orderCount > 0 ? customer.totalSpent / customer.orderCount : 0)}
                          </div>
                        </td>
                        <td>
                          <strong>{customer.activityDate ? formatDate(customer.activityDate) : 'No activity yet'}</strong>
                          <div className="admin-table-subtle">
                            Joined {formatDate(customer.joinedDate)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-record-list admin-customer-records">
                {filteredCustomers.map((customer) => (
                  <article key={customer.id} className="admin-record-card admin-customer-card">
                    <div className="admin-record-row">
                      <div className="admin-record-meta">
                        <strong>{customer.name}</strong>
                        <span>{customer.email}</span>
                        <span>{customer.role === 'admin' ? 'Admin access account' : 'Storefront customer'}</span>
                        <CustomerBadgeList badges={customer.relationship.badges} />
                      </div>
                      <div className="admin-status-stack">
                        <span className={`status-badge ${getRoleTone(customer.role)}`.trim()}>
                          {getRoleLabel(customer.role)}
                        </span>
                        <span className={`status-badge ${customer.openOrderCount > 0 ? 'order-status-pending' : 'status-badge-muted'}`}>
                          {customer.openOrderCount > 0 ? `${customer.openOrderCount} open` : customer.relationship.primaryLabel}
                        </span>
                      </div>
                    </div>

                    <CustomerMetrics customer={customer} />

                    <div className="admin-record-row">
                      <div className="admin-record-meta">
                        <span>Joined</span>
                        <strong>{formatDate(customer.joinedDate)}</strong>
                      </div>
                      <div className="admin-record-meta">
                        <span>Recent orders</span>
                        <strong>{customer.recentOrderCount}</strong>
                      </div>
                    </div>

                    <p className="admin-customer-preview-note">{customer.signalSummary}</p>

                    <div className="admin-work-queue-card-actions">
                      <button type="button" className="text-button" onClick={() => focusCustomer(customer)}>
                        Focus customer
                      </button>
                      <Link to="/admin/orders" className="text-button">
                        Review orders
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="admin-empty-state">
              <h2>No matching customers.</h2>
              <p>Try a different name, email, role, or customer-signal filter.</p>
              <div className="admin-empty-state-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setQuery('');
                    setRoleFilter('all');
                    setActivityFilter('all');
                  }}
                >
                  Clear filters
                </button>
                <Link to="/admin/orders" className="btn btn-ghost">
                  Review orders
                </Link>
              </div>
            </div>
          )
        ) : (
          <div className="admin-empty-state">
            <h2>No customer records yet.</h2>
            <p>Customer accounts appear here after sign-up, saved-item activity, or completed orders in this environment.</p>
            <div className="admin-empty-state-actions">
              <Link to="/admin/orders" className="btn btn-ghost">
                Review orders
              </Link>
              <Link to="/" className="btn btn-dark">
                View storefront
              </Link>
            </div>
          </div>
        )}
      </section>

      {hasFilters ? (
        <p className="admin-catalog-helper">
          Showing {filteredCustomers.length} of {customerRecords.length} customer records, including{' '}
          {summary.adminUsers} admin access account{summary.adminUsers === 1 ? '' : 's'}.
        </p>
      ) : null}
    </div>
  );
}

