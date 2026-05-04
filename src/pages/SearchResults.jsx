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
    default:
      return items;
  }
}

export default function SearchResults() {
  const { products } = useProductCatalog();
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
  }, [query, sort]);

  const heading = query ? `Search results for "${query}"` : 'Search ShopOra';

  return (
    <section className="search-page">
      <div className="container">
        <CatalogStatusNote className="search-catalog-status" />
        <SectionHeading
          title={heading}
          description={
            query
              ? 'Browse the styles that match your search.'
              : 'Use the search bar in the navbar to look for products, categories, and colors.'
          }
          action={query ? <span className="count-badge">{results.length} products</span> : null}
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
                </select>
              </label>
            </div>
            <div className="query-chip">Showing matches for "{query}"</div>
          </div>
        ) : null}

        {!query ? (
          <div className="empty-state search-empty">
            <h2>Search for clothing, shoes, and accessories.</h2>
            <p>Try names like blazer, sneakers, tote, or a color such as black or ivory.</p>
            <Link to="/" className="btn btn-dark">
              Start Shopping
            </Link>
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
            <p>Try a different keyword or browse the full collection to find something close.</p>
            <Link to="/" className="btn btn-dark">
              Back to Shopping
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
