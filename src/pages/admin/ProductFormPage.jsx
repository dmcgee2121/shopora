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

const editorGuidanceToneByLabel = {
  Ready: 'status-active',
  'Needs attention': 'status-draft',
  'Optional polish': 'status-badge-sale',
  'Missing required merchandising': 'admin-issue-missing',
};

const editorGuidanceOrder = [
  'Ready',
  'Needs attention',
  'Optional polish',
  'Missing required merchandising',
];

const optionalGuidanceKeys = new Set(['sale', 'gallery', 'merchandising', 'details']);
const requiredGuidanceKeys = new Set(['name', 'brand', 'sku', 'taxonomy', 'pricing', 'stock', 'description', 'image']);

function getEditorGuidanceTone(status) {
  return editorGuidanceToneByLabel[status] ?? 'status-badge-muted';
}

function getEditorGuidanceStatus(item, product) {
  if (!item?.ready) {
    if (item?.key === 'sale') {
      return item.note?.includes('No sale price set') ? 'Optional polish' : 'Needs attention';
    }

    if (item?.key === 'stock') {
      const stockCount = Number(product.stockCount);
      if (!Number.isFinite(stockCount) || stockCount <= 0) {
        return 'Missing required merchandising';
      }

      if (stockCount <= 7) {
        return 'Needs attention';
      }
    }

    if (optionalGuidanceKeys.has(item?.key)) {
      return 'Optional polish';
    }

    if (requiredGuidanceKeys.has(item?.key)) {
      return 'Missing required merchandising';
    }
  }

  if (item?.key === 'sale' && item.note?.includes('Sale price must stay below')) {
    return 'Needs attention';
  }

  if (item?.key === 'stock') {
    const stockCount = Number(product.stockCount);

    if (!Number.isFinite(stockCount) || stockCount <= 0) {
      return 'Missing required merchandising';
    }

    if (stockCount <= 7) {
      return 'Needs attention';
    }
  }

  if (item?.key === 'visibility' && !item.ready) {
    return 'Needs attention';
  }

  if (optionalGuidanceKeys.has(item?.key)) {
    return 'Optional polish';
  }

  return 'Ready';
}

function getEditorGuidanceOrder(key) {
  const index = editorGuidanceOrder.indexOf(key);
  return index === -1 ? editorGuidanceOrder.length : index;
}

function getEditorGuidanceCopy(status) {
  switch (status) {
    case 'Ready':
      return 'The field is in good shape for a storefront launch.';
    case 'Needs attention':
      return 'This is close, but the product should be reviewed before a pitch or save.';
    case 'Optional polish':
      return 'Nice to have for stronger merchandising, but not required to save.';
    case 'Missing required merchandising':
      return 'This field should be completed before treating the listing as owner-ready.';
    default:
      return 'Use this guidance to refine the product before a release batch.';
  }
}

function EditorGuidanceItem({ item, guidanceStatus }) {
  return (
    <div className={`admin-editor-guidance-item ${guidanceStatus === 'Ready' ? 'is-ready' : 'needs-attention'}`}>
      <div className="admin-editor-guidance-item-row">
        <strong>{item.label}</strong>
        <span className={`status-badge ${getEditorGuidanceTone(guidanceStatus)}`.trim()}>{guidanceStatus}</span>
      </div>
      <p>{item.note}</p>
      <p className="admin-editor-guidance-copy">{getEditorGuidanceCopy(guidanceStatus)}</p>
    </div>
  );
}

