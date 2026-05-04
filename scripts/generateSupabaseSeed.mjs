import crypto from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { products } from '../src/data/products.js';
import { productToSupabasePayload } from '../src/utils/productMappers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outputPath = path.join(rootDir, 'supabase', 'seed-products.sql');

function toSqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function toSqlLiteral(value) {
  if (value === null || value === undefined || value === '') {
    return 'NULL';
  }

  if (Array.isArray(value)) {
    if (!value.length) {
      return 'ARRAY[]::text[]';
    }

    return `ARRAY[${value.map((item) => toSqlString(item)).join(', ')}]::text[]`;
  }

  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : 'NULL';
  }

  return toSqlString(value);
}

function hashToUuid(input) {
  const bytes = crypto.createHash('sha256').update(String(input)).digest();
  const view = Uint8Array.from(bytes.slice(0, 16));
  view[6] = (view[6] & 0x0f) | 0x40;
  view[8] = (view[8] & 0x3f) | 0x80;
  const hex = Array.from(view, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function buildProductInsert(product) {
  const productId = hashToUuid(product.sku);
  const payload = productToSupabasePayload(product, productId);
  const productRow = {
    id: productId,
    ...payload.product,
  };

  const columns = [
    'id',
    'name',
    'brand',
    'department',
    'category',
    'price',
    'sale_price',
    'description',
    'image',
    'sizes',
    'colors',
    'rating',
    'review_count',
    'stock_count',
    'is_new',
    'is_sale',
    'sku',
    'material',
    'care',
    'fit',
    'details',
    'shipping_note',
    'return_note',
  ];

  const values = columns.map((column) => toSqlLiteral(productRow[column]));
  const updateColumns = columns.filter((column) => column !== 'id' && column !== 'sku');

  const imageRows = payload.images ?? [];
  const imageValues = imageRows
    .map((row) => `(${toSqlLiteral(row.sort_order)}, ${toSqlLiteral(row.image_url)})`)
    .join(',\n    ');

  const productInsert = `INSERT INTO public.products (${columns.join(', ')})\nVALUES (${values.join(', ')})\nON CONFLICT (sku) DO UPDATE SET\n  ${updateColumns.map((column) => `${column} = EXCLUDED.${column}`).join(',\n  ')};`;

  const deleteImages = `DELETE FROM public.product_images\nWHERE product_id = (SELECT id FROM public.products WHERE sku = ${toSqlLiteral(product.sku)});`;

  const imageInsert =
    imageRows.length > 0
      ? `INSERT INTO public.product_images (product_id, image_url, sort_order)\nSELECT p.id, img.image_url, img.sort_order\nFROM public.products p\nJOIN (VALUES\n    ${imageValues}\n) AS img(sort_order, image_url) ON TRUE\nWHERE p.sku = ${toSqlLiteral(product.sku)}\nORDER BY img.sort_order;`
      : '';

  return [productInsert, deleteImages, imageInsert].filter(Boolean).join('\n\n');
}

async function main() {
  const statements = products.map((product) => buildProductInsert(product));
  const sql = [
    '-- Generated from src/data/products.js',
    '-- Rerun `npm run generate:supabase-seed` when the mock catalog changes.',
    '',
    'BEGIN;',
    '',
    statements.join('\n\n'),
    '',
    'COMMIT;',
    '',
  ].join('\n');

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, sql, 'utf8');
  console.log(`Wrote ${path.relative(rootDir, outputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
