import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CatalogStatusNote from '../../components/CatalogStatusNote';
import ShopOraImage from '../../components/ShopOraImage';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import {
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
      return `${missing.join(', ')} still need attention before this product is ready for shoppers.`;
    }

    return 'One or more core product fields still need attention.';
  }

  if (status === 'Needs review') {
    if (visibility.state !== 'active') {
      return `${visibility.label} products stay hidden from shoppers until they are activated.`;
    }

    const stockIssue = issues.find((issue) => ['lowStock', 'outOfStock', 'stockCount'].includes(issue.key));
    if (stockIssue) {
      return stockIssue.detail;
    }

    return 'The product is close, but inventory or merchandising details still need review.';
  }

  if (status === 'Merchandising opportunity') {
    return 'The product is live and can be featured more strongly with sale or discovery cues.';
  }

  return 'Core product checks are complete and the product is ready to sell.';
}

function getLaunchChecklistStatus(product = {}) {
  const visibility = getProductVisibilityInfo(product);
  const checklist = getProductEditorReadinessChecklist(product);
  const issues = getProductReadinessIssues(product);
  const merchReadiness = getProductMerchandisingReadiness(product);
  const stockCount = Number(product.stockCount);
  const hasStockCount = Number.isFinite(stockCount);
  const missingCoreFields = checklist.filter((item) => launchCoreChecklistKeys.has(item.key) && !item.ready);
  const hasInventoryReview = hasStockCount && stockCount <= 7;
  const hasReviewItems = checklist.some((item) => ['sale', 'gallery', 'merchandising'].includes(item.key) && !item.ready);

  let status = 'Ready to launch';

  if (!hasStockCount || missingCoreFields.length > 0) {
    status = 'Missing essentials';
  } else if (visibility.state !== 'active' || hasInventoryReview || hasReviewItems) {
    status = 'Needs review';
  } else if (
    product.isSale ||
    product.isNew ||
    product.featured ||
    merchReadiness.badges.some((badge) => ['Featured', 'Sale ready', 'New arrival'].includes(badge.label))
  ) {
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
    checklistPreview,
    issues,
    merchReadiness,
    readyCount: checklist.filter((item) => item.ready).length,
    totalChecks: checklist.length,
    note: getLaunchStatusNote(status, product, visibility, checklistPreview, issues),
  };
}

function getStockState(stockCount) {
  const count = Number(stockCount);

  if (!Number.isFinite(count)) {
    return { label: 'Stock not set', className: 'admin-issue-missing', count: null };
  }

  if (count <= 0) {
    return { label: 'Out of stock', className: 'stock-out', count };
  }

  if (count <= 7) {
    return { label: `Low stock (${count})`, className: 'stock-low', count };
  }

  return { label: `In stock (${count})`, className: 'stock-in', count };
}

function getProductQueuePriority(product, launchInfo) {
  const stockState = getStockState(product.stockCount);
  const issues = launchInfo.issues;
  const firstIssue = issues[0];

  if (stockState.className === 'stock-out') {
    return {
      score: 120,
      label: 'Out of stock',
      detail: 'This item is unavailable to shoppers until inventory is restored.',
      tone: 'stock-out',
    };
  }

  if (stockState.className === 'stock-low') {
    return {
      score: 112,
      label: 'Low stock',
      detail: 'Inventory is getting tight and should be checked soon.',
      tone: 'stock-low',
    };
  }

  if (launchInfo.status === 'Missing essentials') {
    return {
      score: 104,
      label: 'Missing details',
      detail: firstIssue?.detail ?? 'Review the product record for missing fields.',
      tone: 'admin-issue-missing',
    };
  }

  if (launchInfo.visibility.state !== 'active') {
    return {
      score: 96,
      label: launchInfo.visibility.label,
      detail: launchInfo.visibility.helper,
      tone: launchInfo.visibility.className,
    };
  }

  if (launchInfo.status === 'Needs review') {
    return {
      score: 88,
      label: 'Needs review',
      detail: launchInfo.note,
      tone: launchInfo.tone,
    };
  }

  if (product.isSale || product.isNew || product.featured) {
    return {
      score: 72,
      label: 'Merchandising cue',
      detail: 'This live product is flagged for sale, newness, or featured placement.',
      tone: 'status-badge-sale',
    };
  }

  return {
    score: 48,
    label: 'Healthy listing',
    detail: 'The product is live and does not currently need owner attention.',
    tone: 'status-active',
  };
}

