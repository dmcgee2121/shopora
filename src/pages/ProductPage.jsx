import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import QuantitySelector from '../components/QuantitySelector';
import ShopOraImage from '../components/ShopOraImage';
import CatalogStatusNote from '../components/CatalogStatusNote';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useMiniCart } from '../context/MiniCartContext';
import { useProductCatalog } from '../context/ProductCatalogContext';
import { getProductImage } from '../data/products';
import { getProductMerchandisingBadges, getProductShelfLabel } from '../utils/merchandising';
import { idsMatch, normalizeId } from '../utils/idUtils';
import { getRecommendedProducts } from '../utils/recommendations';

const RECENT_KEY = 'shopora-recently-viewed-v1';

function readRecentlyViewed() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeId).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function storeRecentlyViewed(id) {
  if (typeof window === 'undefined') return;
  try {
    const productId = normalizeId(id);
    const current = readRecentlyViewed().filter((item) => !idsMatch(item, productId));
    current.unshift(productId);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(current.slice(0, 6)));
  } catch {
    // Ignore storage errors for local-only browsing.
  }
}

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

function getSwatchColor(value) {
  const key = value.replace(/\s+/g, '').toLowerCase();
  const colors = {
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

  return colors[key] ?? '#c9b7a1';
}

function SizeGuideModal({ isOpen, onClose }) {
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

  return (
    <div className="modal-layer">
      <button type="button" className="modal-overlay" aria-label="Close size guide" onClick={onClose} />
      <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="size-guide-title">
        <div className="modal-header">
          <div>
            <p className="modal-kicker">Size guide</p>
            <h2 id="size-guide-title">Clothing size chart</h2>
          </div>
          <button type="button" className="mini-cart-close" aria-label="Close size guide" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className="size-guide-table-wrap">
          <table className="size-guide-table">
            <thead>
              <tr>
                <th>Size</th>
                <th>Bust/Chest</th>
                <th>Waist</th>
                <th>Hips</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>XS</td>
                <td>31-32</td>
                <td>24-25</td>
                <td>34-35</td>
              </tr>
              <tr>
                <td>S</td>
                <td>33-34</td>
                <td>26-27</td>
                <td>36-37</td>
              </tr>
              <tr>
                <td>M</td>
                <td>35-36</td>
                <td>28-29</td>
                <td>38-39</td>
              </tr>
              <tr>
                <td>L</td>
                <td>37-39</td>
                <td>30-32</td>
                <td>40-42</td>
              </tr>
              <tr>
                <td>XL</td>
                <td>40-42</td>
                <td>33-35</td>
                <td>43-45</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="modal-note">Sizing is approximate and can vary slightly by product and fabric.</p>
      </div>
    </div>
  );
}

export default function ProductPage() {
  const { products } = useProductCatalog();
  const { id } = useParams();
  const product = products.find((item) => idsMatch(item.id, id));
  const { addItem } = useCart();
  const { isAuthenticated, isSavedItem, toggleSavedItem } = useAuth();
  const { openMiniCart } = useMiniCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState(() => readRecentlyViewed());
  const galleryImages = Array.isArray(product?.images) ? product.images : product?.image ? [product.image] : [];
  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];
  const colors = Array.isArray(product?.colors) ? product.colors : [];
  const details = Array.isArray(product?.details) ? product.details : [];
  const stockCount = Number(product?.stockCount ?? 0);
  const isOutOfStock = stockCount <= 0;
  const rating = Number(product?.rating ?? 0);
  const reviewCount = Number(product?.reviewCount ?? 0);
  const hasSalePrice = product?.salePrice !== null && product?.salePrice !== undefined;
  const basePrice = Number(product?.price ?? 0);
  const price = hasSalePrice ? Number(product.salePrice) : basePrice;
  const stockMessage =
    stockCount <= 0 ? 'Out of stock' : stockCount <= 7 ? `Only ${stockCount} left` : 'In stock and ready to ship';

  useEffect(() => {
    setSelectedSize(sizes[0] ?? '');
    setSelectedColor(colors[0] ?? '');
    setQuantity(1);
    setActiveImage(0);
  }, [product?.id, sizes, colors]);

  useLayoutEffect(() => {
    if (!product) return;
    storeRecentlyViewed(product.id);
    setRecentlyViewed(readRecentlyViewed());
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return getRecommendedProducts(products, [product], {
      excludeIds: [product.id],
      limit: 4,
    });
  }, [product, products]);

  const recentlyViewedProducts = useMemo(() => {
    if (!product) return [];
    const ids = recentlyViewed.filter((itemId) => !idsMatch(itemId, product.id));
    return ids.map((itemId) => products.find((item) => idsMatch(item.id, itemId))).filter(Boolean);
  }, [product, recentlyViewed, products]);

  if (!product) {
    return (
      <section className="container empty-product">
        <h1>Product not found</h1>
        <p>The style you are looking for does not exist in the current catalog.</p>
        <Link to="/" className="btn btn-dark">
          Return home
        </Link>
      </section>
    );
  }

  const currentImage = getProductImage(product, activeImage);
  const shelfLabel = getProductShelfLabel(product);
  const merchandisingBadges = getProductMerchandisingBadges(product);
  const primaryBadges = merchandisingBadges.filter(
    (badge) => badge.tone === 'badge-new' || badge.tone === 'badge-sale' || badge.tone === 'badge-featured',
  );
  const secondaryBadges = merchandisingBadges.filter((badge) => !primaryBadges.includes(badge));
  const storyHighlights = details.slice(0, 3);
  const quickFacts = [
    { label: 'Material', value: product.material },
    { label: 'Care', value: product.care },
    { label: 'Fit', value: product.fit },
    { label: 'Shipping', value: product.shippingNote },
    { label: 'Returns', value: product.returnNote },
  ].filter((item) => item.value);

  const handleAddToCart = () => {
    const added = addItem(product, {
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
    if (added !== false) {
      openMiniCart();
    }
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}&message=save`);
      return;
    }

    if (typeof toggleSavedItem === 'function') {
      toggleSavedItem(product);
    }
  };

  return (
    <section className="container product-page">
      <CatalogStatusNote className="product-catalog-status" />
      <div className="product-detail">
        <div className="product-gallery">
          <div className="product-detail-media">
            <ShopOraImage
              src={currentImage}
              alt={product.name}
              className="product-detail-image"
              fallbackText="Image coming soon"
            />
            <div className="badge-stack badge-stack-left">
              {primaryBadges.map((badge) => (
                <span key={badge.label} className={`badge ${badge.tone}`}>
                  {badge.label}
                </span>
              ))}
            </div>
            <div className="badge-stack badge-stack-right">
              {secondaryBadges.map((badge) => (
                <span key={badge.label} className={`badge ${badge.tone}`}>
                  {badge.label}
                </span>
              ))}
            </div>
          </div>

          {galleryImages.length > 1 ? (
            <>
              <div className="thumb-rail" aria-label="Product images">
                {galleryImages.map((thumb, index) => (
                  <button
                    key={thumb}
                    type="button"
                    className={activeImage === index ? 'thumb active' : 'thumb'}
                    onClick={() => setActiveImage(index)}
                  >
                    <ShopOraImage
                      src={thumb}
                      alt={`${product.name} view ${index + 1}`}
                      className="product-thumb-image"
                      fallbackText="ShopOra"
                    />
                  </button>
                ))}
              </div>
              <p className="product-gallery-note">Tap a thumbnail for alternate angles and color views.</p>
            </>
          ) : null}
        </div>

        <div className="product-detail-copy">
          <p className="product-page-kicker">Product overview</p>
          <p className="product-brand">{product.brand}</p>
          <h1>{product.name}</h1>
          <div className="detail-subline">
            <span className="product-sku">SKU {product.sku}</span>
            <span className="product-fit">{shelfLabel}</span>
            <span className="product-fit">{product.fit}</span>
          </div>
          <div className="rating rating-detail" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
            <div className="rating-stars" aria-hidden="true">
              {Array.from({ length: 5 }, (_, index) => (
                <span key={index} className={index < Math.round(rating) ? 'filled' : ''}>
                  &#9733;
                </span>
              ))}
            </div>
            <span className="rating-value">
              {rating.toFixed(1)} &middot; {reviewCount.toLocaleString()} reviews
            </span>
          </div>
          <div className="price-row price-row-large">
            <span className="price">${price.toFixed(2)}</span>
            {hasSalePrice ? <span className="compare-price">${basePrice.toFixed(2)}</span> : null}
          </div>
          <p className="price-note">A clear, demo-ready view of the price shoppers will pay today.</p>
          <p className={`stock-note stock-note-${isOutOfStock ? 'out' : stockCount <= 7 ? 'low' : 'in'}`}>
            {stockMessage}
          </p>
          <p className="detail-description">{product.description}</p>

          {quickFacts.length ? (
            <div className="product-story-grid" aria-label="Product story and support highlights">
              <article className="product-story-card">
                <p className="product-section-label">Design notes</p>
                <h3>How it wears</h3>
                <ul className="product-story-list">
                  {storyHighlights.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </article>
              <article className="product-story-card">
                <p className="product-section-label">Fabric and fit</p>
                <h3>What shoppers need to know</h3>
                <dl className="product-fact-list">
                  {quickFacts.map((fact) => (
                    <div key={fact.label} className="product-fact-item">
                      <dt>{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
              <article className="product-story-card">
                <p className="product-section-label">Support</p>
                <h3>Confidence to buy</h3>
                <ul className="product-story-list product-support-list">
                  <li>Secure checkout through Stripe.</li>
                  <li>{product.shippingNote}</li>
                  <li>{product.returnNote}</li>
                  <li>
                    Need help? <Link to="/contact">Contact customer support</Link>.
                  </li>
                </ul>
              </article>
            </div>
          ) : null}

          <div className="product-purchase-panel">
            <div className="selector-block">
              <div className="selector-head">
                <h3>Size</h3>
                <button type="button" className="text-button" onClick={() => setSizeGuideOpen(true)}>
                  Size Guide
                </button>
              </div>
              <div className="chip-row">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={selectedSize === size ? 'chip active' : 'chip'}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="selector-block">
              <h3>Color</h3>
              <div className="swatch-row">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={selectedColor === color ? 'color-swatch active' : 'color-swatch'}
                    onClick={() => setSelectedColor(color)}
                    aria-label={color}
                    title={color}
                  >
                    <span style={{ backgroundColor: getSwatchColor(color) }} />
                  </button>
                ))}
              </div>
            </div>

            <div className="selector-block">
              <h3>Quantity</h3>
              <QuantitySelector
                quantity={quantity}
                onDecrease={() => setQuantity((value) => Math.max(1, value - 1))}
                onIncrease={() => setQuantity((value) => value + 1)}
              />
            </div>

            <div className="product-actions">
              <button type="button" className="btn btn-dark" onClick={handleAddToCart} disabled={isOutOfStock}>
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={handleSave}>
                {typeof isSavedItem === 'function' && isSavedItem(product.id) ? 'Saved' : 'Save Item'}
              </button>
              <Link to="/cart" className="btn btn-outline">
                View Cart
              </Link>
            </div>
            <p className="product-support-note">
              Secure checkout, easy returns, and shipping updates are ready for a polished demo experience.
            </p>
          </div>

          <div className="product-accordions">
            <details open>
              <summary>Product details</summary>
              <ul>
                {details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </details>
            <details>
              <summary>Materials &amp; care</summary>
              <div className="accordion-copy">
                <p>
                  <strong>Material:</strong> {product.material}
                </p>
                <p>
                  <strong>Care:</strong> {product.care}
                </p>
              </div>
            </details>
            <details>
              <summary>Shipping, returns, and support</summary>
              <div className="accordion-copy">
                <p>{product.shippingNote}</p>
                <p>{product.returnNote}</p>
                <p>
                  Questions before ordering? <Link to="/contact">Reach out to support</Link>.
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>

      {recentlyViewedProducts.length ? (
        <section className="related-section">
          <div className="section-heading">
            <div>
              <h2>Recently Viewed</h2>
              <p>Pick up where you left off.</p>
            </div>
          </div>
          <div className="product-grid">
            {recentlyViewedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="related-section">
        <div className="section-heading">
          <div>
            <h2>Complete the look</h2>
            <p>Recommended styles from the same department and category.</p>
          </div>
        </div>
        <div className="product-grid">
          {relatedProducts.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>

      <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </section>
  );
}
