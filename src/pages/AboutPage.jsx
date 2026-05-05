export default function AboutPage() {
  return (
    <section className="container content-page">
      <div className="content-split">
        <div>
          <p className="eyebrow">About ShopOra</p>
          <h1>A polished storefront prototype for everyday clothing and lifestyle shopping.</h1>
          <p>
            ShopOra is a client-ready storefront concept for a modern clothing and lifestyle brand.
            It is designed to feel credible, calm, and easy to shop while staying honest about its
            prototype nature.
          </p>
          <p>
            The experience focuses on clear merchandising, simple navigation, and a lightweight
            customer journey that can support a small business or a growing retail brand without
            overstating what the store can do today.
          </p>
        </div>
        <div className="info-card">
          <h2>Built for shoppers</h2>
          <ul>
            <li>Responsive storefront navigation and category browsing</li>
            <li>Curated clothing, shoes, and accessories departments</li>
            <li>Saved carts, customer accounts, and order history</li>
            <li>Secure checkout flow ready for real-world retail workflows</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
