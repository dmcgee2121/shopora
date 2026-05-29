const items = [
  {
    title: 'Fresh arrivals',
    text: 'New pieces, seasonal layers, and dependable staples are grouped for easy browsing.',
  },
  {
    title: 'Shipping guidance',
    text: 'Shipping details stay close by so you can review expectations before checkout.',
  },
  {
    title: 'Stripe checkout',
    text: 'Payment entry is handled through Stripe during the checkout handoff.',
  },
  {
    title: 'Return support',
    text: 'Return guidance, order help, and account receipts stay easy to find after purchase.',
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
