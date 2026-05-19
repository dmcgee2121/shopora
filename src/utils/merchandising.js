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

  if (product?.featured) {
    badges.push({ label: 'Style pick', tone: 'badge-featured' });
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

export function getProductReviewDisplay(product) {
  const rating = toNumber(product?.rating);
  const reviewCount = Math.max(0, Math.floor(toNumber(product?.reviewCount)));
  const isReviewDataAvailable = reviewCount > 0;
  const category = toTitleCase(product?.category);
  const department = toTitleCase(product?.department);
  const fit = typeof product?.fit === 'string' ? product.fit.trim().toLowerCase() : '';

  let summary;
  let note;
  const notes = [];

  if (!isReviewDataAvailable) {
    summary = 'No shopper ratings yet.';
    note = 'This storefront preview shows display-only review metadata. A real review submission flow is not included.';
    notes.push('Customer notes are not collected in this demo.');
    notes.push('Use the product details and support sections to review the item before buying.');
    notes.push('Ratings will appear here if future product data includes them.');
  } else if (rating >= 4.8 && reviewCount >= 100) {
    summary = 'A highly rated favorite with a steady stream of shopper feedback.';
    note = 'Display-only review metadata keeps this section realistic without adding review submission logic.';
    notes.push(`Popular for ${fit || 'repeat wear'} and easy styling.`);
    notes.push(`A strong fit for ${department || 'the store'} shoppers comparing similar pieces.`);
    notes.push('No review form is available in this prototype.');
  } else if (rating >= 4.6 && reviewCount >= 50) {
    summary = 'Well reviewed and easy to trust at a glance.';
    note = 'Customer notes are preview content only and do not represent a live review system.';
    notes.push(`Often chosen for ${fit || 'balanced everyday wear'}.`);
    notes.push(`Pairs naturally with ${category || 'this category'} edits and wardrobe basics.`);
    notes.push('Review data is display-only in this storefront demo.');
  } else {
    summary = 'A smaller set of shopper ratings, shown as a simple storefront preview.';
    note = 'This section stays demo-safe and does not imply an active review submission workflow.';
    notes.push(`Useful if you want a ${fit || 'straightforward'} option in the ${category || 'current'} edit.`);
    notes.push(`Relevant for ${department || 'the department'} shoppers comparing similar styles.`);
    notes.push('Ratings here are display metadata only.');
  }

  return {
    rating,
    reviewCount,
    summary,
    note,
    notes,
    hasReviews: isReviewDataAvailable,
  };
}
