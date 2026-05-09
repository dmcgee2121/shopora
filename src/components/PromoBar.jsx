const items = [
  'Free shipping on orders over $75',
  'Secure checkout with Stripe',
  'Easy 30-day returns',
];

export default function PromoBar() {
  return (
    <section className="promo-bar" aria-label="Store highlights">
      <div className="container promo-bar-inner">
        {items.map((item) => (
          <div key={item} className="promo-bar-item">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
