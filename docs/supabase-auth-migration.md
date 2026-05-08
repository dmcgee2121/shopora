# Supabase Auth Migration

ShopOra now wires customer auth to Supabase Auth when Supabase is configured, while the seeded admin demo login remains local. This document keeps the migration boundaries clear: customer auth, profiles, saved items, and customer orders are on Supabase for signed-in customers, while the admin demo flow stays local/demo only.

## Current Auth Behavior

Auth state now lives in `src/context/AuthContext.jsx` and uses a split model:

- Customer register/login/logout goes through Supabase Auth when configured.
- The seeded admin account stays local-only in browser storage.
- If Supabase is missing or unavailable, the local mock auth fallback remains available.

Current user data includes:

- `id`
- `firstName`
- `lastName`
- `email`
- `password`
- `phone`
- `role`
- `defaultShippingAddress`
- `savedProductIds`

The seeded admin account is also local-only:

- Email: `admin@shopora.demo`
- Role: `admin`

This is prototype behavior only. Local fallback accounts still use browser storage, but Supabase users never store passwords in localStorage.
For Supabase customers, `savedProductIds` is hydrated from `public.saved_items` instead of browser storage.

## Implemented Supabase Behavior

Supabase Auth is now the source of truth for customer accounts when configured:

- Registration calls `supabase.auth.signUp`.
- Login calls `supabase.auth.signInWithPassword`.
- Logout calls `supabase.auth.signOut`.
- The authenticated Supabase user id becomes the profile id.
- Profile data lives in `public.profiles`.
- Saved-item data lives in `public.saved_items`.
- `src/services/supabaseAuthService.js` performs the Supabase auth and profile calls.
- `src/services/supabaseSavedItemsService.js` performs the Supabase saved-item reads and writes.
- `src/context/AuthContext.jsx` chooses between local and Supabase auth while preserving the demo admin login.
- If customer profile edits return `permission denied for table profiles`, rerun `supabase/schema.sql` against the live Supabase project so the update grant matches the repo schema.
- If saved-item reads or writes return `permission denied for table saved_items`, rerun `supabase/schema.sql` against the live Supabase project so the RLS and grant statements match the repo schema.

## Profiles Table Mapping

`supabase/schema.sql` now includes `public.profiles`.

Suggested field mapping:

- `id` -> Supabase Auth `auth.users.id`
- `firstName` -> `first_name`
- `lastName` -> `last_name`
- `email` -> `email`
- `phone` -> `phone`
- `role` -> `role`
- `defaultShippingAddress` -> `default_shipping_address`
- `createdAt` -> `created_at`
- `updatedAt` -> `updated_at`

Do not map local mock passwords into profiles. Supabase Auth owns credentials.

## Roles And Admin Access

The profile role column is constrained to:

- `customer`
- `admin`

Starter RLS policies allow authenticated users to read, insert, and update their own customer profile fields only.

Admin role policies are intentionally not implemented yet. Production admin access should eventually require:

- Supabase Auth session
- profile role lookup
- database policies or backend functions that prevent role self-promotion
- server-side enforcement for privileged writes

Do not allow anonymous reads of all profiles.

## Saved Items And Orders

Saved items are now backend-backed for authenticated Supabase customers.

Current pattern:

- Saved items are stored as rows keyed by `user_id` and `product_id`.
- RLS restricts access to the owning authenticated user.
- Local fallback users and the seeded admin still keep their browser-local demo behavior.
- Customer orders are stored in `public.orders` and `public.order_items` for authenticated Supabase users.
- The seeded demo admin still remains local/demo-only.
- A real Supabase admin profile can read all orders through the protected `get_admin_orders()` RPC added in `supabase/schema.sql`.

Cart can stay local because checkout now branches by auth source:

- Supabase customers create and read order records from Supabase.
- Local/demo users continue to use browser-local demo orders.

## Password Migration Risk

The current mock passwords are prototype data and should not be imported.

Recommended approach:

- Keep mock users local until Supabase Auth is ready.
- Create new Supabase Auth users through the normal signup or invite flow.
- Ask existing demo users to reset or recreate passwords if needed.
- Remove local password storage only after Supabase sessions are driving the app.

## Recommended Implementation Sequence

1. Run the updated `supabase/schema.sql`.
2. Keep the local demo admin flow intact.
3. Use `src/services/supabaseAuthService.js` as the customer auth adapter.
4. Upsert `profiles` after signup and profile edits.
5. Use `src/services/supabaseSavedItemsService.js` for customer saved-item reads and writes.
6. Keep customer orders on Supabase and local/demo orders in browser storage until the next backend milestone.
7. Remove localStorage passwords and mock users only after the local fallback is no longer needed.

## Helper Files

- `src/utils/authMappers.js` maps profile rows to the current app-style user fields.
- `src/services/supabaseAuthService.js` performs the Supabase Auth sign-up, sign-in, sign-out, and profile upsert calls.
- `src/services/supabaseSavedItemsService.js` performs saved-item reads, writes, and toggles for the current Supabase user.
- `supabase/schema.sql` contains the `profiles` table, role constraint, self-profile RLS policies, and profile `updated_at` trigger.
