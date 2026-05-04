import { normalizeId } from './idUtils.js';

function toNumber(value, fallback = null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toStringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string' && item.length > 0) : [];
}

function normalizeOptionalString(value) {
  if (typeof value !== 'string') return value ?? null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export function normalizeProductFromSupabase(row, images = []) {
  if (!row) return null;

  const normalizedImages = Array.isArray(images)
    ? images
        .slice()
        .sort((left, right) => Number(left?.sort_order ?? 0) - Number(right?.sort_order ?? 0))
        .map((entry) => entry?.image_url)
        .filter(Boolean)
    : [];

  return {
    id: normalizeId(row.id),
    brand: row.brand ?? 'ShopOra',
    sku: row.sku ?? '',
    name: row.name ?? '',
    category: row.category ?? '',
    department: row.department ?? '',
    price: toNumber(row.price, 0),
    salePrice: row.sale_price == null ? null : toNumber(row.sale_price, null),
    image: row.image ?? normalizedImages[0] ?? '',
    images: normalizedImages.length ? normalizedImages : row.image ? [row.image] : [],
    description: row.description ?? '',
    details: toStringArray(row.details),
    material: row.material ?? '',
    care: row.care ?? '',
    fit: row.fit ?? '',
    shippingNote: row.shipping_note ?? '',
    returnNote: row.return_note ?? '',
    stockCount: toNumber(row.stock_count, 0),
    reviewCount: toNumber(row.review_count, 0),
    sizes: toStringArray(row.sizes),
    colors: toStringArray(row.colors),
    rating: toNumber(row.rating, 0),
    isNew: Boolean(row.is_new),
    isSale: Boolean(row.is_sale),
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

export function productToSupabasePayload(product, productId = product?.id) {
  if (!product) {
    return { product: null, images: [] };
  }

  const productRow = {
    name: product.name ?? '',
    brand: normalizeOptionalString(product.brand),
    department: normalizeOptionalString(product.department),
    category: normalizeOptionalString(product.category),
    price: toNumber(product.price, 0),
    sale_price: product.salePrice == null ? null : toNumber(product.salePrice, null),
    description: normalizeOptionalString(product.description),
    image: normalizeOptionalString(product.image),
    sizes: toStringArray(product.sizes),
    colors: toStringArray(product.colors),
    rating: toNumber(product.rating, 0),
    review_count: toNumber(product.reviewCount, 0),
    stock_count: toNumber(product.stockCount, 0),
    is_new: Boolean(product.isNew),
    is_sale: Boolean(product.isSale),
    sku: normalizeOptionalString(product.sku),
    material: normalizeOptionalString(product.material),
    care: normalizeOptionalString(product.care),
    fit: normalizeOptionalString(product.fit),
    details: toStringArray(product.details),
    shipping_note: normalizeOptionalString(product.shippingNote),
    return_note: normalizeOptionalString(product.returnNote),
  };

  const images = Array.isArray(product.images)
    ? product.images.filter(Boolean).map((imageUrl, index) => ({
        product_id: normalizeId(productId),
        image_url: imageUrl,
        sort_order: index,
      }))
    : [];

  return {
    product: productRow,
    images,
  };
}
