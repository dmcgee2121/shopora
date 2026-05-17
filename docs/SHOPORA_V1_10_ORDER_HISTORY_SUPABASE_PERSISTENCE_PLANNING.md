# ShopOra v1.10 Order History Supabase Persistence Planning

## Scope

This checkpoint audits the current order-history architecture and records the safest path for future Supabase-backed order-history persistence work. It does not change order history behavior, checkout behavior, or order creation behavior.

## Current Customer Order History Behavior

- `OrdersContext` is the central source for customer and admin order state.
- Customer orders are loaded from Supabase when the current auth source is Supabase and the signed-in user has an id.
- Local/demo orders are loaded from browser storage when the app is in local mode.
- `OrdersPage` shows the current account's order list and switches copy based on whether the session is Supabase-backed or demo/local.
- `OrderDetailPage` resolves one order by id and only shows it when the current account owns it.
- `OrderConfirmationPage` resolves an order after checkout by local order id first, then by Supabase order id or Stripe checkout session id when the auth source is Supabase.
- `AccountPage` surfaces a short recent-order preview from the current order source and links into the full order history route.
- Admin order views can read live Supabase orders through the protected admin RPC path, while local demo orders remain browser-local and editable only in the prototype flows.

## Current Local/Demo Fallback Behavior

- Demo orders are stored in browser local storage under the existing order context storage key.
- Local/demo orders keep their own status simulation and cancel/reset behavior in the context.
- Local/demo checkout continues to create browser-local demo orders.
- Local/demo users do not need Supabase order tables to see their order history.
- The seeded demo admin remains local/demo only.

## Current Supabase-Backed Behavior

- Supabase-authenticated customers use `createSupabaseOrder()` for order creation.
- Supabase-authenticated customers use `getSupabaseOrders()` for customer order history.
- `getSupabaseOrderById()` and `getSupabaseOrderByStripeCheckoutSessionId()` read owned Supabase orders for the current session.
- Admins use `getSupabaseAdminOrders()` through the protected `get_admin_orders()` RPC.
- Order history data is already stored as snapshots in `public.orders` and `public.order_items`.

## Existing Schema, RPC, And RLS Assumptions

The repo already includes `supabase/schema.sql`, which defines:

- `public.orders`
- `public.order_items`
- `payment_status`
- `payment_provider`
- `currency`
- `stripe_checkout_session_id`
- `stripe_payment_intent_id`
- `paid_at`
- customer shipping snapshot fields
- order item snapshot fields for product name, brand, image, SKU, selected size, selected color, quantity, and price

The schema also defines:

- indexes on `orders.user_id`, `orders.created_at`, `orders.payment_status`, `orders.stripe_checkout_session_id`, and `orders.stripe_payment_intent_id`
- unique indexes for non-null Stripe checkout session ids and payment intent ids
- RLS on `orders` and `order_items`
- policies that allow authenticated customers to read and insert their own orders
- policies that allow authenticated customers to read and insert order items tied to their own orders
- grants for authenticated access to `orders` and `order_items`
- the `create_customer_order(order_payload, items_payload)` RPC
- the `get_admin_orders()` RPC

The service layer assumes:

- `orders.user_id` matches `auth.uid()`
- order items are attached to the owning order
- Stripe checkout session ids can be used to recover a matching order after redirect
- the live project schema still matches the repo schema

## Logged-Out, Local/Demo, And Supabase User Behavior

- Logged-out users should continue to use the existing checkout/login flow and local/demo fallback behavior.
- Local/demo users should continue to get browser-local order history.
- Supabase-authenticated customers should continue to get order history from Supabase tables and snapshot rows.
- Admins should continue to read customer orders through the admin RPC path and not through customer-owned order rows alone.

## Risks And Gaps

- Session restore can briefly make it unclear whether the app is loading local or Supabase order history until auth hydration completes.
- Customer ownership must remain strict so one user cannot read another user's order history or receipt.
- `order_items` lookups depend on the order id relationship remaining intact.
- Stripe checkout session lookup depends on the stored `stripe_checkout_session_id` remaining unique and populated when relevant.
- Local demo orders and live Supabase orders are intentionally different persistence models, so the UI must avoid blending them in a way that confuses ownership or source.
- Admin visibility depends on the protected RPC plus the admin profile role, not just on the presence of order rows.
- If live RLS or grants drift, order history can fail to load even though checkout still creates local/demo records.
- Future customer-order replay or receipt recovery work should not rely on mutable frontend state alone.

## Recommended Future Sequence

1. Confirm the live `orders` and `order_items` tables still match `supabase/schema.sql`.
2. Confirm `create_customer_order()` still matches the checkout payload shape and order-item snapshot shape.
3. Confirm customer read policies still allow only the owning authenticated user to read their orders and order items.
4. Confirm the Stripe checkout session id and payment-intent fields still behave as unique recovery keys.
5. Confirm admin order visibility still works through `get_admin_orders()` and the admin profile role.
6. Confirm local/demo order history still behaves the same before any customer-history persistence expansion.
7. Only after those checks pass, consider any future order-history loading or reconciliation improvements.

## Manual QA Checklist For Future Order-History Persistence Work

- Sign in with a Supabase-backed customer account.
- Place a checkout that creates a Supabase order and confirm it appears in `/account/orders`.
- Open the receipt from `/account/orders/:orderId` and confirm the order detail page resolves the correct record.
- Reload the browser and confirm the Supabase order history still hydrates.
- Open the order confirmation page with the order id and `session_id` and confirm it resolves.
- Sign out and confirm demo/local order history still works as before.
- Use a local/demo account and confirm browser-local demo orders still appear in order history.
- Sign in as an admin and confirm live order visibility still routes through the protected admin RPC path.
- Confirm order history changes do not alter checkout submission, order creation, cart behavior, Stripe, or session behavior.

## Rollback Notes

- The order-history source-of-truth code is centralized in `src/context/OrdersContext.jsx` and `src/services/supabaseOrdersService.js`.
- If future order-history persistence work needs to be rolled back, revert changes in those two areas first.
- Keep the browser-local demo fallback intact so the app remains usable while live order-history behavior is investigated.

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

