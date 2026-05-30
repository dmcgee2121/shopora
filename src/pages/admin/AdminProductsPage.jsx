import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CatalogStatusNote from '../../components/CatalogStatusNote';
import ShopOraImage from '../../components/ShopOraImage';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import {
  getCatalogAttentionProducts,
  getCatalogReadinessSummary,
  getProductEditorReadinessChecklist,
  getProductMerchandisingReadiness,
  getProductReadinessIssues,
  getProductVisibilityInfo,
} from '../../utils/catalogReadiness';

function safeText(value, fallback = '-') {
  const text = typeof value === 'string' ? value.trim() : '';
  return text || fallback;
}

function formatMoney(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : '-';
}

function matchesQuery(product, query) {
  const value = query.trim().toLowerCase();
  if (!value) return true;

  return [
    safeText(product.name, ''),
    safeText(product.brand, ''),
    safeText(product.category, ''),
    safeText(product.department, ''),
    safeText(product.sku, ''),
  ]
    .join(' ')
    .toLowerCase()
    .includes(value);
}

const launchStatusToneByLabel = {
  'Ready to launch': 'status-active',
  'Needs review': 'status-draft',
  'Missing essentials': 'admin-issue-missing',
  'Merchandising opportunity': 'status-badge-sale',
};

const launchStatusOrder = [
  'Ready to launch',
  'Merchandising opportunity',
  'Needs review',
  'Missing essentials',
];

const launchCoreChecklistKeys = new Set(['name', 'brand', 'sku', 'taxonomy', 'pricing', 'description', 'image', 'details']);
const launchChecklistPreviewOrder = ['name', 'image', 'brand', 'sku', 'taxonomy', 'pricing', 'stock', 'description', 'details', 'gallery', 'merchandising', 'sale'];

function getLaunchStatusTone(label) {
  return launchStatusToneByLabel[label] ?? 'status-badge-muted';
}

function getLaunchChecklistOrder(key) {
  const index = launchChecklistPreviewOrder.indexOf(key);
  return index === -1 ? launchChecklistPreviewOrder.length : index;
}

function getLaunchStatusNote(status, product, visibility, checklistPreview, issues) {
  if (status === 'Missing essentials') {
    const missing = checklistPreview
      .filter((item) => !item.ready)
      .map((item) => item.label)
      .slice(0, 3);
    if (missing.length) {
      return `${missing.join(', ')} still need attention before this product can be pitched as launch-ready.`;
    }
    return 'One or more core product fields still need attention.';
  }

  if (status === 'Needs review') {
    if (visibility.state !== 'active') {
      return `${visibility.label} products stay hidden from shoppers until they are activated.`;
    }

    const stockIssue = issues.find((issue) => issue.key === 'lowStock' || issue.key === 'outOfStock' || issue.key === 'stockCount');
    if (stockIssue) {
      return stockIssue.detail;
    }

    return 'The product is close, but inventory or merchandising details still need a review.';
  }

  if (status === 'Merchandising opportunity') {
    return 'Core launch checks are complete, and sale or featured badges can help this product stand out in a pitch.';
  }

  return 'Core launch checks are complete and the product is ready to sell.';
}

function getLaunchChecklistStatus(product = {}) {
  const visibility = getProductVisibilityInfo(product);
  const checklist = getProductEditorReadinessChecklist(product);
  const issues = getProductReadinessIssues(product);
  const merchReadiness = getProductMerchandisingReadiness(product);
  const stockCount = Number(product.stockCount);
  const hasStockCount = Number.isFinite(stockCount);
  const missingCoreFields = checklist.filter((item) => launchCoreChecklistKeys.has(item.key) && !item.ready);
  const hasInventoryReview = hasStockCount && (stockCount <= 7 || stockCount <= 0);
  const hasReviewItems = checklist.some((item) => ['sale', 'gallery', 'merchandising'].includes(item.key) && !item.ready);

  let status = 'Ready to launch';

  if (!hasStockCount || missingCoreFields.length > 0) {
    status = 'Missing essentials';
  } else if (visibility.state !== 'active' || hasInventoryReview || hasReviewItems) {
    status = 'Needs review';
  } else if (product.isSale || product.isNew || product.featured || merchReadiness.badges.some((badge) => badge.label === 'Featured' || badge.label === 'Sale ready' || badge.label === 'New arrival')) {
    status = 'Merchandising opportunity';
  }

  const checklistPreview = [...checklist]
    .sort((left, right) => {
      if (left.ready !== right.ready) {
        return left.ready ? 1 : -1;
      }

      return getLaunchChecklistOrder(left.key) - getLaunchChecklistOrder(right.key);
    })
    .slice(0, 4);

  return {
    status,
    tone: getLaunchStatusTone(status),
    visibility,
    checklist,
    checklistPreview,
    issues,
    merchReadiness,
    readyCount: checklist.filter((item) => item.ready).length,
    totalChecks: checklist.length,
    note: getLaunchStatusNote(status, product, visibility, checklistPreview, issues),
  };
}

