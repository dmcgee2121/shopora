import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CatalogStatusNote from '../components/CatalogStatusNote';
import FilterSidebar from '../components/FilterSidebar';
import ProductCard from '../components/ProductCard';
import SectionHeading from '../components/SectionHeading';
import { useProductCatalog } from '../context/ProductCatalogContext';
import { getRecommendedProducts } from '../utils/recommendations';
import {
  getDiscoveryDepartmentLinks,
  getSearchLandingProducts,
  getSearchSuggestionLinks,
} from '../utils/discovery';
import useDocumentTitle from '../hooks/useDocumentTitle';
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

export default function SearchResults() {
  const { products, isCatalogLoading } = useProductCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim() ?? '';
  useDocumentTitle(`ShopOra | ${query ? `Search results for ${query}` : 'Search'}`);
  const sort = searchParams.get('sort') ?? 'featured';
  const category = searchParams.get('category') ?? '';
  const department = searchParams.get('department') ?? '';
  const brand = searchParams.get('brand') ?? '';
  const size = searchParams.get('size') ?? '';
  const price = searchParams.get('price') ?? '';
  const status = searchParams.get('status') ?? '';
  const saleOnly = searchParams.get('saleOnly') === '1';
  const departmentLinks = useMemo(() => getDiscoveryDepartmentLinks(), []);
  const searchSuggestionLinks = useMemo(() => getSearchSuggestionLinks(), []);
  const searchLandingProducts = useMemo(
    () => getSearchLandingProducts(products, { limit: 4 }),
    [products],
  );

  const searchMatches = useMemo(() => {
    if (!query) {
      return [];
    }

    const lower = query.toLowerCase();

    return products.filter((product) => matchesText(product, lower));
  }, [products, query]);

  const availableCategories = useMemo(() => uniqueValues(searchMatches, (product) => product.category), [searchMatches]);
  const availableDepartments = useMemo(
    () => uniqueValues(searchMatches, (product) => product.department),
    [searchMatches],
  );
  const availableBrands = useMemo(() => uniqueValues(searchMatches, (product) => product.brand), [searchMatches]);
  const availableSizes = useMemo(
    () => uniqueValues(searchMatches.flatMap((product) => product.sizes || []), (value) => value),
    [searchMatches],
  );

  const filteredResults = useMemo(() => {
    let list = [...searchMatches];

    if (category) {
      list = list.filter((product) => product.category === category);
    }

    if (department) {
      list = list.filter((product) => product.department === department);
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

    if (saleOnly) {
      list = list.filter((product) => product.isSale);
    }

    return sortCatalogProducts(list, sort);
  }, [brand, category, department, price, saleOnly, searchMatches, size, sort, status]);

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

  const clearSearch = () => setSearchParams(new URLSearchParams());
  const resetFilters = () => setSearchParams(query ? { q: query } : new URLSearchParams());
  const activeFilterCount = [category, department, brand, size, price, status, saleOnly].filter(Boolean).length;
  const isInitialCatalogLoading = isCatalogLoading && products.length === 0;
  const countLabel = isInitialCatalogLoading ? 'Loading styles' : `${filteredResults.length} products`;
  const filterSummary = [
    category ? `Category: ${category}` : '',
    department ? `Department: ${department}` : '',
    brand ? `Brand: ${brand}` : '',
    size ? `Size: ${size}` : '',
    price ? `Price: ${getCatalogPriceLabel(price)}` : '',
    status ? `Status: ${getCatalogStatusLabel(status)}` : '',
    saleOnly ? 'Sale styles only' : '',
    sort && sort !== 'featured' ? `Sort: ${getCatalogSortLabel(sort)}` : '',
  ].filter(Boolean);
  const emptyTitle = activeFilterCount ? 'No styles match those filters.' : 'No results found.';
  const emptyDescription = activeFilterCount
    ? 'Try removing one or more filters, clearing the search, or browsing sale and new arrival styles to widen the results.'
    : 'Try a broader keyword, check spelling, or use a department shortcut to start with a curated edit.';
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
        excludeIds: filteredResults.map((product) => product.id),
        limit: 4,
      }),
    [filteredResults, products, recommendationSeeds],
  );

  return (
    <section className="search-page">
      <div className="container">
        <CatalogStatusNote className="search-catalog-status" />
        <SectionHeading
          title={query ? `Search results for "${query}"` : 'Search ShopOra'}
          description={
            query
              ? 'Browse the styles that match your search across brands, departments, and colorways, then narrow the edit with filters and sort controls.'
              : 'Use the search bar in the navbar to look for products, categories, brands, and colors when you want a fast way into the edit.'
          }
          action={query ? <span className="count-badge">{countLabel}</span> : null}
        />
        <p className="catalog-toolbar-note">
          Sort controls change the order of the results, while filters narrow the catalog to a smaller set of matches.
        </p>

        {!query ? (
          <div className="search-landing">
            <div className="search-landing-grid">
              <section className="search-landing-panel" aria-labelledby="search-start-title">
                <p className="eyebrow">Search guide</p>
                <h2 id="search-start-title">Start with a product, category, brand, or color.</h2>
                <p>Try a focused search, then refine by department, size, price, product status, or sale.</p>
                <div className="recommendation-links search-suggestion-list" aria-label="Suggested searches">
                  {searchSuggestionLinks.map((link) => (
                    <Link key={link.to} to={link.to} className="query-chip">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </section>

              <section className="search-landing-panel search-landing-panel-soft" aria-labelledby="search-browse-title">
                <p className="eyebrow">Browse instead</p>
                <h2 id="search-browse-title">Move through the store by department.</h2>
                <p>Use a department shortcut when you want a curated edit first, or jump to sale when you want markdowns right away.</p>
                <div className="recommendation-links search-suggestion-list" aria-label="Browse departments">
                  {departmentLinks.map((link) => (
                    <Link key={link.to} to={link.to} className="query-chip">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </section>
            </div>

            {isInitialCatalogLoading ? (
              <div className="empty-state search-empty">
                <h2>Loading discovery picks.</h2>
                <p>We are getting the latest catalog ready before showing suggested products.</p>
              </div>
            ) : searchLandingProducts.length ? (
              <section className="discovery-section search-landing-products">
                <SectionHeading
                  title="Recommended starting points"
                  description="A few strong products to begin browsing before you search."
                  action={<span className="count-badge">{searchLandingProducts.length} picks</span>}
                />
                <div className="product-grid discovery-product-grid">
                  {searchLandingProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : isInitialCatalogLoading ? (
          <div className="empty-state search-empty">
            <h2>Loading styles.</h2>
            <p>We are getting the latest catalog ready before showing matching products. You can still use the department shortcuts while the catalog loads.</p>
          </div>
        ) : (
          <>
            <div className="catalog-toolbar search-toolbar">
              <div className="toolbar-group">
                <label className="toolbar-label">
                  Sort
                  <select
                    value={sort}
                    onChange={(event) => updateSearchParams({ sort: event.target.value })}
                  >
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
                <span className="query-chip">Showing matches for &quot;{query}&quot;</span>
                {activeFilterCount ? (
                  <span className="query-chip">
                    {activeFilterCount} filter{activeFilterCount === 1 ? '' : 's'} applied
                  </span>
                ) : null}
              </div>
            </div>

            {filterSummary.length ? (
              <div className="active-filter-row" aria-label="Active search filters">
                {filterSummary.map((item) => (
                  <span key={item} className="query-chip">
                    {item}
                  </span>
                ))}
                <button type="button" className="text-button" onClick={resetFilters}>
                  Reset filters
                </button>
                <button type="button" className="text-button" onClick={clearSearch}>
                  Clear search
                </button>
              </div>
            ) : null}

            <div className="catalog-layout">
              <FilterSidebar
                availableCategories={availableCategories}
                availableDepartments={availableDepartments}
                availableBrands={availableBrands}
                availableSizes={availableSizes}
                category={category}
                department={department}
                brand={brand}
                size={size}
                price={price}
                saleOnly={saleOnly}
                status={status}
                onChange={updateSearchParams}
              />

              <div className="product-results">
                {filteredResults.length ? (
                  <div className="product-grid">
                    {filteredResults.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                <div className="empty-state search-empty">
                  <h2>{emptyTitle}</h2>
                  <p>{emptyDescription}</p>
                    <div className="empty-state-actions">
                      {activeFilterCount ? (
                        <button type="button" className="btn btn-dark" onClick={resetFilters}>
                          Reset filters
                        </button>
                      ) : (
                        <button type="button" className="btn btn-dark" onClick={clearSearch}>
                          Clear search
                        </button>
                      )}
                      <Link to="/women" className="btn btn-ghost">
                        Browse women
                      </Link>
                      <Link to="/sale" className="btn btn-ghost">
                        Browse sale
                      </Link>
                    </div>
                    <div className="recommendation-links" aria-label="Browse departments">
                      {departmentLinks.map((link) => (
                        <Link key={link.to} to={link.to} className="query-chip">
                          {link.label}
                        </Link>
                      ))}
                    </div>
                    <div className="recommendation-links search-suggestion-list" aria-label="Try suggested searches">
                      {searchSuggestionLinks.map((link) => (
                        <Link key={link.to} to={link.to} className="query-chip">
                          {link.label}
                        </Link>
                      ))}
                    </div>
                    <div className="recommendation-links search-suggestion-list" aria-label="How to refine search">
                      <span className="query-chip">Check spelling</span>
                      <span className="query-chip">Try a broader keyword</span>
                      <span className="query-chip">Clear filters</span>
                      <span className="query-chip">Browse new arrivals</span>
                    </div>
                  </div>
                )}
                {!filteredResults.length && recommendedProducts.length ? (
                  <section className="related-section search-recommendations">
                    <div className="section-heading">
                      <div>
                        <h2>Recommended styles</h2>
                        <p>Popular products that shoppers often compare with this search.</p>
                      </div>
                    </div>
                    <div className="product-grid">
                      {recommendedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
