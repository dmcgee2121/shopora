import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <section className="container content-page">
      <div className="content-split">
        <div>
          <p className="eyebrow">Privacy</p>
          <h1>Privacy notes for a modern storefront prototype.</h1>
          <p>
            This privacy page explains the kinds of information a shopper may provide while using
            the ShopOra demo. It is general prototype language and is not a substitute for a final
            legal privacy policy.
          </p>
          <p>
            Before using ShopOra as a live store, the operating business should review and replace
            this page with a policy that reflects its real tools, vendors, and data practices.
            Support, shipping, and returns language elsewhere in the app is also prototype-safe
            copy rather than a live service promise.
          </p>
        </div>
        <div className="info-card">
          <h2>Privacy overview</h2>
          <ul>
            <li>Shopper information supports browsing, checkout, accounts, and orders.</li>
            <li>Payment entry is handled through Stripe during secure checkout.</li>
            <li>Account and order history help shoppers review receipts and shipping details.</li>
            <li>This prototype should not be treated as a final legal privacy policy.</li>
          </ul>
          <div className="support-contact-actions">
            <Link to="/contact" className="btn btn-dark btn-small">
              Contact support
            </Link>
            <Link to="/shipping" className="btn btn-ghost btn-small">
              Shipping policy
            </Link>
            <Link to="/returns" className="btn btn-ghost btn-small">
              Returns policy
            </Link>
          </div>
        </div>
      </div>

      <div className="policy-grid">
        <div className="info-card">
          <h2>Information shoppers provide</h2>
          <p>
            Shoppers may provide contact details, shipping details, account information, and order
            details while using the storefront.
          </p>
        </div>
        <div className="info-card">
          <h2>How information is used</h2>
          <p>
            Information is used to display account details, prepare checkout, create order records,
            and provide a clearer shopping experience within the prototype.
          </p>
        </div>
        <div className="info-card">
          <h2>Payments and Stripe</h2>
          <p>
            Card entry is handled by Stripe during secure checkout. ShopOra should not display or
            store raw card details in the storefront.
          </p>
        </div>
        <div className="info-card">
          <h2>Account and order information</h2>
          <p>
            Account and order views help shoppers review receipts, shipping details, and order
            history. A live store should define how long those records are retained.
          </p>
        </div>
        <div className="info-card">
          <h2>What this prototype does not do</h2>
          <p>
            It does not replace a legal policy, and it does not promise any specific retention
            period, vendor list, or compliance outcome.
          </p>
        </div>
      </div>

      <div className="privacy-contact-note">
        Questions about privacy, account information, or order details can be directed through{' '}
        <Link to="/contact">Contact</Link>.
      </div>
    </section>
  );
}
