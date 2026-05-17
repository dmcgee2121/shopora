# ShopOra v1.06 Customer Profile Persistence Implementation

## Scope

This pass implements the first safe customer profile persistence improvement: customer profile edits now persist through the existing Supabase profile helper for authenticated Supabase users, while local/demo users keep the local fallback path. The change is intentionally narrow and reversible.

## What Was Implemented

- The account form still saves through `AuthContext.updateProfile()`.
- Supabase-authenticated users now persist profile edits through the existing `upsertProfile()` helper path.
- The save path now persists only the safest editable profile fields:
  - first name
  - last name
  - phone
  - default shipping street
  - default shipping city
  - default shipping state
  - default shipping zip
- The Supabase write payload now omits email and role for the profile edit flow.
- Local/demo users still save to the browser-local profile record through the existing fallback path.
- The account form now shows a small saving indicator plus the existing success and error messages.

## What Fields Are Covered

The persisted customer-edit fields in this implementation are:

- `firstName`
- `lastName`
- `phone`
- `defaultShippingAddress.street`
- `defaultShippingAddress.city`
- `defaultShippingAddress.state`
- `defaultShippingAddress.zip`

The current profile form still displays the full address block, but the implementation keeps the write path limited to these safe fields.

## Supabase-Authenticated Versus Local / Demo Users

- Supabase-authenticated users call the existing `upsertProfile()` path and persist to `public.profiles`.
- Local/demo users continue to persist through browser storage only.
- The demo admin flow stays local-only.
- Session restore behavior did not change.

## What Was Intentionally Not Implemented

- No new database fields were introduced.
- No auth/session behavior was changed.
- No saved-items persistence changes were made.
- No order history persistence changes were made.
- No checkout, cart, Stripe, or Netlify function changes were made.
- No schema or migration changes were applied.
- No RLS changes were made.
- No production SQL was run.

## Manual QA Checklist

- Sign in with a Supabase-backed customer account.
- Update first name, last name, phone, and shipping address fields.
- Save the profile and confirm the success message appears.
- Refresh the page and confirm the values remain on the account page.
- Sign out and sign back in to confirm the profile values still load.
- Repeat the same flow with a local/demo account and confirm the browser-local fallback still works.
- Confirm checkout, order history, saved items, and login/register/session behavior are unchanged.

## Rollback Notes

- The change is concentrated in the profile payload mapping, the Supabase profile update call, and the account form save state.
- If the new Supabase profile write path needs to be rolled back, revert the `updateProfile()` payload change and the helper payload option change first.
- The local/demo fallback remains intact, so rollback can safely return to the prior behavior without touching auth, checkout, or order flows.

## No-Touch Areas Preserved

- Checkout submission.
- Order creation.
- Cart business logic.
- Stripe functions.
- Netlify functions and environment settings.
- Env files and secrets.
- Package and dependency files.
- Supabase RLS.
- Saved items persistence.
- Order history persistence.
- Auth login, register, session, and logout behavior.

## Confirmation

This implementation did not:

- change auth session behavior
- change checkout
- change order creation
- change cart business logic
- change Stripe
- change Netlify functions or env
- change Supabase RLS
- change env files or secrets
- change package/dependency files
- run SQL against production
- apply Supabase migrations

