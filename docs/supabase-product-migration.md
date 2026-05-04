# Supabase Product Migration

This document prepares the ShopOra product catalog for a future Supabase-backed implementation without replacing the current `localStorage` flow yet.

## Current Local Storage Shape

The existing product catalog lives in `src/context/ProductCatalogContext.jsx` and persists to `localStorage` under `shopora_product_catalog_v1`.

The frontend now treats product ids as opaque strings. Existing localStorage ids and future Supabase UUID ids can coexist without any numeric conversion.
Existing localStorage data may still contain older ids, but all product-id comparisons in the frontend are string-safe.

Each product currently behaves like a single app object with fields such as:

- `id`
- `brand`
- `sku`
- `name`
- `category`
- `department`
- `price`
- `salePrice`
- `image`
- `images`
- `description`
- `details`
- `material`
- `care`
- `fit`
- `shippingNote`
- `returnNote`
- `stockCount`
- `reviewCount`
- `sizes`
- `colors`
- `rating`
- `isNew`
- `isSale`

## Supabase Table Mapping

### `products`

The `products` table in `supabase/schema.sql` is the main catalog record.

Suggested field mapping:

- `name` -> `name`
- `brand` -> `brand`
- `department` -> `department`
- `category` -> `category`
- `price` -> `price`
- `salePrice` -> `sale_price`
- `description` -> `description`
- `image` -> `image`
- `sizes` -> `sizes`
- `colors` -> `colors`
- `rating` -> `rating`
- `reviewCount` -> `review_count`
- `stockCount` -> `stock_count`
- `isNew` -> `is_new`
- `isSale` -> `is_sale`
- `sku` -> `sku`
- `material` -> `material`
- `care` -> `care`
- `fit` -> `fit`
- `details` -> `details`
- `shippingNote` -> `shipping_note`
- `returnNote` -> `return_note`

### `product_images`

The current `images` array maps to `product_images` rows.

Recommended mapping:

- `product_id` -> parent product row id
- `image_url` -> each image URL in the app `images` array
- `sort_order` -> array index, starting at `0`

The first image can continue to act as the product thumbnail by mirroring it into the `products.image` field.

## What Still Needs To Happen

Before wiring the app to Supabase, the following still needs to be decided and implemented:

1. Install `@supabase/supabase-js` if it is not already present.
2. Decide how to handle the current string product ids during migration.
3. Add a read path in `ProductCatalogContext` that can fall back to `localStorage` when Supabase is unavailable.
4. Add write paths for create, update, delete, and reset.
5. Decide whether product images stay as public URLs or move to Supabase Storage later.
6. Add row-level security policies before exposing catalog writes in production.

## Recommended Migration Path

The lowest-risk sequence is:

1. Create the Supabase tables with `supabase/schema.sql`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.
3. Export or seed the current product catalog into `products` and `product_images`.
4. Keep the current `localStorage` catalog as the active runtime fallback.
5. Introduce Supabase reads behind a safe feature gate or configuration check.
6. Switch admin writes one operation at a time.
7. Remove `localStorage` persistence only after the Supabase path is stable.

## Seed Workflow

Use the seed tooling to copy the current mock catalog into Supabase for development or testing:

1. Run the schema in the Supabase SQL editor:
   - `supabase/schema.sql`
2. Generate the product seed SQL from the current mock data:
   - `npm run generate:supabase-seed`
3. Open `supabase/seed-products.sql` in the Supabase SQL editor and run it.

The generated seed file is safe to rerun because it uses `sku` as the conflict key and refreshes `product_images` for each product.

If the mock catalog changes later, rerun the generator and commit the updated `supabase/seed-products.sql`.

## Runtime Setup

To enable catalog mode at runtime, set these env vars in `.env`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

When the app loads:

- `catalogSource = local` means the app is using localStorage only.
- `catalogSource = supabase` means Supabase reads and writes are working.
- `catalogSource = fallback` means Supabase was configured, but the catalog read failed and the app fell back to localStorage.

You can confirm Supabase catalog mode in the admin UI by checking the catalog source note. The admin pages also surface mutation loading and write errors through the catalog status component.

## Current Runtime Behavior

- When Supabase env vars are missing, ShopOra stays on the localStorage catalog.
- When Supabase is configured and the catalog query succeeds, the storefront and admin use Supabase product rows plus `product_images`.
- When Supabase is configured but the catalog query fails, ShopOra falls back to the localStorage catalog and continues to work.
- The frontend does not yet use Supabase auth, orders, saved items, image uploads, or Stripe.

## Catalog Source and Mutation State

`ProductCatalogContext` now exposes:

- `catalogSource`
  - `local`: the app is using the localStorage demo catalog
  - `supabase`: the app is reading and writing the Supabase catalog successfully
  - `fallback`: Supabase was configured, but the catalog read failed and the app is using localStorage as a safe fallback
- `isCatalogLoading`: true while the initial catalog read is in progress
- `isCatalogSaving`: true while an add, edit, delete, or local reset mutation is running
- `catalogError`: read/load problems, shown mainly in admin
- `catalogMutationError`: write problems, shown mainly in admin and the product form

Mutation behavior:

- Local mode keeps the current localStorage behavior.
- Supabase mode writes directly to `products` and `product_images`.
- If a Supabase write fails, the app does not pretend it succeeded and does not silently overwrite the catalog as if the save worked.
- Reset catalog is local-demo only while Supabase mode is active.

## RLS Note

The current schema is ready for development seeding, but production use still needs Supabase Row Level Security and policies.

- For development/testing, table access must allow the anon key to read `products` and `product_images`.
- If you are testing admin writes through the frontend, the current access model must also allow the anon key to perform the required catalog writes.
- Production admin writes should eventually be protected by Supabase Auth and role-based policies.
- If writes fail in the admin UI, the app now shows a permission-oriented catalog error instead of pretending the save succeeded.

## Helper Files

- `src/lib/supabaseClient.js` exposes the configured Supabase client and configuration check.
- `src/utils/productMappers.js` converts between app objects and Supabase rows.
- `scripts/generateSupabaseSeed.mjs` regenerates `supabase/seed-products.sql` from `src/data/products.js`.
