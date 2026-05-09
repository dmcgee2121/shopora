export default function ContactPage() {
  return (
    <section className="container content-page">
      <div className="content-split">
        <div>
          <p className="eyebrow">Contact</p>
          <h1>Questions about an order, product, or policy? Reach out.</h1>
          <p>
            ShopOra gives shoppers a straightforward way to ask about orders, product details,
            sizing, shipping expectations, returns, or general store questions.
          </p>
          <p>
            This contact page keeps the storefront presentable for clients today and can be adapted
            into a full support workflow later without changing the shopping experience.
          </p>
        </div>
        <div className="info-card">
          <h2>Support details</h2>
          <p>Email support@shopora.example</p>
          <p>Phone (555) 555-0199</p>
          <p>Hours Monday to Friday, 9am to 6pm</p>
          <p>Typical topics: orders, sizing, product questions, shipping help, and returns.</p>
          <p>
            ShopOra note: this is a local storefront prototype, so support details are presentation
            copy unless the business replaces them with real contact channels.
          </p>
        </div>
      </div>
    </section>
  );
}
