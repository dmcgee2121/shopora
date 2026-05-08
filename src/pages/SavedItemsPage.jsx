import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useProductCatalog } from '../context/ProductCatalogContext';
import { idsMatch } from '../utils/idUtils';

export default function SavedItemsPage() {
  const { currentUser, savedProductIds } = useAuth();
  const { products } = useProductCatalog();
  const safeSavedProductIds = Array.isArray(savedProductIds) ? savedProductIds : [];
  const savedProducts = products.filter((product) =>
    safeSavedProductIds.some((id) => idsMatch(id, product.id)),
  );

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
                ? `Favorites saved for ${currentUser.firstName}.`
                : 'Products saved for later will appear here.'}
            </p>
          </div>
        </div>
        <span className="count-badge">
          {safeSavedProductIds.length} saved style{safeSavedProductIds.length === 1 ? '' : 's'}
        </span>
      </div>

      <p className="account-page-note">
        Saved items help you compare looks, revisit favorites, and move faster when you are ready to buy.
      </p>

      {savedProducts.length ? (
        <>
          <div className="account-toolbar">
            <div className="catalog-context">
              <span className="query-chip">
                {savedProducts.length} favorite{savedProducts.length === 1 ? '' : 's'} ready to browse
              </span>
            </div>
            <div className="empty-state-actions">
              <Link to="/women" className="btn btn-dark btn-small">
                Continue shopping
              </Link>
              <Link to="/account/orders" className="btn btn-ghost btn-small">
                View orders
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
          <p>Tap the heart icon on a product to save it for later, then come back here to compare favorites.</p>
          <div className="empty-state-actions">
            <Link to="/women" className="btn btn-dark">
              Browse products
            </Link>
            <Link to="/account/orders" className="btn btn-ghost">
              View orders
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
