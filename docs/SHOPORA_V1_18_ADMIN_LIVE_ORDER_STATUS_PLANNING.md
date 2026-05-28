# ShopOra v1.18 Admin Live Order Status Planning

## Scope

This checkpoint is documentation-only. It records the current admin order-status behavior, the risks of a future live write path, and the backend/security questions that should be answered before any implementation work starts. It does not change app behavior.

## Current Admin Order Status Behavior

- The admin orders surface is built around [src/pages/admin/AdminOrdersPage.jsx](C:\Users\flygr\OneDrive\Desktop\ShopOra\src\pages\admin\AdminOrdersPage.jsx).
- The admin list shows order status, payment status, attention flags, and quick-view detail panels.
- The status selector uses a fixed local UI set: `Pending`, `Processing`, `Shipped`, `Delivered`, and `Cancelled`.
- In local/demo mode, the status selector is editable and writes only to browser storage through `updateOrderStatus()`.
- In live Supabase mode, the status selector is disabled and the UI says the view is read-only.
- The quick-view modal is also read-only in live Supabase mode and only describes the next operational step.
- The admin dashboard reads live Supabase orders through the protected `get_admin_orders()` RPC, but it does not write order status back yet.

## Current Prototype And Read-Only Limitations

- There is no live admin status mutation path yet.
- There is no live fulfillment action path yet.
- There is no live refund or cancellation action path in the admin UI.
- The current live admin view is inspection-oriented only.
- The current local demo mutation path is browser-storage simulation only.
- The current order model still treats payment data, customer data, and totals as order snapshots, not mutable admin workflow state.

## Safe Status Fields

- `status` is the safest first candidate for a future live admin workflow because the UI already treats it as the operational state.
- Allowed values currently visible in the UI are `Pending`, `Processing`, `Shipped`, `Delivered`, and `Cancelled`.
- `updated_at` should be system-managed, not user-edited.
- A future notes field could be safe if it is stored separately from the canonical order snapshot and is explicitly admin-only.

## Dangerous Status Fields

- `payment_status` is high risk because it is tied to payment truth and can imply Stripe state.
- `payment_provider` is high risk because it describes how the order was paid, not a warehouse status.
- `paid_at` is high risk because it reflects payment timing and should not be hand-edited casually.
- `stripe_checkout_session_id` is high risk because it links to payment-session recovery.
- `stripe_payment_intent_id` is high risk because it links to payment reconciliation.
- `subtotal`, `shipping`, `tax`, and `total` are high risk because they are financial snapshot values.
- `customer_name`, `customer_email`, `customer_phone`, and `shipping_address` are high risk because they are customer snapshot data.
- `user_id`, `order_number`, and `order_items` are high risk because they define ownership, identity, and line-item provenance.

## Future Live Update Requirements

- Define the exact live write surface before changing the UI.
- Decide whether live updates will allow only status transitions or also notes, fulfillment markers, cancellations, or refunds.
- Decide whether updates apply to a single field or a structured workflow payload.
- Decide whether transitions are constrained by order source, payment state, or current status.
- Decide whether live changes should be reversible and how rollback should work.
- Decide whether every live write must append an audit event.
- Decide whether the admin UI should expose only permitted transitions instead of a free-form selector.

## RLS / RPC / Security Questions

- Should live updates use a new admin-only RPC instead of direct table updates from the client?
- Should the write path validate `auth.uid()` and `public.profiles.role = 'admin'` in the database, the same way `get_admin_orders()` does?
- Should the write path reject non-admin users even if the frontend is modified?
- Should the write path validate allowed transitions such as `Pending -> Processing` and reject invalid jumps?
- Should the write path prevent edits to payment or financial snapshot fields entirely?
- Should the write path update `updated_at` automatically through the database trigger instead of client input?
- Should the write path preserve historical status values in a separate audit table or event log?
- Should the write path emit a row-level audit record with actor id, previous status, next status, timestamp, and reason?

## Recommended Implementation Phases

1. Freeze the write model and list the exact fields that may change live.
2. Add a backend/admin mutation layer, likely as a security-definer RPC.
3. Tighten RLS or permissions so only the intended admin path can write.
4. Add audit history or a status-event table before exposing the UI.
5. Add frontend controls for only the permitted transitions.
6. QA the full flow in local and non-production environments before any release batch.

## Manual QA Checklist For Future Live Status Updates

- Confirm a signed-in admin can load live orders and see the current status.
- Confirm a non-admin cannot write status changes even if the UI is manipulated.
- Confirm only the allowed status transitions are accepted.
- Confirm disallowed transitions are rejected cleanly.
- Confirm the order reloads with the updated status after a successful write.
- Confirm the `updated_at` timestamp changes when expected.
- Confirm audit history or logs capture the actor and before/after status.
- Confirm payment data, totals, customer data, and order items stay unchanged.
- Confirm rollback restores the prior status cleanly if the write path fails.
- Confirm local/demo admin simulation still works exactly as before.
- Confirm mobile and desktop admin layouts still read clearly after the live control is introduced.

## Netlify Credit Strategy Reminder

- Do not merge every small admin step.
- Batch release intentionally.
- Spend deploy credits only after the write model, QA, and rollback story are ready.

## No-Touch Areas Preserved

- Checkout submission.
- Order creation.
- Cart business logic.
- Stripe functions.
- Netlify functions and environment settings.
- Supabase RLS in this checkpoint.
- Auth behavior.
- Env files and secrets.
- Package and dependency files.
- Live order mutation behavior.
- Live payment behavior.
- Production SQL.

## Confirmation

This checkpoint does not change app behavior. It only records the current admin status model and the future planning questions for a safe live write path.
