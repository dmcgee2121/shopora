# ShopOra v0.99 Admin Order Management Prototype Planning

## Current Branch

- Branch: `v0.99-admin-order-management-prototype-planning`
- This pass is local-first and planning-focused.
- No push, merge, deploy, or environment/secrets change was performed.

## Scope Confirmed For This Pass

- Inspect the current admin orders page and its related helpers, context, and docs.
- Identify what order-management actions the admin UI currently implies.
- Distinguish local/demo-only behavior from live Supabase read-only behavior.
- Plan a prototype-safe admin order-management flow for future work.
- Keep the current app behavior safe and avoid real order mutation logic.
- Add only very small copy/UI planning clarification if it stays read-only and prototype-safe.

## Current Admin Order-Management Behavior

- The admin orders page lives at `src/pages/admin/AdminOrdersPage.jsx`.
- It shows summary cards, search, status filtering, attention previews, a tabular list, mobile cards, and a quick-view modal.
- It exposes status selectors on each order row, but those selectors only mutate local browser storage when the order source is local.
- It opens order receipts and customer-contact context without leaving the admin area.
- It surfaces live Supabase orders through the existing read path when the admin session is connected to Supabase.
- It surfaces browser-local demo orders when the current session is using local order state.
- It uses `getOrderOperationsSummary()` and `getOrderAttentionInfo()` to derive operational signals from the existing order data.

## Current Live Vs Demo Limitations

- Live Supabase admin orders are read-only in the frontend.
- Live order status updates are not enabled yet.
- Live fulfillment notes are not stored yet.
- Live attention flags are not stored yet.
- Local/demo order status changes are simulated in browser storage only.
- Local/demo cancellation behavior is simulated only and does not represent a real backend workflow.
- There is no dedicated admin write path, no audit trail for live mutations, and no backend schema work in this pass.

## What The Prototype-Safe Flow Should Include

- Status review: order, payment, and attention state should be easy to scan.
- Fulfillment notes: a visible place for short internal notes, even if the field is read-only for now.
- Attention flags: clear indicators for missing contact data, payment pending, or fulfillment review.
- Customer/contact context: name, email, phone, shipping snapshot, and receipt access.
- Local-only status simulation: demo orders can be adjusted in browser storage to model operations workflows.
- Future live status updates: the UI should be shaped so a later backend write path can be added without redesigning the page.

## What Should Stay Read-Only For Now

- Live Supabase order status writes.
- Live fulfillment updates.
- Live cancellation and refund actions.
- Live note persistence.
- Any direct mutation of customer order rows from the admin UI.
- Any backend or schema change needed to support live writes.
- Any change to checkout submission, order creation, cart logic, Stripe, Netlify functions/env, Supabase RLS, auth, env files/secrets, or package/dependency files.

## Risks Before Real Admin Order Updates

- Status changes without audit history would make operational debugging difficult.
- Live writes without backend ownership rules could weaken order integrity.
- Refund, cancellation, and fulfillment actions need explicit ownership and rollback rules.
- Customer contact details and shipping snapshots may require stricter data-handling review.
- Admin-only action rules should be validated before any write surface becomes live.
- A mixed local/demo and live write experience could confuse operators if labels are not explicit.

## Suggested Future Phases

1. Define the live admin order write model and the exact set of permitted actions.
2. Decide how fulfillment notes and attention flags should be stored.
3. Add a backend mutation path only after the action model is approved.
4. Revisit RLS, audit logging, and role checks for live writes.
5. Add targeted QA for status updates, note persistence, and rollback behavior.
6. Separate prototype simulation from live operations in the UI before enabling writes.

## No-Touch Areas Preserved

- checkout submission
- order creation
- cart business logic
- Stripe functions
- Netlify functions/env
- Supabase RLS
- auth behavior
- env files/secrets
- package/dependency files
- backend/schema work
- real live order mutation behavior
- refund/cancellation/fulfillment backend logic

## Outcome

- This pass documents the current admin order-management surface and sets a prototype-safe direction for v0.99.
- The only code change made in this pass is copy clarification that labels the admin orders view as prototype/read-only where appropriate.
- App behavior remains unchanged aside from the new descriptive copy.
