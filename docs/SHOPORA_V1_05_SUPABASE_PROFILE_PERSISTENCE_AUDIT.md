# ShopOra v1.05 Supabase Profile Persistence Audit

## Scope

This audit reviews the current Supabase customer profile architecture, the existing local fallback path, and the repo assumptions around profile persistence before any live backend implementation work is attempted. It does not apply migrations or change runtime behavior.

## Current Architecture

- `src/lib/supabaseClient.js` only enables Supabase when both the URL and anon key are present and valid.
- `src/context/AuthContext.jsx` is the main orchestrator for customer auth state, profile hydration, profile updates, and saved-item hydration.
- `src/services/supabaseAuthService.js` provides the Supabase Auth and profile REST helpers.
- `src/services/supabaseSavedItemsService.js` provides the saved-items REST helpers.
- `src/context/OrdersContext.jsx` provides customer and admin order reads/writes through the existing order service layer, with local fallback behavior when Supabase is not active.
- `src/utils/authMappers.js` maps the app user shape to and from the `profiles` REST payload shape.

## Current Profile Fields

The current customer profile shape used by the app includes:

- `id`
- `firstName`
- `lastName`
- `email`
- `phone`
- `role`
- `defaultShippingAddress`
- `createdAt`
- `updatedAt`
- `savedProductIds` as part of the broader app user object, not the Supabase profile row itself

The editable account form currently covers:

- first name
- last name
- phone
- default shipping first name
- default shipping last name
- default shipping street
- default shipping city
- default shipping state
- default shipping zip

## Current Read / Write Behavior

- `AccountPage` seeds its form from `currentUser`.
- `AuthContext.updateProfile()` merges the form into the active user record.
- When `authSource === 'supabase'`, `updateProfile()` calls `upsertProfile()` in `supabaseAuthService`.
- When `authSource === 'local'`, `updateProfile()` writes back to the browser-local demo user record.
- `supabaseAuthService` currently uses REST requests against `/rest/v1/profiles` with the current session access token.
- `profileToSupabasePayload()` maps the UI fields to Supabase column names.
- The app already treats profile data as a shared shape across local/demo and Supabase-backed flows.

## Current Fallback Behavior

- Demo users and demo sessions are stored in `localStorage` under `shopora_users` and `shopora_current_user`.
- If Supabase is not configured, the app remains functional in local/demo mode.
- If Supabase auth is configured but profile hydration or writes fail, the current code surfaces friendly errors and may fall back to local behavior when the failure is a configuration/network style issue.
- The seeded demo admin remains local-only.

## Existing Supabase Schema / RLS Assumptions

The repo already includes `supabase/schema.sql`, which defines the live shape the frontend is expecting:

- `public.profiles`
- `public.saved_items`
- `public.orders`
- `public.order_items`

`public.profiles` currently includes:

- `id` referencing `auth.users(id)`
- `first_name`
- `last_name`
- `email`
- `phone`
- `role`
- `default_shipping_address` as `jsonb`
- `created_at`
- `updated_at`

The schema also defines:

- an `updated_at` trigger for profiles
- RLS on profiles, saved_items, orders, and order_items
- read/insert/update policies for the owning authenticated customer on `profiles`
- insert/delete/select policies for the owning authenticated customer on `saved_items`
- insert/select policies for the owning authenticated customer on `orders`
- select/insert policies for `order_items` tied to the owning order

The profile grants in `supabase/schema.sql` currently allow authenticated users to:

- select profiles
- insert the profile fields needed by the app
- update the profile fields needed by the app

## Saved Items, Orders, And Order Items

- Saved items are already backend-backed for authenticated Supabase customers through `supabaseSavedItemsService`.
- Orders are already backend-backed for authenticated Supabase customers through `OrdersContext` and the order service layer.
- Order items are already represented in the schema and read/write path for owned orders.
- Local/demo fallback behavior still exists for saved items and orders when Supabase is not active.

## What Must Be Verified Before Real Profile Writes

1. Confirm the live Supabase project is using a schema that matches `supabase/schema.sql`.
2. Confirm `profiles` exists and the `default_shipping_address` JSON shape is accepted in the live project.
3. Confirm the authenticated customer session still carries a valid access token at profile-save time.
4. Confirm the live RLS policies allow only the owning customer to read and update their profile row.
5. Confirm the profile grants match the current REST payload fields used by `profileToSupabasePayload()`.
6. Confirm the profile row is still the authoritative record for editable customer profile data.

## Safest First Real Backend Implementation Step

The lowest-risk first backend step is not a new mutation feature. It is a live schema and permission audit in a non-production Supabase project:

1. Compare the live project schema to `supabase/schema.sql`.
2. Confirm the `profiles` column set and RLS policies match the repo assumptions.
3. Validate a single authenticated profile read and a single authenticated profile update in a dev or staging Supabase project.
4. Only after that passes, wire any future profile persistence rollout behind the existing `updateProfile()` path.

If the live project already matches the repo schema, the next implementation step can reuse the existing `upsertProfile()` helper without changing the account form contract.

## Recommended Future Sequence

1. Audit the live Supabase schema against `supabase/schema.sql`.
2. Confirm `profiles` read/update permissions for the owning authenticated user.
3. Confirm the profile payload mapping from the app matches the live column names.
4. Validate the current `updateProfile()` path in a non-production Supabase project.
5. Keep local/demo fallback intact.
6. Only then consider any deeper profile-field expansion or backend hardening work.

## Risks And Rollback Notes

- The biggest risk is assuming the live schema matches the repo schema when it does not.
- RLS drift can turn profile saves into silent fallback behavior or permission errors.
- Because the app already supports local/demo fallback, a misconfigured Supabase project can hide a production issue until a real customer tries the save flow.
- The safe rollback path is to keep the local/demo account flow intact and temporarily disable the Supabase profile write path if live permission checks fail.
- Do not widen profile write access until the customer-owned row policies are verified in a dev or staging project.

## No-Touch Areas Preserved

- Checkout submission.
- Order creation.
- Cart business logic.
- Stripe functions.
- Netlify functions and environment settings.
- Env files and secrets.
- Package and dependency files.
- Production SQL execution.
- Supabase migrations.
- Live auth behavior.
- Customer login/register/session behavior.

## Confirmation

This audit does not:

- apply migrations
- change env files or secrets
- change auth behavior
- change checkout submission
- change order creation
- change Stripe
- change Netlify functions or env
- change Supabase RLS
- change cart behavior
- run SQL against production