function EditorGuidanceGroup({ title, status, note, items, product }) {
  if (!items.length) return null;

  return (
    <section className="admin-editor-guidance-group">
      <div className="admin-dashboard-section-heading compact">
        <span>{title}</span>
        <p>{note}</p>
      </div>

      <div className="admin-editor-guidance-group-header">
        <span className={`status-badge ${getEditorGuidanceTone(status)}`.trim()}>{status}</span>
        <span className="admin-status-caption">{items.length} item{items.length === 1 ? '' : 's'}</span>
      </div>

      <div className="admin-editor-guidance-list">
        {items.slice(0, 4).map((item) => (
          <EditorGuidanceItem
            key={item.key}
            item={item}
            guidanceStatus={getEditorGuidanceStatus(item, product)}
          />
        ))}
      </div>

      {items.length > 4 ? (
        <p className="admin-editor-guidance-more">
          +{items.length - 4} more item{items.length - 4 === 1 ? '' : 's'} are visible in the checklist below.
        </p>
      ) : null}
    </section>
  );
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
  const guidanceChecklist = useMemo(() => {
    return readinessChecklist
      .map((item) => ({
        ...item,
        guidanceStatus: getEditorGuidanceStatus(item, editorProduct),
      }))
      .sort((left, right) => {
        const leftStatusIndex = getEditorGuidanceOrder(left.guidanceStatus);
        const rightStatusIndex = getEditorGuidanceOrder(right.guidanceStatus);

        if (leftStatusIndex !== rightStatusIndex) {
          return leftStatusIndex - rightStatusIndex;
        }

        return left.label.localeCompare(right.label);
      });
  }, [editorProduct, readinessChecklist]);
  const guidanceGroups = useMemo(() => {
    return editorGuidanceOrder.reduce((acc, status) => {
      acc[status] = guidanceChecklist.filter((item) => item.guidanceStatus === status);
      return acc;
    }, {});
  }, [guidanceChecklist]);
  const readinessReadyCount = guidanceGroups.Ready.length;
  const readinessAttentionCount = guidanceGroups['Needs attention'].length;
  const readinessOptionalCount = guidanceGroups['Optional polish'].length;
  const readinessMissingCount = guidanceGroups['Missing required merchandising'].length;
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

  const readinessCTA = [
    { label: 'Review Catalog', to: '/admin/products', className: 'btn btn-dark' },
    { label: 'Add Product', to: '/admin/products/new', className: 'btn btn-ghost' },
    { label: 'Check Storefront', to: '/', className: 'btn btn-outline' },
  ];
  const pageTitle =
    mode === 'edit'
      ? form.name.trim()
        ? `Edit ${form.name.trim()}`
        : 'Edit Product'
      : 'Add Product';
  const previewRoute = mode === 'edit' && existingProduct ? `/product/${existingProduct.id}` : '/';
  const previewActionLabel = mode === 'edit' && existingProduct ? 'Preview product' : 'View storefront';
  const shopperPreviewDetails = splitLines(form.details).slice(0, 3);
  const shopperPreviewCopy = form.description.trim()
    ? form.description.trim()
    : 'Add a short shopper-facing description so this listing feels clear before launch.';

  return (
    <section className="admin-form-page">
      <AdminPageHeader
        eyebrow="Catalog editor"
        title={pageTitle}
        subtitle="Update shopper-facing details, pricing, inventory, and launch readiness."
        actions={(
          <>
            <Link to="/admin/products" className="btn btn-ghost">
              Back to Products
            </Link>
            <Link to={previewRoute} className="btn btn-outline">
              {previewActionLabel}
            </Link>
          </>
        )}
      />

      <div className="admin-editor-overview">
        <div className="admin-editor-main">
          <div className="admin-status-grid admin-editor-summary-grid">
            <div className="admin-status-card">
              <span>Product summary</span>
              <strong>{merchandisingSummary.productLabel}</strong>
              <p>
                {form.department || 'Unassigned department'}
                {form.category ? ` / ${form.category}` : ''}
                {form.sku ? ` - SKU ${form.sku}` : ' - SKU not assigned'}
              </p>
              <div className="status-badges admin-preview-badges">
                <span className={`status-badge ${merchandisingSummary.visibility.className}`}>
                  {merchandisingSummary.visibility.label}
                </span>
                <span className="status-badge status-badge-muted">{merchandisingSummary.stockLabel}</span>
              </div>
              <p className="admin-preview-hint">{merchandisingSummary.visibility.helper}</p>
            </div>
            <div className="admin-status-card">
              <span>Pricing</span>
              <strong>{merchandisingSummary.priceLabel}</strong>
              <p>Use the base price for the everyday listing and add a sale price only when the markdown is intentional.</p>
            </div>
            <div className="admin-status-card">
              <span>Inventory review</span>
              <strong>{merchandisingSummary.stockLabel}</strong>
              <p>
                {Number.isFinite(merchandisingSummary.stockCount)
                  ? `${merchandisingSummary.stockCount} units currently shown in the draft.`
                  : 'Stock count is still missing from the draft.'}
              </p>
            </div>
            <div className="admin-status-card">
              <span>Media & options</span>
              <strong>{galleryImages.length + (form.image.trim() ? 1 : 0)} visual{galleryImages.length + (form.image.trim() ? 1 : 0) === 1 ? '' : 's'}</strong>
              <p>{merchandisingSummary.assetLabel}</p>
            </div>
          </div>

          <section className="admin-dashboard-panel admin-editor-preview-panel">
            <div className="admin-dashboard-section-heading">
              <span>Shopper preview</span>
              <p>Quickly check how the current draft reads before you save or return to Products.</p>
            </div>

            <div className="admin-editor-preview-card">
              <div className="admin-editor-preview-media">
                {form.image.trim() ? (
                  <ShopOraImage
                    src={form.image.trim()}
                    alt={form.name || 'Product preview'}
                    className="admin-preview-image"
                    fallbackText="Image coming soon"
                  />
                ) : (
                  <div className="admin-image-preview-empty">
                    <span>Image coming soon</span>
                    <p>Add a hosted image URL to preview the shopper-facing hero image here.</p>
                  </div>
                )}
              </div>

              <div className="admin-editor-preview-copy">
                <div className="status-badges admin-preview-badges">
                  <span className={`status-badge ${merchandisingSummary.visibility.className}`}>
                    {merchandisingSummary.visibility.label}
                  </span>
                  <span className="status-badge status-badge-muted">{merchandisingSummary.stockLabel}</span>
                  {form.isSale ? <span className="status-badge status-badge-sale">Sale</span> : null}
                  {form.isNew ? <span className="status-badge status-active">New</span> : null}
                </div>

                <strong>{form.name.trim() || 'Untitled product'}</strong>
                <p className="admin-editor-preview-subtitle">
                  {[form.brand.trim() || 'Brand pending', form.category.trim() || 'Category pending']
                    .filter(Boolean)
                    .join(' / ')}
                </p>
                <p className="admin-editor-preview-price">{merchandisingSummary.priceLabel}</p>
                <p className="admin-preview-hint">{shopperPreviewCopy}</p>

                <div className="admin-editor-preview-meta">
                  <div>
                    <span>Department</span>
                    <strong>{form.department.trim() || 'Unassigned'}</strong>
                  </div>
                  <div>
                    <span>Sizes</span>
                    <strong>{sizeValues.length ? `${sizeValues.length} listed` : 'Not listed yet'}</strong>
                  </div>
                  <div>
                    <span>Colors</span>
                    <strong>{colorValues.length ? `${colorValues.length} listed` : 'Not listed yet'}</strong>
                  </div>
                </div>

                {shopperPreviewDetails.length ? (
                  <div className="admin-editor-preview-notes">
                    <span>Shopper detail cues</span>
                    <ul>
                      {shopperPreviewDetails.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="admin-editor-preview-actions">
                  <Link to="/admin/products" className="text-button">
                    Return to Products
                  </Link>
                  <Link to={previewRoute} className="text-button">
                    {previewActionLabel}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="admin-editor-readiness-panel">
          <div className="admin-dashboard-section-heading compact">
            <span>Editor readiness guidance</span>
            <p>
              {readinessMissingCount
                ? `${readinessMissingCount} item${readinessMissingCount === 1 ? '' : 's'} still need required merchandising before this product feels launch-ready.`
                : readinessAttentionCount
                  ? `${readinessAttentionCount} item${readinessAttentionCount === 1 ? '' : 's'} still need attention before this product is pitched as ready to sell.`
                  : 'This draft is ready for storefront QA, with optional polish still available if you want a stronger listing.'}
            </p>
          </div>

          <div className="admin-editor-guidance-summary">
            <div className="admin-editor-readiness-stat">
              <strong>{readinessReadyCount}</strong>
              <span>Ready</span>
            </div>
            <div className="admin-editor-readiness-stat">
              <strong>{readinessAttentionCount}</strong>
              <span>Needs attention</span>
            </div>
            <div className="admin-editor-readiness-stat">
              <strong>{readinessOptionalCount}</strong>
              <span>Optional polish</span>
            </div>
            <div className="admin-editor-readiness-stat">
              <strong>{readinessMissingCount}</strong>
              <span>Missing required merchandising</span>
            </div>
          </div>

          <div className="admin-editor-guidance-groups">
            <EditorGuidanceGroup
              title="Launch-ready basics"
              status="Ready"
              note="These items are already in good shape for a storefront pitch."
              items={guidanceGroups.Ready}
              product={editorProduct}
            />
            <EditorGuidanceGroup
              title="Needs attention"
              status="Needs attention"
              note="These items should be reviewed before you save or present the product."
              items={guidanceGroups['Needs attention']}
              product={editorProduct}
            />
            <EditorGuidanceGroup
              title="Optional polish"
              status="Optional polish"
              note="These enrichments are not required, but they make the listing feel more complete."
              items={guidanceGroups['Optional polish']}
              product={editorProduct}
            />
            <EditorGuidanceGroup
              title="Missing required merchandising"
              status="Missing required merchandising"
              note="These gaps should be fixed first before presenting this product as ready."
              items={guidanceGroups['Missing required merchandising']}
              product={editorProduct}
            />
          </div>

          <div className="admin-editor-readiness-footer">
            <p>
              This guidance is advisory only. Saving stays enabled, the product still uses the existing validation and
              save flow, and the current draft has {readinessIssues.length} core merchandising
              {readinessIssues.length === 1 ? ' issue' : ' issues'} flagged by the catalog helper.
            </p>
            <div className="admin-cta-row">
              {readinessCTA.map((action) => (
                <Link key={action.to} to={action.to} className={action.className}>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {mode === 'edit' && !existingProduct ? (
        <div className="admin-empty-state">
          <h2>Product not found.</h2>
          <p>The product you are trying to edit is not available in the current catalog view.</p>
          <Link to="/admin/products" className="btn btn-dark">
            Back to Products
          </Link>
        </div>
      ) : (
        <form id="admin-product-editor-form" className="admin-form-card admin-form" onSubmit={handleSubmit}>
          {formError ? <div className="auth-message auth-message-error">{formError}</div> : null}
          {catalogMutationError ? (
            <div className="auth-message auth-message-error">{catalogMutationError}</div>
          ) : null}

          <section className="admin-form-section">
            <div className="admin-form-section-header">
              <h2>Product Basics</h2>
              <p>Set the core identity shoppers and the admin catalog both rely on.</p>
            </div>
            <div className="admin-form-grid">
              <label>
                Name
                <span className="field-help field-required">Required</span>
                <input name="name" value={form.name} onChange={handleChange} />
                <span className="field-help">Use the shopper-facing title, not an internal shorthand.</span>
                {errors.name ? <span className="field-error">{errors.name}</span> : null}
              </label>
              <label>
                Brand
                <span className="field-help field-required">Required</span>
                <input name="brand" value={form.brand} onChange={handleChange} />
                <span className="field-help">Use the exact brand name shoppers should see.</span>
                {errors.brand ? <span className="field-error">{errors.brand}</span> : null}
              </label>
              <label>
                Department
                <span className="field-help field-required">Required</span>
                <input name="department" value={form.department} onChange={handleChange} />
                <span className="field-help">Controls top-level browsing and category placement.</span>
                {errors.department ? <span className="field-error">{errors.department}</span> : null}
              </label>
              <label>
                Category
                <span className="field-help field-required">Required</span>
                <input name="category" value={form.category} onChange={handleChange} />
                <span className="field-help">Use the closest catalog category for search and filtering.</span>
                {errors.category ? <span className="field-error">{errors.category}</span> : null}
              </label>
              <label className="full-span">
                SKU
                <span className="field-help">Optional, but helpful for support, filtering, and catalog review.</span>
                <input name="sku" value={form.sku} onChange={handleChange} />
                <span className="field-help">Keep it short, unique, and stable across later edits.</span>
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
            </div>
          </section>

          <section className="admin-form-section">
            <div className="admin-form-section-header">
              <h2>Shopper-Facing Details</h2>
              <p>Fill in the product story and support notes shoppers will use to decide whether to buy.</p>
            </div>
            <div className="admin-form-grid">
              <label className="full-span">
                Product description
                <span className="field-help field-required">Recommended for launch readiness</span>
                <textarea name="description" rows="4" value={form.description} onChange={handleChange} />
                <span className="field-help">Use short, readable copy that explains the product quickly.</span>
              </label>
              <label className="full-span">
                Material
                <input name="material" value={form.material} onChange={handleChange} />
                <span className="field-help">Optional, but useful when shoppers compare similar items.</span>
              </label>
              <label className="full-span">
                Care
                <input name="care" value={form.care} onChange={handleChange} />
                <span className="field-help">Use concise care instructions shoppers can scan quickly.</span>
              </label>
              <label className="full-span">
                Fit type
                <input name="fit" value={form.fit} onChange={handleChange} />
                <span className="field-help">A simple fit note often makes the listing easier to trust.</span>
              </label>
              <label className="full-span">
                Details, one per line
                <textarea name="details" rows="5" value={form.details} onChange={handleChange} />
                <span className="field-help">Each line becomes a separate shopper-facing bullet.</span>
              </label>
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

          <section className="admin-form-section">
            <div className="admin-form-section-header">
              <h2>Pricing &amp; Inventory</h2>
              <p>Review what shoppers will pay and whether the listing is ready to stay in stock.</p>
            </div>
            <div className="admin-form-grid">
              <label>
                Base price
                <span className="field-help field-required">Required</span>
                <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} />
                <span className="field-help">Use the everyday price shown on the storefront.</span>
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
                Stock count
                <span className="field-help field-required">Required</span>
                <input name="stockCount" type="number" value={form.stockCount} onChange={handleChange} />
                <span className="field-help">Use 0 for out of stock. Low stock warnings appear automatically.</span>
                {errors.stockCount ? <span className="field-error">{errors.stockCount}</span> : null}
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
                <span className="field-help">Keep it consistent with the expected store story and discovery cues.</span>
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
              <h2>Category, Options &amp; Merchandising Flags</h2>
              <p>Review the option set and the lightweight visual flags that affect how the listing is presented.</p>
            </div>
            <div className="admin-form-grid">
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
              <div className="admin-flag-panel full-span">
                <span className="admin-form-section-kicker">Merchandising flags</span>
                <div className="admin-flag-row">
                  <label className="checkbox-row">
                    <input name="isNew" type="checkbox" checked={form.isNew} onChange={handleChange} />
                    New arrival
                  </label>
                  <label className="checkbox-row">
                    <input name="isSale" type="checkbox" checked={form.isSale} onChange={handleChange} />
                    Sale
                  </label>
                </div>
                <p className="field-help">
                  These flags change presentation only. They do not alter pricing, inventory, or save behavior.
                </p>
              </div>
            </div>
          </section>

          <div className="admin-form-actions">
            <p className="admin-form-actions-note">
              Required fields are marked in the form, readiness guidance stays advisory, and save/update behavior
              remains unchanged.
            </p>
            <div className="admin-cta-row">
              <button type="button" className="btn btn-ghost" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="btn btn-dark" disabled={isCatalogSaving}>
                {isCatalogSaving ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </div>
        </form>
      )}
    </section>
  );
}
