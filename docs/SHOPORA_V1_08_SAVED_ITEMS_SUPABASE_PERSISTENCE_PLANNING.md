# ShopOra v1.08 Saved Items Supabase Persistence Planning

## Scope

This checkpoint documents the current saved-items architecture and the safest path for future Supabase-backed saved-item planning. It does not change saved-item behavior or introduce new persistence writes.

## Current Saved-Items Behavior

- Product cards expose a heart/save control through `ProductCard`.
- Product detail pages expose the same save control through `ProductPage`.
- Saved items pages read the current saved-item list from `useAuth().savedProductIds`.
- Logged-out users are redirected to sign in when they try to save an item.
- Signed-in users see the saved-state reflected through `isSavedItem()` and the heart button state.
- The UI copy already treats saved items as a lightweight wishlist / favorite trail.

## Current Local / Demo Fallback Behavior

- Local/demo users persist saved items in browser storage through `AuthContext`.
- The active local demo user keeps `savedProductIds` inside the local user record.
- Demo admin remains local-only.
- If Supabase is unavailable or not configured, the app stays on the local/demo path.
- The saved-items page and product save controls continue to work in demo mode because the auth context owns the fallback state.

## Current Supabase-Backed Behavior

- `AuthContext` hydrates saved product ids through `getSavedProductIdsForCurrentSupabaseUser()` when the session is Supabase-backed.
- `AuthContext.toggleSavedItem()` calls `toggleSavedProductId()` for Supabase users.
- `src/services/supabaseSavedItemsService.js` talks to `public.saved_items` through REST requests using the current session access token.
- The helper deduplicates the current list before deciding whether to insert or delete.
- Saved items are already backend-backed for authenticated Supabase customers.

## Existing Schema / RLS Assumptions

The repo already includes `supabase/schema.sql`, which defines:

- `public.saved_items`
- a unique constraint on `(user_id, product_id)`
- indexes on `user_id` and `product_id`
- RLS policies for select / insert / delete on the owning authenticated user
- grants for `authenticated`

The saved-items helper and auth path assume:

- `saved_items.user_id` matches `auth.uid()`
- `saved_items.product_id` references a product row
- the current Supabase session is available when saving or loading
- the live project schema still matches the repo schema

## Logged-Out, Local/Demo, And Supabase User Behavior

- Logged-out users: save actions route to sign-in instead of writing saved items immediately.
- Local/demo users: save actions update browser-local `savedProductIds` only.
- Supabase-authenticated users: save actions read and write `public.saved_items` through the current session.

## Known Gaps And Risks

- Session restore can mask whether a user is on the local or Supabase path until the auth context finishes hydrating.
- Duplicate saved records are prevented by the schema constraint, but the UI still depends on helper-side dedupe and the current session token.
- Optimistic UI is not yet explicit; the heart state changes after the helper resolves.
- If RLS or grants drift in the live project, saves can fall back or fail even though the UI still renders.
- A missing or invalid Supabase session should not silently create inconsistent saved-item rows.
- Cross-account ownership must remain strict so one user cannot read or write another user’s wishlist.

## Safest Future Path

The safest future implementation path is to keep the current helper architecture and harden it in small steps:

1. Confirm the live `saved_items` table matches `supabase/schema.sql`.
2. Confirm the live RLS policies still allow only the owning authenticated user to read, insert, and delete saved items.
3. Keep the current `AuthContext.toggleSavedItem()` flow as the single UI entry point.
4. Keep the local/demo fallback behavior intact for non-Supabase sessions.
5. Add any UX feedback or loading state only after the live write path remains stable.

## Recommended Implementation Phases

1. Audit the live `saved_items` schema and RLS against the repo schema.
2. Validate a single authenticated save and remove flow in a non-production Supabase project.
3. Confirm session restore still hydrates the saved-item list correctly after refresh.
4. Add small UX feedback improvements only if the helper path remains stable.
5. Consider broader wishlist features only after the current save/remove path is reliable.

## Manual QA Checklist For Future Saved-Items Work

- Sign in with a Supabase-backed customer account.
- Save a product from a product card.
- Remove that same product from the heart control.
- Refresh the page and confirm the saved-item state stays correct.
- Sign out and confirm the signed-out save CTA routes to login.
- Repeat the same flow in local/demo mode and confirm browser-local saved items still work.
- Confirm saved-item behavior does not change checkout, cart, order history, or profile behavior.

## Rollback Notes

- The current helper path is centralized in `AuthContext` and `supabaseSavedItemsService`.
- If future Supabase saved-item work needs to be rolled back, revert changes in those two areas first.
- Keep the browser-local fallback intact so demo mode remains usable while the live path is investigated.

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
- Order history persistence.
- Profile persistence changes.

## Confirmation

This checkpoint does not change:

- saved-items behavior
- auth behavior
- checkout
- order creation
- cart behavior
- Stripe
- Netlify functions or env
- Supabase RLS
- env files or secrets
- package/dependency files

