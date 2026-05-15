import { useProductCatalog } from '../context/ProductCatalogContext';

function getCatalogLabel(catalogSource, catalogLoadState) {
  switch (catalogLoadState) {
    case 'loading':
      return 'Loading catalog';
    case 'loaded-supabase':
      return 'Live catalog loaded';
    case 'fallback-after-error':
      return 'Catalog preview shown';
    case 'empty':
      return 'No catalog products';
    case 'loaded-fallback':
    default:
      return catalogSource === 'local' ? 'Local catalog preview' : 'Catalog preview shown';
  }
}

function getTone(catalogLoadState) {
  if (catalogLoadState === 'loading') {
    return 'stock-low';
  }

  if (catalogLoadState === 'loaded-supabase') {
    return 'stock-in';
  }

  if (catalogLoadState === 'fallback-after-error') {
    return 'stock-low';
  }

  return '';
}

export default function CatalogStatusNote({ variant = 'storefront', className = '' }) {
  const { catalogSource, catalogLoadState, isCatalogLoading, catalogError, catalogMutationError, isCatalogSaving } =
    useProductCatalog();
  const showNote = variant === 'admin' || isCatalogLoading;

  if (!showNote) {
    return null;
  }

  const label = getCatalogLabel(catalogSource, catalogLoadState);
  const tone = getTone(catalogLoadState);
  const showMutationError = variant === 'admin' && catalogMutationError;
  const showCatalogError =
    variant === 'admin' && catalogError && ['fallback-after-error', 'empty'].includes(catalogLoadState);

  return (
    <div className={`catalog-status-note ${variant} ${className}`.trim()} aria-live="polite">
      <span className={`status-badge ${tone}`.trim()}>{label}</span>
      {variant === 'admin' ? (
        <p className="catalog-status-helper">
          Catalog readiness checks cover images, copy, SKU, category, department, pricing, stock, and detail
          fields.
        </p>
      ) : null}
      {variant === 'admin' && isCatalogSaving ? <p className="catalog-status-error">Updating catalog...</p> : null}
      {showMutationError ? <p className="catalog-status-error">{catalogMutationError}</p> : null}
      {showCatalogError ? <p className="catalog-status-error">{catalogError}</p> : null}
    </div>
  );
}
