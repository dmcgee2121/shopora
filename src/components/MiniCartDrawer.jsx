import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ShopOraImage from './ShopOraImage';

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 6 18 18M18 6 6 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function MiniCartDrawer({ isOpen, onClose }) {
  const { items, count, subtotal, increaseItem, decreaseItem, removeItem } = useCart();
  const drawerTitleId = 'mini-cart-title';

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.classList.add('drawer-open');
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('drawer-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const itemCountLabel = count === 1 ? '1 item' : `${count} items`;

  return (
    <div className="mini-cart-layer" aria-hidden="false">
      <button
        type="button"
        className="mini-cart-overlay"
        aria-label="Close mini cart"
        onClick={onClose}
      />
      <aside
        className="mini-cart-drawer"
        aria-labelledby={drawerTitleId}
        role="dialog"
        aria-modal="true"
      >
        <div className="mini-cart-header">
          <div className="mini-cart-header-copy">
            <p>Your Cart</p>
            <div className="mini-cart-header-row">
              <h2 id={drawerTitleId}>Your Cart</h2>
              <span className="mini-cart-count" aria-live="polite">
                {count ? itemCountLabel : 'Empty'}
              </span>
            </div>
          </div>
          <button type="button" className="mini-cart-close" aria-label="Close drawer" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="mini-cart-body">
          {items.length ? (
            <div className="mini-cart-items">
              {items.map((item) => (
                <article key={item.key} className="mini-cart-item">
                  <ShopOraImage
                    src={item.image}
                    alt={item.name}
                    className="mini-cart-item-image"
                    fallbackText="ShopOra"
                  />
                  <div className="mini-cart-item-copy">
                    <div className="mini-cart-item-head">
                      <div>
                        <h3>{item.name}</h3>
                        <p>
                          {item.size ? `Size: ${item.size}` : 'One size'}
                          {item.color ? ` - Color: ${item.color}` : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="text-button mini-cart-remove"
                        aria-label={`Remove ${item.name} from cart`}
                        onClick={() => removeItem(item.key)}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mini-cart-item-footer">
                      <div className="mini-cart-stepper" aria-label={`${item.name} quantity`}>
                        <button
                          type="button"
                          className="mini-cart-stepper-btn"
                          aria-label={`Decrease quantity of ${item.name}`}
                          onClick={() => decreaseItem(item.key)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="mini-cart-stepper-value" aria-live="polite">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="mini-cart-stepper-btn"
                          aria-label={`Increase quantity of ${item.name}`}
                          onClick={() => increaseItem(item.key)}
                        >
                          +
                        </button>
                      </div>
                      <strong>${(item.unitPrice * item.quantity).toFixed(2)}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mini-cart-empty">
              <h3>Your cart is empty.</h3>
              <p>Browse the latest styles and add your favorites to start building your look.</p>
              <Link to="/women" className="btn btn-dark full-width" onClick={onClose}>
                Start Shopping
              </Link>
            </div>
          )}
        </div>

        <div className="mini-cart-footer">
          <div className="mini-cart-total">
            <div>
              <span>Subtotal</span>
              <p>Shipping calculated at checkout</p>
            </div>
            <strong>${subtotal.toFixed(2)}</strong>
          </div>
          <p className="mini-cart-note">Checkout is currently in demo mode.</p>
          <div className="mini-cart-actions">
            <Link to="/cart" className="btn btn-ghost full-width" onClick={onClose}>
              View Cart
            </Link>
            <Link to="/checkout" className="btn btn-dark full-width" onClick={onClose}>
              Checkout
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
