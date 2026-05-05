import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import PromoBar from '../components/PromoBar';
import TrustStrip from '../components/TrustStrip';
import HomeCampaign from '../components/HomeCampaign';
import FeaturedBrands from '../components/FeaturedBrands';
import DepartmentTiles from '../components/DepartmentTiles';
import WhyShopOra from '../components/WhyShopOra';
import ProductCard from '../components/ProductCard';
import SectionHeading from '../components/SectionHeading';
import CatalogStatusNote from '../components/CatalogStatusNote';
import { useProductCatalog } from '../context/ProductCatalogContext';
import { idsMatch } from '../utils/idUtils';

export default function HomePage() {
  const { products, isCatalogLoading } = useProductCatalog();
  const isInitialCatalogLoading = isCatalogLoading && products.length === 0;
  const trendingProducts = [...products]
    .sort((a, b) => {
      const score = (product) =>
        product.rating + (product.isNew ? 0.25 : 0) + (product.isSale ? 0.2 : 0);
      return score(b) - score(a);
    })
    .filter((product, index, array) => array.findIndex((item) => idsMatch(item.id, product.id)) === index)
    .filter((product) => product.rating >= 4.6 || product.isNew || product.isSale)
    .slice(0, 8);

  return (
    <div className="home-page">
      <div className="container">
        <PromoBar />
        <CatalogStatusNote className="home-catalog-status" />
        <Hero />

        <TrustStrip />

        <HomeCampaign />

        <FeaturedBrands />

        <DepartmentTiles products={products} />

        <section className="section-block" id="trending-now">
          <SectionHeading
            title="Trending Now"
            description="New pieces across clothing, accessories, shoes, and everyday departments."
            action={<Link to="/search?q=blazer">Browse more</Link>}
          />
          {isInitialCatalogLoading ? (
            <div className="empty-state">
              <h3>Loading featured products.</h3>
              <p>We are getting the latest catalog ready for browsing.</p>
            </div>
          ) : (
            <div className="product-grid">
              {trendingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        <WhyShopOra />
      </div>
    </div>
  );
}
