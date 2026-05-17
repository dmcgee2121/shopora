# ShopOra v1.11 Order History Implementation Readiness Review

## Scope

This checkpoint reviews whether the existing order-history architecture is ready for a future read-only Supabase customer history implementation path. It does not change order history behavior, checkout behavior, or order creation behavior.

## Current Order-History Architecture

- `OrdersContext` is the source of truth for customer and admin order state.
- Local/demo orders are stored in browser local storage and loaded through `OrdersContext`.
- Supabase-authenticated customers load orders from the existing `public.orders` and `public.order_items` helper paths.
- `OrdersPage` renders the current account's order history and switches copy based on the active auth source.
- `OrderDetailPage` resolves a single order from the order store and only shows it when the current account owns the order.
- `OrderConfirmationPage` first checks the current order store, then falls back to order id or Stripe checkout session id lookups when the auth source is Supabase.
- `AccountPage` shows a small recent-order preview that is derived from the same order source used by the full history page.
- Admin order views use a separate read path that can load live Supabase orders through `get_admin_orders()` or local/demo orders through browser storage.

## What The Current Code Already Does

- Signed-in Supabase customers already have a read path for order history through `getSupabaseOrders()`.
- The read path also hydrates order items for each order so the receipt/detail pages can display item snapshots.
- The checkout flow already writes customer orders through the existing `create_customer_order()` RPC when the auth source is Supabase.
- Local/demo users continue to use browser-local demo orders.
- The demo admin flow remains local/demo and does not depend on live customer order writes.

## What A Safe Read-Only Future Implementation Would Require

- Confirm the live `public.orders` and `public.order_items` tables still match `supabase/schema.sql`.
- Confirm the customer read policies still only allow the owning authenticated user to read their order rows and order item rows.
- Confirm the `create_customer_order()` RPC continues to snapshot the fields that order detail and confirmation pages need.
- Confirm `get_admin_orders()` continues to work for admin reads without changing customer write paths.
- Confirm the `stripe_checkout_session_id` and `stripe_payment_intent_id` columns remain reliable recovery keys for post-checkout order confirmation.
- Confirm session restore still hydrates the correct order source before the customer pages render.

## What Must Remain Untouched

- Checkout submission.
- Order creation.
- Cart business logic.
- Stripe functions.
- Netlify functions and environment settings.
- Env files and secrets.
- Package and dependency files.
- Auth login, register, session, and logout behavior.
- Supabase RLS.
- Demo/local browser storage behavior.
- Admin prototype order state simulation.

## Risks Identified

- Customer ownership must remain strict so one account cannot read another account's order history or receipt.
- `order_items` joins depend on the order id relationship remaining intact across the order and receipt pages.
- Checkout-created orders depend on the order snapshot remaining stable after redirect, refresh, and session restore.
- The confirmation page currently uses both order id and Stripe checkout session id recovery; that fallback must remain consistent.
- Local/demo order state is intentionally different from Supabase order history, so the UI must not blend the two sources in a way that confuses customers.
- Admin order visibility depends on both the protected RPC and the admin profile role, not just the presence of rows in `orders`.
- If live RLS or grants drift, customer order history can fail while checkout continues to create or recover demo/local orders.

## RLS And RPC Verification Questions

- Does the live `orders` table still enforce ownership with `auth.uid()`?
- Does the live `order_items` table still only allow item rows attached to the owning order?
- Does `create_customer_order()` still reject cross-account writes and continue to snapshot all fields the detail pages need?
- Does `get_admin_orders()` still require the admin profile role and return the expected shape?
- Are the Stripe checkout session id and payment intent id fields still present, unique where expected, and populated for the live path?
- Do customer order reads still return the same shape that `OrdersPage`, `OrderDetailPage`, `OrderConfirmationPage`, and `AccountPage` expect?

## Proposed v1.12 Decision

Recommend that v1.12 wait for live RLS and RPC verification before any behavior change.

Reasoning:

- The existing customer read path already exists, so there is no missing helper to build first.
- The remaining risk is verification, not feature shape.
- A read-only customer order history helper would duplicate the current read path unless the future work explicitly needs a narrower customer-only adapter.
- The safest next step is to verify live schema, RLS, and RPC behavior in a non-production Supabase project, then decide whether any code change is still needed.

If verification passes and a code change is still desired, the smallest future implementation boundary would be:

- keep `OrdersContext` as the orchestrator
- keep local/demo fallback intact
- keep order confirmation recovery logic unchanged
- keep order detail ownership checks unchanged
- only add a narrowly scoped read-only customer order-history helper if the current service layer needs a clearer boundary

## Manual QA Checklist For Future Work

- Sign in with a Supabase-backed customer account.
- Confirm the full orders page shows the current account's live order history.
- Open an order receipt from the orders page and confirm the detail page resolves the same record.
- Reload the browser and confirm the order history still hydrates correctly.
- Open the order confirmation page after checkout and confirm it resolves by order id and, when needed, Stripe checkout session id.
- Sign out and confirm local/demo orders still appear only for local/demo mode.
- Sign in as the demo admin and confirm the admin orders surface still uses the existing prototype read path.
- Confirm that no checkout, cart, Stripe, auth, or order-creation behavior changed while order history was reviewed.

## Rollback Notes

- No runtime changes were made in this checkpoint, so there is nothing to roll back beyond the documentation files.
- If a future order-history change needs rollback, start with `src/context/OrdersContext.jsx` and `src/services/supabaseOrdersService.js`.

## No-Touch Areas Preserved

- Checkout submission.
- Order creation.
- Cart business logic.
- Stripe functions.
- Netlify functions and environment settings.
- Supabase RLS.
- Env files and secrets.
- Package and dependency files.
- Auth login, register, session, and logout behavior.
- Saved-items persistence.
- Profile persistence.

## Confirmation

This checkpoint does not change:

- order history behavior
- checkout
- order creation
- cart business logic
- Stripe
- Netlify functions or env
- Supabase RLS
- env files or secrets
- package/dependency files
- auth login/register/session behavior
- saved-items persistence

