import { Link } from 'react-router-dom';

export default function AdminPageHeader({
  eyebrow,
  title,
  subtitle,
  actionLabel,
  actionTo,
  actionOnClick,
  actionClassName = 'btn btn-dark',
  actions,
}) {
  return (
    <header className="admin-page-header">
      <div className="admin-page-header-copy">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>

      {actions ? (
        <div className="admin-page-header-actions">{actions}</div>
      ) : actionLabel ? (
        actionTo ? (
          <Link to={actionTo} className={actionClassName}>
            {actionLabel}
          </Link>
        ) : (
          <button type="button" className={actionClassName} onClick={actionOnClick}>
            {actionLabel}
          </button>
        )
      ) : null}
    </header>
  );
}
