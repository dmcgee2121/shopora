import { Link } from 'react-router-dom';
import SupportLinkStrip from '../components/SupportLinkStrip';
import { getSupportLinks } from '../utils/supportLinks';

export default function ShippingPage() {
  const supportLinks = getSupportLinks();

  return (
    <section className="container content-page">
      <div className="content-split">
        <div>
          <p className="eyebrow">Shipping</p>
          <h1>Shipping information that is easy to scan before checkout.</h1>
          <p>
            ShopOra shows shipping information as shopper-facing guidance so customers can review
            timing, delivery expectations, and the order details they may need if they contact
            support later.
          </p>
          <p>
            Final shipping options, costs, carriers, and delivery estimates should always be
            confirmed by the business operating the store before launch.
          </p>
        </div>
        <div className="info-card">
          <h2>At a glance</h2>
          <ul>
            <li>Orders collect shipping details during checkout.</li>
            <li>Shipping costs are shown in the order summary before payment.</li>
            <li>Order records stay available from the customer account area.</li>
            <li>Shipping guidance is prototype-safe, not a final policy.</li>
          </ul>
          <div className="support-contact-actions">
            <Link to="/contact" className="btn btn-dark btn-small">
              Contact support
            </Link>
            <Link to="/returns" className="btn btn-ghost btn-small">
              Returns policy
            </Link>
          </div>
        </div>
      </div>

      <div className="policy-grid">
        <div className="info-card">
          <h2>Processing and handoff</h2>
          <p>
            ShopOra can display order status updates such as pending, processing, shipped, or
            delivered. In this prototype, those labels are for demonstration and receipt display.
          </p>
        </div>
        <div className="info-card">
          <h2>Shipping costs</h2>
          <p>
            Any shipping amount shown at checkout is part of the demo order summary. A real store
            should replace this with its own pricing rules before accepting live orders.
          </p>
        </div>
        <div className="info-card">
          <h2>Delivery timing</h2>
          <p>
            This prototype does not promise delivery dates or carrier timelines. Delivery estimates
            should be added only when they match the store&apos;s actual fulfillment setup.
          </p>
        </div>
        <div className="info-card">
          <h2>Order tracking</h2>
          <p>
            Customers can review order details and receipts from their account. Carrier tracking can
            be added later if the live store connects a fulfillment provider.
          </p>
        </div>
      </div>

      <SupportLinkStrip
        title="Need help with shipping?"
        description="Review your account or order history, then contact support if you want help understanding shipping, returns, privacy, or a receipt."
        links={supportLinks}
      />
    </section>
  );
}
