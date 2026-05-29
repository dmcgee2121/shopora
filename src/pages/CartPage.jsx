import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import ProductCard from '../components/ProductCard';
import QuantitySelector from '../components/QuantitySelector';
import ShopOraImage from '../components/ShopOraImage';
import SupportLinkStrip from '../components/SupportLinkStrip';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProductCatalog } from '../context/ProductCatalogContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { getCustomerRetentionLinks } from '../utils/customerRetention';
import { getDepartmentLinks, getRecommendedProducts } from '../utils/recommendations';
import { filterRecentlyViewedProducts, readRecentlyViewedIds } from '../utils/recentlyViewed';
import { getSupportLinks } from '../utils/supportLinks';

export default function CartPage() {
  const { products } = useProductCatalog();
  useDocumentTitle('ShopOra | Cart');
  const { currentUser, savedProductIds } = useAuth();
  const { items, subtotal, increaseItem, decreaseItem, removeItem, clearCart } = useCart();
  const departmentLinks = useMemo(() => getDepartmentLinks(), []);
  const retentionLinks = getCustomerRetentionLinks(currentUser);
  const supportLinks = getSupportLinks(currentUser);
  const cartSearchLinks = retentionLinks.searchLinks.slice(0, 3);
  const accountLink = currentUser ? '/account' : '/login';
  const accountLabel = currentUser ? 'View account' : 'Sign in';
  const safeSavedProductIds = Array.isArray(savedProductIds) ? savedProductIds : [];
  const recommendedProducts = useMemo(
    () =>
      getRecommendedProducts(products, items, {
        excludeIds: items.map((item) => item.productId),
        limit: 4,
      }),
    [items, products],
  );
  const recentlyViewedProducts = useMemo(
    () =>
      filterRecentlyViewedProducts(
        products,
        readRecentlyViewedIds(8).filter((itemId) => !items.some((item) => item.productId === itemId)),
      ).slice(0, 4),
    [items, products],
  );

  return (
    <section className="container cart-page">
      <div className="section-heading">
        <div className="page-heading-brand-wrap">
          <BrandLogo variant="bag" alt="ShopOra" className="page-heading-brand" />
          <div>
            <h1>Your cart</h1>
            <p>Review your selected items before heading to checkout.</p>
          </div>
        </div>
      </div>

      {items.length ? (
        <>
          <div className="cart-layout">
            <div className="cart-list">
              {items.map((item) => (
                <article key={item.key} className="cart-item">
                  <ShopOraImage src={item.image} alt={item.name} className="cart-item-image" fallbackText="ShopOra" />
                  <div className="cart-item-copy">
                    <div className="cart-item-head">
                      <div>
                        <p>{item.category}</p>
                        <h3>{item.name}</h3>
                      </div>
                      <button
                        type="button"
                        className="text-button"
                        aria-label={`Remove ${item.name} from cart`}
                        onClick={() => removeItem(item.key)}
                      >
                        Remove
                      </button>
                    </div>
                    <p className="cart-meta">
                      Size: {item.size} &middot; Color: {item.color} &middot; ${item.unitPrice.toFixed(2)} each
                    </p>
                    <div className="cart-item-footer">
                      <QuantitySelector
                        quantity={item.quantity}
                        onDecrease={() => decreaseItem(item.key)}
                        onIncrease={() => increaseItem(item.key)}
                        decreaseLabel={`Decrease quantity of ${item.name}`}
                        increaseLabel={`Increase quantity of ${item.name}`}
                      />
                      <strong>${(item.unitPrice * item.quantity).toFixed(2)}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="cart-summary">
              <h2>Order summary</h2>
              <div className="summary-row">
                <span>Subtotal</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>
              <div className="summary-row">
                <span>Estimated shipping</span>
                <strong>Free</strong>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>
              <p className="account-page-note">
                {currentUser
                  ? `Signed in? ${safeSavedProductIds.length ? 'Your saved items and orders stay tied to your account.' : 'Your orders stay tied to your account, and you can save favorites as you browse.'}`
                  : 'Sign in to keep saved items and order history together in one account view.'}
              </p>
              <Link to="/checkout" className="btn btn-dark full-width">
                Proceed to checkout
              </Link>
              <button type="button" className="btn btn-ghost full-width" onClick={clearCart}>
                Clear cart
              </button>
            </aside>
          </div>

          {recommendedProducts.length ? (
            <section className="related-section cart-recommendations">
              <div className="section-heading">
                <div>
                  <h2>Pairs well with your cart</h2>
                  <p>Lightweight extras that work with items already in your bag.</p>
                </div>
              </div>
              <div className="product-grid">
                {recommendedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ) : null}

          {recentlyViewedProducts.length ? (
            <section className="related-section cart-recommendations">
              <div className="section-heading">
                <div>
                  <h2>Recently viewed</h2>
                  <p>Jump back to styles you checked out earlier.</p>
                </div>
              </div>
              <div className="product-grid">
                {recentlyViewedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : (
        <>
          <div className="empty-state cart-empty">
            <h2>Your cart is empty.</h2>
            <p>
              Browse fresh picks, save a few favorites, and return here when you are ready to review your order.
              Sign in to keep favorites and orders together in one account view.
            </p>
            <div className="empty-state-actions">
              <Link to={retentionLinks.continueShopping.to} className="btn btn-dark">
                {retentionLinks.continueShopping.label}
              </Link>
              <Link to={accountLink} className="btn btn-ghost">
                {accountLabel}
              </Link>
              <Link to={retentionLinks.browseSale.to} className="btn btn-ghost">
                {retentionLinks.browseSale.label}
              </Link>
            </div>
            <div className="recommendation-links" aria-label="Shop by department">
              {departmentLinks.map((link) => (
                <Link key={link.to} to={link.to} className="query-chip">
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="recommendation-links" aria-label="Search for styles">
              {cartSearchLinks.map((link) => (
                <Link key={link.to} to={link.to} className="query-chip">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          {recommendedProducts.length ? (
            <section className="related-section cart-recommendations">
              <div className="section-heading">
                <div>
                  <h2>Good places to start</h2>
                  <p>A few easy pieces to begin your cart.</p>
                </div>
              </div>
              <div className="product-grid">
                {recommendedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}

      <SupportLinkStrip
        title="Need help before checkout?"
        description="Review shipping, returns, privacy, and account details or contact support before you place an order."
        links={supportLinks}
      />
    </section>
  );
}
