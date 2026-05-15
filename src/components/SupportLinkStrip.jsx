import { Link } from 'react-router-dom';

export default function SupportLinkStrip({
  eyebrow = 'Need help?',
  title,
  description,
  links = [],
  className = '',
}) {
  if (!links.length) {
    return null;
  }

  return (
    <section className={`support-link-strip ${className}`.trim()}>
      <div className="support-link-strip-copy">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        {title ? <h2>{title}</h2> : null}
        {description ? <p>{description}</p> : null}
      </div>

      <nav className="support-link-strip-links" aria-label={title || eyebrow || 'Support links'}>
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="support-link-card"
            aria-label={link.note ? `${link.label}. ${link.note}` : link.label}
          >
            <strong>{link.label}</strong>
            {link.note ? <span>{link.note}</span> : null}
          </Link>
        ))}
      </nav>
    </section>
  );
}
