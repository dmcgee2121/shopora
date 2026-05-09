import { useMemo, useState } from 'react';
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

function getLatestOrderDate(orders) {
  if (!orders.length) return null;

  return orders.reduce((latest, order) => {
    const currentTime = new Date(order?.createdAt ?? 0).getTime();
    return currentTime > latest ? currentTime : latest;
  }, 0);
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
        <span>Last order</span>
        <strong>{customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'None yet'}</strong>
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

        return {
          id: user.id,
          name: formatName(user),
          email: safeText(user.email, 'No email provided'),
          role: user.role === 'admin' ? 'admin' : 'customer',
          savedItemCount,
          orderCount,
          totalSpent,
          lastOrderDate,
          joinedDate: user.createdAt,
        };
      })
      .sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime());
  }, [orders, users]);

  const summary = useMemo(() => {
    const totalCustomers = customerRecords.filter((customer) => customer.role !== 'admin').length;
    const adminUsers = customerRecords.filter((customer) => customer.role === 'admin').length;
    const customersWithOrders = customerRecords.filter((customer) => customer.role !== 'admin' && customer.orderCount > 0).length;
    const savedItemCustomers = customerRecords.filter((customer) => customer.savedItemCount > 0).length;
    const savedItemActivity = customerRecords.reduce((total, customer) => total + customer.savedItemCount, 0);
    const totalSpent = customerRecords.reduce(
      (total, customer) => total + (customer.role === 'admin' ? 0 : customer.totalSpent),
      0,
    );

    return {
      totalCustomers,
      adminUsers,
      customersWithOrders,
      savedItemCustomers,
      savedItemActivity,
      totalSpent,
    };
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
        subtitle="Browse customer accounts, saved-item activity, and order history summaries in a read-only directory."
      />

      <div className="admin-card-grid">
        <div className="admin-card">
          <span>Total customers</span>
          <strong>{summary.totalCustomers}</strong>
          <p>Non-admin storefront accounts.</p>
        </div>
        <div className="admin-card">
          <span>Admin users</span>
          <strong>{summary.adminUsers}</strong>
          <p>Back-office access accounts.</p>
        </div>
        <div className="admin-card">
          <span>Customers with orders</span>
          <strong>{summary.customersWithOrders}</strong>
          <p>{formatMoney(summary.totalSpent)} total spent across customer orders.</p>
        </div>
        <div className="admin-card">
          <span>Saved item activity</span>
          <strong>{summary.savedItemActivity}</strong>
          <p>{summary.savedItemCustomers} customers are using saved items.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <input
            className="admin-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email, or role"
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
                    <th>Role</th>
                    <th>Orders</th>
                    <th>Saved</th>
                    <th>Spent</th>
                    <th>Last Order</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <strong>{customer.name}</strong>
                        <p>{customer.role === 'admin' ? 'Admin access account' : 'Storefront customer'}</p>
                      </td>
                      <td>{customer.email}</td>
                      <td>
                        <span className={`status-badge ${getRoleTone(customer.role)}`.trim()}>
                          {getRoleLabel(customer.role)}
                        </span>
                      </td>
                      <td>{customer.orderCount}</td>
                      <td>{customer.savedItemCount}</td>
                      <td>{formatMoney(customer.totalSpent)}</td>
                      <td>{customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'No orders yet'}</td>
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
                    </div>
                    <span className={`status-badge ${getRoleTone(customer.role)}`.trim()}>
                      {getRoleLabel(customer.role)}
                    </span>
                  </div>

                  <CustomerMetrics customer={customer} />

                  <div className="admin-record-row">
                    <div className="admin-record-meta">
                      <span>Joined</span>
                      <strong>{formatDate(customer.joinedDate)}</strong>
                    </div>
                    <div className="admin-record-meta">
                      <span>Last order</span>
                      <strong>{customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'No orders yet'}</strong>
                    </div>
                  </div>
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
            </div>
          </div>
        )
      ) : (
        <div className="admin-empty-state">
          <h2>No customer records yet.</h2>
          <p>Customer accounts will appear here once demo users or Supabase profiles exist.</p>
        </div>
      )}

      {hasFilters ? (
        <p className="admin-catalog-helper">
          Showing {filteredCustomers.length} of {customerRecords.length} customer records.
        </p>
      ) : null}
    </div>
  );
}
