# ShopOra v1.02 Customer Account Persistence Planning

## Scope

This checkpoint is a documentation-first planning pass for customer account persistence. It records how the current account surfaces work today, where data is already persisted, where the app still falls back to local/demo behavior, and what should wait for a dedicated auth/RLS/backend task.

## Current Behavior

- The customer account page shows profile details, default shipping address, saved items, recent orders, recently viewed products, and derived preference hints in one place.
- Profile updates are handled through the existing auth/profile flow.
- Saved items are already tied to the current auth path when Supabase is configured, with a local demo fallback when it is not.
- Order history is already available through the existing orders context, which can load from Supabase or from local storage depending on the active auth source.
- Recently viewed products are frontend-only and remain localStorage-backed.
- Account preference hints are presentation-only and are derived from saved items plus recently viewed products. No separate preference record is written.

## Current Supabase-Backed Behavior

- `AuthContext` hydrates the current user from Supabase when configured.
- Profile reads and updates flow through the existing Supabase profile service when the user is using the Supabase auth path.
- Default shipping address is included in the profile payload, so it can persist with the user profile when the live profile update path is active.
- Saved items use the existing Supabase saved-items service when configured and available.
- Orders are already read through Supabase when the current session is using the Supabase auth path.

## Current Local / Demo Fallback Behavior

- Local demo users, session state, and profile records are stored in localStorage.
- Local demo orders are also stored in localStorage when the app is in local mode.
- Saved items fall back to localStorage-backed user state when Supabase is unavailable.
- Recently viewed products are localStorage-backed only.
- Preference hints on the account page are computed from local saved items and recent views and are not persisted as a backend record.

## Known Persistence Gaps

- Profile fields still need a dedicated review for how much should be considered editable customer profile state versus operational account metadata.
- Default shipping address persistence is present in the profile flow, but it still needs a clearly defined future ownership model if the account system is expanded.
- Saved items have a live path, but the current fallback and sync behavior still deserve a deliberate review before any broader account redesign.
- Order history is already displayed, but it is not a separate persistence feature in the account page itself; it depends on the existing orders source.
- Recently viewed products are intentionally frontend-only and do not currently sync to Supabase.
- Account preferences are only derived in the UI and are not persisted as a user preference object.

## Recommended Future Phases

1. Define the exact customer profile model, including which fields are editable and which are read-only operational data.
2. Decide whether default shipping address should remain part of the profile record or move to a dedicated customer-address model later.
3. Review saved-items persistence and fallback behavior together so local/demo and live Supabase paths stay consistent.
4. Decide whether recent activity should remain frontend-only or be promoted to a live persistence surface.
5. Add a separate preferences model only if the product needs it and the backend/auth/RLS plan is approved.
6. Only after the model is settled, implement any live account persistence updates with the matching auth/RLS/backend work.

## What Should Remain Untouched For Now

- Auth login, register, session, and logout behavior.
- Profile persistence implementation details outside this planning checkpoint.
- Saved-items persistence implementation details outside this planning checkpoint.
- Supabase schema, RLS, and backend service changes.
- Checkout submission.
- Order creation.
- Cart business logic.
- Stripe functions.
- Netlify functions and environment settings.

## No-Touch Areas Preserved

- Customer login and session behavior.
- Profile persistence rules.
- Saved items persistence rules.
- Checkout, order creation, Stripe, Netlify functions/env, Supabase RLS, auth, and cart behavior.
- Package and dependency files.
- Backend/schema work.
- Real live persistence changes.

## Risk Notes

- Profile and saved-item code already supports both local/demo and Supabase-backed paths, so changes in one layer can easily create drift if they are not coordinated.
- The `profiles` and `saved_items` tables need to stay aligned with the frontend payload shape if any future live persistence work is introduced.
- Orders and order-items are the main source of truth for history, so account-page changes should not assume the account page owns persistence for receipts.
- RLS and permission drift are the biggest operational risk before enabling any new write path for customer account data.
- Recently viewed activity is intentionally lightweight and should stay local-only unless a dedicated persistence decision is made later.

## Confirmation

This checkpoint does not change:

- auth behavior
- profile persistence
- saved items persistence
- checkout submission
- order creation
- Stripe
- Netlify functions or env
- Supabase RLS
- cart behavior

