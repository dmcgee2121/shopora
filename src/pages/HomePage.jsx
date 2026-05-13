import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import PromoBar from '../components/PromoBar';
import TrustStrip from '../components/TrustStrip';
import HomeCampaign from '../components/HomeCampaign';
import FeaturedBrands from '../components/FeaturedBrands';
import DepartmentTiles from '../components/DepartmentTiles';
import DepartmentNav from '../components/DepartmentNav';
import WhyShopOra from '../components/WhyShopOra';
import ProductCard from '../components/ProductCard';
import SectionHeading from '../components/SectionHeading';
import CatalogStatusNote from '../components/CatalogStatusNote';
import { useProductCatalog } from '../context/ProductCatalogContext';
import { filterRecentlyViewedProducts, readRecentlyViewedIds } from '../utils/recentlyViewed';
import { getHomepageDepartmentLinks, getRecommendedProducts } from '../utils/recommendations';
import {
  scoreEssentialsProduct,
  scoreNewArrivalProduct,
  scoreSaleProduct,
  scoreTrendingProduct,
  uniqueProducts,
} from '../utils/merchandising';

function MerchSection({ id, title, description, action, products, loading = false, emptyTitle, emptyText }) {
  return (
    <section className="section-block" id={id}>
      <SectionHeading title={title} description={description} action={action} />
      {loading ? (
        <div className="empty-state">
          <h3>Loading {title.toLowerCase()}.</h3>
          <p>We are getting the latest catalog ready for browsing.</p>
        </div>
      ) : products.length ? (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>{emptyTitle}</h3>
          <p>{emptyText}</p>
        </div>
      )}
    </section>
  );
}

function HomeDiscoverySection({ title, description, products, action, links, loading = false }) {
  return (
    <section className="section-block home-discovery">
      <SectionHeading title={title} description={description} action={action} />
      {loading ? (
        <div className="empty-state home-discovery-loading">
          <h3>Loading personalized picks.</h3>
          <p>We are preparing a few styles and shortcuts for your next stop.</p>
        </div>
      ) : (
        <>
          <div className="product-grid home-discovery-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="home-continue-strip">
            <div className="home-continue-copy">
              <p className="home-continue-kicker">Continue exploring</p>
              <h3>Keep moving through the store.</h3>
              <p>Use these department shortcuts to jump back into the edits shoppers visit most.</p>
            </div>
            <div className="recommendation-links home-continue-links" aria-label="Continue shopping by department">
              {links.map((link) => (
                <Link key={link.to} to={link.to} className="query-chip">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default function HomePage() {
  const { products, isCatalogLoading } = useProductCatalog();
  const isInitialCatalogLoading = isCatalogLoading && products.length === 0;
  const catalogProducts = useMemo(() => uniqueProducts(products), [products]);
  const homepageDepartmentLinks = useMemo(() => getHomepageDepartmentLinks(), []);
  const trendingProducts = useMemo(
    () =>
      [...catalogProducts]
        .sort((a, b) => scoreTrendingProduct(b) - scoreTrendingProduct(a))
        .slice(0, 8),
    [catalogProducts],
  );
  const salePicks = useMemo(
    () =>
      [...catalogProducts]
        .filter((product) => product.isSale)
        .sort((a, b) => scoreSaleProduct(b) - scoreSaleProduct(a))
        .slice(0, 8),
    [catalogProducts],
  );
  const everydayEssentials = useMemo(
    () =>
      [...catalogProducts]
        .filter((product) => {
          const price = Number(product.salePrice ?? product.price ?? 0);
          return price <= 120 || ['women', 'men'].includes(product.department);
        })
        .sort((a, b) => scoreEssentialsProduct(b) - scoreEssentialsProduct(a))
        .slice(0, 8),
    [catalogProducts],
  );
  const newArrivals = useMemo(
    () =>
      [...catalogProducts]
        .filter((product) => product.isNew)
        .sort((a, b) => scoreNewArrivalProduct(b) - scoreNewArrivalProduct(a))
        .slice(0, 8),
    [catalogProducts],
  );
  const recentlyViewedProducts = useMemo(
    () => filterRecentlyViewedProducts(catalogProducts, readRecentlyViewedIds(8)).slice(0, 4),
    [catalogProducts],
  );
  const firstLookProducts = useMemo(
    () => getRecommendedProducts(catalogProducts, [], { limit: 4 }),
    [catalogProducts],
  );
  const discoveryProducts = recentlyViewedProducts.length ? recentlyViewedProducts : firstLookProducts;
  const discoveryTitle = isInitialCatalogLoading
    ? 'ShopOra picks'
    : recentlyViewedProducts.length
      ? 'Recently viewed'
      : 'Recommended for your first look';
  const discoveryDescription = isInitialCatalogLoading
    ? 'Loading a few styles for your next stop.'
    : recentlyViewedProducts.length
      ? 'Pick up where you left off.'
      : 'Start with a few ShopOra favorites.';
  const discoveryAction = (
    <span className="count-badge">{isInitialCatalogLoading ? 'Loading' : `${discoveryProducts.length} picks`}</span>
  );

  return (
    <div className="home-page">
      <div className="container">
        <PromoBar />
        <CatalogStatusNote className="home-catalog-status" />
        <Hero />

        <DepartmentNav products={catalogProducts} />

        <TrustStrip />

        <HomeCampaign products={catalogProducts} />

        <HomeDiscoverySection
          title={discoveryTitle}
          description={discoveryDescription}
          products={discoveryProducts}
          action={discoveryAction}
          links={homepageDepartmentLinks}
          loading={isInitialCatalogLoading}
        />

        <MerchSection
          id="new-arrivals"
          title="New Arrivals"
          description="Freshly added styles selected to balance wardrobe staples with sharper seasonal pieces and easy outfit builders."
          action={<Link to="/women">Browse Women's Edit</Link>}
          products={newArrivals}
          loading={isInitialCatalogLoading}
          emptyTitle="New arrivals are on the way."
          emptyText="We are building the latest edit now. Check back shortly for fresh product drops."
        />

        <MerchSection
          id="sale-picks"
          title="Sale Picks"
          description="Marked-down styles with the clearest value, strongest savings, and easiest reasons to shop before they move on."
          action={<Link to="/sale">Shop Sale</Link>}
          products={salePicks}
          loading={isInitialCatalogLoading}
          emptyTitle="Sale picks are temporarily empty."
          emptyText="There are no markdowns in the current catalog. Browse the full store for more styles."
        />

        <FeaturedBrands />

        <DepartmentTiles products={catalogProducts} />

        <MerchSection
          id="trending-now"
          title="Trending Now"
          description="Best-reviewed styles and current favorites earning the most attention across the store right now."
          products={trendingProducts}
          loading={isInitialCatalogLoading}
          emptyTitle="Trending styles are loading."
          emptyText="We are getting the latest catalog ready for browsing."
        />

        <MerchSection
          id="everyday-essentials"
          title="Everyday Essentials"
          description="Polished basics, easy layers, and wardrobe pieces built for repeat wear across the week."
          action={<Link to="/men">Browse Men's Edit</Link>}
          products={everydayEssentials}
          loading={isInitialCatalogLoading}
          emptyTitle="Everyday essentials are loading."
          emptyText="We are getting the core wardrobe edit ready for browsing."
        />

        <WhyShopOra />
      </div>
    </div>
  );
}
