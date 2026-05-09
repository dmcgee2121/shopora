import { Link } from 'react-router-dom';
import { getProductImage, products as fallbackProducts } from '../data/products';
import ShopOraImage from './ShopOraImage';

export default function HomeCampaign({ products = [] }) {
  const featuredProducts = products.length ? products : fallbackProducts;
  const heroProduct = featuredProducts.find((product) => product.isNew) ?? featuredProducts[0];
  const supportProducts = featuredProducts
    .filter((product) => product.id !== heroProduct?.id)
    .slice(0, 2);

  return (
    <section className="home-campaign">
      <div className="campaign-copy">
        <p className="campaign-kicker">Curated edit</p>
        <h2>Fresh arrivals with a calm, curated point of view.</h2>
        <p>
          New pieces, polished essentials, and easy layers selected to keep the store current
          without making shopping feel crowded. ShopOra is built to feel editorial, trustworthy,
          and easy to shop from the first scroll.
        </p>
        <div className="campaign-actions">
          <Link className="btn btn-dark" to="/women">
            Shop New Arrivals
          </Link>
          <Link className="btn btn-outline" to="/sale">
            Explore Sale Picks
          </Link>
        </div>
        <div className="campaign-tags" aria-label="Merchandising highlights">
          <span className="query-chip">New styles</span>
          <span className="query-chip">Best sellers</span>
          <span className="query-chip">Limited markdowns</span>
        </div>
      </div>

      <div className="campaign-visual" aria-hidden="true">
        <div className="campaign-image main">
          <ShopOraImage src={getProductImage(heroProduct)} alt="" className="campaign-photo" />
        </div>
        <div className="campaign-stack">
          <div className="campaign-image">
            <ShopOraImage src={getProductImage(supportProducts[0])} alt="" className="campaign-photo" />
          </div>
          <div className="campaign-image">
            <ShopOraImage src={getProductImage(supportProducts[1])} alt="" className="campaign-photo" />
          </div>
        </div>
      </div>
    </section>
  );
}
