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
import useDocumentTitle from '../hooks/useDocumentTitle';
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
          <p>Thanks for your patience while the catalog gets ready.</p>
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
          <h3>Loading ShopOra picks.</h3>
          <p>We are getting a few styles and department shortcuts ready.</p>
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
              <h3>Pick a department and keep browsing.</h3>
              <p>Use these shortcuts to jump into the main ShopOra sections.</p>
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

function HomeActivitySection({ cards, loading = false }) {
  return (
    <section className="section-block home-activity">
      <SectionHeading
        title="This week's edit"
        description="A quick guide to new, sale, and staple styles from the current catalog."
        action={<Link to="/search">Browse all styles</Link>}
      />
      {loading ? (
        <div className="empty-state home-activity-loading">
          <h3>Loading this week's edit.</h3>
          <p>We are getting the homepage edit ready.</p>
        </div>
      ) : (
        <div className="activity-cue-grid">
          {cards.map((card) => (
            <article key={card.title} className="activity-cue-card">
              <p className="activity-cue-label">{card.label}</p>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <div className="activity-cue-footer">
                <span className="count-badge">{card.badge}</span>
                <Link to={card.to} className="activity-cue-link">
                  {card.cta}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default function HomePage() {
  const { products, isCatalogLoading } = useProductCatalog();
  useDocumentTitle('ShopOra | Curated department-store shopping');
  const isInitialCatalogLoading = isCatalogLoading && products.length === 0;
  const catalogProducts = useMemo(() => uniqueProducts(products), [products]);
  const homepageDepartmentLinks = useMemo(() => getHomepageDepartmentLinks(), []);
  const trendingProducts = useMemo(
    () =>
      [...catalogProducts]
        .sort((a, b) => scoreTrendingProduct(b) - scoreTrendingProduct(a))
        .slice(0, 4),
    [catalogProducts],
  );
  const salePicks = useMemo(
    () =>
      [...catalogProducts]
        .filter((product) => product.isSale)
        .sort((a, b) => scoreSaleProduct(b) - scoreSaleProduct(a))
        .slice(0, 4),
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
        .slice(0, 4),
    [catalogProducts],
  );
  const newArrivals = useMemo(
    () =>
      [...catalogProducts]
        .filter((product) => product.isNew)
        .sort((a, b) => scoreNewArrivalProduct(b) - scoreNewArrivalProduct(a))
        .slice(0, 4),
    [catalogProducts],
  );
  const recentlyViewedProducts = useMemo(
    () => filterRecentlyViewedProducts(catalogProducts, readRecentlyViewedIds(8)).slice(0, 3),
    [catalogProducts],
  );
  const firstLookProducts = useMemo(
    () => getRecommendedProducts(catalogProducts, [], { limit: 3 }),
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
      ? 'Pick up where you left off with the styles you were already comparing.'
      : 'Start with a few ShopOra favorites, then keep moving through the store.';
  const discoveryAction = (
    <span className="count-badge">{isInitialCatalogLoading ? 'Loading' : `${discoveryProducts.length} picks`}</span>
  );
  const activityCards = useMemo(
    () => [
      {
        label: 'New arrivals',
        title: `${newArrivals.length} new-arrival picks`,
        description: 'Fresh pieces are grouped first so you can start with what is newest in the catalog.',
        badge: newArrivals.length ? `${newArrivals.length} new arrivals` : 'Loading',
        to: '/women',
        cta: 'See new arrivals',
      },
      {
        label: 'Featured styles',
        title: `${trendingProducts.length} styles to compare`,
        description: 'Highly rated and featured products are grouped together for quicker browsing.',
        badge: trendingProducts.length ? `${trendingProducts.length} featured` : 'Featured edit',
        to: '/search',
        cta: 'Browse featured styles',
      },
      {
        label: 'Recently highlighted',
        title: `${discoveryProducts.length} styles to revisit`,
        description: recentlyViewedProducts.length
          ? 'Pick up where you left off with styles you were already comparing.'
          : 'Start with a few curated picks from the current catalog.',
        badge: recentlyViewedProducts.length ? 'Recently viewed' : 'Curated picks',
        to: '/search',
        cta: 'Open the edit',
      },
      {
        label: 'Everyday staples',
        title: `${everydayEssentials.length} easy pieces`,
        description: 'Wardrobe staples, sale picks, and everyday layers stay close at hand.',
        badge: everydayEssentials.length ? `${everydayEssentials.length} staples` : 'Easy browse',
        to: '/sale',
        cta: 'Shop style picks',
      },
    ],
    [discoveryProducts.length, everydayEssentials.length, newArrivals.length, recentlyViewedProducts.length, trendingProducts.length],
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

        <HomeActivitySection cards={activityCards} loading={isInitialCatalogLoading} />

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
          description="Freshly added styles selected to balance wardrobe staples with seasonal pieces and easy outfit builders."
          action={<Link to="/women">Browse women's edit</Link>}
          products={newArrivals}
          loading={isInitialCatalogLoading}
          emptyTitle="New arrivals are on the way."
          emptyText="This section is being updated. Browse the full store for current styles in the meantime."
        />

        <MerchSection
          id="sale-picks"
          title="Sale Picks"
          description="Marked-down styles with clear pricing and easy ways to compare value across the store."
          action={<Link to="/sale">Shop sale</Link>}
          products={salePicks}
          loading={isInitialCatalogLoading}
          emptyTitle="No sale picks right now."
          emptyText="There are no markdowns in the current catalog. Browse the full store for more styles."
        />

        <FeaturedBrands />

        <DepartmentTiles products={catalogProducts} />

        <MerchSection
          id="trending-now"
          title="Trending Now"
          description="Highly rated styles and featured favorites from across the store."
          products={trendingProducts}
          loading={isInitialCatalogLoading}
          emptyTitle="Featured styles are loading."
          emptyText="We are getting the latest catalog ready so you can keep browsing."
        />

        <MerchSection
          id="everyday-essentials"
          title="Everyday Essentials"
          description="Curated for everyday wear: polished basics, easy layers, and wardrobe pieces built for repeat use across the week."
          action={<Link to="/men">Browse men's edit</Link>}
          products={everydayEssentials}
          loading={isInitialCatalogLoading}
          emptyTitle="Everyday essentials are loading."
          emptyText="We are getting the core wardrobe edit ready for browsing and easy outfit building."
        />

        <WhyShopOra />
      </div>
    </div>
  );
}
