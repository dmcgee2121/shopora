import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useMiniCart } from '../context/MiniCartContext';
import { getProductImage } from '../data/products';
import { getProductMerchandisingBadges, getProductReviewDisplay, getProductShelfLabel } from '../utils/merchandising';
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
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function formatMoney(value) {
  const numeric = Number(value);
  return `$${Number.isFinite(numeric) ? numeric.toFixed(2) : '0.00'}`;
}

function getDiscoveryCue(product, stockState, reviewDisplay, price) {
  const listPrice = Number(product?.price ?? 0);
  const saleSavings = Number.isFinite(listPrice) && Number.isFinite(price) && listPrice > price ? listPrice - price : 0;

  if (saleSavings > 0) {
    return `Save ${formatMoney(saleSavings)} on this style`;
  }

  if (stockState.tone === 'low') {
    return stockState.label;
  }

  if (stockState.tone === 'out') {
    return stockState.label;
  }

  if (reviewDisplay.hasReviews) {
    return `${reviewDisplay.reviewCount.toLocaleString()} shopper ratings`;
  }

  if (product?.featured) {
    return "Currently featured in this week's edit";
  }

  if (product?.isNew) {
    return 'New arrival, updated weekly';
  }

  if (product?.isSale) {
    return 'Featured markdown';
  }

  return product?.shippingNote || product?.returnNote || 'Style-ready pick for easy outfit building.';
}

