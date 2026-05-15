import { Link } from 'react-router-dom';
import SupportLinkStrip from '../components/SupportLinkStrip';
import { getSupportLinks } from '../utils/supportLinks';

export default function ReturnsPage() {
  const supportLinks = getSupportLinks();

  return (
    <section className="container content-page">
      <div className="content-split">
        <div>
          <p className="eyebrow">Returns</p>
          <h1>Return guidance that stays clear and easy to follow.</h1>
          <p>
            This page provides prototype-safe return language for a polished storefront experience.
            It is not a final operational policy and should be updated by the business before launch.
          </p>
          <p>
            A live store should define its own return window, item condition rules, refund method,
            and support process.
          </p>
        </div>
        <div className="info-card">
          <h2>At a glance</h2>
          <ul>
            <li>Return requests should be reviewed by the store team.</li>
            <li>Eligibility depends on the final store policy.</li>
            <li>Refund timing should reflect the live payment and fulfillment setup.</li>
            <li>Customers should be able to reach support easily with the order number in hand.</li>
          </ul>
          <div className="support-contact-actions">
            <Link to="/contact" className="btn btn-dark btn-small">
              Contact support
            </Link>
            <Link to="/shipping" className="btn btn-ghost btn-small">
              Shipping policy
            </Link>
          </div>
        </div>
      </div>

      <div className="policy-grid">
        <div className="info-card">
          <h2>Return eligibility</h2>
          <p>
            ShopOra does not define a fixed return window in this prototype. A real storefront
            should clearly state which items can be returned and what condition is required.
          </p>
        </div>
        <div className="info-card">
          <h2>Damaged or incorrect items</h2>
          <p>
            If an order arrives damaged or does not match what was purchased, shoppers should
            contact the store with the order number and a short description of the issue.
          </p>
        </div>
        <div className="info-card">
          <h2>Refund timing</h2>
          <p>
            Refund timing is not guaranteed by the demo storefront. A live policy should explain
            when refunds are reviewed, approved, and returned to the original payment method.
          </p>
        </div>
        <div className="info-card">
          <h2>How to request help</h2>
          <p>
            Use the Contact page for order questions, product concerns, sizing help, or return
            inquiries. Include an order number when one is available.
          </p>
        </div>
      </div>

      <SupportLinkStrip
        title="Need help with a return?"
        description="Keep your order number close, review your receipt, and head to support with the details of the item you want to discuss, including shipping or privacy questions if needed."
        links={supportLinks}
      />
    </section>
  );
}
