import { useMemo } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { useAuth } from '../../context/AuthContext';

function formatDate(value) {
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

export default function AdminCustomersPage() {
  const { users } = useAuth();
  const summary = useMemo(() => {
    const customerUsers = users.filter((user) => user.role !== 'admin');
    const adminUsers = users.filter((user) => user.role === 'admin');
    const savedTotal = users.reduce((total, user) => total + (user.savedProductIds?.length ?? 0), 0);
    return {
      total: users.length,
      customers: customerUsers.length,
      admins: adminUsers.length,
      savedTotal,
    };
  }, [users]);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [users]);

  return (
    <div className="admin-page-stack">
      <AdminPageHeader
        eyebrow="Customer directory"
        title="Customers"
        subtitle="View demo accounts, roles, and saved-item counts without exposing any credentials."
      />

      <div className="admin-card-grid">
        <div className="admin-card">
          <span>Total Accounts</span>
          <strong>{summary.total}</strong>
          <p>All local mock user records.</p>
        </div>
        <div className="admin-card">
          <span>Customers</span>
          <strong>{summary.customers}</strong>
          <p>Non-admin storefront accounts.</p>
        </div>
        <div className="admin-card">
          <span>Admins</span>
          <strong>{summary.admins}</strong>
          <p>Demo back-office access accounts.</p>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Saved Items</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <strong>
                    {user.firstName} {user.lastName}
                  </strong>
                </td>
                <td>{user.email}</td>
                <td>{user.role ?? 'customer'}</td>
                <td>{formatDate(user.createdAt)}</td>
                <td>{user.savedProductIds?.length ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-record-list admin-customer-records">
        {sortedUsers.map((user) => (
          <article key={user.id} className="admin-record-card">
            <div className="admin-record-row">
              <div className="admin-record-meta">
                <strong>
                  {user.firstName} {user.lastName}
                </strong>
                <span>{user.email}</span>
              </div>
              <span className="status-badge">{user.role ?? 'customer'}</span>
            </div>
            <div className="admin-record-row">
              <div className="admin-record-meta">
                <span>Created {formatDate(user.createdAt)}</span>
              </div>
              <div className="admin-record-meta">
                <span>Saved items</span>
                <strong>{user.savedProductIds?.length ?? 0}</strong>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
