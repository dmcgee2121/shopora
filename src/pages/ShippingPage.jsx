export default function ShippingPage() {
  return (
    <section className="container content-page">
      <div className="content-split">
        <div>
          <p className="eyebrow">Shipping</p>
          <h1>Shipping that feels clear, simple, and easy to understand.</h1>
          <p>
            This page outlines how shipping information is presented in the ShopOra demo storefront.
            It is written as shopper-facing guidance for a prototype and can be adapted to match a
            real store&apos;s fulfillment process.
          </p>
          <p>
            Final shipping options, costs, carriers, and delivery estimates should be confirmed by
            the business operating the store before launch.
          </p>
        </div>
        <div className="info-card">
          <h2>Shipping overview</h2>
          <ul>
            <li>Orders collect shipping details during checkout.</li>
            <li>Shipping costs are shown in the order summary before payment.</li>
            <li>Order records are available from the customer account area.</li>
            <li>Shipping is currently presented as prototype-safe guidance, not a final policy.</li>
          </ul>
        </div>
      </div>

      <div className="content-split">
        <div className="info-card">
          <h2>Order processing</h2>
          <p>
            ShopOra can display order status updates such as pending, processing, shipped, or
            delivered. In this prototype, those labels are for demonstration and receipt display.
          </p>
        </div>
        <div className="info-card">
          <h2>Shipping costs</h2>
          <p>
            Any shipping amount shown at checkout is part of the demo order summary. A real store
            should replace this with its own pricing rules before accepting live orders.
          </p>
        </div>
        <div className="info-card">
          <h2>Delivery timing</h2>
          <p>
            This prototype does not promise delivery dates or carrier timelines. Delivery estimates
            should be added only when they match the store&apos;s actual fulfillment setup.
          </p>
        </div>
        <div className="info-card">
          <h2>Order tracking</h2>
          <p>
            Customers can review order details and receipts from their account. Carrier tracking can
            be added later if the live store connects a fulfillment provider.
          </p>
        </div>
      </div>
    </section>
  );
}
