import { idsMatch } from './idUtils';

function toNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function toTitleCase(value) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) return '';

  return text
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function isOnlineOnlyProduct(product) {
  return Boolean(
    product?.isOnlineOnly ||
      product?.onlineOnly ||
      product?.onlineExclusive ||
      product?.exclusiveOnline ||
      product?.availability === 'online',
  );
}

export function uniqueProducts(products = []) {
  return products.filter((product, index, array) => array.findIndex((item) => idsMatch(item.id, product.id)) === index);
}

export function scoreTrendingProduct(product) {
  const rating = toNumber(product?.rating);
  const reviews = toNumber(product?.reviewCount);
  const stockCount = toNumber(product?.stockCount);

  return rating * 1.2 + reviews / 110 + (product?.isNew ? 0.45 : 0) + (product?.isSale ? 0.25 : 0) + Math.min(stockCount, 20) / 120;
}

export function scoreNewArrivalProduct(product) {
  const rating = toNumber(product?.rating);
  const reviews = toNumber(product?.reviewCount);
  const stockCount = toNumber(product?.stockCount);

  return (
    (product?.isNew ? 3 : 0) +
    rating / 2 +
    reviews / 140 +
    (stockCount > 0 ? 0.2 : 0) -
    (product?.isSale ? 0.15 : 0)
  );
}

export function scoreSaleProduct(product) {
  const price = toNumber(product?.price);
  const salePrice = product?.salePrice == null ? null : toNumber(product.salePrice);
  const discount = salePrice != null && price > 0 ? Math.max(price - salePrice, 0) / price : 0;

  return discount * 2 + toNumber(product?.rating) / 5 + toNumber(product?.reviewCount) / 220;
}

export function scoreEssentialsProduct(product) {
  const price = toNumber(product?.salePrice ?? product?.price);
  const rating = toNumber(product?.rating);
  const reviews = toNumber(product?.reviewCount);
  const departmentWeight = ['women', 'men'].includes(product?.department) ? 0.4 : 0.2;

  return departmentWeight + rating / 4 + reviews / 180 - price / 500;
}

export function getProductShelfLabel(product) {
  const department = toTitleCase(product?.department);
  const category = toTitleCase(product?.category);

  if (department && category) {
    return `${department} / ${category}`;
  }

  return department || category || 'ShopOra style';
}

export function getProductMerchandisingBadges(product) {
  const badges = [];
  const stockCount = toNumber(product?.stockCount);
  const rating = toNumber(product?.rating);
  const reviews = toNumber(product?.reviewCount);

  if (product?.isNew) {
    badges.push({ label: 'New', tone: 'badge-new' });
  }

  if (product?.isSale) {
    badges.push({ label: 'Sale', tone: 'badge-sale' });
  }

  if (reviews >= 90 || rating >= 4.8) {
    badges.push({ label: 'Best seller', tone: 'badge-featured' });
  }

  if (isOnlineOnlyProduct(product)) {
    badges.push({ label: 'Online only', tone: 'badge-online' });
  }

  if (stockCount <= 0) {
    badges.push({ label: 'Out of stock', tone: 'badge-stock badge-stock-out' });
  } else if (stockCount <= 7) {
    badges.push({ label: 'Low stock', tone: 'badge-stock badge-stock-low' });
  }

  return badges.slice(0, 4);
}
