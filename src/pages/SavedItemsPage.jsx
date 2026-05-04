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
      </div>

      {savedProducts.length ? (
        <div className="product-grid">
          {savedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="empty-state account-empty">
          <h2>No saved items yet.</h2>
          <p>Tap the heart icon on a product to save it for later.</p>
          <Link to="/women" className="btn btn-dark">
            Browse products
          </Link>
        </div>
      )}
    </section>
  );
}
