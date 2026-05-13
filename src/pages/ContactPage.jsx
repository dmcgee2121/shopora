import SupportLinkStrip from '../components/SupportLinkStrip';
import { getSupportLinks } from '../utils/supportLinks';

const helpTopics = [
  'Order help and receipt questions',
  'Shipping updates and delivery timing',
  'Returns, exchanges, and damaged items',
  'Account sign-in and profile help',
  'Product fit, sizing, and styling questions',
];

export default function ContactPage() {
  const supportLinks = getSupportLinks();

  return (
    <section className="container content-page">
      <div className="content-split">
        <div>
          <p className="eyebrow">Contact</p>
          <h1>Need help with an order, shipping question, or product detail?</h1>
          <p>
            ShopOra keeps support paths simple: reach out with order questions, shipping concerns,
            return requests, account help, or product questions and keep your order number handy if
            you have one.
          </p>
          <p>
            This storefront is still a prototype, so the help details below are presentation copy
            rather than a live ticketing workflow or guaranteed response system.
          </p>
        </div>
        <div className="info-card">
          <h2>Help categories</h2>
          <ul>
            {helpTopics.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
          <p>
            Typical support details: support@shopora.example, (555) 555-0199, Monday to Friday,
            9am to 6pm.
          </p>
          <p>
            ShopOra note: this is a local storefront prototype, so support details are presentation
            copy unless the business replaces them with real contact channels.
          </p>
        </div>
      </div>

      <SupportLinkStrip
        title="Keep the support path close at hand"
        description="Use these shortcuts to review orders, check shipping or returns guidance, or get back to your account before reaching out."
        links={supportLinks}
      />
    </section>
  );
}
