import { Link } from 'react-router-dom';
import { getProductImage, products as fallbackProducts } from '../data/products';
import { getHomepageDepartmentLinks } from '../utils/recommendations';
import ShopOraImage from './ShopOraImage';

export default function HomeCampaign({ products = [] }) {
  const featuredProducts = products.length ? products : fallbackProducts;
  const heroProduct = featuredProducts.find((product) => product.isNew) ?? featuredProducts[0];
  const supportProducts = featuredProducts
    .filter((product) => product.id !== heroProduct?.id)
    .slice(0, 2);
  const departmentLinks = getHomepageDepartmentLinks().slice(0, 4);

  return (
    <section className="home-campaign">
      <div className="campaign-copy">
        <p className="campaign-kicker">Seasonal edit</p>
        <h2>Fresh arrivals, trending finds, and easy staples in one calm edit.</h2>
        <p>
          ShopOra is arranged like a modern department floor: new pieces up front, dependable
          essentials close at hand, and support pages easy to find when you want shipping, returns,
          or privacy details.
        </p>
        <div className="campaign-actions">
          <Link className="btn btn-dark" to="/women">
            Shop new arrivals
          </Link>
          <Link className="btn btn-outline" to="/sale">
            Explore sale picks
          </Link>
        </div>
        <div className="campaign-cues" aria-label="Store highlights">
          <span className="query-chip">New arrivals weekly</span>
          <span className="query-chip">Secure checkout</span>
          <span className="query-chip">Easy returns</span>
        </div>
        <div className="campaign-tags" aria-label="Merchandising highlights">
          <span className="query-chip">New arrivals</span>
          <span className="query-chip">Secure checkout</span>
          <span className="query-chip">Return guidance</span>
          <span className="query-chip">Editor's picks</span>
        </div>
        <div className="campaign-discovery-links" aria-label="Browse departments">
          {departmentLinks.map((link) => (
            <Link key={link.to} to={link.to} className="query-chip">
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="campaign-visual" aria-hidden="true">
        <div className="campaign-image main">
          <ShopOraImage src={getProductImage(heroProduct)} alt="" className="campaign-photo" loading="eager" />
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
