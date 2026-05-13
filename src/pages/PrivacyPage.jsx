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
            <li>Shopper information is used to support browsing, checkout, accounts, and orders.</li>
            <li>Payment entry is handled through Stripe during secure checkout.</li>
            <li>Final privacy terms should be reviewed before a live launch.</li>
            <li>This prototype should not be treated as a final legal privacy policy.</li>
          </ul>
        </div>
      </div>

      <div className="content-split">
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
          <h2>Contact</h2>
          <p>
            Questions about privacy, account information, or order details can be directed through
            the Contact page.
          </p>
        </div>
      </div>
    </section>
  );
}
