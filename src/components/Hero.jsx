import { Link } from 'react-router-dom';
import ShopOraImage from './ShopOraImage';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="hero-tagline">Curated department-store shopping.</p>
        <h1>New arrivals, everyday staples, polished finds.</h1>
        <p className="hero-text">
          Shop clothing, shoes, and accessories across a calm storefront built for quick discovery,
          clear details, and easy comparison.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-dark" to="/women">
            Shop women
          </Link>
          <Link className="btn btn-light" to="/men">
            Shop men
          </Link>
        </div>
        <div className="hero-proof-row" aria-label="Store highlights">
          <span className="query-chip">New arrivals each week</span>
          <span className="query-chip">Sale picks worth scanning</span>
          <span className="query-chip">Easy returns</span>
        </div>
      </div>

      <div className="hero-visual" aria-hidden="true">
        <div className="hero-panel hero-panel-main">
          <ShopOraImage
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&h=1500&q=80"
            alt=""
            fallbackText="ShopOra"
            className="hero-image"
            loading="eager"
          />
        </div>
        <div className="hero-panel hero-panel-secondary">
          <p className="hero-panel-kicker">Featured edit</p>
          <div className="hero-mini-card">
            <span>New Arrivals</span>
            <strong>Linen Blend Blazer</strong>
          </div>
          <div className="hero-mini-card alt">
            <span>Sale Pick</span>
            <strong>Court Sneaker</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
