# ShopOra v1.09 Saved Items Supabase Persistence Implementation

## Scope

This checkpoint implements the first narrow saved-items persistence improvement that was already supported by the repo schema and existing helper path. It does not add schema, migration, or RLS changes.

## What Was Implemented

- Supabase-authenticated saved-item save/remove actions continue to use `public.saved_items` through the existing REST helper path.
- The authenticated mutation path now requires a real Supabase session instead of silently no-oping when the session is missing.
- Saved-item inserts are now treated as idempotent against the existing `(user_id, product_id)` unique constraint, which reduces duplicate-record risk without changing schema.
- Product cards now show a conservative in-flight state for authenticated saved-item writes by disabling the heart button while the request is active.
- Product pages now show the same conservative in-flight state and surface saved-item errors with the existing `auth-message` pattern.
- The saved-items page now surfaces saved-item auth errors with the existing `auth-message` pattern.

## How User Types Differ

- Supabase-authenticated users: saved-item save/remove actions use the live Supabase session and the `public.saved_items` REST helper path.
- Local/demo users: saved items still persist in browser-local state through `AuthContext`.
- Logged-out users: save actions still route to sign-in instead of writing a saved item immediately.

## What Remains Local/Demo Fallback

- Browser-local saved-item storage for demo/local users.
- Logged-out save CTA routing to login.
- Existing demo admin behavior.
- Existing browser-local fallback behavior if Supabase is not configured.

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
- No order history persistence changes.
- No new schema fields.

## Audit Result

The v1.08 audit confirmed the repo already had the required saved-items assumptions in place:

- `public.saved_items`
- unique `(user_id, product_id)` protection
- ownership RLS policies for select/insert/delete
- authenticated grants for the saved-items table

That was enough to make this a safe client-side implementation without schema or policy edits.

## Manual QA Checklist

- Sign in with a Supabase-backed customer account.
- Save a product from a product card.
- Remove that same product from the heart control.
- Confirm the heart control disables while the Supabase request is in flight.
- Refresh the page and confirm saved-item state still hydrates correctly.
- Confirm duplicate clicks do not create duplicate visible saves.
- Sign out and confirm the save CTA still routes to login.
- Repeat the same flow in local/demo mode and confirm browser-local saved items still work.

## Rollback Notes

- Revert the changes in `src/context/AuthContext.jsx`, `src/services/supabaseSavedItemsService.js`, `src/components/ProductCard.jsx`, `src/pages/ProductPage.jsx`, and `src/pages/SavedItemsPage.jsx` if this checkpoint needs to be undone.
- The rollback path does not require any database rollback because this checkpoint did not apply SQL, migrations, or RLS changes.

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

## Confirmation

This implementation did not change:

- checkout
- order creation
- cart business logic
- Stripe
- Netlify functions or env
- Supabase RLS
- env files or secrets
- package/dependency files
- auth login/register/session behavior
- order history persistence

