# ShopOra v1.19 Admin Order Operations QA Checklist

## Scope

This checkpoint is documentation-only. It records the current admin order-management state, the prototype/read-only boundaries, and the QA checklist to use before any future admin order-management release. It does not change app behavior.

## Current Admin Order-Management Status

- The admin orders surface is built around `src/pages/admin/AdminOrdersPage.jsx`.
- Admins can review orders, filter them, open receipts, and inspect quick-view details.
- Live Supabase orders are visible in the admin UI when the current session is connected to the protected admin RPC path.
- Local/demo orders are visible when the session is using browser-local order state.
- Status updates are only enabled for local/demo orders.
- Live Supabase admin orders remain read-only in the UI.
- The admin dashboard summarizes live order operations, recent activity, and attention signals without mutating order records.

## What Is Prototype Or Read-Only

- The admin workflow preview cards are prototype-only.
- The quick-view modal panels for fulfillment readiness, contact context, notes, and next operational step are read-only.
- Order attention flags are descriptive only.
- Fulfillment readiness copy is descriptive only.
- Customer/contact context is pulled from existing order snapshots only.
- Local/demo status changes are browser-storage simulation only.
- Live admin writes, live fulfillment actions, and live cancellation or refund actions are not enabled here.

## What Should Be QA Tested Before Any Future Admin Order-Management Release

- Confirm the admin dashboard still loads and communicates the live versus local/demo source clearly.
- Confirm the admin orders list still renders, filters, and opens quick views without regressions.
- Confirm the admin order detail and prototype panels still read clearly and stay read-only in live mode.
- Confirm the order attention flags still match the expected order context.
- Confirm the fulfillment readiness copy still matches the current operational state.
- Confirm the customer/contact context still displays the expected snapshot data.
- Confirm the mobile admin layout still works on narrow screens and the cards remain readable.
- Confirm customer order history still remains read-only for Supabase-authenticated customers.
- Confirm checkout render-only behavior still looks correct and no checkout regression appears.

## QA Checklist

- Admin dashboard:
  - Confirm the admin dashboard summaries still show live order operations and recent activity accurately.
  - Confirm the live Supabase source messaging still makes the read-only boundary obvious.
- Admin orders list:
  - Confirm list rendering, search, filters, and source labels still work.
  - Confirm the status selector remains disabled for live Supabase orders.
  - Confirm quick view and receipt links still resolve the expected orders.
- Admin order detail and prototype panels:
  - Confirm the prototype detail banner still frames the view as read-only.
  - Confirm the fulfillment readiness, contact context, notes placeholder, and next-step panels still display cleanly.
  - Confirm no controls imply a live write path before backend support exists.
- Order attention flags:
  - Confirm the flags still surface customer-info, payment-pending, ready-to-process, needs-fulfillment, shipped-complete, and cancelled-refunded style conditions correctly.
  - Confirm the attention badges remain descriptive rather than actionable.
- Fulfillment readiness copy:
  - Confirm the readiness copy still matches the order state and does not promise live workflow behavior.
  - Confirm read-only live orders keep their operational guidance wording intact.
- Customer/contact context:
  - Confirm names, email, phone, and shipping snapshot lines still render from the stored order data.
  - Confirm missing contact data still shows a clear fallback state.
- Mobile admin layout:
  - Confirm the admin cards, list rows, modal panels, and buttons still fit on a small viewport.
  - Confirm the status labels and workflow copy remain scannable on mobile.
- Customer order history read-only behavior:
  - Confirm customer order history remains read-only for Supabase-authenticated customers.
  - Confirm no admin QA step accidentally changes customer-side receipt behavior.
- Checkout render-only regression:
  - Confirm checkout still renders correctly and that no unrelated release work changes submission, totals, or payment logic.
  - Confirm any future admin work does not alter checkout-visible order snapshots.

## What Should Remain Untouched Until Live Backend / RLS Work

- Live status update writes.
- Live fulfillment action writes.
- Live cancellation and refund writes.
- Any admin RPC or server-side mutation path changes.
- Supabase schema changes or RLS changes.
- Auth or session changes tied to admin write permissions.
- Payment truth fields such as payment status, payment provider, paid at, and Stripe identifiers.
- Financial snapshot fields such as subtotal, shipping, tax, and total.
- Order ownership, identity, and item provenance fields.

## Recommended Future Admin Order Implementation Phases

1. Freeze the intended live write model and the exact fields it may touch.
2. Design the backend mutation layer for admin-only updates.
3. Add or tighten RLS and permissions for the live admin path.
4. Add audit logging or status history before exposing live writes.
5. Add frontend controls for only the approved transitions.
6. QA the live flow in local and non-production environments before any release batch.

## Netlify Credit Strategy Reminder

- Do not merge every small branch.
- Batch release intentionally.
- Spend deploy credits only when the admin batch is ready and worth the release.

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
- Backend schema work.
- Live order mutation behavior.
- Production SQL.

## Confirmation

This checkpoint does not change app behavior. It only records the current admin order-operations QA checklist and the future release boundaries.
