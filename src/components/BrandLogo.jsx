import { useState } from 'react';
import wordmarkLogo from '../assets/brand/shopora-wordmark-logo-optimized.png';
import bagLogo from '../assets/brand/shopora-bag-logo-optimized.png';

export default function BrandLogo({ variant = 'wordmark', className = '', alt = 'ShopOra' }) {
  const [failed, setFailed] = useState(false);
  const src = variant === 'bag' ? bagLogo : wordmarkLogo;
  const width = variant === 'bag' ? 192 : 720;
  const height = variant === 'bag' ? 192 : 540;

  return (
    <span className={`brand-logo brand-logo-${variant} ${className}`.trim()}>
      {failed ? (
        <span className="brand-logo-fallback">{alt}</span>
      ) : (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="brand-logo-image"
          onError={() => setFailed(true)}
          loading="eager"
          decoding="async"
        />
      )}
    </span>
  );
}
