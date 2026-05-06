const items = [
  {
    title: 'Curated Departments',
    text: 'Shop women, men, shoes, accessories, and sale edits from one clean storefront.',
  },
  {
    title: 'Order Tracking',
    text: 'Keep tabs on orders and receipts from your account after purchase.',
  },
  {
    title: 'Secure Checkout',
    text: 'Checkout is powered by Stripe for a familiar, trusted payment handoff.',
  },
];

export default function TrustStrip() {
  return (
    <section className="trust-strip">
      {items.map((item) => (
        <div key={item.title} className="trust-item">
          <div className="trust-icon" aria-hidden="true">
            <span />
          </div>
          <div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
