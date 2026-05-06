import { Link } from 'react-router-dom';
import { useProductCatalog } from '../context/ProductCatalogContext';

function slugify(value) {
  return value.trim().replace(/\s+/g, ' ');
}

function brandTagline(brand, products) {
  const categories = new Set(products.map((product) => product.category));
  const departments = new Set(products.map((product) => product.department));

  if (brand.includes('Shoes')) {
    return 'Everyday footwear';
  }

  if (brand.includes('Accessories')) {
    return 'Finishing touches';
  }

  if (brand.includes('Atelier')) {
    return 'Modern essentials';
  }

  if (brand.includes('Bridge')) {
    return 'Polished workwear';
  }

  if (brand.includes('North')) {
    return 'Layer-ready classics';
  }

  if (departments.has('shoes')) {
    return 'Everyday footwear';
  }

  if (departments.has('accessories') && categories.size <= 2) {
    return 'Finishing touches';
  }

  if (categories.has('Blazers') || categories.has('Shirts') || categories.has('Outerwear')) {
    return 'Polished workwear';
  }

  if (categories.has('Dresses') || categories.has('Tops') || categories.has('Bottoms')) {
    return 'Modern essentials';
  }

  return 'Soft everyday layers';
}

export default function FeaturedBrands() {
  const { products } = useProductCatalog();
  const brandMap = products.reduce((accumulator, product) => {
    const key = product.brand;
    if (!accumulator[key]) {
      accumulator[key] = [];
    }
    accumulator[key].push(product);
    return accumulator;
  }, {});

  const brands = Object.entries(brandMap).map(([brand, items]) => ({
    brand,
    items,
    tagline: brandTagline(brand, items),
  }));

  return (
    <section className="section-block">
      <div className="section-heading">
        <div>
          <h2>Featured Brands</h2>
          <p>Explore the labels shaping this season's ShopOra edit.</p>
        </div>
      </div>

      <div className="brand-rail">
        {brands.map((item) => (
          <Link
            key={item.brand}
            to={`/search?q=${encodeURIComponent(slugify(item.brand))}`}
            className="brand-card"
          >
            <div className="brand-card-top">
              <h3>{item.brand}</h3>
              <span>{item.items.length} products</span>
            </div>
            <p>{item.tagline}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
