const items = [
  {
    title: 'Easy Returns',
    text: 'Return in store or by mail within 30 days.',
  },
  {
    title: 'Secure Checkout',
    text: 'Your information is safe with us.',
  },
  {
    title: 'New Styles Weekly',
    text: 'Fresh arrivals from your favorite brands.',
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
