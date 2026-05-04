import { normalizeId } from './idUtils';

function safeString(value) {
  return typeof value === 'string' ? value : '';
}

function safeObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function normalizeProductSnapshot(product, fallback = {}) {
  const safeProduct = safeObject(product);
  const directImages = Array.isArray(safeProduct.images) ? safeProduct.images.filter(Boolean) : [];
  const primaryImage =
    safeString(safeProduct.image) ||
    safeString(safeProduct.productImage) ||
    safeString(safeProduct.product_image) ||
    safeString(fallback.image);
  const images = directImages.length ? directImages : primaryImage ? [primaryImage] : [];

  return {
    ...safeProduct,
    id: normalizeId(safeProduct.id ?? fallback.id ?? ''),
    name: safeString(safeProduct.name) || safeString(fallback.name),
    brand: safeString(safeProduct.brand) || safeString(fallback.brand),
    image: primaryImage,
    images,
  };
}

export function getOrderItemImage(item) {
  const safeItem = safeObject(item);
  const safeProduct = safeObject(safeItem.product);
  const productImages = Array.isArray(safeProduct.images) ? safeProduct.images.filter(Boolean) : [];

  return (
    safeString(safeItem.image) ||
    safeString(safeItem.productImage) ||
    safeString(safeItem.product_image) ||
    safeString(safeProduct.image) ||
    productImages[0] ||
    ''
  );
}

export function normalizeOrderItem(item) {
  const safeItem = safeObject(item);
  const quantity = Number(safeItem.quantity ?? 1);
  const unitPrice = Number(safeItem.unitPrice ?? safeItem.unit_price ?? 0);
  const originalPrice = Number(safeItem.originalPrice ?? safeItem.unitPrice ?? safeItem.unit_price ?? unitPrice);
  const salePrice = safeItem.salePrice != null && safeItem.salePrice !== '' ? Number(safeItem.salePrice) : null;
  const lineTotal = Number(safeItem.lineTotal ?? safeItem.line_total ?? unitPrice * quantity);
  const productId = normalizeId(safeItem.productId ?? safeItem.product_id ?? safeItem.id ?? '');
  const image = getOrderItemImage(safeItem);
  const name = safeString(safeItem.name) || safeString(safeItem.product_name);
  const brand = safeString(safeItem.brand) || safeString(safeItem.product_brand);
  const sku = safeString(safeItem.sku);
  const size = safeString(safeItem.size) || safeString(safeItem.selectedSize) || safeString(safeItem.selected_size);
  const color = safeString(safeItem.color) || safeString(safeItem.selectedColor) || safeString(safeItem.selected_color);
  const product = normalizeProductSnapshot(safeItem.product, { id: productId, name, brand, image });

  return {
    key: normalizeId(
      safeItem.key ??
        `${productId ?? safeItem.id ?? name}-${size || 'One Size'}-${color || 'Default'}`,
    ),
    id: normalizeId(safeItem.id),
    orderId: normalizeId(safeItem.orderId ?? safeItem.order_id),
    productId,
    name,
    brand,
    image,
    productImage: image,
    product_image: image,
    product,
    sku,
    size,
    color,
    quantity,
    unitPrice,
    originalPrice,
    salePrice,
    lineTotal,
  };
}

export function normalizeOrderItems(items = []) {
  return Array.isArray(items)
    ? items.map(normalizeOrderItem).filter((item) => item.name || item.image || item.productId || item.product?.id)
    : [];
}
