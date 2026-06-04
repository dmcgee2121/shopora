import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/customers', label: 'Customers' },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboardHome = location.pathname === '/admin';

  return (
    <section className={`admin-shell ${isDashboardHome ? 'dashboard-home' : ''}`}>
      <header className="admin-top-nav-shell">
        <Link to="/admin" className="admin-brand admin-top-brand">
          <BrandLogo variant="bag" alt="ShopOra" />
          <span className="admin-top-brand-label">ShopOra Admin</span>
        </Link>

        <nav className="admin-top-nav" aria-label="Admin navigation">
          {navLinks.map((link) => (
            <NavLink
              key={`top-${link.to}`}
              to={link.to}
              end={link.to === '/admin'}
              className={({ isActive }) => (isActive ? 'admin-top-nav-link active' : 'admin-top-nav-link')}
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/" className="admin-top-nav-link">
            View Storefront
          </NavLink>
          <button
            type="button"
            className="admin-top-nav-link admin-top-nav-button"
            onClick={() => {
              logout();
              navigate('/admin/login', { replace: true });
            }}
          >
            Logout
          </button>
        </nav>
      </header>

      <div className="admin-main">
        <Outlet />
      </div>
    </section>
  );
}
