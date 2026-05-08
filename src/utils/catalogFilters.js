import {
  scoreNewArrivalProduct,
  scoreTrendingProduct,
} from './merchandising';

function toNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export function getCatalogPrice(product) {
  return toNumber(product?.salePrice ?? product?.price);
}

export function getCatalogStockState(product) {
  const stockCount = toNumber(product?.stockCount);

  if (stockCount <= 0) return 'outOfStock';
  if (stockCount <= 7) return 'lowStock';
  return 'inStock';
}

export function matchesCatalogStatus(product, status) {
  switch (status) {
    case 'sale':
      return Boolean(product?.isSale);
    case 'new':
      return Boolean(product?.isNew);
    case 'inStock':
      return getCatalogStockState(product) === 'inStock';
    case 'lowStock':
      return getCatalogStockState(product) === 'lowStock';
    case 'outOfStock':
      return getCatalogStockState(product) === 'outOfStock';
    default:
      return true;
  }
}

export function sortCatalogProducts(list, sort) {
  const items = [...list];

  switch (sort) {
    case 'priceAsc':
      return items.sort((a, b) => getCatalogPrice(a) - getCatalogPrice(b));
    case 'priceDesc':
      return items.sort((a, b) => getCatalogPrice(b) - getCatalogPrice(a));
    case 'newest':
      return items.sort(
        (a, b) => Number(b.isNew) - Number(a.isNew) || scoreNewArrivalProduct(b) - scoreNewArrivalProduct(a),
      );
    case 'rating':
      return items.sort((a, b) => toNumber(b.rating) - toNumber(a.rating) || toNumber(b.reviewCount) - toNumber(a.reviewCount));
    case 'reviews':
      return items.sort(
        (a, b) => toNumber(b.reviewCount) - toNumber(a.reviewCount) || toNumber(b.rating) - toNumber(a.rating),
      );
    default:
      return items.sort(
        (a, b) =>
          scoreTrendingProduct(b) - scoreTrendingProduct(a) ||
          toNumber(b.reviewCount) - toNumber(a.reviewCount) ||
          toNumber(b.rating) - toNumber(a.rating),
      );
  }
}

export function getCatalogStatusLabel(status) {
  switch (status) {
    case 'sale':
      return 'Sale';
    case 'new':
      return 'New';
    case 'inStock':
      return 'In stock';
    case 'lowStock':
      return 'Low stock';
    case 'outOfStock':
      return 'Out of stock';
    default:
      return 'All';
  }
}

export function getCatalogSortLabel(sort) {
  switch (sort) {
    case 'priceAsc':
      return 'Price: Low to High';
    case 'priceDesc':
      return 'Price: High to Low';
    case 'newest':
      return 'Newest';
    case 'rating':
      return 'Top Rated';
    case 'reviews':
      return 'Most Reviewed';
    default:
      return 'Featured';
  }
}

export function getCatalogPriceLabel(price) {
  switch (price) {
    case 'under50':
      return 'Under $50';
    case '50to100':
      return '$50 to $100';
    case 'over100':
      return 'Over $100';
    default:
      return 'All prices';
  }
}

export function getCatalogSortOptions() {
  return [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest' },
    { value: 'priceAsc', label: 'Price: Low to High' },
    { value: 'priceDesc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'reviews', label: 'Most Reviewed' },
  ];
}

export function getCatalogStatusOptions() {
  return [
    { value: '', label: 'All' },
    { value: 'sale', label: 'Sale' },
    { value: 'new', label: 'New' },
    { value: 'inStock', label: 'In stock' },
    { value: 'lowStock', label: 'Low stock' },
    { value: 'outOfStock', label: 'Out of stock' },
  ];
}
