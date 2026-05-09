import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useMiniCart } from '../context/MiniCartContext';
import MiniCartDrawer from './MiniCartDrawer';
import BrandLogo from './BrandLogo';

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4.2 4.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5.5 6.5h14l-1.4 7.3a2 2 0 0 1-2 1.6H9a2 2 0 0 1-2-1.6L5.5 6.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M4 4.5h2l1.3 6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="10" cy="19" r="1.4" fill="currentColor" />
      <circle cx="17" cy="19" r="1.4" fill="currentColor" />
    </svg>
  );
}

const links = [
  { to: '/women', label: 'Women' },
  { to: '/men', label: 'Men' },
  { to: '/shoes', label: 'Shoes' },
  { to: '/accessories', label: 'Accessories' },
  { to: '/sale', label: 'Sale' },
];

export default function Navbar() {
  const { count } = useCart();
  const { isAuthenticated, isAdmin, currentUser } = useAuth();
  const { isMiniCartOpen, openMiniCart, closeMiniCart } = useMiniCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const submitSearch = (event) => {
    event.preventDefault();
    const value = search.trim();
    const query = value ? `?q=${encodeURIComponent(value)}` : '';
    navigate(`/search${query}`);
    setMenuOpen(false);
  };

  const handleNavigate = () => setMenuOpen(false);

  useEffect(() => {
    closeMiniCart();
  }, [location.pathname, location.search, closeMiniCart]);

  return (
    <header className="site-header">
      <div className="topbar">
        <Link to="/" className="brand" aria-label="ShopOra home">
          <BrandLogo variant="wordmark" alt="ShopOra" />
          <BrandLogo variant="bag" alt="ShopOra" />
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav ${menuOpen ? 'is-open' : ''}`} id="primary-navigation">
          <div className="nav-links">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={handleNavigate}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <form className="search-form" onSubmit={submitSearch} role="search">
            <SearchIcon />
            <input
              type="search"
              placeholder="Search products or brands"
              aria-label="Search products"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </form>

          <button
            type="button"
            className="cart-link"
            onClick={() => {
              openMiniCart();
              handleNavigate();
            }}
          >
            <CartIcon />
            <span>Cart</span>
            <strong>{count}</strong>
          </button>

          <Link
            to={isAuthenticated ? '/account' : '/login'}
            className="account-link"
            onClick={handleNavigate}
          >
            {isAuthenticated ? `Hi, ${currentUser?.firstName ?? 'Account'}` : 'Sign In'}
          </Link>

          {isAdmin ? (
            <Link to="/admin" className="account-link admin-link" onClick={handleNavigate}>
              Admin
            </Link>
          ) : null}
        </nav>
      </div>

      {location.pathname === '/' ? null : <div className="header-divider" />}
      <MiniCartDrawer isOpen={isMiniCartOpen} onClose={closeMiniCart} />
    </header>
  );
}
