import { departments } from '../data/products';
import { normalizeId } from './idUtils';

function getProductPrice(product) {
  return Number(product?.salePrice ?? product?.price ?? 0);
}

function normalizeSeed(seed) {
  if (!seed || typeof seed !== 'object') {
    return null;
  }

  const id = normalizeId(seed.id ?? seed.productId ?? seed.key);

  return {
    id,
    department: seed.department ?? '',
    category: seed.category ?? '',
    brand: seed.brand ?? '',
    price: getProductPrice(seed),
  };
}

function scoreAgainstSeed(product, seed) {
  let score = 0;

  if (seed.department && product.department === seed.department) {
    score += 60;
  }

  if (seed.category && product.category === seed.category) {
    score += 80;
  }

  if (seed.brand && product.brand === seed.brand) {
    score += 20;
  }

  if (seed.price > 0) {
    const priceGap = Math.abs(getProductPrice(product) - seed.price);
    if (priceGap <= 15) {
      score += 10;
    } else if (priceGap <= 35) {
      score += 5;
    }
  }

  return score;
}

function scoreByPopularity(product) {
  const rating = Number(product?.rating ?? 0);
  const reviewCount = Number(product?.reviewCount ?? 0);
  const stockCount = Number(product?.stockCount ?? 0);

  return (
    rating * 5 +
    Math.min(reviewCount, 250) / 25 +
    Math.min(stockCount, 20) / 20 +
    (product?.isNew ? 8 : 0) +
    (product?.isSale ? 4 : 0)
  );
}

export function getRecommendedProducts(products = [], seeds = [], { excludeIds = [], limit = 4 } = {}) {
  const safeProducts = Array.isArray(products) ? products.filter(Boolean) : [];
  const safeSeeds = Array.isArray(seeds)
    ? seeds.map(normalizeSeed).filter((seed) => seed && (seed.department || seed.category || seed.brand || seed.price))
    : [];
  const excludedIds = new Set(
    Array.isArray(excludeIds)
      ? excludeIds.map(normalizeId).filter(Boolean)
      : [],
  );

  return safeProducts
    .filter((product) => !excludedIds.has(normalizeId(product?.id)))
    .map((product) => {
      const seedScore = safeSeeds.length
        ? safeSeeds.reduce((total, seed) => total + scoreAgainstSeed(product, seed), 0)
        : 0;

      return {
        product,
        score: seedScore + scoreByPopularity(product),
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      if ((right.product.rating ?? 0) !== (left.product.rating ?? 0)) {
        return (right.product.rating ?? 0) - (left.product.rating ?? 0);
      }
      if ((right.product.reviewCount ?? 0) !== (left.product.reviewCount ?? 0)) {
        return (right.product.reviewCount ?? 0) - (left.product.reviewCount ?? 0);
      }
      return String(left.product.name ?? '').localeCompare(String(right.product.name ?? ''));
    })
    .slice(0, limit)
    .map(({ product }) => product);
}

export function getDepartmentLinks() {
  return departments.map((department) => ({
    label: department.label,
    to: `/${department.id}`,
  }));
}
