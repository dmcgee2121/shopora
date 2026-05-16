import useDocumentTitle from '../hooks/useDocumentTitle';

export default function AboutPage() {
  useDocumentTitle('About ShopOra | ShopOra');
  return (
    <section className="container content-page">
      <div className="content-split">
        <div>
          <p className="eyebrow">About ShopOra</p>
          <h1>A modern storefront built to feel calm, curated, and easy to trust.</h1>
          <p>
            ShopOra is a client-ready ecommerce concept for a modern clothing and lifestyle brand.
            It is designed to feel credible, calm, and easy to shop while staying honest about its
            prototype nature.
          </p>
          <p>
            The experience focuses on clear merchandising, trustworthy support copy, and a lightweight
            customer journey that helps shoppers move from browsing to support without feeling lost.
          </p>
        </div>
        <div className="info-card">
          <h2>Built for shoppers</h2>
          <ul>
            <li>Responsive storefront navigation and category browsing</li>
            <li>Curated clothing, shoes, and accessories departments</li>
            <li>Saved carts, customer accounts, and order history</li>
            <li>Secure Stripe checkout handoff with clear support messaging</li>
            <li>Prototype-safe shipping, returns, and privacy pages</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