function ProductWorkQueueCard({ item }) {
  const { product, priority } = item;

  return (
    <article className="admin-work-queue-card">
      <div className="admin-work-queue-card-head">
        <div>
          <strong>{safeText(product.name, 'Untitled product')}</strong>
          <p>
            {safeText(product.brand, 'Unbranded')}
            {' • '}
            {safeText(product.department, 'Unassigned')}
            {' • '}
            {safeText(product.category, 'Unassigned')}
          </p>
        </div>
        <span className={`status-badge ${priority.tone}`.trim()}>{priority.label}</span>
      </div>

      <p>{priority.detail}</p>

      <div className="admin-work-queue-card-actions">
        <Link to={`/admin/products/${product.id}/edit`} className="text-button">
          Edit product
        </Link>
        <Link to={`/product/${product.id}`} className="text-button">
          View storefront
        </Link>
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

  const launchReadiness = useMemo(() => {
    const entries = products.map((product) => ({
      product,
      ...getLaunchChecklistStatus(product),
    }));

    return {
      byId: new Map(entries.map((entry) => [entry.product.id, entry])),
      entries,
    };
  }, [products]);

  const productWorkQueue = useMemo(() => {
    return launchReadiness.entries
      .map((entry) => {
        const stockState = getStockState(entry.product.stockCount);
        const priority = getProductQueuePriority(entry.product, entry);

        return {
          product: entry.product,
          launchInfo: entry,
          stockState,
          priority,
        };
      })
      .sort((left, right) => {
        if (right.priority.score !== left.priority.score) {
          return right.priority.score - left.priority.score;
        }

        const leftIssues = left.launchInfo.issues.length;
        const rightIssues = right.launchInfo.issues.length;
        if (rightIssues !== leftIssues) {
          return rightIssues - leftIssues;
        }

        return safeText(left.product.name).localeCompare(safeText(right.product.name));
      })
      .slice(0, 3);
  }, [launchReadiness.entries]);

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
        const departmentMatches = departmentFilter === 'all' || product.department === departmentFilter;
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
        subtitle="Review, update, and prepare your catalog for shoppers."
        actions={(
          <>
            <Link to="/admin/products/new" className="btn btn-dark">
              Add product
            </Link>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setStockFilter('low');
                setCategoryFilter('all');
                setDepartmentFilter('all');
              }}
            >
              Review low stock
            </button>
            <Link to="/" className="btn btn-outline">
              View storefront
            </Link>
          </>
        )}
      />

      <CatalogStatusNote variant="admin" className="admin-catalog-status" />
      {!resetAvailable ? <p className="admin-catalog-helper">Reset catalog is available only in local mode.</p> : null}

      <section className="admin-owner-workbench-panel">
        <div className="admin-owner-workbench-main">
          <div className="admin-dashboard-section-heading">
            <span>Catalog snapshot</span>
            <p>See what is live, what needs attention, and what to open first.</p>
          </div>

          <div className="admin-status-grid admin-owner-summary-grid">
            <div className="admin-status-card">
              <span>Active products</span>
              <strong>{summary.activeProducts}</strong>
              <p>Listings currently visible to shoppers.</p>
            </div>
            <div className="admin-status-card">
              <span>Need attention</span>
              <strong>{summary.productsNeedingAttention}</strong>
              <p>Products with stock, visibility, or merchandising issues.</p>
            </div>
            <div className="admin-status-card">
              <span>Low stock</span>
              <strong>{summary.lowStockProducts}</strong>
              <p>Items close to selling out.</p>
            </div>
            <div className="admin-status-card">
              <span>Out of stock</span>
              <strong>{summary.outOfStockProducts}</strong>
              <p>Unavailable products that need inventory review.</p>
            </div>
            <div className="admin-status-card">
              <span>Sale / featured</span>
              <strong>
                {summary.saleProducts}
                <span className="admin-readiness-divider">/</span>
                {summary.featuredProducts}
              </strong>
              <p>Products already promoted for shoppers.</p>
            </div>
          </div>
        </div>

        <aside className="admin-owner-workbench-side admin-dashboard-panel">
          <div className="admin-dashboard-section-heading compact">
            <span>Work queue</span>
            <p>The few product tasks most likely to block sales.</p>
          </div>

          {productWorkQueue.length ? (
            <div className="admin-work-queue-list">
              {productWorkQueue.map((item) => (
                <ProductWorkQueueCard key={item.product.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="admin-empty-state-tight">
              <h3>Catalog looks healthy.</h3>
              <p>No products are currently flagged for owner attention.</p>
            </div>
          )}
        </aside>
      </section>

      <section className="admin-dashboard-panel">
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
              Clear filters
            </button>
            <button type="button" className="btn btn-ghost" onClick={handleResetCatalog} disabled={!resetAvailable}>
              Reset catalog
            </button>
            <Link to="/admin/products/new" className="btn btn-dark">
              Add product
            </Link>
          </div>
        </div>

        {filtered.length ? (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table admin-owner-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Needs attention</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => {
                    const launchInfo = launchReadiness.byId.get(product.id);
                    const visibility = getProductVisibilityInfo(product);
                    const stockState = getStockState(product.stockCount);
                    const priority = getProductQueuePriority(product, launchInfo);

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
                              <p>
                                {safeText(product.brand, 'Unbranded')}
                                {' • '}
                                {safeText(product.department, 'Unassigned')}
                                {' • '}
                                {safeText(product.category, 'Unassigned')}
                              </p>
                              <p className="admin-table-subtle">SKU {safeText(product.sku, 'Not assigned')}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          {product.salePrice ? (
                            <div className="admin-status-stack">
                              <span className="price">{formatMoney(product.salePrice)}</span>
                              <span className="compare-price">{formatMoney(product.price)}</span>
                            </div>
                          ) : (
                            <span className="price">{formatMoney(product.price)}</span>
                          )}
                        </td>
                        <td>
                          <div className="admin-stock-cell">
                            <span className={`status-badge ${stockState.className}`}>{stockState.label}</span>
                            <span className="admin-stock-count">{stockState.count ?? '—'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="admin-status-stack">
                            <span className={`status-badge ${visibility.className}`}>{visibility.label}</span>
                          </div>
                        </td>
                        <td>
                          <div className="admin-status-stack">
                            <span className={`status-badge ${priority.tone}`}>{priority.label}</span>
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
                              Edit
                            </Link>
                            <Link to={`/product/${product.id}`} className="text-button">
                              View
                            </Link>
                            <button
                              type="button"
                              className="text-button danger"
                              disabled={isCatalogSaving}
                              onClick={() => handleDelete(product)}
                            >
                              Delete
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
                const launchInfo = launchReadiness.byId.get(product.id);
                const visibility = getProductVisibilityInfo(product);
                const stockState = getStockState(product.stockCount);
                const priority = getProductQueuePriority(product, launchInfo);

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
                        <p>
                          {safeText(product.brand, 'Unbranded')}
                          {' • '}
                          {safeText(product.department, 'Unassigned')}
                        </p>
                        <p>{safeText(product.category, 'Unassigned')}</p>
                        <p>SKU {safeText(product.sku, 'Not assigned')}</p>
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

                      <div className="status-badges">
                        <span className={`status-badge ${visibility.className}`}>{visibility.label}</span>
                        <span className={`status-badge ${launchInfo?.tone ?? 'status-badge-muted'}`}>
                          {launchInfo?.status ?? 'Ready to launch'}
                        </span>
                        <span className={`status-badge ${priority.tone}`}>{priority.label}</span>
                      </div>

                      <p className="admin-product-readiness-detail">{priority.detail}</p>

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
                          Edit
                        </Link>
                        <Link to={`/product/${product.id}`} className="btn btn-outline btn-small">
                          View
                        </Link>
                        <button
                          type="button"
                          className="btn btn-outline btn-small"
                          disabled={isCatalogSaving}
                          onClick={() => handleDelete(product)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        ) : null}
      </section>

      {!filtered.length ? (
        <div className="admin-empty-state">
          <h3>{hasProducts ? 'No products match this view.' : 'Your catalog is empty.'}</h3>
          <p>
            {hasProducts
              ? 'Try a different product name, brand, category, department, or stock filter.'
              : 'Add a product to start building the catalog, or reset the demo catalog if you want the seeded products back.'}
          </p>
          <div className="admin-empty-state-actions">
            {hasFilters ? (
              <button type="button" className="btn btn-ghost" onClick={clearFilters}>
                Clear filters
              </button>
            ) : null}
            <Link to="/admin/products/new" className="btn btn-dark">
              Add product
            </Link>
            {!hasProducts && resetAvailable ? (
              <button type="button" className="btn btn-outline" onClick={handleResetCatalog}>
                Reset catalog
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
