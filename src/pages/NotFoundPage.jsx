import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="container content-page">
      <div className="empty-state">
        <h1>Page not found</h1>
        <p>The route you opened does not exist in the ShopOra foundation.</p>
        <Link to="/" className="btn btn-dark">
          Go home
        </Link>
      </div>
    </section>
  );
}
