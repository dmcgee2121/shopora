import { useEffect, useState } from 'react';
import BrandLogo from './BrandLogo';

export default function ShopOraImage({
  src,
  alt,
  className = '',
  fallbackText = 'Image coming soon',
  loading = 'eager',
  decoding = 'async',
  onClick,
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed || !src) {
    return (
      <div className={`shopora-image-fallback ${className}`.trim()} aria-label={alt || fallbackText}>
        <BrandLogo variant="bag" alt="ShopOra" className="shopora-image-brandmark" />
        <span className="shopora-image-note">{fallbackText}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      onError={() => setFailed(true)}
      onClick={onClick}
    />
  );
}
