const cards = [
  {
    title: 'Curated Merchandising',
    text: 'Well-edited collections keep the store easy to scan and feel premium without feeling crowded.',
  },
  {
    title: 'Simple Discovery',
    text: 'Category links, search, and pricing cues make it easy to move from browse to cart.',
  },
  {
    title: 'Everyday Value',
    text: 'New arrivals, wardrobe staples, and markdowns stay accessible without overpowering the storefront.',
  },
  {
    title: 'Trusted Checkout',
    text: 'A calm checkout experience with secure payment handoff, order records, and easy support follow-up.',
  },
];

export default function WhyShopOra() {
  return (
    <section className="section-block">
      <div className="section-heading">
        <div>
          <h2>Why ShopOra</h2>
          <p>A storefront designed for clear merchandising, simple navigation, trusted checkout, and calm shopping.</p>
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
