import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useProductCatalog } from '../context/ProductCatalogContext';
import { getCustomerRetentionLinks } from '../utils/customerRetention';
import { idsMatch } from '../utils/idUtils';

export default function SavedItemsPage() {
  const { currentUser, savedProductIds } = useAuth();
  const { products } = useProductCatalog();
  const safeSavedProductIds = Array.isArray(savedProductIds) ? savedProductIds : [];
  const savedProducts = products.filter((product) =>
    safeSavedProductIds.some((id) => idsMatch(id, product.id)),
  );
  const retentionLinks = getCustomerRetentionLinks(currentUser);
  const savedSearchLinks = retentionLinks.searchLinks.slice(0, 3);

  return (
    <section className="container account-page">
      <div className="section-heading">
        <div className="page-heading-brand-wrap">
          <BrandLogo variant="bag" alt="ShopOra" className="page-heading-brand" />
          <div>
            <p className="eyebrow">Account</p>
            <h1>Saved Items</h1>
            <p>
              {currentUser
                ? `Favorites saved for ${currentUser.firstName}. Keep them in one place for quicker comparison and easier repeat visits.`
                : 'Products saved for later will appear here. Sign in to keep a wishlist tied to your account.'}
            </p>
          </div>
        </div>
        <span className="count-badge">
          {safeSavedProductIds.length} saved style{safeSavedProductIds.length === 1 ? '' : 's'}
        </span>
      </div>

      <p className="account-page-note">
        Saved items work like a simple wishlist. Compare favorite finds, revisit styles later, and keep a lightweight
        ShopOra member trail without any points, rewards, or redemption balance.
      </p>

      {savedProducts.length ? (
        <>
          <div className="account-toolbar">
            <div className="catalog-context">
              <span className="query-chip">Save favorites, then compare later</span>
              <span className="query-chip">
                {savedProducts.length} favorite{savedProducts.length === 1 ? '' : 's'} ready to browse
              </span>
              <span className="query-chip">Wishlist stays tied to this account</span>
            </div>
            <div className="empty-state-actions">
              <Link to={retentionLinks.continueShopping.to} className="btn btn-dark btn-small">
                {retentionLinks.continueShopping.label}
              </Link>
              <Link to={retentionLinks.account.to} className="btn btn-ghost btn-small">
                {retentionLinks.account.label}
              </Link>
              <Link to={retentionLinks.browseSale.to} className="btn btn-ghost btn-small">
                {retentionLinks.browseSale.label}
              </Link>
            </div>
          </div>
          <div className="product-grid">
            {savedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state account-empty">
          <h2>No saved items yet.</h2>
          <p>
            Tap the heart icon on a product to build a wishlist, then come back here to compare favorites, revisit
            them later, or pick up a new search.
          </p>
          <div className="empty-state-actions">
            <Link to={retentionLinks.continueShopping.to} className="btn btn-dark">
              {retentionLinks.continueShopping.label}
            </Link>
            <Link to={retentionLinks.browseSale.to} className="btn btn-ghost">
              {retentionLinks.browseSale.label}
            </Link>
            <Link to={retentionLinks.orders.to} className="btn btn-ghost">
              {retentionLinks.orders.label}
            </Link>
            <Link to={retentionLinks.account.to} className="btn btn-ghost">
              {retentionLinks.account.label}
            </Link>
          </div>
          <div className="recommendation-links account-empty-links" aria-label="Search shortcuts">
            {savedSearchLinks.map((link) => (
              <Link key={link.to} to={link.to} className="query-chip">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
