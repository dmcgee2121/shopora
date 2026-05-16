# ShopOra v0.95 Customer Account Backend Readiness

## Current Branch

- Branch: `v0.90-next-phase-foundation`
- Current branch tip at readiness time: `17505fe Add v0.90 next phase foundation`
- v0.80 was merged into `main` through PR #7.
- v0.90-v0.94 are already committed on the next-phase foundation branch.
- This checkpoint is documentation-first and does not change app behavior.

## Current Customer Account Behavior

- The account page shows profile details, saved styles, recent orders, shipping info, support shortcuts, and account-ready shopping links.
- The saved-items page shows a wishlist-style collection of saved products.
- The orders page shows order history and receipts for the signed-in account.
- The account surfaces are designed to feel like a single customer dashboard across profile, saved items, orders, and shopping shortcuts.

## Current Frontend / Local Fallback Behavior

- Local demo accounts are supported through browser storage in `src/context/AuthContext.jsx`.
- Local demo saved items are stored in browser state and local storage.
- Local demo order history comes from browser-local order state in `src/context/OrdersContext.jsx`.
- When Supabase is unavailable or not configured, the app can continue in local/demo mode.
- The account page reads saved product IDs, recently viewed products, and recommendations from frontend/local sources to build the dashboard experience.

## Current Supabase-Backed Behavior

- When Supabase is configured, the auth context attempts to hydrate the current user from Supabase.
- Profile updates can be written through the Supabase profile service.
- Saved items can be toggled through the Supabase saved-items service.
- Customer orders can be read from Supabase when the session is available and permitted.
- The account and orders pages display Supabase-backed data when the current auth source is Supabase.

## Known Limitations

- Profile persistence is still split between local/demo state and Supabase state.
- Saved items persistence depends on auth source and Supabase permissions.
- Order history is readable, but the customer account layer is not a full backend-hardening solution yet.
- The demo/local fallback path remains part of the current experience.
- Stronger persistence guarantees still depend on dedicated auth, profile, saved-items, orders, and RLS work.

## What Is Safe To Improve Next

- Copy clarity around local/demo versus Supabase-backed account state.
- Empty-state guidance for profile, saved items, and orders.
- Small readability and accessibility improvements on account, saved-items, and order-history surfaces.
- QA notes and release planning for stronger persistence.
- Documentation that explains how the account experience behaves in each auth mode.

## What Should Remain Untouched Until A Dedicated Auth / RLS / Backend Task

- Auth behavior.
- Profile persistence model.
- Saved-items persistence model.
- Checkout submission.
- Order creation.
- Supabase RLS.
- Any schema or backend write-path changes.
- Any auth/session changes intended to modify account persistence.

## Recommended Future Phases For Real Customer Account Hardening

1. Confirm the production account baseline and current auth mode behavior.
2. Define the persistence model for profile, saved items, and account state.
3. Review and harden auth/session handling before changing backend writes.
4. Review Supabase RLS and write permissions for profiles and saved items.
5. Add production QA for persistence, reconnect, and recovery scenarios.

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

## Confirmation

- This checkpoint does not change auth behavior.
- This checkpoint does not change profile persistence behavior.
- This checkpoint does not change saved-items persistence behavior.
- This checkpoint does not change checkout or order creation behavior.
- This checkpoint is limited to inspection notes and readiness documentation.

