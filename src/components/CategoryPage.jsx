import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import FilterSidebar from './FilterSidebar';
import CatalogStatusNote from './CatalogStatusNote';
import ProductCard from './ProductCard';
import SectionHeading from './SectionHeading';
import { useProductCatalog } from '../context/ProductCatalogContext';
import { getRecommendedProducts } from '../utils/recommendations';
import {
  getCategoryDiscovery,
  getCategoryDiscoveryProfile,
  getCategoryShortcutLinks,
  getDiscoveryDepartmentLinks,
} from '../utils/discovery';
import {
  getCatalogPriceLabel,
  getCatalogSortLabel,
  getCatalogStatusLabel,
  matchesCatalogStatus,
  sortCatalogProducts,
} from '../utils/catalogFilters';

function uniqueValues(products, accessor) {
  return [...new Set(products.map(accessor).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function matchesText(product, value) {
  const searchable = [
    product.brand,
    product.name,
    product.category,
    product.department,
    product.description,
    product.sku,
    ...(product.colors || []),
  ]
    .join(' ')
    .toLowerCase();

  return searchable.includes(value);
}

export default function CategoryPage({ title, description, department, saleOnly = false }) {
  const { products, isCatalogLoading } = useProductCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') ?? '';
  const brand = searchParams.get('brand') ?? '';
  const size = searchParams.get('size') ?? '';
  const price = searchParams.get('price') ?? '';
  const status = searchParams.get('status') ?? '';
  const q = searchParams.get('q') ?? '';
  const sort = searchParams.get('sort') ?? 'featured';
  const saleFilter = saleOnly || searchParams.get('saleOnly') === '1';
  const departmentLinks = useMemo(() => getDiscoveryDepartmentLinks(), []);

  const scopedProducts = useMemo(() => {
    let list = products;

    if (department) {
      list = list.filter((product) => product.department === department);
    }

    if (q) {
      const value = q.toLowerCase();
      list = list.filter((product) => matchesText(product, value));
    }

    if (saleFilter) {
      list = list.filter((product) => product.isSale);
    }

    return list;
  }, [department, products, q, saleFilter]);

  const availableCategories = useMemo(() => uniqueValues(scopedProducts, (product) => product.category), [scopedProducts]);
  const availableBrands = useMemo(() => uniqueValues(scopedProducts, (product) => product.brand), [scopedProducts]);
  const availableSizes = useMemo(
    () => uniqueValues(scopedProducts.flatMap((product) => product.sizes || []), (value) => value),
    [scopedProducts],
  );

  const filteredProducts = useMemo(() => {
    let list = [...scopedProducts];

    if (category) {
      list = list.filter((product) => product.category === category);
    }

    if (brand) {
      list = list.filter((product) => product.brand === brand);
    }

    if (size) {
      list = list.filter((product) => product.sizes?.includes(size));
    }

    if (price) {
      list = list.filter((product) => {
        const value = product.salePrice ?? product.price;
        if (price === 'under50') return value < 50;
        if (price === '50to100') return value >= 50 && value <= 100;
        if (price === 'over100') return value > 100;
        return true;
      });
    }

    if (status) {
      list = list.filter((product) => matchesCatalogStatus(product, status));
    }

    return sortCatalogProducts(list, sort);
  }, [brand, category, price, scopedProducts, size, sort, status]);

  const updateSearchParams = (updates) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value === false || value === null || value === undefined) {
        next.delete(key);
      } else if (value === true) {
        next.set(key, '1');
      } else {
        next.set(key, String(value));
      }
    });

    setSearchParams(next);
  };

  const resetFilters = () => setSearchParams(q ? { q } : new URLSearchParams());
  const activeFilterCount = [category, brand, size, price, status, saleFilter && !saleOnly].filter(Boolean).length;
  const browsingLabel = saleOnly ? 'Sale collection' : department ? `${title} edit` : 'All departments';
  const discovery = useMemo(
    () => getCategoryDiscovery(products, { department, saleOnly, limit: 4 }),
    [department, products, saleOnly],
  );
  const discoveryProfile = useMemo(
    () => getCategoryDiscoveryProfile({ title, department, saleOnly }),
    [department, saleOnly, title],
  );
  const shortcutLinks = useMemo(
    () => getCategoryShortcutLinks({ department, saleOnly, categories: availableCategories }),
    [availableCategories, department, saleOnly],
  );
  const filterSummary = [
    category ? `Category: ${category}` : '',
    brand ? `Brand: ${brand}` : '',
    size ? `Size: ${size}` : '',
    price ? `Price: ${getCatalogPriceLabel(price)}` : '',
    status ? `Status: ${getCatalogStatusLabel(status)}` : '',
    saleFilter && !saleOnly ? 'Sale styles only' : '',
    sort && sort !== 'featured' ? `Sort: ${getCatalogSortLabel(sort)}` : '',
  ].filter(Boolean);
  const isInitialCatalogLoading = isCatalogLoading && products.length === 0;
  const countLabel = isInitialCatalogLoading ? 'Loading styles' : `${filteredProducts.length} products`;
  const emptyTitle = activeFilterCount ? 'No styles match those filters.' : 'No styles found.';
  const emptyDescription = activeFilterCount
    ? 'Try removing brand, size, price, or status filters to widen the edit.'
    : 'This lane is still being merchandised, so browse the department shortcuts for nearby styles.';
  const recommendationSeeds = useMemo(
    () =>
      [
        department ? { department } : null,
        category ? { category } : null,
        brand ? { brand } : null,
      ].filter(Boolean),
    [brand, category, department],
  );
  const recommendedProducts = useMemo(
    () =>
      getRecommendedProducts(products, recommendationSeeds, {
        excludeIds: filteredProducts.map((product) => product.id),
        limit: 4,
      }),
    [filteredProducts, products, recommendationSeeds],
  );
  const discoveryTitle = saleOnly ? 'Sale picks worth a closer look' : `${title} top picks`;
  const discoveryDescription = saleOnly
    ? 'A compact edit of markdowns with strong value, ratings, and styling range.'
    : 'A quick department edit that starts with strong styles, then lets shoppers refine the assortment.';
  const discoveryHeadingId = `category-discovery-${saleOnly ? 'sale' : department || 'all'}`;

  return (
    <section className="catalog-page">
      <div className="container">
        <CatalogStatusNote className="category-catalog-status" />
        <SectionHeading
          title={title}
          description={`${description} You are browsing the ${browsingLabel.toLowerCase()}. Use the filters to narrow the edit by category, brand, price, size, and product status.`}
          action={<span className="count-badge">{countLabel}</span>}
        />

        <section className="discovery-hero" aria-labelledby={discoveryHeadingId}>
          <div className="discovery-hero-copy">
            <p className="eyebrow">{discoveryProfile.eyebrow}</p>
            <h2 id={discoveryHeadingId}>{discoveryProfile.title}</h2>
            <p>{discoveryProfile.description}</p>
          </div>
          <div className="discovery-stat-card" aria-label={`${title} discovery summary`}>
            <span className="account-card-label">Department snapshot</span>
            <div className="discovery-stat-grid">
              <div>
                <strong>{isInitialCatalogLoading ? 'Loading' : discovery.stats.total}</strong>
                <span>Styles</span>
              </div>
              <div>
                <strong>{isInitialCatalogLoading ? 'Loading' : discovery.stats.newCount}</strong>
                <span>New</span>
              </div>
              <div>
                <strong>{isInitialCatalogLoading ? 'Loading' : discovery.stats.saleCount}</strong>
                <span>Sale</span>
              </div>
            </div>
          </div>
        </section>

        {!isInitialCatalogLoading && discovery.topPicks.length ? (
          <section className="discovery-section">
            <SectionHeading
              title={discoveryTitle}
              description={discoveryDescription}
              action={<span className="count-badge">{discovery.topPicks.length} picks</span>}
            />
            <div className="product-grid discovery-product-grid">
              {discovery.topPicks.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ) : null}

        {shortcutLinks.length ? (
          <nav className="discovery-shortcut-strip" aria-label={`${title} discovery shortcuts`}>
            {shortcutLinks.map((link) => (
              <Link key={`${link.label}-${link.to}`} to={link.to} className="discovery-shortcut-card">
                <span>{link.label}</span>
                <p>{link.description}</p>
              </Link>
            ))}
          </nav>
        ) : null}

        <div className="catalog-toolbar">
          <div className="toolbar-group">
            <label className="toolbar-label">
              Sort
              <select value={sort} onChange={(event) => updateSearchParams({ sort: event.target.value })}>
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="reviews">Most Reviewed</option>
              </select>
            </label>
          </div>
          <div className="catalog-context">
            <span className="query-chip">{browsingLabel}</span>
            {q ? <span className="query-chip">Search: &quot;{q}&quot;</span> : null}
            {activeFilterCount ? (
              <span className="query-chip">
                {activeFilterCount} filter{activeFilterCount === 1 ? '' : 's'} applied
              </span>
            ) : null}
          </div>
        </div>

        {filterSummary.length ? (
          <div className="active-filter-row" aria-label="Active catalog filters">
            {filterSummary.map((item) => (
              <span key={item} className="query-chip">
                {item}
              </span>
            ))}
            <button type="button" className="text-button" onClick={resetFilters}>
              Reset filters
            </button>
          </div>
        ) : null}

        <div className="catalog-layout">
          <FilterSidebar
            availableCategories={availableCategories}
            availableBrands={availableBrands}
            availableSizes={availableSizes}
            category={category}
            brand={brand}
            size={size}
            price={price}
            saleOnly={saleFilter}
            status={status}
            onChange={updateSearchParams}
          />

          <div className="product-results">
            {isInitialCatalogLoading ? (
              <div className="empty-state">
                <h3>Loading styles.</h3>
                <p>We are getting the latest catalog ready. Featured products will appear here shortly.</p>
              </div>
            ) : filteredProducts.length ? (
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <>
                <div className="empty-state">
                  <h3>{emptyTitle}</h3>
                  <p>{emptyDescription}</p>
                  <div className="empty-state-actions">
                    <button type="button" className="btn btn-dark" onClick={resetFilters}>
                      Reset filters
                    </button>
                    {q ? (
                      <button type="button" className="btn btn-ghost" onClick={() => setSearchParams(new URLSearchParams())}>
                        Clear search
                      </button>
                    ) : null}
                  </div>
                  <div className="recommendation-links" aria-label="Browse departments">
                    {departmentLinks.map((link) => (
                      <Link key={link.to} to={link.to} className="query-chip">
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
                {recommendedProducts.length ? (
                  <section className="related-section search-recommendations">
                    <div className="section-heading">
                      <div>
                        <h2>More to explore</h2>
                        <p>Popular picks that fit the same shopping lane.</p>
                      </div>
                    </div>
                    <div className="product-grid">
                      {recommendedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </section>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
