import { Link } from 'react-router-dom';
import ShopOraImage from './ShopOraImage';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="hero-tagline">Curated department-store edit.</p>
        <h1>New arrivals, everyday staples, and polished finds.</h1>
        <p className="hero-text">
          Modern style, easy shopping, and a storefront built to help shoppers find what they need
          fast.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-dark" to="/women">
            Shop Women
          </Link>
          <Link className="btn btn-light" to="/men">
            Shop Men
          </Link>
        </div>
      </div>

      <div className="hero-visual" aria-hidden="true">
        <div className="hero-panel hero-panel-main">
          <ShopOraImage
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&h=1500&q=80"
            alt=""
            fallbackText="ShopOra"
            className="hero-image"
          />
        </div>
        <div className="hero-panel hero-panel-secondary">
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
