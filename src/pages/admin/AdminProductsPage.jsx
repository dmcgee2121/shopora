import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CatalogStatusNote from '../../components/CatalogStatusNote';
import ShopOraImage from '../../components/ShopOraImage';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import AdminPageHeader from '../../components/admin/AdminPageHeader';

function safeText(value, fallback = '-') {
  const text = typeof value === 'string' ? value.trim() : '';
  return text || fallback;
}

function formatMoney(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : '-';
}

function formatTitle(value) {
  const text = safeText(value, '');
  if (!text) return 'Active';
  return text
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
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

function getProductVisibility(product) {
  const explicitStatus = safeText(product.status, '') || safeText(product.visibility, '');
  const normalizedStatus = explicitStatus.toLowerCase();

  if (normalizedStatus === 'archived' || product.archived || product.isArchived) {
    return { label: 'Archived', className: 'status-archived', helper: 'Hidden from the storefront.' };
  }

  if (
    normalizedStatus === 'draft' ||
    normalizedStatus === 'hidden' ||
    normalizedStatus === 'inactive' ||
    normalizedStatus === 'unlisted' ||
    product.draft ||
    product.isDraft ||
    product.isActive === false
  ) {
    return { label: 'Draft', className: 'status-draft', helper: 'Saved in admin, not shown to shoppers.' };
  }

  if (normalizedStatus) {
    return {
      label: formatTitle(explicitStatus),
      className: 'status-active',
      helper: 'Custom catalog status from stored product data.',
    };
  }

  return { label: 'Active', className: 'status-active', helper: 'Visible in the storefront.' };
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
        const stockCount = Number(product.stockCount ?? 0);
        const departmentMatches =
          departmentFilter === 'all' || product.department === departmentFilter;
        const categoryMatches = categoryFilter === 'all' || product.category === categoryFilter;
        const stockMatches =
          stockFilter === 'all'
            ? true
            : stockFilter === 'low'
              ? stockCount > 0 && stockCount <= 7
              : stockFilter === 'out'
                ? stockCount <= 0
                : stockCount >= 8;
        return departmentMatches && categoryMatches && stockMatches && matchesQuery(product, query);
      }),
    [products, query, departmentFilter, categoryFilter, stockFilter],
  );

  const getStockState = (stockCount) => {
    const count = Number(stockCount);

    if (!Number.isFinite(count) || count <= 0) {
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
        subtitle="Search, filter, and maintain the catalog from one clean admin table or mobile card view."
        actionLabel="Add Product"
        actionTo="/admin/products/new"
      />

      <CatalogStatusNote variant="admin" className="admin-catalog-status" />
      {!resetAvailable ? (
        <p className="admin-catalog-helper">Reset catalog is available for local demo mode only.</p>
      ) : null}

      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <input
            className="admin-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search catalog, brands, departments, or SKU"
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
            <th>Status</th>
            <th>Stock</th>
            <th />
          </tr>
        </thead>
        <tbody>
                {filtered.map((product) => (
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
                      <div className="status-badges admin-status-stack">
                        <span className={`status-badge ${getProductVisibility(product).className}`}>
                          {getProductVisibility(product).label}
                        </span>
                        <span className="admin-status-caption">{getProductVisibility(product).helper}</span>
                      </div>
                    </td>
                    <td>
                      <div className="admin-stock-cell">
                        <span className={`status-badge ${getStockState(product.stockCount).className}`}>
                          {getStockState(product.stockCount).label}
                        </span>
                        <span className="admin-stock-count">{Number(product.stockCount ?? 0)}</span>
                      </div>
                      <div className="admin-status-subtext">
                        {Number(product.stockCount ?? 0) <= 0
                          ? 'Shoppers cannot add this item to cart.'
                          : Number(product.stockCount ?? 0) <= 7
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
                          Edit product
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
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-product-cards">
            {filtered.map((product) => (
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
                    <p>
                      {safeText(product.department, 'Unassigned')} / {safeText(product.category, 'Unassigned')}
                    </p>
                    <div className="status-badges">
                      <span className={`status-badge ${getProductVisibility(product).className}`}>
                        {getProductVisibility(product).label}
                      </span>
                      {product.isNew ? <span className="status-badge status-badge-muted">New</span> : null}
                      {product.isSale ? <span className="status-badge status-badge-sale">Sale</span> : null}
                    </div>
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
                    <span className={`status-badge ${getStockState(product.stockCount).className}`}>
                      {getStockState(product.stockCount).label}
                    </span>
                  </div>

                  <p className="admin-status-subtext">
                    Stock count: {Number(product.stockCount ?? 0)}.{' '}
                    {Number(product.stockCount ?? 0) <= 0
                      ? 'Out of stock.'
                      : Number(product.stockCount ?? 0) <= 7
                        ? 'Low stock.'
                        : 'Available.'}
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
                      Edit product
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
            ))}
          </div>
        </>
      ) : null}

      {!filtered.length ? (
        <div className="admin-empty-state">
          <h3>{hasProducts ? 'No matching products.' : 'Your catalog is empty.'}</h3>
          <p>
            {hasProducts
              ? 'Try a different product name, brand, category, department, or stock filter.'
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
