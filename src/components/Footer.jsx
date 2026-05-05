import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand-block">
          <div className="footer-brand-row">
            <BrandLogo variant="wordmark" alt="ShopOra" className="footer-brand-logo" />
            <BrandLogo variant="bag" alt="ShopOra" className="footer-brand-accent" />
          </div>
          <p className="footer-copy">A polished storefront for modern clothing and lifestyle shopping.</p>
        </div>

        <div className="footer-links">
          <Link to="/">Shop</Link>
          <Link to="/women">Women</Link>
          <Link to="/men">Men</Link>
          <Link to="/shoes">Shoes</Link>
          <Link to="/accessories">Accessories</Link>
          <Link to="/sale">Sale</Link>
          <Link to="/account">Account</Link>
          <Link to="/account/orders">Orders</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/shipping">Shipping</Link>
          <Link to="/returns">Returns</Link>
          <Link to="/privacy">Privacy</Link>
        </div>
      </div>
      <div className="footer-legal">Copyright 2026 ShopOra. All rights reserved.</div>
    </footer>
  );
}
