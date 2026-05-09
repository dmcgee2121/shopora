import { idsMatch, normalizeId } from './idUtils';

const RECENTLY_VIEWED_KEY = 'shopora-recently-viewed-v1';
const DEFAULT_LIMIT = 8;

function canUseLocalStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function parseStoredIds(rawValue) {
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed.map(normalizeId).filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function readRecentlyViewedIds(limit = DEFAULT_LIMIT) {
  if (!canUseLocalStorage()) return [];

  try {
    const raw = window.localStorage.getItem(RECENTLY_VIEWED_KEY);
    return parseStoredIds(raw).slice(0, limit);
  } catch {
    return [];
  }
}

export function writeRecentlyViewedIds(ids = [], limit = DEFAULT_LIMIT) {
  if (!canUseLocalStorage()) return [];

  const nextIds = [...new Set(ids.map(normalizeId).filter(Boolean))].slice(0, limit);

  try {
    window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(nextIds));
  } catch {
    // Ignore storage failures in local-only browsing.
  }

  return nextIds;
}

export function addRecentlyViewedId(id, limit = DEFAULT_LIMIT) {
  const productId = normalizeId(id);
  if (!productId) return readRecentlyViewedIds(limit);

  const current = readRecentlyViewedIds(limit).filter((itemId) => !idsMatch(itemId, productId));
  current.unshift(productId);
  return writeRecentlyViewedIds(current, limit);
}

export function filterRecentlyViewedProducts(products = [], ids = []) {
  const safeProducts = Array.isArray(products) ? products : [];
  const safeIds = Array.isArray(ids) ? ids.map(normalizeId).filter(Boolean) : [];

  return safeIds
    .map((itemId) => safeProducts.find((product) => idsMatch(product?.id, itemId)))
    .filter(Boolean);
}
