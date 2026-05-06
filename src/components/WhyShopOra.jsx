const cards = [
  {
    title: 'Curated Merchandising',
    text: 'Thoughtful editing keeps the assortment tight, readable, and aligned with a modern department-store feel.',
  },
  {
    title: 'Simple Discovery',
    text: 'Fast navigation, clear pricing, and direct paths into the departments shoppers want most.',
  },
  {
    title: 'Everyday Value',
    text: 'Fresh markdowns, practical wardrobe staples, and seasonal updates that stay accessible.',
  },
  {
    title: 'Trusted Checkout',
    text: 'A calm checkout experience with secure payment handoff and order records in your account.',
  },
];

export default function WhyShopOra() {
  return (
    <section className="section-block">
      <div className="section-heading">
        <div>
          <h2>Why ShopOra</h2>
          <p>A storefront designed for clear merchandising, simple navigation, and calm shopping.</p>
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
