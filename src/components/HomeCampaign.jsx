import { Link } from 'react-router-dom';
import { getProductImage, products } from '../data/products';
import ShopOraImage from './ShopOraImage';

export default function HomeCampaign() {
  const campaignImages = [products[0], products[4], products[9]].filter(Boolean);

  return (
    <section className="home-campaign">
      <div className="campaign-copy">
        <p className="campaign-kicker">Seasonal campaign</p>
        <h2>Refresh Your Everyday Wardrobe</h2>
        <p>
          Discover versatile styles, polished basics, and comfortable fits designed to work across
          the week and into the weekend.
        </p>
        <div className="campaign-actions">
          <a className="btn btn-dark" href="#trending-now">
            Shop New Arrivals
          </a>
          <Link className="btn btn-outline" to="/sale">
            Explore Sale
          </Link>
        </div>
      </div>

      <div className="campaign-visual" aria-hidden="true">
        <div className="campaign-image main">
          <ShopOraImage src={getProductImage(campaignImages[0])} alt="" className="campaign-photo" />
        </div>
        <div className="campaign-stack">
          <div className="campaign-image">
            <ShopOraImage src={getProductImage(campaignImages[1])} alt="" className="campaign-photo" />
          </div>
          <div className="campaign-image">
            <ShopOraImage src={getProductImage(campaignImages[2])} alt="" className="campaign-photo" />
          </div>
        </div>
      </div>
    </section>
  );
}
