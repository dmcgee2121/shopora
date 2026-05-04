import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import FilterSidebar from './FilterSidebar';
import CatalogStatusNote from './CatalogStatusNote';
import ProductCard from './ProductCard';
import SectionHeading from './SectionHeading';
import { useProductCatalog } from '../context/ProductCatalogContext';

function sortProducts(list, sort) {
  const items = [...list];

  switch (sort) {
    case 'priceAsc':
      return items.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    case 'priceDesc':
      return items.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    case 'rating':
      return items.sort((a, b) => b.rating - a.rating);
    case 'newest':
      return items.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    default:
      return items;
  }
}

export default function CategoryPage({ title, description, department, saleOnly = false }) {
  const { products } = useProductCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') ?? '';
  const size = searchParams.get('size') ?? '';
  const price = searchParams.get('price') ?? '';
  const q = searchParams.get('q') ?? '';
  const sort = searchParams.get('sort') ?? 'featured';
  const saleFilter = saleOnly || searchParams.get('saleOnly') === '1';

  const scopedProducts = useMemo(() => {
    let list = products;

    if (department) {
      list = list.filter((product) => product.department === department);
    }

    if (saleOnly) {
      list = list.filter((product) => product.isSale);
    }

    if (q) {
      const value = q.toLowerCase();
      list = list.filter(
        (product) =>
          product.name.toLowerCase().includes(value) ||
          product.category.toLowerCase().includes(value) ||
          product.description.toLowerCase().includes(value),
      );
    }

    if (saleFilter) {
      list = list.filter((product) => product.isSale);
    }

    return list;
  }, [category, department, price, q, saleFilter, saleOnly, size, sort]);

  const availableCategories = useMemo(
    () => [...new Set(scopedProducts.map((product) => product.category))],
    [scopedProducts],
  );

  const availableSizes = useMemo(
    () => [...new Set(scopedProducts.flatMap((product) => product.sizes || []))],
    [scopedProducts],
  );

  const filteredProducts = useMemo(() => {
    let list = [...scopedProducts];

    if (category) {
      list = list.filter((product) => product.category === category);
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

    return sortProducts(list, sort);
  }, [category, price, scopedProducts, size, sort]);

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

  return (
    <section className="catalog-page">
      <div className="container">
        <CatalogStatusNote className="category-catalog-status" />
        <SectionHeading
          title={title}
          description={description}
          action={<span className="count-badge">{filteredProducts.length} products</span>}
        />

        <div className="catalog-toolbar">
          <div className="toolbar-group">
            <label className="toolbar-label">
              Sort
              <select value={sort} onChange={(event) => updateSearchParams({ sort: event.target.value })}>
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="rating">Top rated</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </label>
          </div>
          {q ? <div className="query-chip">Search: “{q}”</div> : null}
        </div>

        <div className="catalog-layout">
          <FilterSidebar
            availableCategories={availableCategories}
            availableSizes={availableSizes}
            category={category}
            size={size}
            price={price}
            saleOnly={saleFilter}
            onChange={updateSearchParams}
          />

          <div className="product-results">
            {filteredProducts.length ? (
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No products match these filters.</h3>
                <p>Try clearing a filter or search term to see more styles.</p>
                <button
                  type="button"
                  className="btn btn-dark"
                  onClick={() => setSearchParams(new URLSearchParams())}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
