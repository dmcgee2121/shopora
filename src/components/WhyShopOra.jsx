const cards = [
  {
    title: 'Curated Style',
    text: 'Thoughtful product editing keeps the assortment easy to browse and aligned with a modern retail feel.',
  },
  {
    title: 'Simple Shopping',
    text: 'Fast navigation, clear pricing, and a cart flow that stays out of the way.',
  },
  {
    title: 'Everyday Value',
    text: 'Fresh markdowns, practical wardrobe staples, and seasonal updates that feel accessible.',
  },
  {
    title: 'Secure Checkout',
    text: 'A calm checkout experience with secure payment handoff and order records in your account.',
  },
];

export default function WhyShopOra() {
  return (
    <section className="section-block">
      <div className="section-heading">
        <div>
          <h2>Why ShopOra</h2>
          <p>A storefront built to feel modern, approachable, and easy to shop.</p>
        </div>
      </div>

      <div className="why-grid">
        {cards.map((card) => (
          <article key={card.title} className="why-card">
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
