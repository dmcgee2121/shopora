import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ShopOraImage from '../../components/ShopOraImage';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { idsMatch } from '../../utils/idUtils';
import {
  getProductEditorReadinessChecklist,
  getProductReadinessIssues,
  getProductVisibilityInfo,
} from '../../utils/catalogReadiness';

const emptyForm = {
  name: '',
  brand: '',
  department: 'women',
  category: '',
  price: '',
  salePrice: '',
  description: '',
  image: '',
  images: '',
  sizes: '',
  colors: '',
  rating: '4.5',
  reviewCount: '0',
  stockCount: '0',
  isNew: false,
  isSale: false,
  sku: '',
  material: '',
  care: '',
  fit: '',
  details: '',
  shippingNote: '',
  returnNote: '',
};

function toCsv(value) {
  return value.join(', ');
}

function splitCsv(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatMoney(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : '-';
}

function isValidColor(value) {
  if (typeof window === 'undefined' || typeof window.CSS?.supports !== 'function') {
    return false;
  }

  return window.CSS.supports('color', value);
}

function generateSku(brand, name, category) {
  const base = [brand, name, category]
    .filter(Boolean)
    .join(' ')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 18);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base || 'SHOP'}-${suffix}`;
}

function splitLines(value) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ProductFormPage({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    products,
    addProduct,
    updateProduct,
    isCatalogSaving,
    catalogMutationError,
    clearCatalogMutationError,
  } = useProductCatalog();
  const existingProduct = mode === 'edit' ? products.find((product) => idsMatch(product.id, id)) : null;
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const initialFormRef = useRef(emptyForm);

  useEffect(() => {
    if (!existingProduct) return;

    const nextForm = {
      name: existingProduct.name ?? '',
      brand: existingProduct.brand ?? '',
      department: existingProduct.department ?? 'women',
      category: existingProduct.category ?? '',
      price: String(existingProduct.price ?? ''),
      salePrice: existingProduct.salePrice ? String(existingProduct.salePrice) : '',
      description: existingProduct.description ?? '',
      image: existingProduct.image ?? '',
      images: toCsv(existingProduct.images ?? []),
      sizes: toCsv(existingProduct.sizes ?? []),
      colors: toCsv(existingProduct.colors ?? []),
      rating: String(existingProduct.rating ?? 0),
      reviewCount: String(existingProduct.reviewCount ?? 0),
      stockCount: String(existingProduct.stockCount ?? 0),
      isNew: Boolean(existingProduct.isNew),
      isSale: Boolean(existingProduct.isSale),
      sku: existingProduct.sku ?? '',
      material: existingProduct.material ?? '',
      care: existingProduct.care ?? '',
      fit: existingProduct.fit ?? '',
      details: (existingProduct.details ?? []).join('\n'),
      shippingNote: existingProduct.shippingNote ?? '',
      returnNote: existingProduct.returnNote ?? '',
    };

    setForm(nextForm);
    initialFormRef.current = nextForm;
  }, [existingProduct]);

  useEffect(() => {
    if (mode !== 'create') return;
    initialFormRef.current = emptyForm;
  }, [mode]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (formError) setFormError('');
    if (catalogMutationError) {
      clearCatalogMutationError();
    }
    if (errors[name]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[name];
        return next;
      });
    }
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validate = () => {
    const nextErrors = {};
    const price = Number(form.price);
    const salePrice = form.salePrice ? Number(form.salePrice) : null;
    const stockCount = Number(form.stockCount);
    const rating = Number(form.rating);
    const reviewCount = Number(form.reviewCount);

    if (!form.name.trim()) nextErrors.name = 'Name is required.';
    if (!form.brand.trim()) nextErrors.brand = 'Brand is required.';
    if (!form.department.trim()) nextErrors.department = 'Department is required.';
    if (!form.category.trim()) nextErrors.category = 'Category is required.';
    if (!form.image.trim()) nextErrors.image = 'Primary image URL is required.';
    if (!Number.isFinite(price) || price <= 0) nextErrors.price = 'Price must be greater than 0.';
    if (form.salePrice && (!Number.isFinite(salePrice) || salePrice <= 0 || salePrice >= price)) {
      nextErrors.salePrice = 'Sale price must be greater than 0 and lower than the base price.';
    }
    if (!Number.isFinite(stockCount) || stockCount < 0) {
      nextErrors.stockCount = 'Stock count must be 0 or greater.';
    }
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      nextErrors.rating = 'Rating must be between 0 and 5.';
    }
    if (!Number.isFinite(reviewCount) || reviewCount < 0) {
      nextErrors.reviewCount = 'Review count must be 0 or greater.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isCatalogSaving) {
      return;
    }

    if (mode === 'edit' && !existingProduct) {
      setFormError('The requested product could not be found.');
      return;
    }

    if (!validate()) {
      setFormError('Please correct the highlighted fields before saving.');
      return;
    }

    clearCatalogMutationError();

    const payload = {
      ...form,
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      images: splitCsv(form.images),
      sizes: splitCsv(form.sizes),
      colors: splitCsv(form.colors),
      rating: Number(form.rating),
      reviewCount: Number(form.reviewCount),
      stockCount: Number(form.stockCount),
      details: splitLines(form.details),
      isNew: Boolean(form.isNew),
      isSale: Boolean(form.isSale),
    };

    try {
      await Promise.resolve(mode === 'edit' ? updateProduct(id, payload) : addProduct(payload));
      navigate('/admin/products');
    } catch {
      // catalogMutationError is set by the catalog context.
    }
  };

  const handleCancel = () => {
    const hasChanges = JSON.stringify(form) !== JSON.stringify(initialFormRef.current);
    if (hasChanges && !window.confirm('Discard unsaved changes?')) {
      return;
    }

    navigate('/admin/products');
  };

  const galleryImages = useMemo(() => splitCsv(form.images), [form.images]);
  const colorValues = useMemo(() => splitCsv(form.colors), [form.colors]);
  const sizeValues = useMemo(() => splitCsv(form.sizes), [form.sizes]);
  const editorProduct = useMemo(
    () => ({
      ...form,
      status: existingProduct?.status ?? '',
      visibility: existingProduct?.visibility ?? '',
      archived: Boolean(existingProduct?.archived),
      isArchived: Boolean(existingProduct?.isArchived),
      draft: Boolean(existingProduct?.draft),
      isDraft: Boolean(existingProduct?.isDraft),
      isActive: existingProduct?.isActive,
      featured: Boolean(existingProduct?.featured),
      name: form.name.trim(),
      brand: form.brand.trim(),
      department: form.department.trim(),
      category: form.category.trim(),
      price: form.price,
      salePrice: form.salePrice,
      description: form.description.trim(),
      image: form.image.trim(),
      images: galleryImages,
      sku: form.sku.trim(),
      material: form.material.trim(),
      care: form.care.trim(),
      fit: form.fit.trim(),
      details: splitLines(form.details),
      stockCount: form.stockCount,
      isNew: Boolean(form.isNew),
      isSale: Boolean(form.isSale),
    }),
    [
      form.brand,
      form.category,
      form.care,
      form.department,
      form.description,
      form.details,
      form.fit,
      form.image,
      form.images,
      form.isNew,
      form.isSale,
      form.material,
      form.name,
      form.price,
      form.salePrice,
      form.sku,
      form.stockCount,
      existingProduct?.archived,
      existingProduct?.draft,
      existingProduct?.featured,
      existingProduct?.isActive,
      existingProduct?.isArchived,
      existingProduct?.isDraft,
      existingProduct?.status,
      existingProduct?.visibility,
      galleryImages,
    ],
  );
  const readinessChecklist = useMemo(
    () => getProductEditorReadinessChecklist(editorProduct),
    [editorProduct],
  );
  const readinessIssues = useMemo(
    () => getProductReadinessIssues(editorProduct),
    [editorProduct],
  );
  const readinessReadyCount = readinessChecklist.filter((item) => item.ready).length;
  const readinessNeedsCount = readinessChecklist.length - readinessReadyCount;
  const merchandisingSummary = useMemo(() => {
    const stockCount = Number(form.stockCount);
    const stockLabel = !Number.isFinite(stockCount)
      ? 'Stock not set'
      : stockCount <= 0
        ? 'Out of stock'
        : stockCount <= 7
          ? 'Low stock'
          : 'In stock';
    const priceLabel = form.salePrice
      ? `${formatMoney(form.salePrice)} on sale from ${formatMoney(form.price)}`
      : formatMoney(form.price);
    const assetLabel = `${galleryImages.length} images / ${sizeValues.length} sizes / ${colorValues.length} colors`;
    const visibility = getProductVisibilityInfo(editorProduct);

    return {
      productLabel: `${form.name || 'Untitled product'}${form.brand ? ` - ${form.brand}` : ''}`,
      priceLabel,
      stockLabel,
      stockCount: Number.isFinite(stockCount) ? stockCount : null,
      assetLabel,
      visibility,
    };
  }, [editorProduct, form.brand, form.name, form.price, form.salePrice, form.stockCount, galleryImages.length, sizeValues.length]);

  return (
    <section className="admin-form-page">
      <AdminPageHeader
        eyebrow="Catalog editor"
        title={mode === 'edit' ? 'Edit Product' : 'Add Product'}
        subtitle="Update product merchandising, pricing, inventory flags, and content in one place while keeping the write flow unchanged."
        actionLabel="Back to Products"
        actionTo="/admin/products"
        actionClassName="btn btn-ghost"
      />

      <div className="admin-editor-overview">
        <div className="admin-status-grid admin-editor-summary-grid">
          <div className="admin-status-card">
            <span>Storefront preview</span>
            <strong>{merchandisingSummary.productLabel}</strong>
            <p>
              {form.department || 'Unassigned department'}
              {form.category ? ` / ${form.category}` : ''}{' '}
              {form.sku ? ` - SKU ${form.sku}` : ' - SKU not assigned'}
            </p>
            <div className="status-badges admin-preview-badges">
              <span className={`status-badge ${merchandisingSummary.visibility.className}`}>
                {merchandisingSummary.visibility.label}
              </span>
              <span className="status-badge status-badge-muted">{merchandisingSummary.stockLabel}</span>
            </div>
            <p className="admin-preview-hint">
              {merchandisingSummary.visibility.helper} The editor preview reflects the current draft values before save.
            </p>
          </div>
          <div className="admin-status-card">
            <span>Pricing</span>
            <strong>{merchandisingSummary.priceLabel}</strong>
            <p>Sale price, if set, renders as compare-at pricing in the storefront.</p>
          </div>
          <div className="admin-status-card">
            <span>Inventory</span>
            <strong>{merchandisingSummary.stockLabel}</strong>
            <p>
              {Number.isFinite(merchandisingSummary.stockCount)
                ? `${merchandisingSummary.stockCount} units`
                : 'Stock count not set'}
            </p>
          </div>
          <div className="admin-status-card">
            <span>Merchandising assets</span>
            <strong>{galleryImages.length} images</strong>
            <p>{merchandisingSummary.assetLabel}</p>
          </div>
        </div>

        <aside className="admin-editor-readiness-panel">
          <div className="admin-dashboard-section-heading compact">
            <span>Product readiness</span>
            <p>
              {readinessNeedsCount
                ? `${readinessNeedsCount} checklist item${readinessNeedsCount === 1 ? '' : 's'} still need attention before this item feels storefront-ready.`
                : 'This draft is ready for the storefront QA checklist.'}
            </p>
          </div>

          <div className="admin-editor-readiness-summary">
            <div className="admin-editor-readiness-stat">
              <strong>{readinessReadyCount}</strong>
              <span>Ready</span>
            </div>
            <div className="admin-editor-readiness-stat">
              <strong>{readinessNeedsCount}</strong>
              <span>Needs attention</span>
            </div>
            <div className="admin-editor-readiness-stat">
              <strong>{readinessIssues.length}</strong>
              <span>Core issues</span>
            </div>
          </div>

          <div className="admin-editor-readiness-list">
            {readinessChecklist.map((item) => (
              <div
                key={item.key}
                className={`admin-editor-readiness-item ${item.ready ? 'is-ready' : 'needs-attention'}`}
              >
                <div className="admin-editor-readiness-item-row">
                  <strong>{item.label}</strong>
                  <span className={`status-badge ${item.ready ? 'status-active' : 'admin-issue-missing'}`}>
                    {item.ready ? 'Ready' : 'Needs attention'}
                  </span>
                </div>
                <p>{item.note}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {mode === 'edit' && !existingProduct ? (
        <div className="admin-empty-state">
          <h2>Product not found.</h2>
          <p>The product you are trying to edit does not exist in the current catalog.</p>
          <Link to="/admin/products" className="btn btn-dark">
            Back to Products
          </Link>
        </div>
      ) : (
        <form className="admin-form-card admin-form" onSubmit={handleSubmit}>
          {formError ? <div className="auth-message auth-message-error">{formError}</div> : null}
          {catalogMutationError ? (
            <div className="auth-message auth-message-error">{catalogMutationError}</div>
          ) : null}

          <section className="admin-form-section">
            <div className="admin-form-section-header">
              <h2>Product Basics</h2>
              <p>Core merchandising fields that define the product in the storefront and keep the readiness panel useful for QA.</p>
              <p className="field-help">
                Required fields keep the listing usable in the catalog and product detail pages. Keep the title,
                brand, SKU, category, and department aligned with storefront naming so QA and discovery stay consistent.
              </p>
            </div>
            <div className="admin-form-grid">
              <label>
                Name
                <span className="field-help field-required">Required</span>
                <input name="name" value={form.name} onChange={handleChange} />
                <span className="field-help">Use the shopper-facing product title, not an internal label.</span>
                {errors.name ? <span className="field-error">{errors.name}</span> : null}
              </label>
              <label>
                Brand
                <span className="field-help field-required">Required</span>
                <input name="brand" value={form.brand} onChange={handleChange} />
                <span className="field-help">Use the exact published brand name shown to shoppers.</span>
                {errors.brand ? <span className="field-error">{errors.brand}</span> : null}
              </label>
              <label>
                Department
                <span className="field-help field-required">Required</span>
                <input name="department" value={form.department} onChange={handleChange} />
                <span className="field-help">Controls browse navigation and category discovery.</span>
                {errors.department ? <span className="field-error">{errors.department}</span> : null}
              </label>
              <label>
                Category
                <span className="field-help field-required">Required</span>
                <input name="category" value={form.category} onChange={handleChange} />
                <span className="field-help">Pick the closest catalog category for filtering and search.</span>
                {errors.category ? <span className="field-error">{errors.category}</span> : null}
              </label>
              <label className="full-span">
                SKU
                <span className="field-help">Optional in the demo, but useful for support, filtering, and readiness tracking.</span>
                <input name="sku" value={form.sku} onChange={handleChange} />
                <span className="field-help">Keep it short, unique, and stable across product updates.</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-small sku-generate-button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      sku: generateSku(current.brand, current.name, current.category),
                    }))
                  }
                >
                  Generate SKU
                </button>
              </label>
              <label className="full-span">
                Product description
                <span className="field-help">Optional. Keep this concise, shopper-facing, and useful in demos.</span>
                <textarea name="description" rows="4" value={form.description} onChange={handleChange} />
              </label>
            </div>
          </section>

          <section className="admin-form-section">
            <div className="admin-form-section-header">
              <h2>Pricing &amp; Merchandising</h2>
              <p>Keep the base price and optional sale price aligned with the catalog presentation.</p>
              <p className="field-help">
                Ratings and reviews are display-only metadata. Sale price should stay lower than the base price and
                the readiness panel will flag it if the values do not line up.
              </p>
            </div>
            <div className="admin-form-grid">
              <label>
                Base price
                <span className="field-help field-required">Required</span>
                <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} />
                <span className="field-help">Required. Use the standard price shown on the storefront.</span>
                {errors.price ? <span className="field-error">{errors.price}</span> : null}
              </label>
              <label>
                Sale price
                <span className="field-help">Optional. Leave blank when the product is not on sale.</span>
                <input
                  name="salePrice"
                  type="number"
                  step="0.01"
                  value={form.salePrice}
                  onChange={handleChange}
                />
                <span className="field-help">When used, it should stay below the base price.</span>
                {errors.salePrice ? <span className="field-error">{errors.salePrice}</span> : null}
              </label>
              <label>
                Rating
                <span className="field-help">Optional. Shoppers see this as a 0 to 5 score.</span>
                <input name="rating" type="number" step="0.1" value={form.rating} onChange={handleChange} />
                {errors.rating ? <span className="field-error">{errors.rating}</span> : null}
              </label>
              <label>
                Review count
                <span className="field-help">Optional. Pairs with rating to give shoppers quick social proof.</span>
                <input name="reviewCount" type="number" value={form.reviewCount} onChange={handleChange} />
                <span className="field-help">Keep it consistent with the expected demo story and discovery cues.</span>
                {errors.reviewCount ? <span className="field-error">{errors.reviewCount}</span> : null}
              </label>
            </div>
          </section>

          <section className="admin-form-section">
            <div className="admin-form-section-header">
              <h2>Images</h2>
              <p>Use one clean hero image and, when possible, a small gallery of fallback views.</p>
              <p className="field-help">
                Paste hosted image URLs only. File uploads are not part of this editor yet, and the readiness panel
                uses the primary image to judge storefront completeness. A strong image set also helps the admin
                list feel more merchandised.
              </p>
            </div>
            <div className="admin-preview-layout">
              <div className="admin-image-preview-panel">
                <div className="admin-image-preview">
                  {form.image.trim() ? (
                    <ShopOraImage
                      src={form.image.trim()}
                      alt={form.name || 'Primary product image'}
                      className="admin-preview-image"
                      fallbackText="Image coming soon"
                    />
                  ) : (
                    <div className="admin-image-preview-empty">
                      <span>Image coming soon</span>
                      <p>Paste a hosted image URL to preview the product image here.</p>
                    </div>
                  )}
                </div>
                <div className="admin-image-preview-meta">
                  <strong>Primary image preview</strong>
                  <span>Paste a hosted image URL. The storefront preview will use this as the hero image.</span>
                </div>
              </div>

              <div className="admin-gallery-preview-panel">
                <label className="full-span">
                  Primary image
                  <span className="field-help field-required">Required</span>
                  <input name="image" value={form.image} onChange={handleChange} />
                  <span className="field-help">Use a direct image URL that loads in the browser preview and storefront.</span>
                  {errors.image ? <span className="field-error">{errors.image}</span> : null}
                </label>
                <div className="admin-gallery-preview-header">
                  <strong>Gallery previews</strong>
                  <span className="field-help">Optional. Separate multiple image URLs with commas for alternate views.</span>
                </div>
                <label className="full-span">
                  Gallery image URLs, comma separated
                  <textarea name="images" rows="3" value={form.images} onChange={handleChange} />
                  <span className="field-help">Add 2-4 URLs for alternate angles, details, or color views.</span>
                </label>
                <div className="admin-gallery-preview-grid">
                  {galleryImages.length ? (
                    galleryImages.map((image, index) => (
                      <div key={`${image}-${index}`} className="admin-gallery-preview-item">
                        <ShopOraImage
                          src={image}
                          alt={`${form.name || 'Product'} gallery ${index + 1}`}
                          className="admin-gallery-preview-image"
                          fallbackText="Image coming soon"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="admin-gallery-preview-empty">
                      <span>No gallery images yet.</span>
                      <p>Add comma-separated image URLs to preview the gallery here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="admin-form-section">
            <div className="admin-form-section-header">
              <h2>Stock, Visibility &amp; Flags</h2>
              <p>Control availability and merchandising badges without touching the storefront code.</p>
              <p className="field-help">
                Products without an explicit status remain Active in the admin list. Draft and archived values are
                shown if they already exist in the catalog data. Stock counts are read by the readiness checklist,
                and sale or low-stock states will surface in the admin product list.
              </p>
            </div>
            <div className="admin-form-grid">
              <label>
                Stock count
                <span className="field-help field-required">Required</span>
                <input name="stockCount" type="number" value={form.stockCount} onChange={handleChange} />
                <span className="field-help">Use 0 for out of stock. Low stock warnings appear automatically.</span>
                {errors.stockCount ? <span className="field-error">{errors.stockCount}</span> : null}
              </label>
              <label>
                Sizes, comma separated
                <input name="sizes" value={form.sizes} onChange={handleChange} />
                <span className="field-help">Example: XS, S, M, L, XL</span>
                <div className="admin-chip-row">
                  {sizeValues.length ? (
                    sizeValues.map((size) => (
                      <span key={size} className="admin-chip">
                        {size}
                      </span>
                    ))
                  ) : (
                    <span className="field-help">No size chips yet.</span>
                  )}
                </div>
              </label>
              <label className="full-span">
                Colors, comma separated
                <input name="colors" value={form.colors} onChange={handleChange} />
                <span className="field-help">Example: Black, Ivory, Taupe</span>
                <div className="admin-chip-row">
                  {colorValues.length ? (
                    colorValues.map((color) => {
                      const swatchColor = isValidColor(color) ? color : '#c8b7a2';
                      return (
                        <span key={color} className="admin-color-chip">
                          <span className="admin-color-swatch" style={{ backgroundColor: swatchColor }} />
                          {color}
                        </span>
                      );
                    })
                  ) : (
                    <span className="field-help">No color chips yet.</span>
                  )}
                </div>
              </label>
              <label className="checkbox-row">
                <input name="isNew" type="checkbox" checked={form.isNew} onChange={handleChange} />
                New
              </label>
              <label className="checkbox-row">
                <input name="isSale" type="checkbox" checked={form.isSale} onChange={handleChange} />
                Sale
              </label>
              <p className="field-help full-span">
                These flags only change presentation. They do not alter pricing, inventory, or storefront contracts.
              </p>
            </div>
          </section>

          <section className="admin-form-section">
            <div className="admin-form-section-header">
              <h2>Material, Fit &amp; Details</h2>
              <p>These fields power the product page accordion and detail sections.</p>
              <p className="field-help">
                The readiness panel treats these as merchandising enrichments, so adding them makes the listing feel
                complete even if the base product is already valid. They also give the admin list stronger discovery
                cues beyond price and stock.
              </p>
            </div>
            <div className="admin-form-grid">
              <label className="full-span">
                Material
                <input name="material" value={form.material} onChange={handleChange} />
                <span className="field-help">Optional, but helpful for materials-led shopping decisions.</span>
              </label>
              <label className="full-span">
                Care
                <input name="care" value={form.care} onChange={handleChange} />
                <span className="field-help">Optional. Use concise care instructions shoppers can scan quickly.</span>
              </label>
              <label className="full-span">
                Fit type
                <input name="fit" value={form.fit} onChange={handleChange} />
                <span className="field-help">Optional. A simple fit note makes the listing easier to understand.</span>
              </label>
              <label className="full-span">
                Details, one per line
                <textarea name="details" rows="5" value={form.details} onChange={handleChange} />
                <span className="field-help">Each line becomes a separate bullet in the storefront.</span>
              </label>
            </div>
          </section>

          <section className="admin-form-section">
            <div className="admin-form-section-header">
              <h2>Shipping &amp; Returns</h2>
              <p>These notes keep the product page polished without requiring fulfillment integration.</p>
              <p className="field-help">
                Short, readable notes help shoppers trust the product page without implying a real shipping backend.
              </p>
            </div>
            <div className="admin-form-grid">
              <label className="full-span">
                Shipping note
                <textarea name="shippingNote" rows="3" value={form.shippingNote} onChange={handleChange} />
                <span className="field-help">Optional. Use short, confident fulfillment copy.</span>
              </label>
              <label className="full-span">
                Return note
                <textarea name="returnNote" rows="3" value={form.returnNote} onChange={handleChange} />
                <span className="field-help">Optional. Keep the policy language short and readable.</span>
              </label>
            </div>
          </section>

          <div className="admin-form-actions">
            <button type="button" className="btn btn-ghost" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-dark" disabled={isCatalogSaving}>
              {isCatalogSaving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
