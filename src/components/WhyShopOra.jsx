const cards = [
  {
    title: 'Curated Style',
    text: 'Thoughtful product editing that keeps the assortment easy to browse and on trend.',
  },
  {
    title: 'Simple Shopping',
    text: 'Fast navigation, clear pricing, and a cart flow that stays out of the way.',
  },
  {
    title: 'Everyday Value',
    text: 'Fresh markdowns, practical wardrobe staples, and reliable seasonal updates.',
  },
  {
    title: 'Secure Checkout',
    text: 'A calm checkout experience built to feel polished and trustworthy.',
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