function LaunchChecklistItem({ item }) {
  return (
    <div className={`admin-product-launch-checklist-item ${item.ready ? 'ready' : 'needs-attention'}`}>
      <div className="admin-product-launch-checklist-row">
        <strong>{item.label}</strong>
        <span className={`status-badge ${item.ready ? 'status-active' : 'admin-issue-missing'}`}>
          {item.ready ? 'Ready' : 'Needs attention'}
        </span>
      </div>
      <p>{item.note}</p>
    </div>
  );
}

function LaunchProductCard({ item }) {
  const { product, status, tone, visibility, checklistPreview, readyCount, totalChecks, note, merchReadiness } = item;

  return (
    <article className="admin-product-launch-card">
      <div className="admin-product-launch-card-top">
        <ShopOraImage
          src={product.image}
          alt={safeText(product.name, 'Product image')}
          className="admin-product-launch-thumb"
          fallbackText="ShopOra"
        />
        <div className="admin-product-launch-card-meta">
          <div className="admin-product-launch-card-row">
            <div>
              <strong>{safeText(product.name, 'Untitled product')}</strong>
              <p>
                {safeText(product.brand, 'Unbranded')}
                {' / '}
                {safeText(product.department, 'Unassigned')}
                {' / '}
                {safeText(product.category, 'Unassigned')}
                {' / SKU '}
                {safeText(product.sku, 'Not assigned')}
              </p>
            </div>
            <span className={`status-badge ${tone}`.trim()}>{status}</span>
          </div>

          <div className="status-badges admin-launch-badges">
            <span className={`status-badge ${visibility.className}`}>{visibility.label}</span>
            <span className="status-badge status-badge-muted">
              {readyCount} / {totalChecks} checks ready
            </span>
            {merchReadiness.badges.map((badge) => (
              <span key={badge.label} className={`status-badge ${badge.tone}`.trim()}>
                {badge.label}
              </span>
            ))}
          </div>

          <p className="admin-product-launch-note">{note}</p>

          <div className="admin-product-launch-checklist">
            {checklistPreview.map((check) => (
              <LaunchChecklistItem key={check.key} item={check} />
            ))}
          </div>

          <div className="admin-product-launch-actions">
            <Link to={`/admin/products/${product.id}/edit`} className="text-button">
              Quick edit
            </Link>
            <Link to="/admin/products" className="text-button">
              Review catalog
            </Link>
            <Link to="/admin/products/new" className="text-button">
              Add Product
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function AdminProductsPage() {
  const {
    products,
    deleteProduct,
    resetCatalog,
    catalogSource,
    isCatalogSaving,
    clearCatalogMutationError,
  } = useProductCatalog();
  const [query, setQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const resetAvailable = catalogSource !== 'supabase';
  const hasProducts = products.length > 0;
  const hasFilters = Boolean(query.trim() || departmentFilter !== 'all' || categoryFilter !== 'all' || stockFilter !== 'all');
  const summary = useMemo(() => getCatalogReadinessSummary(products), [products]);
  const attentionProducts = useMemo(() => getCatalogAttentionProducts(products, { limit: 5 }), [products]);
  const launchReadiness = useMemo(() => {
    const entries = products.map((product) => {
      const status = getLaunchChecklistStatus(product);

      return {
        product,
        ...status,
      };
    });

    const summaryCounts = entries.reduce(
      (acc, item) => {
        acc.total += 1;
        acc[item.status] += 1;
        return acc;
      },
      {
        total: 0,
        'Ready to launch': 0,
        'Needs review': 0,
        'Missing essentials': 0,
        'Merchandising opportunity': 0,
      },
    );

    const byStatus = launchStatusOrder.reduce((acc, status) => {
      acc[status] = entries.filter((item) => item.status === status);
      return acc;
    }, {});

    return {
      entries,
      summary: summaryCounts,
      byId: new Map(entries.map((entry) => [entry.product.id, entry])),
      byStatus,
    };
  }, [products]);

  const departments = useMemo(() => {
    return Array.from(new Set(products.map((product) => product.department).filter(Boolean)));
  }, [products]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        products
          .filter((product) => departmentFilter === 'all' || product.department === departmentFilter)
          .map((product) => product.category)
          .filter(Boolean),
      ),
    );
  }, [departmentFilter, products]);

  const filtered = useMemo(
    () =>
      products.filter((product) => {
        const stockCountValue = Number(product.stockCount);
        const hasStockCount = Number.isFinite(stockCountValue);
        const departmentMatches =
          departmentFilter === 'all' || product.department === departmentFilter;
        const categoryMatches = categoryFilter === 'all' || product.category === categoryFilter;
        const stockMatches =
          stockFilter === 'all'
            ? true
            : stockFilter === 'low'
              ? hasStockCount && stockCountValue > 0 && stockCountValue <= 7
              : stockFilter === 'out'
                ? hasStockCount && stockCountValue <= 0
                : hasStockCount && stockCountValue >= 8;
        return departmentMatches && categoryMatches && stockMatches && matchesQuery(product, query);
      }),
    [products, query, departmentFilter, categoryFilter, stockFilter],
  );

  const getStockState = (stockCount) => {
    const count = Number(stockCount);

    if (!Number.isFinite(count)) {
      return { label: 'Stock not set', className: 'admin-issue-missing' };
    }

    if (count <= 0) {
      return { label: 'Out of stock', className: 'stock-out' };
    }

    if (count <= 7) {
      return { label: `Low stock (${count})`, className: 'stock-low' };
    }

    return { label: `In stock (${count})`, className: 'stock-in' };
  };

  const handleDelete = async (product) => {
    if (isCatalogSaving) return;

    if (window.confirm(`Delete ${product.name}? This will remove it from the storefront catalog.`)) {
      clearCatalogMutationError();
      try {
        await Promise.resolve(deleteProduct(product.id));
      } catch {
        // catalogMutationError is set by the catalog context.
      }
    }
  };

  const handleResetCatalog = () => {
    if (!resetAvailable) return;

    if (window.confirm('Reset the catalog back to the seeded demo products? Local edits will be lost.')) {
      clearCatalogMutationError();
      resetCatalog();
      setQuery('');
      setDepartmentFilter('all');
      setCategoryFilter('all');
      setStockFilter('all');
    }
  };

  const clearFilters = () => {
    setQuery('');
    setDepartmentFilter('all');
    setCategoryFilter('all');
    setStockFilter('all');
  };

  return (
    <div className="admin-page-stack">
      <AdminPageHeader
        eyebrow="Catalog management"
        title="Products"
        subtitle="Search, filter, and maintain the catalog from one clear admin table, readiness checklist, or mobile card view."
        actionLabel="Add Product"
        actionTo="/admin/products/new"
      />

      <CatalogStatusNote variant="admin" className="admin-catalog-status" />
      {!resetAvailable ? (
        <p className="admin-catalog-helper">Reset catalog is available only in local mode.</p>
      ) : null}

      <section className="admin-product-launch-panel">
        <div className="admin-dashboard-section-heading">
          <span>Product readiness checklist</span>
          <p>
            A business-owner view of which products are ready to publish, which need review, and which still need
            merchandising polish.
          </p>
        </div>

        <div className="admin-status-grid admin-launch-summary-grid">
          <div className="admin-status-card admin-launch-summary-card">
            <span>Ready to launch</span>
            <strong>{launchReadiness.summary['Ready to launch']}</strong>
            <p>Core product checks are complete.</p>
          </div>
          <div className="admin-status-card admin-launch-summary-card">
            <span>Merchandising opportunity</span>
            <strong>{launchReadiness.summary['Merchandising opportunity']}</strong>
            <p>Products with sale or featured potential.</p>
          </div>
          <div className="admin-status-card admin-launch-summary-card">
            <span>Needs review</span>
            <strong>{launchReadiness.summary['Needs review']}</strong>
            <p>Active products with stock, draft, or merchandising issues.</p>
          </div>
          <div className="admin-status-card admin-launch-summary-card">
            <span>Missing essentials</span>
            <strong>{launchReadiness.summary['Missing essentials']}</strong>
            <p>Products missing core launch fields.</p>
          </div>
        </div>

        <div className="admin-product-launch-groups">
          {launchStatusOrder.map((status) => {
            const items = launchReadiness.byStatus[status] ?? [];
            if (!items.length) return null;

            return (
              <section key={status} className="admin-product-launch-group">
                <div className="admin-product-launch-group-header">
                  <div className="admin-dashboard-section-heading compact">
                    <span>{status}</span>
                    <p>
                      {status === 'Ready to launch'
                        ? 'Products that are ready to sell with no blockers.'
                        : status === 'Merchandising opportunity'
                          ? 'Products that are launch-ready and could be positioned more strongly.'
                          : status === 'Needs review'
                            ? 'Products that should be checked before a demo or release batch.'
                            : 'Products missing core launch fields.'}
                    </p>
                  </div>
                  <span className={`status-badge ${getLaunchStatusTone(status)}`.trim()}>{items.length}</span>
                </div>

                <div className="admin-product-launch-list">
                  {items.slice(0, 2).map((item) => (
                    <LaunchProductCard key={item.product.id} item={item} />
                  ))}
                </div>

                {items.length > 2 ? (
                  <p className="admin-product-launch-more">
                    +{items.length - 2} more product{items.length - 2 === 1 ? '' : 's'} are listed in the table below.
                  </p>
                ) : null}
              </section>
            );
          })}
        </div>

        <div className="admin-cta-row">
          <Link to="/admin/products" className="btn btn-dark">
            Review Catalog
          </Link>
          <Link to="/admin/products/new" className="btn btn-ghost">
            Add Product
          </Link>
          <Link to="/admin" className="btn btn-outline">
            Open Dashboard
          </Link>
        </div>
      </section>

      <div className="admin-readiness-grid">
        <div className="admin-status-card admin-readiness-card">
          <span>Total products</span>
          <strong>{summary.totalProducts}</strong>
          <p>All catalog records currently loaded in the admin session.</p>
        </div>
        <div className="admin-status-card admin-readiness-card">
          <span>Active products</span>
          <strong>{summary.activeProducts}</strong>
          <p>Visible in the storefront and ready for shoppers.</p>
        </div>
        <div className="admin-status-card admin-readiness-card">
          <span>Draft / inactive</span>
          <strong>{summary.inactiveProducts}</strong>
          <p>
            {summary.archivedProducts
              ? `${summary.inactiveProducts} draft or inactive and ${summary.archivedProducts} archived records.`
              : 'Products hidden from the storefront or marked inactive.'}
          </p>
        </div>
        <div className="admin-status-card admin-readiness-card">
          <span>Low stock</span>
          <strong>{summary.lowStockProducts}</strong>
          <p>Items that should be restocked before store launch.</p>
        </div>
        <div className="admin-status-card admin-readiness-card">
          <span>Out of stock</span>
          <strong>{summary.outOfStockProducts}</strong>
          <p>Items currently unavailable for purchase.</p>
        </div>
        <div className="admin-status-card admin-readiness-card">
          <span>Catalog gaps</span>
          <strong>{summary.missingMerchandisingInfo}</strong>
          <p>Products missing images, copy, price, SKU, brand, or stock data.</p>
        </div>
        <div className="admin-status-card admin-readiness-card">
          <span>Sale / featured</span>
          <strong>
            {summary.saleProducts}
            <span className="admin-readiness-divider">/</span>
            {summary.featuredProducts}
          </strong>
          <p>Products flagged for sale pricing or featured merchandising.</p>
        </div>
      </div>

      <section className="admin-catalog-readiness-panel">
        <div className="admin-catalog-readiness-header">
          <div className="admin-dashboard-section-heading compact">
            <span>Catalog readiness</span>
            <p>
              {summary.productsNeedingAttention
                ? `${summary.productsNeedingAttention} product${summary.productsNeedingAttention === 1 ? '' : 's'} need attention before screenshots or demos.`
                : 'No catalog issues are currently flagged in the admin product list.'}
            </p>
          </div>
          <div className="admin-catalog-readiness-summary">
            <div className="admin-catalog-readiness-stat">
              <strong>{summary.productsNeedingAttention}</strong>
              <span>Need attention</span>
            </div>
            <div className="admin-catalog-readiness-stat">
              <strong>{summary.missingMerchandisingInfo}</strong>
              <span>Missing merchandising info</span>
            </div>
            <div className="admin-catalog-readiness-stat">
              <strong>{attentionProducts.length}</strong>
              <span>Priority items shown</span>
            </div>
          </div>
        </div>

        {attentionProducts.length ? (
          <div className="admin-attention-list">
            {attentionProducts.map(({ product, issues, issueCount }) => (
              <article key={product.id} className="admin-attention-item">
                <div className="admin-attention-item-header">
                  <div>
                    <strong>{safeText(product.name, 'Untitled product')}</strong>
                    <p>
                      {safeText(product.brand, 'Unbranded')}
                      {' \u2022 '}
                      {safeText(product.sku, 'No SKU assigned')}
                    </p>
                  </div>
                  <span className="admin-attention-count">{issueCount} issue{issueCount === 1 ? '' : 's'}</span>
                </div>

                <div className="status-badges admin-issue-badges">
                  {issues.slice(0, 3).map((issue) => (
                    <span key={issue.key} className={`status-badge ${issue.tone}`}>
                      {issue.label}
                    </span>
                  ))}
                  {issues.length > 3 ? <span className="status-badge status-badge-muted">+{issues.length - 3} more</span> : null}
                </div>

                <p className="admin-attention-detail">{issues[0]?.detail ?? 'Review the product record for missing catalog data.'}</p>

                <div className="admin-attention-actions">
                  <Link to={`/admin/products/${product.id}/edit`} className="text-button">
                    Review product
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="admin-empty-state-tight admin-readiness-empty">
            <h3>Everything in this catalog is review-ready.</h3>
            <p>All tracked products have the core merchandising fields needed for owner review and admin QA.</p>
          </div>
        )}
      </section>

      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <input
            className="admin-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, brand, department, or SKU"
            aria-label="Search catalog"
          />

          <select
            className="admin-filter"
            value={departmentFilter}
            onChange={(event) => {
              setDepartmentFilter(event.target.value);
              setCategoryFilter('all');
            }}
            aria-label="Filter by department"
          >
            <option value="all">All departments</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>

          <select
            className="admin-filter"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            className="admin-filter"
            value={stockFilter}
            onChange={(event) => setStockFilter(event.target.value)}
            aria-label="Filter by stock"
          >
            <option value="all">All stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
            <option value="in">In stock</option>
          </select>
        </div>

        <div className="admin-toolbar-actions">
          <button type="button" className="btn btn-ghost" onClick={clearFilters}>
            Clear Filters
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleResetCatalog} disabled={!resetAvailable}>
            Reset Catalog
          </button>
          <Link to="/admin/products/new" className="btn btn-dark">
            Add Product
          </Link>
        </div>
      </div>

      {filtered.length ? (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Brand</th>
                  <th>Department</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Launch</th>
                  <th>Status</th>
                  <th>Stock</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => {
                  const launchInfo = launchReadiness.byId.get(product.id);
                  const visibility = getProductVisibilityInfo(product);
                  const merchandisingReadiness = getProductMerchandisingReadiness(product);
                  const stockCountValue = Number(product.stockCount);
                  const stockCount = Number.isFinite(stockCountValue) ? stockCountValue : null;
                  const stockState = getStockState(stockCount);
                  const saleActive = product.isSale || Number(product.salePrice ?? 0) > 0;
                  const featuredActive = Boolean(product.isNew || product.featured);

                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="admin-product-cell">
                          <ShopOraImage
                            src={product.image}
                            alt={safeText(product.name, 'Product image')}
                            className="admin-product-thumb"
                            fallbackText="ShopOra"
                          />
                          <div className="admin-product-cell-copy">
                            <strong>{safeText(product.name, 'Untitled product')}</strong>
                            <p>{safeText(product.sku, 'No SKU assigned')}</p>
                            <div className="status-badges">
                              {featuredActive ? <span className="status-badge status-badge-muted">Featured</span> : null}
                              {saleActive ? <span className="status-badge status-badge-sale">Sale</span> : null}
                            </div>
                            <div className="status-badges admin-readiness-badges">
                              {merchandisingReadiness.badges.map((badge) => (
                                <span key={badge.label} className={`status-badge ${badge.tone}`.trim()}>
                                  {badge.label}
                                </span>
                              ))}
                            </div>
                            <p className="admin-product-readiness-detail">{merchandisingReadiness.detail}</p>
                          </div>
                        </div>
                      </td>
                      <td>{safeText(product.brand, 'Unbranded')}</td>
                      <td>{safeText(product.department, 'Unassigned')}</td>
                      <td>{safeText(product.category, 'Unassigned')}</td>
                      <td>
                        {product.salePrice ? (
                          <>
                            <span className="price">{formatMoney(product.salePrice)}</span>{' '}
                            <span className="compare-price">{formatMoney(product.price)}</span>
                          </>
                        ) : (
                          <span className="price">{formatMoney(product.price)}</span>
                        )}
                      </td>
                      <td>
                        <div className="admin-status-stack">
                          <span className={`status-badge ${launchInfo?.tone ?? 'status-badge-muted'}`}>
                            {launchInfo?.status ?? 'Ready to launch'}
                          </span>
                          <span className="admin-status-caption">
                            {launchInfo?.note ?? 'Core launch checks are complete.'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="status-badges admin-status-stack">
                          <span className={`status-badge ${visibility.className}`}>{visibility.label}</span>
                          <span className="admin-status-caption">{visibility.helper}</span>
                        </div>
                      </td>
                      <td>
                        <div className="admin-stock-cell">
                          <span className={`status-badge ${stockState.className}`}>{stockState.label}</span>
                          <span className="admin-stock-count">{stockCount ?? '—'}</span>
                        </div>
                        <div className="admin-status-subtext">
                          {stockCount === null
                            ? 'Inventory count is not set yet.'
                            : stockCount <= 0
                              ? 'Shoppers cannot add this item to cart.'
                              : stockCount <= 7
                              ? 'Low stock warning is shown automatically.'
                              : 'Healthy stock level for the storefront.'}
                        </div>
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <Link
                            to={`/admin/products/${product.id}/edit`}
                            className={isCatalogSaving ? 'text-button is-disabled' : 'text-button'}
                            aria-disabled={isCatalogSaving}
                            onClick={(event) => {
                              if (isCatalogSaving) {
                                event.preventDefault();
                              }
                            }}
                          >
                            Quick edit
                          </Link>
                          <button
                            type="button"
                            className="text-button danger"
                            disabled={isCatalogSaving}
                            onClick={() => handleDelete(product)}
                          >
                            Delete product
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="admin-product-cards">
                {filtered.map((product) => {
                  const visibility = getProductVisibilityInfo(product);
                  const merchandisingReadiness = getProductMerchandisingReadiness(product);
                  const launchInfo = launchReadiness.byId.get(product.id);
                  const stockCountValue = Number(product.stockCount);
                  const stockCount = Number.isFinite(stockCountValue) ? stockCountValue : null;
                  const stockState = getStockState(stockCount);
                  const saleActive = product.isSale || Number(product.salePrice ?? 0) > 0;
                  const featuredActive = Boolean(product.isNew || product.featured);

              return (
                <article key={product.id} className="admin-product-card">
                  <div className="admin-product-card-top">
                    <ShopOraImage
                      src={product.image}
                      alt={safeText(product.name, 'Product image')}
                      className="admin-product-thumb"
                      fallbackText="ShopOra"
                    />
                      <div className="admin-product-card-meta">
                        <h3>{safeText(product.name, 'Untitled product')}</h3>
                        <p>{safeText(product.brand, 'Unbranded')}</p>
                        <p>{safeText(product.sku, 'No SKU assigned')}</p>
                        <p>
                          {safeText(product.department, 'Unassigned')} / {safeText(product.category, 'Unassigned')}
                        </p>
                        <div className="status-badges">
                          <span className={`status-badge ${launchInfo?.tone ?? 'status-badge-muted'}`}>
                            {launchInfo?.status ?? 'Ready to launch'}
                          </span>
                          <span className={`status-badge ${visibility.className}`}>{visibility.label}</span>
                          {featuredActive ? <span className="status-badge status-badge-muted">Featured</span> : null}
                          {saleActive ? <span className="status-badge status-badge-sale">Sale</span> : null}
                        </div>
                        <div className="status-badges admin-readiness-badges">
                          {merchandisingReadiness.badges.map((badge) => (
                            <span key={badge.label} className={`status-badge ${badge.tone}`.trim()}>
                              {badge.label}
                            </span>
                          ))}
                        </div>
                        <p className="admin-product-readiness-detail">{merchandisingReadiness.detail}</p>
                        <p className="admin-product-launch-note">{launchInfo?.note ?? 'Core launch checks are complete.'}</p>
                      </div>
                    </div>

                  <div className="admin-product-card-body">
                    <div className="admin-product-card-row">
                      <div>
                        {product.salePrice ? (
                          <>
                            <span className="price">{formatMoney(product.salePrice)}</span>{' '}
                            <span className="compare-price">{formatMoney(product.price)}</span>
                          </>
                        ) : (
                          <span className="price">{formatMoney(product.price)}</span>
                        )}
                      </div>
                      <span className={`status-badge ${stockState.className}`}>{stockState.label}</span>
                    </div>

                    <p className="admin-status-subtext">
                      {stockCount === null
                        ? 'Stock count is not set yet.'
                        : `Stock count: ${stockCount}. ${stockCount <= 0 ? 'Out of stock.' : stockCount <= 7 ? 'Low stock.' : 'Available.'}`}
                    </p>

                    <div className="admin-product-card-actions">
                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        className={isCatalogSaving ? 'btn btn-ghost btn-small is-disabled' : 'btn btn-ghost btn-small'}
                        aria-disabled={isCatalogSaving}
                        onClick={(event) => {
                          if (isCatalogSaving) {
                            event.preventDefault();
                          }
                        }}
                      >
                        Quick edit
                      </Link>
                      <button
                        type="button"
                        className="btn btn-outline btn-small"
                        disabled={isCatalogSaving}
                        onClick={() => handleDelete(product)}
                      >
                        Delete product
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      ) : null}

      {!filtered.length ? (
        <div className="admin-empty-state">
          <h3>{hasProducts ? 'No products match this view.' : 'Your catalog is empty.'}</h3>
          <p>
            {hasProducts
              ? 'Try a different product name, brand, category, department, or stock filter. The readiness panel still reflects the full catalog.'
              : 'Add a product to start building the catalog, or reset the demo catalog if you want the seeded products back.'}
          </p>
          <div className="admin-empty-state-actions">
            {hasFilters ? (
              <button type="button" className="btn btn-ghost" onClick={clearFilters}>
                Clear Filters
              </button>
            ) : null}
            <Link to="/admin/products/new" className="btn btn-dark">
              Add Product
            </Link>
            {!hasProducts && resetAvailable ? (
              <button type="button" className="btn btn-outline" onClick={handleResetCatalog}>
                Reset Catalog
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
