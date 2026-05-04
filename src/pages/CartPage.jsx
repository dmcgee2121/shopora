import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import QuantitySelector from '../components/QuantitySelector';
import ShopOraImage from '../components/ShopOraImage';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { items, subtotal, increaseItem, decreaseItem, removeItem, clearCart } = useCart();

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
                    Size: {item.size} · Color: {item.color} · ${item.unitPrice.toFixed(2)} each
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
      ) : (
        <div className="empty-state cart-empty">
          <h2>Your cart is empty.</h2>
          <p>Browse the latest styles and add a few favorites to get started.</p>
          <Link to="/" className="btn btn-dark">
            Continue shopping
          </Link>
        </div>
      )}
    </section>
  );
}
