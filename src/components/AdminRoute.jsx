import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, logout, currentUser, isAuthLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (isAuthLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return (
      <section className="container admin-unauthorized">
        <div className="empty-state admin-unauthorized-card">
          <p className="eyebrow">Admin access required</p>
          <h2>This account does not have admin access.</h2>
          <p>
            Signed in as <strong>{currentUser?.email}</strong>. Use the demo admin login to access
            the ShopOra back office.
          </p>
          <div className="admin-unauthorized-actions">
            <Link to="/account" className="btn btn-ghost">
              Go to My Account
            </Link>
            <Link to="/admin/login" className="btn btn-dark">
              Admin Login
            </Link>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                logout();
                navigate('/admin/login', { replace: true, state: { from: location } });
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </section>
    );
  }

  return children;
}
