import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CatalogStatusNote from '../../components/CatalogStatusNote';
import ShopOraImage from '../../components/ShopOraImage';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import AdminPageHeader from '../../components/admin/AdminPageHeader';

function matchesQuery(product, query) {
  const value = query.trim().toLowerCase();
  if (!value) return true;

  return [
    product.name,
    product.brand,
    product.category,
    product.department,
    product.sku,
  ]
    .join(' ')
    .toLowerCase()
    .includes(value);
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
        const departmentMatches =
          departmentFilter === 'all' || product.department === departmentFilter;
        const categoryMatches = categoryFilter === 'all' || product.category === categoryFilter;
        const stockMatches =
          stockFilter === 'all'
            ? true
            : stockFilter === 'low'
              ? product.stockCount > 0 && product.stockCount <= 7
              : stockFilter === 'out'
                ? product.stockCount <= 0
                : product.stockCount >= 8;
        return departmentMatches && categoryMatches && stockMatches && matchesQuery(product, query);
      }),
    [products, query, departmentFilter, categoryFilter, stockFilter],
  );

  const getStockState = (stockCount) => {
    if (stockCount <= 0) {
      return { label: 'Out of stock', className: 'stock-out' };
    }

    if (stockCount <= 7) {
      return { label: `Low stock (${stockCount})`, className: 'stock-low' };
    }

    return { label: `In stock (${stockCount})`, className: 'stock-in' };
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
        subtitle="Search, filter, and maintain the demo catalog from one clean admin table."
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
                  <th>Stock</th>
                  <th>Status</th>
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
                          alt={product.name}
                          className="admin-product-thumb"
                          fallbackText="ShopOra"
                        />
                        <div>
                          <strong>{product.name}</strong>
                          <p>{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td>{product.brand}</td>
                    <td>{product.department}</td>
                    <td>{product.category}</td>
                    <td>
                      {product.salePrice ? (
                        <>
                          <span className="price">${product.salePrice.toFixed(2)}</span>{' '}
                          <span className="compare-price">${product.price.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="price">${product.price.toFixed(2)}</span>
                      )}
                    </td>
                    <td>
                      <div className="admin-stock-cell">
                        <span className={`status-badge ${getStockState(product.stockCount).className}`}>
                          {getStockState(product.stockCount).label}
                        </span>
                        <span className="admin-stock-count">{product.stockCount}</span>
                      </div>
                    </td>
                    <td>
                      <div className="status-badges">
                        {product.isNew ? <span className="status-badge">New</span> : null}
                        {product.isSale ? <span className="status-badge">Sale</span> : null}
                        <span className={`status-badge ${getStockState(product.stockCount).className}`}>
                          {getStockState(product.stockCount).label}
                        </span>
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
                    alt={product.name}
                    className="admin-product-thumb"
                    fallbackText="ShopOra"
                  />
                  <div className="admin-product-card-meta">
                    <h3>{product.name}</h3>
                    <p>{product.brand}</p>
                    <p>
                      {product.department} / {product.category}
                    </p>
                  </div>
                </div>

                <div className="admin-product-card-body">
                  <div className="admin-product-card-row">
                    <div>
                      {product.salePrice ? (
                        <>
                          <span className="price">${product.salePrice.toFixed(2)}</span>{' '}
                          <span className="compare-price">${product.price.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="price">${product.price.toFixed(2)}</span>
                      )}
                    </div>
                    <span className={`status-badge ${getStockState(product.stockCount).className}`}>
                      {getStockState(product.stockCount).label}
                    </span>
                  </div>

                  <div className="status-badges">
                    {product.isNew ? <span className="status-badge">New</span> : null}
                    {product.isSale ? <span className="status-badge">Sale</span> : null}
                  </div>

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
            ))}
          </div>
        </>
      ) : null}

      {!filtered.length ? (
        <div className="admin-empty-state">
          <h3>No products found.</h3>
          <p>Try a different product name, brand, category, or department.</p>
        </div>
      ) : null}
    </div>
  );
}
