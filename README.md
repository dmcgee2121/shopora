# ShopOra

## v0.3

Supabase Customer Commerce Foundation.

ShopOra is a React + Vite storefront and admin prototype with localStorage-backed mock data for cart and demo/admin flows, plus optional Supabase-backed customer auth, saved items, product catalog reads, and customer orders.

## Current Status

Frontend/admin prototype. The UI is functional, and the product catalog, customer auth, saved items, and customer orders can use Supabase when configured. Cart stays local, and the seeded demo/admin flow stays local-only. Stripe Checkout test mode is wired for Supabase customer orders through Netlify Functions.

## Tech Stack

- React
- Vite
- React Router
- localStorage-backed mock data

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Demo Admin Credentials

Use these credentials for the seeded admin account:

- Email: `admin@shopora.demo`
- Password: `Admin123!`

## Mock System Notes

- Customer auth can use Supabase Auth when configured.
- The demo admin login stays local.
- Cart persists in `localStorage`.
- Demo/admin order management stays frontend-only.
- Supabase customer orders are stored in `public.orders` and `public.order_items` when Supabase is configured.
- Supabase orders now carry payment-state fields for future Stripe checkout support.
- Saved items use Supabase rows for signed-in Supabase customers and keep a local fallback for demo accounts.
- Stripe Checkout is created by Netlify Functions; frontend code only receives the checkout URL.
- Route protection is client-side only for the prototype.
- Checkout supports Supabase customer orders and local/demo fallback; Supabase customers hand off to Stripe Checkout test mode after order creation.

## Backend Readiness

See [`docs/backend-readiness.md`](docs/backend-readiness.md) for the migration notes and recommended backend sequence.

## Supabase Setup

Planned Supabase catalog preparation lives in:

- `src/lib/supabaseClient.js`
- `supabase/schema.sql`
- `supabase/seed-products.sql`
- `docs/supabase-product-migration.md`
- `scripts/generateSupabaseSeed.mjs`

To enable Supabase-backed product catalog mode, set these env vars in `.env`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Use `SUPABASE_URL` only in server-side code, such as Netlify Functions that need the admin client.
The browser-facing app should continue to read `VITE_SUPABASE_URL` instead.

Then run the schema in Supabase with `supabase/schema.sql`.

To seed the catalog from the current mock products:

```bash
npm run generate:supabase-seed
```

Then run `supabase/seed-products.sql` in the Supabase SQL editor.

If you need to install the client package in another environment, use:

```bash
npm install @supabase/supabase-js
```

Current behavior:

- If Supabase is not configured, the app stays on the existing localStorage catalog.
- If Supabase is configured but the catalog query fails, the app falls back to localStorage and keeps running.
- `catalogSource` now reflects `local`, `supabase`, or `fallback`.
- `isCatalogSaving` and `catalogMutationError` surface admin save/delete/reset progress and failures.
- Reset catalog is local-demo only while Supabase catalog mode is active.
- The generated seed file uses `sku` as the rerun key and refreshes `product_images` for each product.
- If Supabase writes fail, the admin UI now shows a permission-oriented error instead of faking success.
- Customer auth uses Supabase Auth when configured, with local fallback still available when Supabase is missing or unavailable.
- The demo admin login remains local-only.
- Supabase profile rows are updated through `src/services/supabaseAuthService.js` and `src/context/AuthContext.jsx`.
- Supabase saved items are read and written through `src/services/supabaseSavedItemsService.js` and `src/context/AuthContext.jsx`.

For production, Supabase still needs RLS/policies before catalog writes should be considered safe.

Not wired yet:

- Inventory decrement/reservation after payment
- Admin roles and admin product writes in Supabase
- Image uploads/storage
- Deployment hardening

## Future Supabase Auth Setup

Supabase Auth preparation now lives in:

- `supabase/schema.sql`
- `docs/supabase-auth-migration.md`
- `src/utils/authMappers.js`
- `src/services/supabaseAuthService.js`

The schema includes a `profiles` table that references `auth.users(id)` and stores customer/admin profile fields separately from Supabase Auth credentials.

Current behavior:

- Customer login, registration, logout, and profile edits use Supabase Auth when the app is configured for it.
- Saved items for Supabase customers are stored in `public.saved_items`.
- Supabase customer orders are stored in `public.orders` and `public.order_items`.
- Stripe payment-state columns are present on orders, and Stripe Checkout is started from Netlify Functions after order creation.
- The demo admin login remains local and still uses the seeded `admin@shopora.demo` / `Admin123!` credentials.
- Local fallback remains available when Supabase is not configured or unavailable.
- Supabase passwords are never stored in localStorage.
- Profile, saved-item, and order RLS are scoped to authenticated users managing only their own rows; broad anonymous access is not enabled.

Stripe setup notes:

- Netlify Functions required: `create-checkout-session` and `stripe-webhook`
- Required Netlify env vars live in the server-only function configuration, not in the frontend bundle
- The frontend never receives server-only secrets
- Netlify secret scanning omits `SUPABASE_URL` because the public Supabase project URL is intentionally embedded in the client bundle through `VITE_SUPABASE_URL`
- For local Stripe testing, use a Netlify dev/preview environment with those env vars set; plain `npm run dev` will not serve the functions
- Stripe webhook events to configure: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.expired`
