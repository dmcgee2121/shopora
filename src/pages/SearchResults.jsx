import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CatalogStatusNote from '../components/CatalogStatusNote';
import ProductCard from '../components/ProductCard';
import SectionHeading from '../components/SectionHeading';
import { useProductCatalog } from '../context/ProductCatalogContext';

function sortResults(list, sort) {
  const items = [...list];

  switch (sort) {
    case 'priceAsc':
      return items.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    case 'priceDesc':
      return items.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    case 'newest':
      return items.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    case 'rating':
      return items.sort((a, b) => b.rating - a.rating);
    default:
      return items;
  }
}

const sortLabels = {
  featured: 'Featured',
  priceAsc: 'Price: Low to High',
  priceDesc: 'Price: High to Low',
  newest: 'Newest',
  rating: 'Top Rated',
};

export default function SearchResults() {
  const { products, isCatalogLoading } = useProductCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim() ?? '';
  const sort = searchParams.get('sort') ?? 'featured';

  const results = useMemo(() => {
    if (!query) {
      return [];
    }

    const lower = query.toLowerCase();

    const matched = products.filter((product) => {
      const searchable = [
        product.brand,
        product.name,
        product.category,
        product.department,
        product.description,
        ...(product.colors || []),
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(lower);
    });

    return sortResults(matched, sort);
  }, [products, query, sort]);

  const heading = query ? `Search results for "${query}"` : 'Search ShopOra';
  const resetSearch = () => setSearchParams(new URLSearchParams());
  const isInitialCatalogLoading = isCatalogLoading && products.length === 0;
  const countLabel = isInitialCatalogLoading ? 'Loading styles' : `${results.length} products`;

  return (
    <section className="search-page">
      <div className="container">
        <CatalogStatusNote className="search-catalog-status" />
        <SectionHeading
          title={heading}
          description={
            query
              ? 'Browse the styles that match your search across brands, departments, and colorways.'
              : 'Use the search bar in the navbar to look for products, categories, brands, and colors.'
          }
          action={query ? <span className="count-badge">{countLabel}</span> : null}
        />

        {query ? (
          <div className="catalog-toolbar search-toolbar">
            <div className="toolbar-group">
              <label className="toolbar-label">
                Sort
                <select
                  value={sort}
                  onChange={(event) => setSearchParams({ q: query, sort: event.target.value })}
                >
                  <option value="featured">Featured</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="newest">Newest</option>
                  <option value="rating">Top Rated</option>
                </select>
              </label>
            </div>
            <div className="catalog-context">
              <span className="query-chip">Showing matches for &quot;{query}&quot;</span>
              {sort !== 'featured' ? <span className="query-chip">Sort: {sortLabels[sort] ?? sort}</span> : null}
            </div>
          </div>
        ) : null}

        {!query ? (
          <div className="empty-state search-empty">
            <h2>Search the catalog.</h2>
            <p>Try names like blazer, sneakers, tote, or a color such as black or ivory.</p>
            <Link to="/" className="btn btn-dark">
              Start Shopping
            </Link>
          </div>
        ) : isInitialCatalogLoading ? (
          <div className="empty-state search-empty">
            <h2>Loading styles.</h2>
            <p>We are getting the latest catalog ready before showing matching products.</p>
          </div>
        ) : results.length ? (
          <div className="product-grid">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state search-empty">
            <h2>No results found.</h2>
            <p>Try a broader keyword, clear the search, or browse departments to keep shopping.</p>
            <div className="empty-state-actions">
              <button type="button" className="btn btn-dark" onClick={resetSearch}>
                Clear Search
              </button>
              <Link to="/" className="btn btn-ghost">
                Browse Departments
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
