import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useMiniCart } from '../context/MiniCartContext';
import { getProductImage } from '../data/products';
import ShopOraImage from './ShopOraImage';

const SWATCH_COLORS = {
  black: '#202020',
  white: '#f7f4ee',
  ivory: '#f3eadf',
  cream: '#efe4d2',
  oat: '#cdbda8',
  sand: '#ddc7ad',
  taupe: '#b7a792',
  stone: '#c9c0b6',
  mocha: '#8f6f53',
  petal: '#d9a3a0',
  brown: '#6f4e37',
  tan: '#c79d72',
  khaki: '#c6b08c',
  olive: '#6d7554',
  navy: '#2f405d',
  charcoal: '#4b4b4a',
  heathergray: '#a9aaad',
  silver: '#d9d9d9',
  gold: '#c6a15a',
  pearl: '#e6ded4',
  blue: '#86a9ca',
  chestnut: '#8d5b39',
  nude: '#dbc1b6',
  tortoise: '#8b6c4a',
};

function HeartIcon({ filled = false }) {
  return filled ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 21s-7.1-4.2-9.4-8.5C.6 8.9 2.7 5.5 6.4 5.2c2-.2 3.8.7 5.1 2 1.3-1.3 3.1-2.2 5.1-2 3.7.3 5.8 3.7 3.8 7.3C19.1 16.8 12 21 12 21Z"
        fill="currentColor"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 21s-7.1-4.2-9.4-8.5C.6 8.9 2.7 5.5 6.4 5.2c2-.2 3.8.7 5.1 2 1.3-1.3 3.1-2.2 5.1-2 3.7.3 5.8 3.7 3.8 7.3C19.1 16.8 12 21 12 21Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarRating({ rating, reviewCount }) {
  const filledStars = Math.round(rating);

  return (
    <div className="rating" aria-label={`Rated ${rating.toFixed(1)} out of 5 by ${reviewCount} reviewers`}>
      <div className="rating-stars" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className={index < filledStars ? 'filled' : ''}>
            ★
          </span>
        ))}
      </div>
      <span className="rating-value">
        {rating.toFixed(1)} · {reviewCount}
      </span>
    </div>
  );
}

function getSwatchColor(value) {
  const key = value.replace(/\s+/g, '').toLowerCase();
  return SWATCH_COLORS[key] ?? '#c9b7a1';
}

function getStockState(stockCount) {
  if (stockCount <= 0) return { label: 'Out of stock', tone: 'out' };
  if (stockCount <= 7) return { label: `Only ${stockCount} left`, tone: 'low' };
  return { label: 'In stock', tone: 'in' };
}

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { isAuthenticated, isSavedItem, toggleSavedItem } = useAuth();
  const { openMiniCart } = useMiniCart();
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const safeProduct = product ?? {};
  const price = safeProduct.salePrice ?? safeProduct.price ?? 0;
  const sizes = Array.isArray(safeProduct.sizes) ? safeProduct.sizes : [];
  const colors = Array.isArray(safeProduct.colors) ? safeProduct.colors : [];
  const images = Array.isArray(safeProduct.images) ? safeProduct.images : safeProduct.image ? [safeProduct.image] : [];
  const primarySize = sizes[0];
  const primaryColor = colors[0];
  const previewImage = hovered && images.length > 1 ? getProductImage(safeProduct, 1) : safeProduct.image;
  const isSaved = typeof isSavedItem === 'function' ? Boolean(isSavedItem(safeProduct.id)) : false;
  const redirectTarget = encodeURIComponent(`${location.pathname}${location.search}`);
  const stockState = getStockState(Number(safeProduct.stockCount ?? 0));
  const isOutOfStock = stockState.tone === 'out';

  const handleSave = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${redirectTarget}&message=save`);
      return;
    }

    if (typeof toggleSavedItem === 'function') {
      toggleSavedItem(product);
    }
  };

  return (
    <article
      className="product-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/product/${product.id}`} className="product-image-link">
        <div className="product-media">
        <ShopOraImage
          src={previewImage}
          alt={safeProduct.name}
          className={`product-media-image${hovered ? ' is-hovered' : ''}`}
          fallbackText="Image coming soon"
        />
          {safeProduct.isNew ? <span className="badge badge-new">New</span> : null}
          {safeProduct.isSale ? <span className="badge badge-sale">Sale</span> : null}
          {isOutOfStock ? <span className="badge badge-stock badge-stock-out">{stockState.label}</span> : null}
          {safeProduct.stockCount > 0 && safeProduct.stockCount <= 7 ? (
            <span className="badge badge-stock badge-stock-low">{stockState.label}</span>
          ) : null}
        </div>
      </Link>

      <button
        type="button"
        className={isSaved ? 'save-button is-saved' : 'save-button'}
        aria-label={isSaved ? `Remove ${product.name} from saved items` : `Save ${product.name}`}
        onClick={handleSave}
      >
        <HeartIcon filled={isSaved} />
      </button>

      <div className="product-body">
        <p className="product-brand">{safeProduct.brand}</p>
        <Link to={`/product/${safeProduct.id}`} className="product-name">
          {safeProduct.name}
        </Link>
        <div className="price-row">
          <span className="price">${price.toFixed(2)}</span>
          {safeProduct.salePrice ? <span className="compare-price">${Number(safeProduct.price ?? 0).toFixed(2)}</span> : null}
        </div>
        <StarRating rating={Number(safeProduct.rating ?? 0)} reviewCount={Number(safeProduct.reviewCount ?? 0)} />
        <p className={`stock-note stock-note-${stockState.tone}`}>{stockState.label}</p>
        <div className="product-swatches" aria-label={`${safeProduct.name} colors`}>
          {colors.slice(0, 4).map((color) => (
            <span key={color} className="swatch" title={color} aria-label={color}>
              <span style={{ backgroundColor: getSwatchColor(color) }} />
            </span>
          ))}
        </div>
        <div className="card-actions">
          <button
            type="button"
            className="btn btn-dark btn-small"
            disabled={isOutOfStock}
            onClick={() => {
              addItem(safeProduct, { size: primarySize, color: primaryColor });
              if (!isOutOfStock) openMiniCart();
            }}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <Link to={`/product/${safeProduct.id}`} className="btn btn-ghost btn-small">
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
