const items = [
  {
    title: 'Fresh Arrivals Weekly',
    text: 'The edit refreshes often with new statements, seasonal pieces, and easy staples.',
  },
  {
    title: 'Shipping Clarity',
    text: 'Delivery expectations are surfaced before checkout so shoppers know what to expect.',
  },
  {
    title: 'Secure Checkout',
    text: 'Checkout is powered by Stripe for a familiar, trusted payment handoff.',
  },
  {
    title: 'Easy Returns',
    text: 'Order help, returns, and account receipts are easy to find after purchase.',
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
