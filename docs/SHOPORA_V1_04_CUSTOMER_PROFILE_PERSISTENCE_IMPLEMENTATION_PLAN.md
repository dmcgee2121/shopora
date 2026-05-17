# ShopOra v1.04 Customer Profile Persistence Implementation Plan

## Scope

This checkpoint documents the safest path for implementing customer profile persistence later. It does not add any new writes or backend work now. The goal is to map the current profile flow clearly enough that a future implementation can be staged, tested, and rolled out in small pieces.

## Current Profile Behavior

- `AccountPage` renders profile fields from `currentUser` and seeds the edit form from the active user record.
- The editable profile form currently covers:
  - first name
  - last name
  - phone
  - default shipping first name
  - default shipping last name
  - default shipping street
  - default shipping city
  - default shipping state
  - default shipping zip
- `handleSubmit` calls `updateProfile(form)` from `AuthContext`.
- `updateProfile()` merges the form into the current user shape, then:
  - writes to Supabase when `authSource === 'supabase'`
  - writes to local demo storage when `authSource === 'local'`
- The account page displays the updated `currentUser` state after save, which keeps the form and profile cards in sync with the active auth source.

## Current Fallback Behavior

- Local demo users are stored in `localStorage` under `shopora_users`.
- The active local session is stored in `shopora_current_user`.
- If Supabase is unavailable, the account page still works with local demo profile data.
- If a Supabase profile update fails with a permission or RLS-style error, the current code is already designed to surface a friendly message rather than silently changing backend behavior.
- The local demo path currently persists the same profile fields through the local user record, which means the form behavior already exercises the same shape as the Supabase path.

## Current Supabase Path

- `AuthContext` hydrates the current user from `getProfile()` when the session is Supabase-backed.
- `updateProfile()` sends the merged profile payload to `upsertProfile()` in the Supabase service.
- `profileToSupabasePayload()` maps the UI shape to the `profiles` REST payload shape.
- The current profile payload shape includes:
  - `first_name`
  - `last_name`
  - `email`
  - `phone`
  - `role`
  - `default_shipping_address`

## Safe Future Persistence Path

The safest implementation path is to keep the existing form shape and auth source branching, then harden the persistence contract in small steps:

1. Confirm the `profiles` table column names and payload mapping are correct for the fields already in use.
2. Confirm the profile row should remain the single source of truth for the editable customer profile data.
3. Keep the current `updateProfile()` call path, but only after the backend and RLS assumptions are verified.
4. Preserve the local fallback path so the account page can still function in demo mode.
5. Add any future validation, normalization, or UX warnings before introducing new writes or new profile fields.

## Future Field Mapping

- `firstName` -> `first_name`
- `lastName` -> `last_name`
- `phone` -> `phone`
- `defaultShippingAddress.firstName` -> `default_shipping_address.firstName`
- `defaultShippingAddress.lastName` -> `default_shipping_address.lastName`
- `defaultShippingAddress.street` -> `default_shipping_address.street`
- `defaultShippingAddress.city` -> `default_shipping_address.city`
- `defaultShippingAddress.state` -> `default_shipping_address.state`
- `defaultShippingAddress.zip` -> `default_shipping_address.zip`

The UI should continue to treat the shipping block as one nested address object, even if the eventual database representation changes later.

## Supabase Assumptions To Confirm Before Implementation

- The `profiles` table exists and is the intended home for customer profile data.
- The `profiles` table accepts the current payload shape, including the nested default shipping address representation.
- The current REST mapping from UI fields to Supabase fields is still correct.
- The existing profile row is safe to update with the customer session token.
- The auth session used by `AuthContext` still has a valid access token when the profile update occurs.
- The profile service still has permission to read and write the current fields.

## Required RLS / Security Confirmations

- The authenticated customer can read only their own profile row.
- The authenticated customer can update only their own profile row.
- The anonymous/public role cannot write profile data.
- The update path does not allow profile escalation, id spoofing, or cross-user writes.
- Any future shipping-address expansion does not weaken the current row ownership model.
- Any future backend implementation continues to reject unauthorized writes before they reach the UI.

## What Should Remain Frontend-Only For Now

- Recently viewed products.
- Derived preference previews.
- Demo/local session handling.
- Any future account preferences center.
- Any new persistence model beyond the existing profile row.

## Proposed Implementation Phases

1. Confirm data model and table expectations.
2. Confirm RLS and permissions for profile reads and updates.
3. Validate the existing form-to-payload mapping against the live profile row shape.
4. Keep the local/demo path intact as the fallback path.
5. Add any profile-read or profile-save copy cues only after the data contract is confirmed.
6. Only then consider a live implementation pass that changes persistence behavior.

## Manual QA Checklist For Future Profile Persistence Work

- Sign in with a Supabase-backed customer account.
- Open the account page and verify the form preloads the current profile.
- Update first name, last name, phone, and shipping address fields.
- Confirm the save result reflects the current account and the page refresh state.
- Sign out and sign back in to verify the values persist.
- Confirm the local/demo fallback still works when Supabase is unavailable.
- Confirm the account page does not change login, register, logout, cart, checkout, or order behavior.

## No-Touch Areas Preserved

- Auth login, register, session, and logout behavior.
- Checkout submission.
- Order creation.
- Cart business logic.
- Stripe functions.
- Netlify functions and environment settings.
- Supabase RLS.
- Environment files and secrets.
- Package and dependency files.
- Backend/schema work.
- Real Supabase mutation implementation.

## Confirmation

This planning checkpoint does not change:

- auth behavior
- profile persistence
- checkout
- order creation
- Stripe
- Netlify functions or env
- Supabase RLS
- cart behavior

