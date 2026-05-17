# ShopOra v1.12 Order History Readonly Supabase Helper

## Scope

This checkpoint adds the first narrow read-only Supabase customer order history helper and wires it into the existing customer order-history loader. It does not change checkout submission, order creation, cart behavior, Stripe, Netlify, auth, or admin order behavior.

## What Was Added

- `src/services/supabaseOrdersService.js` now exports `getSupabaseCustomerOrderHistory()`.
- The helper is intentionally thin and read-only.
- It delegates to the existing owned-order read path and does not introduce a new schema contract.
- `src/context/OrdersContext.jsx` now uses the customer helper for Supabase-authenticated customer order loads.

## What The Helper Does

- Reads the current Supabase session.
- Loads the authenticated customer'"'"'s orders from the existing `public.orders` and `public.order_items` read paths.
- Returns the same normalized order shape that the current customer order pages already expect.
- Does not create, update, cancel, refund, or otherwise mutate order records.

## Wiring Status

- Wired into the customer order-history loader in `OrdersContext`.
- Not wired into checkout submission.
- Not wired into order creation.
- Not wired into admin order loading.
- Not wired into any order status mutation path.
- The customer order-history UI continues to use the existing source split:
  - Supabase-authenticated customers load persisted orders from Supabase.
  - Local/demo users continue to use browser-local orders.

## What Remains Local/Demo Fallback

- Browser-local demo orders in `OrdersContext`.
- Local/demo order status simulation in the context.
- Demo order confirmation behavior.
- Demo admin order behavior.

## What Was Intentionally Not Implemented

- No checkout submission changes.
- No order creation changes.
- No cart business logic changes.
- No Stripe function changes.
- No Netlify function or environment changes.
- No env file or secret changes.
- No package or dependency changes.
- No Supabase migrations.
- No Supabase RLS changes.
- No auth login/register/session behavior changes.
- No admin order behavior changes.
- No order mutation behavior.
- No shipping, status, refund, or fulfillment updates.

## RLS And RPC Assumptions

This helper relies on the same existing assumptions already present in the repo:

- `public.orders` and `public.order_items` exist.
- `orders.user_id` matches the authenticated session user id.
- `order_items` rows are attached to the owning order.
- Live RLS still allows the owning authenticated customer to read their own rows.
- The live project schema still matches `supabase/schema.sql`.

## Manual QA Checklist

- Sign in with a Supabase-backed customer account.
- Open `/account/orders` and confirm the persisted order list loads.
- Open an order receipt and confirm the detail page resolves the same record.
- Refresh the browser and confirm the same customer order history still hydrates.
- Sign out and confirm the app returns to local/demo order behavior.
- Open the customer order pages in demo/local mode and confirm browser-local history still works.
- Confirm admin order pages still behave the same as before.
- Confirm checkout still creates orders exactly as before.

## Rollback Notes

- Revert the changes in `src/services/supabaseOrdersService.js` and `src/context/OrdersContext.jsx` if this checkpoint needs to be undone.
- The rollback path does not require any database rollback because no SQL, migrations, or RLS changes were applied.

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
- Admin order behavior.

## Confirmation

This implementation did not change:

- order history behavior beyond the read-only helper boundary
- checkout submission
- order creation
- cart business logic
- Stripe
- Netlify functions or env
- Supabase RLS
- env files or secrets
- package/dependency files
- auth behavior
- admin order behavior

