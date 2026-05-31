import { useEffect, useState } from 'react';
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
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const isDashboardHome = location.pathname === '/admin';

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  return (
    <section className={`admin-shell ${isDashboardHome ? 'dashboard-home' : ''}`}>
      <header className="admin-top-nav-shell">
        <Link to="/admin" className="admin-brand admin-top-brand" onClick={() => setNavOpen(false)}>
          <BrandLogo variant="bag" alt="ShopOra" />
          <div className="admin-brand-copy">
            <span className="admin-console-label">Admin</span>
            <span className="admin-brand-name">ShopOra</span>
          </div>
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
        </nav>

        <div className="admin-top-nav-user">
          <span className="admin-role-pill">Admin</span>
          <button
            type="button"
            className="btn btn-ghost btn-small"
            onClick={() => {
              logout();
              navigate('/admin/login', { replace: true });
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <aside className={`admin-sidebar ${navOpen ? 'is-open' : ''}`}>
        <div className="admin-sidebar-top">
          <Link to="/admin" className="admin-brand" onClick={() => setNavOpen(false)}>
            <BrandLogo variant="bag" alt="ShopOra" />
            <div className="admin-brand-copy">
              <span className="admin-console-label">Admin Console</span>
              <span className="admin-brand-name">ShopOra</span>
            </div>
          </Link>

          <button
            type="button"
            className="admin-sidebar-toggle"
            aria-expanded={navOpen}
            aria-controls="admin-navigation"
            onClick={() => setNavOpen((value) => !value)}
          >
            {navOpen ? 'Close Menu' : 'Menu'}
          </button>
        </div>

        <div className="admin-sidebar-panel" id="admin-navigation">
          <p className="admin-sidebar-copy">
            Manage catalog, pricing, and customer operations from one workspace.
          </p>

          <nav className="admin-nav" aria-label="Admin navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/admin'}
                className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')}
                onClick={() => setNavOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="admin-sidebar-footer">
            <Link to="/" className="btn btn-ghost full-width" onClick={() => setNavOpen(false)}>
              Back to Store
            </Link>
            <div className="admin-user-note">
              <span className="admin-role-pill">Admin</span>
              <p>
                Signed in as <strong>{currentUser?.firstName} {currentUser?.lastName}</strong>
                <br />
                {currentUser?.email}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-dark full-width"
              onClick={() => {
                logout();
                navigate('/admin/login', { replace: true });
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="admin-main">
        <Outlet />
      </div>
    </section>
  );
}
