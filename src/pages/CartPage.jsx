import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import ProductCard from '../components/ProductCard';
import QuantitySelector from '../components/QuantitySelector';
import ShopOraImage from '../components/ShopOraImage';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProductCatalog } from '../context/ProductCatalogContext';
import { getDepartmentLinks, getRecommendedProducts } from '../utils/recommendations';
import { filterRecentlyViewedProducts, readRecentlyViewedIds } from '../utils/recentlyViewed';

export default function CartPage() {
  const { products } = useProductCatalog();
  const { currentUser } = useAuth();
  const { items, subtotal, increaseItem, decreaseItem, removeItem, clearCart } = useCart();
  const departmentLinks = useMemo(() => getDepartmentLinks(), []);
  const accountLink = currentUser ? '/account' : '/login';
  const accountLabel = currentUser ? 'View account' : 'Sign in';
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
            <h1>Your Cart</h1>
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
              <Link to="/checkout" className="btn btn-dark full-width">
                Proceed to Checkout
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
                  <h2>Customers also considered</h2>
                  <p>Lightweight extras that pair well with items already in your bag.</p>
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
              Browse the latest styles, then return here to review your full order. Sign in to keep favorites and
              recent orders together in one account view.
            </p>
            <div className="empty-state-actions">
              <Link to="/" className="btn btn-dark">
                Continue shopping
              </Link>
              <Link to={accountLink} className="btn btn-ghost">
                {accountLabel}
              </Link>
            </div>
            <div className="recommendation-links" aria-label="Shop by department">
              {departmentLinks.map((link) => (
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
                  <h2>Popular picks to start with</h2>
                  <p>Shoppers often begin with these best-performing styles.</p>
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
    </section>
  );
}