function StarRating({ rating, reviewCount }) {
  const safeRating = Number.isFinite(rating) ? rating : 0;
  const safeReviewCount = Number.isFinite(reviewCount) ? reviewCount : 0;
  const filledStars = Math.round(safeRating);
  const reviewsLabel = safeReviewCount > 0 ? `${safeReviewCount.toLocaleString()} shopper ratings` : 'No shopper ratings yet';

  return (
    <div className="rating" aria-label={`Rated ${safeRating.toFixed(1)} out of 5 by ${safeReviewCount} reviewers`}>
      <span className="rating-label">Customer rating</span>
      <div className="rating-stars" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className={index < filledStars ? 'filled' : ''}>
            &#9733;
          </span>
        ))}
      </div>
      <span className="rating-value">
        {safeRating.toFixed(1)} &middot; {reviewsLabel}
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
  const { isAuthenticated, isSavedItem, isSavingSavedItem, toggleSavedItem } = useAuth();
  const { openMiniCart } = useMiniCart();
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const safeProduct = product ?? {};
  const productId = safeProduct.id ?? '';
  const productName = safeProduct.name || 'ShopOra style';
  const productBrand = safeProduct.brand || 'ShopOra';
  const productPath = productId ? `/product/${productId}` : '#';
  const price = safeProduct.salePrice ?? safeProduct.price ?? 0;
  const hasSalePrice = safeProduct.salePrice !== null && safeProduct.salePrice !== undefined;
  const productDescription = typeof safeProduct.description === 'string' ? safeProduct.description.trim() : '';
  const sizes = Array.isArray(safeProduct.sizes) ? safeProduct.sizes : [];
  const colors = Array.isArray(safeProduct.colors) ? safeProduct.colors : [];
  const images = Array.isArray(safeProduct.images) ? safeProduct.images : safeProduct.image ? [safeProduct.image] : [];
  const primarySize = sizes[0];
  const primaryColor = colors[0];
  const previewImage = hovered && images.length > 1 ? getProductImage(safeProduct, 1) : getProductImage(safeProduct);
  const isSaved = typeof isSavedItem === 'function' ? Boolean(isSavedItem(productId)) : false;
  const isSaving = typeof isSavingSavedItem === 'function' ? Boolean(isSavingSavedItem(productId)) : false;
  const redirectTarget = encodeURIComponent(`${location.pathname}${location.search}`);
  const stockState = getStockState(Number(safeProduct.stockCount ?? 0));
  const isOutOfStock = stockState.tone === 'out';
  const canAddToCart = Boolean(productId) && !isOutOfStock;
  const shelfLabel = getProductShelfLabel(safeProduct);
  const merchandisingBadges = getProductMerchandisingBadges(safeProduct);
  const reviewDisplay = getProductReviewDisplay(safeProduct);
  const discoveryCue = getDiscoveryCue(safeProduct, stockState, reviewDisplay, price);
  const supportCue =
    safeProduct.shippingNote ||
    safeProduct.returnNote ||
    (reviewDisplay.hasReviews ? reviewDisplay.summary : 'Open the product page to see sizing, shipping, and support details.');
  const leftBadges = merchandisingBadges.filter((badge) => badge.tone === 'badge-new' || badge.tone === 'badge-featured');
  const rightBadges = merchandisingBadges.filter((badge) => !leftBadges.includes(badge));

  const handleSave = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${redirectTarget}&message=save`);
      return;
    }

    if (typeof toggleSavedItem === 'function') {
      toggleSavedItem(safeProduct);
    }
  };

  return (
    <article
      className="product-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="product-media-wrap">
        <Link to={productPath} className="product-image-link" aria-label={`${productName} details`}>
          <div className="product-media">
            <ShopOraImage
              src={previewImage}
              alt={productName}
              className={`product-media-image${hovered ? ' is-hovered' : ''}`}
              fallbackText="Image coming soon"
            />
            <div className="badge-stack badge-stack-left">
              {leftBadges.map((badge) => (
                <span key={badge.label} className={`badge ${badge.tone}`}>
                  {badge.label}
                </span>
              ))}
            </div>
            <div className="badge-stack badge-stack-right">
              {rightBadges.map((badge) => (
                <span key={badge.label} className={`badge ${badge.tone}`}>
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
        </Link>

        <button
          type="button"
          className={isSaved ? 'save-button is-saved' : 'save-button'}
          aria-label={
            isSaving
              ? `${isSaved ? 'Removing' : 'Saving'} ${productName}`
              : isSaved
                ? `Remove ${productName} from saved items`
                : `Save ${productName}`
          }
          aria-pressed={isSaved}
          aria-busy={isSaving}
          title={
            isSaving
              ? 'Updating saved items...'
              : isSaved
                ? `Remove ${productName} from saved items`
                : `Save ${productName}`
          }
          disabled={isSaving}
          onClick={handleSave}
        >
          <HeartIcon filled={isSaved} />
        </button>
      </div>

      <div className="product-body">
        <p className="product-brand">{productBrand}</p>
        <Link to={productPath} className="product-name">
          {productName}
        </Link>
        {productDescription ? <p className="product-story">{productDescription}</p> : null}
        <p className="product-meta">{shelfLabel}</p>
        <p className="product-review-caption">
          {reviewDisplay.hasReviews
            ? `${reviewDisplay.reviewCount.toLocaleString()} shopper ratings`
            : 'No shopper ratings yet'}
        </p>
        {reviewDisplay.hasReviews ? <p className="product-review-summary-mini">{reviewDisplay.summary}</p> : null}
        <div className="price-row">
          <span className={hasSalePrice ? 'price price-sale' : 'price'}>{formatMoney(price)}</span>
          {hasSalePrice ? <span className="compare-price">{formatMoney(safeProduct.price)}</span> : null}
        </div>
        <StarRating rating={Number(safeProduct.rating ?? 0)} reviewCount={Number(safeProduct.reviewCount ?? 0)} />
        <p className={`stock-note stock-note-${stockState.tone}`}>{stockState.label}</p>
        <p className="product-discovery-cue">{discoveryCue}</p>
        {supportCue ? <p className="product-discovery-support">{supportCue}</p> : null}
        {colors.length ? (
          <div className="product-swatches" aria-label={`${productName} colors`}>
            {colors.slice(0, 4).map((color) => (
              <span key={color} className="swatch" title={color} aria-label={color}>
                <span style={{ backgroundColor: getSwatchColor(color) }} />
              </span>
            ))}
            {colors.length > 4 ? <span className="swatch-more">+{colors.length - 4}</span> : null}
          </div>
        ) : null}
        <div className="card-actions">
          <button
            type="button"
            className="btn btn-dark btn-small"
            disabled={!canAddToCart}
            onClick={() => {
              addItem(safeProduct, { size: primarySize, color: primaryColor });
              openMiniCart();
            }}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <Link to={productPath} className="btn btn-ghost btn-small">
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
