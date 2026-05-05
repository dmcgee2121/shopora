const items = [
  {
    title: 'Secure Checkout',
    text: 'Checkout is powered by Stripe for a familiar, trusted payment flow.',
  },
  {
    title: 'Order Tracking',
    text: 'Track orders and receipts from your account after purchase.',
  },
  {
    title: 'Simple Departments',
    text: 'Browse clothing, accessories, shoes, and sale items in one place.',
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
