# ShopOra v0.94 Admin Order Management Readiness

## Current Branch

- Branch: `v0.90-next-phase-foundation`
- Current branch tip at readiness time: `17505fe Add v0.90 next phase foundation`
- v0.80 was merged into `main` through PR #7.
- v0.90-v0.93 are already committed as the next-phase foundation and performance checkpoint.
- This checkpoint is documentation-first and does not change app behavior.

## Current Admin Orders Behavior

- The admin orders page is built around `src/pages/admin/AdminOrdersPage.jsx`.
- Admins can review orders, filter them, open receipts, and inspect quick-view details.
- Live Supabase orders are visible when `ordersSource === 'supabase'`.
- Local demo orders are visible when the current session is using browser-local order state.
- Status updates are only enabled when the source is local/demo.
- In live Supabase mode, the status selector is disabled and the UI explicitly presents the view as read-only.
- `src/context/OrdersContext.jsx` routes local order updates through browser storage, while Supabase order reads come from live queries and RPCs.

## Current Limitations

- Live order status updates are not available in the admin UI.
- Live fulfillment actions are not available in the admin UI.
- Refund and cancellation behavior is only simulated in local/demo order state.
- There is no dedicated backend write path for admin order management in this checkpoint.
- There is no live audit trail for admin order mutations because live mutations are not enabled here.

## What Is Safe To Improve Next

- Copy clarity around the read-only/live distinction.
- Empty-state copy for admin order lists.
- Readability and scanning of status labels, search, and quick-view summaries.
- Documentation that clarifies the expected workflow before any backend implementation.
- Small accessibility or layout clarifications that do not add live mutation behavior.

## What Should Remain Untouched Until A Dedicated Backend / RLS Task

- Live status update writes.
- Fulfillment action writes.
- Refund and cancellation writes.
- Order history mutation APIs.
- Any admin RPC or server-side write path changes.
- Supabase schema changes or RLS changes.
- Any auth or session changes tied to admin write permissions.

## Recommended Future Phases For Real Order Management

1. Define the live admin write model for status, fulfillment, and cancellation actions.
2. Design the Supabase RPC or backend mutation layer that supports those actions.
3. Update RLS and permissions only after the write model is agreed.
4. Add audit logging or status history if live writes are introduced.
5. Add production QA coverage for live order mutation and rollback scenarios.

## No-Touch Areas Preserved

- checkout submission
- order creation
- cart business logic
- Stripe functions
- Netlify functions/env
- Supabase RLS
- auth behavior
- env files/secrets
- package/dependency changes
- live order mutation behavior

## Confirmation

- This checkpoint does not change checkout or order creation behavior.
- This checkpoint does not add live admin order mutation behavior.
- This checkpoint is limited to inspection notes and release-readiness documentation.

