import { Link } from 'react-router-dom';
import SupportLinkStrip from '../components/SupportLinkStrip';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { getSupportLinks } from '../utils/supportLinks';

const helpTopics = [
  {
    title: 'Orders',
    note: 'Receipt questions, status checks, delivery updates, and order-number follow-up.',
  },
  {
    title: 'Shipping',
    note: 'Timing, tracking basics, delivery expectations, and address questions.',
  },
  {
    title: 'Returns',
    note: 'Exchanges, refunds, damaged items, and what to include with a request.',
  },
  {
    title: 'Account help',
    note: 'Sign-in support, profile details, saved items, and order history access.',
  },
  {
    title: 'Product questions',
    note: 'Sizing, fit, materials, care, and styling questions before you buy.',
  },
];

export default function ContactPage() {
  const supportLinks = getSupportLinks();
  useDocumentTitle('Contact ShopOra | ShopOra');

  return (
    <section className="container content-page">
      <div className="content-split">
        <div>
          <p className="eyebrow">Contact</p>
          <h1>Need help with an order, shipping question, or product detail?</h1>
          <p>
            ShopOra keeps support paths simple. Reach out with order questions, shipping updates,
            return requests, account help, or product details and keep your order number handy if
            you have one.
          </p>
          <p>
            If you are writing about a recent order, include the order number, the email used at
            checkout, and a short description of what you need. That keeps the conversation clear
            and fast to triage.
          </p>
        </div>
        <div className="info-card">
          <h2>Reach support</h2>
          <p>
            Use the direct links below for a quick start. A live store should keep these details
            current, consistent, and easy to find.
          </p>
          <div className="support-contact-actions">
            <a className="btn btn-dark btn-small" href="mailto:support@shopora.example">
              Email support
            </a>
            <a className="btn btn-ghost btn-small" href="tel:+15555550199">
              Call support
            </a>
            <Link to="/shipping" className="btn btn-ghost btn-small">
              Shipping policy
            </Link>
            <Link to="/returns" className="btn btn-ghost btn-small">
              Returns policy
            </Link>
          </div>
          <p className="support-contact-note">
            Example support hours: Monday to Friday, 9am to 6pm. Response timing should be
            published by the live store.
          </p>
        </div>
      </div>

      <div className="support-category-grid" aria-label="Support categories">
        {helpTopics.map((topic) => (
          <article key={topic.title} className="info-card support-category-card">
            <p className="eyebrow">Help topic</p>
            <h3>{topic.title}</h3>
            <p>{topic.note}</p>
          </article>
        ))}
      </div>

      <SupportLinkStrip
        title="Keep the support path close at hand"
        description="Use these shortcuts to review orders, check shipping, returns, or privacy guidance, or get back to your account before reaching out."
        links={supportLinks}
      />
    </section>
  );
}
