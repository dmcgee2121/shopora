export default function AboutPage() {
  return (
    <section className="container content-page">
      <div className="content-split">
        <div>
          <p className="eyebrow">About ShopOra</p>
          <h1>A modern store foundation for polished everyday style.</h1>
          <p>
            ShopOra is built to feel like a refined department store with a lighter, warmer
            shopping experience. The initial foundation focuses on clean merchandising, easy
            browsing, and reusable components that can grow into a full commerce app.
          </p>
        </div>
        <div className="info-card">
          <h2>What is included</h2>
          <ul>
            <li>Responsive storefront navigation</li>
            <li>Local product catalog and filtering</li>
            <li>Cart persistence with localStorage</li>
            <li>Frontend-only checkout flow</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
