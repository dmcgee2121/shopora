import { useProductCatalog } from '../context/ProductCatalogContext';

function getCatalogLabel(catalogSource) {
  switch (catalogSource) {
    case 'supabase':
      return 'Supabase catalog';
    case 'fallback':
      return 'Supabase unavailable - using local fallback';
    case 'local':
    default:
      return 'Local demo catalog';
  }
}

function getTone(catalogSource, isCatalogLoading) {
  if (isCatalogLoading) {
    return 'stock-low';
  }

  if (catalogSource === 'supabase') {
    return 'stock-in';
  }

  if (catalogSource === 'fallback') {
    return 'stock-low';
  }

  return '';
}

export default function CatalogStatusNote({ variant = 'storefront', className = '' }) {
  const { catalogSource, isCatalogLoading, catalogError, catalogMutationError, isCatalogSaving } =
    useProductCatalog();
  const showNote = variant === 'admin' || isCatalogLoading;

  if (!showNote) {
    return null;
  }

  const label =
    variant === 'admin' && isCatalogLoading
      ? 'Loading catalog'
      : isCatalogLoading
        ? 'Loading catalog'
        : getCatalogLabel(catalogSource);
  const tone = getTone(catalogSource, isCatalogLoading);
  const showMutationError = variant === 'admin' && catalogMutationError;
  const showCatalogError = variant === 'admin' && catalogError && catalogSource === 'fallback';

  return (
    <div className={`catalog-status-note ${variant} ${className}`.trim()} aria-live="polite">
      <span className={`status-badge ${tone}`.trim()}>{label}</span>
      {variant === 'admin' && isCatalogSaving ? <p className="catalog-status-error">Updating catalog...</p> : null}
      {showMutationError ? <p className="catalog-status-error">{catalogMutationError}</p> : null}
      {showCatalogError ? <p className="catalog-status-error">{catalogError}</p> : null}
    </div>
  );
}
