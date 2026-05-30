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

function safeDate(value) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatMoney(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : '$0.00';
}

function formatName(user) {
  return [user?.firstName, user?.lastName].map((part) => safeText(part, '')).filter(Boolean).join(' ') || 'Unnamed customer';
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
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

  badges.push({
    label: orderCount > 0 ? 'Has orders' : 'No orders yet',
    tone: orderCount > 0 ? 'status-badge-muted' : 'status-draft',
  });

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

function getLatestOrderDate(orders) {
  if (!orders.length) return null;

  return orders.reduce((latest, order) => {
    const currentTime = safeDate(order?.createdAt)?.getTime() ?? 0;
    return currentTime > latest ? currentTime : latest;
  }, 0);
}

function getMostRecentOrder(orders) {
  if (!orders.length) return null;

  return [...orders].sort((left, right) => {
    const leftTime = safeDate(left?.createdAt)?.getTime() ?? 0;
    const rightTime = safeDate(right?.createdAt)?.getTime() ?? 0;
    return rightTime - leftTime;
  })[0] ?? null;
}

function getCustomerActivityOrder(customerOrders, joinedDate) {
  const latestOrder = getMostRecentOrder(customerOrders);
  return latestOrder?.createdAt ?? joinedDate ?? null;
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
        const lastOrderDate = getLatestOrderDate(customerOrders);
        const activityDate = getCustomerActivityOrder(customerOrders, user.createdAt);
        const relationship = getCustomerRelationshipInfo({
          role: user.role === 'admin' ? 'admin' : 'customer',
          orderCount,
          savedItemCount,
          totalSpent,
          lastOrderDate,
          joinedDate: user.createdAt,
        });

        return {
          id: user.id,
          name: formatName(user),
          email: safeText(user.email, 'No email provided'),
          role: user.role === 'admin' ? 'admin' : 'customer',
          savedItemCount,
          orderCount,
          totalSpent,
          lastOrderDate,
          activityDate,
          relationship,
          joinedDate: user.createdAt,
        };
      })
      .sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime());
  }, [orders, users]);

  const summary = useMemo(() => {
    const customerProfiles = customerRecords.filter((customer) => customer.role !== 'admin');
    const adminUsers = customerRecords.filter((customer) => customer.role === 'admin').length;
    const customersWithOrders = customerProfiles.filter((customer) => customer.orderCount > 0).length;
    const savedItemCustomers = customerProfiles.filter((customer) => customer.savedItemCount > 0).length;
    const savedItemActivity = customerProfiles.reduce((total, customer) => total + customer.savedItemCount, 0);
    const totalOrders = customerProfiles.reduce((total, customer) => total + customer.orderCount, 0);
    const totalSpent = customerProfiles.reduce(
      (total, customer) => total + (customer.role === 'admin' ? 0 : customer.totalSpent),
      0,
    );
    const returningCustomers = customerProfiles.filter((customer) => customer.orderCount > 1).length;
    const recentActivityCustomers = customerProfiles.filter((customer) => isWithinDays(customer.activityDate, 30)).length;
    const highValueCustomers = customerProfiles.filter(
      (customer) => customer.totalSpent >= 250 || customer.orderCount >= 3,
    ).length;
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    return {
      totalCustomers: customerProfiles.length,
      adminUsers,
      customersWithOrders,
      savedItemCustomers,
      savedItemActivity,
      totalSpent,
      returningCustomers,
      recentActivityCustomers,
      highValueCustomers,
      averageOrderValue,
    };
  }, [customerRecords]);

  const relationshipPreview = useMemo(() => {
    return customerRecords
      .filter((customer) => customer.role !== 'admin')
      .sort((left, right) => {
        const leftActivity = safeDate(left.activityDate)?.getTime() ?? 0;
        const rightActivity = safeDate(right.activityDate)?.getTime() ?? 0;

        if (rightActivity !== leftActivity) return rightActivity - leftActivity;
        if (right.totalSpent !== left.totalSpent) return right.totalSpent - left.totalSpent;
        return right.orderCount - left.orderCount;
      })
      .slice(0, 3);
  }, [customerRecords]);

  const filteredCustomers = useMemo(() => {
    const term = query.trim().toLowerCase();

    return customerRecords.filter((customer) => {
      const matchesSearch =
        !term || [customer.name, customer.email, customer.role].join(' ').toLowerCase().includes(term);
      const matchesRole = roleFilter === 'all' || customer.role === roleFilter;
      const matchesActivity =
        activityFilter === 'all' ||
        (activityFilter === 'with-orders' && customer.orderCount > 0) ||
        (activityFilter === 'saved-items' && customer.savedItemCount > 0) ||
        (activityFilter === 'with-orders-and-saved' && customer.orderCount > 0 && customer.savedItemCount > 0) ||
        (activityFilter === 'no-orders' && customer.orderCount === 0);

      return matchesSearch && matchesRole && matchesActivity;
    });
  }, [activityFilter, customerRecords, query, roleFilter]);

  const hasFilters = Boolean(query.trim() || roleFilter !== 'all' || activityFilter !== 'all');
  const hasCustomers = customerRecords.length > 0;
  const hasFilteredCustomers = filteredCustomers.length > 0;

  return (
    <div className="admin-page-stack">
      <AdminPageHeader
        eyebrow="Customer directory"
        title="Customers"
        subtitle="Browse customer accounts, saved-item activity, and order history summaries in a clear, read-only directory."
        actions={
          <>
            <Link to="/admin" className="btn btn-dark">
              Open dashboard
            </Link>
            <Link to="/admin/orders" className="btn btn-ghost">
              Review orders
            </Link>
            <Link to="/" className="btn btn-outline">
              View storefront
            </Link>
          </>
        }
      />

      <div className="admin-card-grid">
        <div className="admin-card">
          <span>Total customers</span>
          <strong>{summary.totalCustomers}</strong>
          <p>Non-admin storefront accounts.</p>
        </div>
        <div className="admin-card">
          <span>Customers with orders</span>
          <strong>{summary.customersWithOrders}</strong>
          <p>{formatMoney(summary.totalSpent)} total spent across customer orders.</p>
        </div>
        <div className="admin-card">
          <span>Returning customers</span>
          <strong>{summary.returningCustomers}</strong>
          <p>Customers with more than one order.</p>
        </div>
        <div className="admin-card">
          <span>Saved item activity</span>
          <strong>{summary.savedItemActivity}</strong>
          <p>{summary.savedItemCustomers} customers are using saved items.</p>
        </div>
        <div className="admin-card">
          <span>Recent activity</span>
          <strong>{summary.recentActivityCustomers}</strong>
          <p>Customers active in the last 30 days.</p>
        </div>
        <div className="admin-card">
          <span>High-value customers</span>
          <strong>{summary.highValueCustomers}</strong>
          <p>Customers with meaningful spend or order volume.</p>
        </div>
        <div className="admin-card">
          <span>Total customer spend</span>
          <strong>{formatMoney(summary.totalSpent)}</strong>
          <p>All tracked storefront customer orders combined.</p>
        </div>
        <div className="admin-card">
          <span>Average order value</span>
          <strong>{formatMoney(summary.averageOrderValue)}</strong>
          <p>Average across customer orders in this directory.</p>
        </div>
      </div>

      <section className="admin-customer-ops-panel">
        <div className="admin-dashboard-section-heading compact">
          <span>Relationship snapshot</span>
          <p>
            Preview storefront accounts and see which customers are new, returning, or building order history.
            Admin access accounts stay visible in the directory for context only.
          </p>
        </div>

        <div className="admin-customer-preview-list">
          {relationshipPreview.length ? (
            relationshipPreview.map((customer) => (
              <article key={customer.id} className="admin-customer-preview-card">
                <div className="admin-record-row">
                  <div className="admin-record-meta">
                    <strong>{customer.name}</strong>
                    <span>{customer.email}</span>
                    <span>{customer.role === 'admin' ? 'Admin access account' : 'Storefront customer'}</span>
                  </div>
                  <span className={`status-badge ${getRoleTone(customer.role)}`.trim()}>
                    {getRoleLabel(customer.role)}
                  </span>
                </div>

                <CustomerBadgeList badges={customer.relationship.badges} />

                <p className="admin-customer-preview-note">
                  {customer.relationship.detail} {customer.relationship.valueLabel}.
                </p>

                <div className="admin-customer-preview-grid">
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
                    <span>Activity</span>
                    <strong>{customer.relationship.activityLabel}</strong>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="admin-empty-state-tight admin-readiness-empty">
              <h3>No customer activity yet.</h3>
              <p>
                Customer accounts and relationship signals will appear here after sign-up, saved items, or order
                activity.
              </p>
            </div>
          )}
        </div>

        <div className="admin-panel-footer">
          <div className="admin-quick-actions">
            <Link to="/admin" className="text-button">
              Open dashboard
            </Link>
            <Link to="/admin/orders" className="text-button">
              Review orders
            </Link>
          </div>
          <p className="admin-status-caption">Read-only customer relationship view for the current session. This is not a CRM automation tool.</p>
        </div>
      </section>

      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <input
            className="admin-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email, role, or relationship"
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
            <option value="no-orders">No orders</option>
          </select>
        </div>

        <div className="admin-toolbar-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setQuery('');
              setRoleFilter('all');
              setActivityFilter('all');
            }}
          >
            Clear Filters
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
                    <th>Name</th>
                    <th>Email</th>
                    <th>Relationship</th>
                    <th>Orders</th>
                    <th>Saved</th>
                    <th>Spent</th>
                    <th>Last activity</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <strong>{customer.name}</strong>
                        <p>{customer.role === 'admin' ? 'Admin access account' : 'Storefront customer'}</p>
                        <CustomerBadgeList badges={customer.relationship.badges} />
                      </td>
                      <td>{customer.email}</td>
                      <td>
                        <div className="admin-status-stack">
                          <span className={`status-badge ${getRoleTone(customer.role)}`.trim()}>
                            {getRoleLabel(customer.role)}
                          </span>
                          <span className={`status-badge ${customer.role === 'admin' ? 'status-active' : 'status-badge-muted'}`}>
                            {customer.relationship.primaryLabel}
                          </span>
                        </div>
                      </td>
                      <td>{customer.orderCount}</td>
                      <td>{customer.savedItemCount}</td>
                      <td>{formatMoney(customer.totalSpent)}</td>
                      <td>{customer.activityDate ? formatDate(customer.activityDate) : 'No activity yet'}</td>
                      <td>{formatDate(customer.joinedDate)}</td>
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
                      <span className={`status-badge ${customer.role === 'admin' ? 'status-active' : 'status-badge-muted'}`}>
                        {customer.relationship.primaryLabel}
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
                      <span>Last activity</span>
                      <strong>{customer.activityDate ? formatDate(customer.activityDate) : 'No activity yet'}</strong>
                    </div>
                  </div>

                  <p className="admin-customer-preview-note">
                    {customer.relationship.detail} {customer.relationship.valueLabel}.
                  </p>
                </article>
              ))}
            </div>
          </>
        ) : (
        <div className="admin-empty-state">
          <h2>No matching customers.</h2>
          <p>Try a different name, email, role, or activity filter.</p>
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
                Clear Filters
              </button>
              <Link to="/admin" className="btn btn-ghost">
                Open dashboard
              </Link>
            </div>
          </div>
        )
      ) : (
        <div className="admin-empty-state">
          <h2>No customer records yet.</h2>
          <p>Customer accounts appear here after sign-up, saved-item activity, or completed orders in this environment.</p>
          <div className="admin-empty-state-actions">
            <Link to="/admin" className="btn btn-ghost">
              Open dashboard
            </Link>
            <Link to="/" className="btn btn-dark">
              View storefront
            </Link>
          </div>
        </div>
      )}

      {hasFilters ? (
        <p className="admin-catalog-helper">
          Showing {filteredCustomers.length} of {customerRecords.length} customer records, including{' '}
          {summary.adminUsers} admin access account{summary.adminUsers === 1 ? '' : 's'}.
        </p>
      ) : null}
    </div>
  );
}
