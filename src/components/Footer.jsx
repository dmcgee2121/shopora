import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';

const shopLinks = [
  { to: '/', label: 'Home' },
  { to: '/women', label: 'Women' },
  { to: '/men', label: 'Men' },
  { to: '/shoes', label: 'Shoes' },
  { to: '/accessories', label: 'Accessories' },
  { to: '/sale', label: 'Sale' },
];

const supportLinks = [
  { to: '/contact', label: 'Contact' },
  { to: '/shipping', label: 'Shipping' },
  { to: '/returns', label: 'Returns' },
  { to: '/privacy', label: 'Privacy' },
];

const accountLinks = [
  { to: '/account', label: 'Account' },
  { to: '/account/orders', label: 'Orders' },
  { to: '/admin', label: 'Admin' },
];

function FooterLinkGroup({ title, links }) {
  return (
    <div className="footer-link-group">
      <h3>{title}</h3>
      {links.map((link) => (
        <Link key={link.to} to={link.to}>
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand-block">
          <div className="footer-brand-row">
            <BrandLogo variant="wordmark" alt="ShopOra" className="footer-brand-logo" />
            <BrandLogo variant="bag" alt="ShopOra" className="footer-brand-accent" />
          </div>
          <p className="footer-copy">
            A calm, curated storefront for modern clothing and lifestyle shopping with secure checkout,
            easy returns, and straightforward support.
          </p>
        </div>

        <div className="footer-links" aria-label="Footer links">
          <FooterLinkGroup title="Shop" links={shopLinks} />
          <FooterLinkGroup title="Support" links={supportLinks} />
          <FooterLinkGroup title="Account" links={accountLinks} />
        </div>
      </div>
      <div className="footer-legal">Copyright 2026 ShopOra. All rights reserved.</div>
    </footer>
  );
}
