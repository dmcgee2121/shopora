# ShopOra Supabase Security Hardening Plan

Milestone: `v0.23-supabase-security-hardening-plan`

Scope: documentation-first security audit and hardening plan. No schema changes are applied by this document.

## What This Plan Is Based On

Reviewed sources:

- [supabase/schema.sql](./../supabase/schema.sql)
- [docs/supabase-auth-migration.md](./supabase-auth-migration.md)
- [docs/SHOPORA_PRODUCTION_READINESS_AUDIT.md](./SHOPORA_PRODUCTION_READINESS_AUDIT.md)
- [src/services/supabaseAuthService.js](./../src/services/supabaseAuthService.js)
- [src/services/supabaseOrdersService.js](./../src/services/supabaseOrdersService.js)
- [src/services/supabaseSavedItemsService.js](./../src/services/supabaseSavedItemsService.js)
- [src/context/AuthContext.jsx](./../src/context/AuthContext.jsx)
- [src/context/OrdersContext.jsx](./../src/context/OrdersContext.jsx)

## 1. Profiles Security

### Current behavior

- `public.profiles` is keyed to `auth.users.id`.
- RLS is enabled on `public.profiles`.
- Policies currently allow authenticated users to:
  - read their own profile row
  - insert their own profile row
  - update their own profile row
- The schema grants:
  - `SELECT` to `authenticated`
  - `INSERT` only on safe columns
  - `UPDATE` only on safe columns
- Client auth code strips `role` from payloads before profile insert/update requests.
- `AuthContext` also forces `role` to remain `customer` in the normal profile update flow.

### Security conclusion

- Users should not be able to read other users' profiles through the intended API path.
- Users should not be able to self-promote to admin through the current client code or the current column grants.
- The current design is defensible for a prototype, but the admin trust boundary still deserves a final live review before production.

### What to verify before production

- Confirm the profile owner checks still work against a live Supabase auth user.
- Confirm no migration or dashboard tool has relaxed the column-level update grant.
- Confirm the `role` constraint still only allows `customer` and `admin`.
- Confirm admin role assignment happens out of band, not through a self-service UI.

### Safe admin-role assignment pattern

- Create the auth user first.
- Insert or update the matching `public.profiles` row as an operator or migration step.
- Set `role = 'admin'` only through controlled SQL or a trusted backend process.
- Never expose an admin promotion path to the frontend.

## 2. Saved Items Security

### Current behavior

- `public.saved_items` has RLS enabled.
- Users can read, insert, and delete only rows where `user_id = auth.uid()`.
- Grants are limited to `authenticated`.
- The client service always sends the authenticated user id for writes.

### Security conclusion

- Saved items are correctly scoped to the owning user in the current schema.
- The main remaining risk is operational: a later SQL change could weaken the policies or broaden grants.

### What to verify before production

- Confirm duplicate protection still works via the unique `(user_id, product_id)` constraint.
- Confirm the list/read path never leaks another user’s saved items.
- Confirm anonymous access remains blocked.

## 3. Orders Security

### Current behavior

- `public.orders` has RLS enabled.
- Customers can read only their own orders.
- Customers can insert only their own orders.
- `public.order_items` has RLS enabled.
- Customers can read and insert order items only when the related order belongs to them.
- The app’s Supabase order writer constructs the order payload from the current authenticated user session.
- The order fetch paths always re-check ownership in the client after the Supabase read.

### Security conclusion

- The current order model is acceptable for customer-owned data access.
- The highest-risk area is not the ordinary customer flow; it is any future change that broadens order reads or weakens ownership checks.

### What to verify before production

- Confirm a customer cannot read another customer’s orders through REST or RPC.
- Confirm a customer cannot insert order items for an order they do not own.
- Confirm `order_items` remains readable only through the owning order.
- Confirm demo/local order logic stays isolated from the Supabase-backed path.

## 4. Admin Order Visibility

### Current behavior

- `public.get_admin_orders()` is `SECURITY DEFINER`.
- It checks `auth.uid()` and requires a matching profile row with `role = 'admin'`.
- It uses `SET search_path = public`.
- It returns all orders and nested order items as JSON.
- The function is only granted to `authenticated`.

### Security conclusion

- The function is currently the correct shape for a controlled admin read path.
- The main security questions are:
  - whether the function owner has privileges broader than intended
  - whether the function exposes more fields than the admin UI actually needs
  - whether the admin role check can be bypassed through an unexpected object lookup or future schema change

### `SECURITY DEFINER` risks

- `SECURITY DEFINER` is powerful because it runs with the function owner’s privileges.
- That is appropriate here only because the function performs its own admin check.
- If the function owner is too privileged, the blast radius of a future SQL mistake increases.

### `search_path` safety

- Setting `search_path = public` is better than leaving it implicit.
- The function should still be reviewed after any schema changes to ensure helper object resolution cannot be hijacked.

### Exposure review

- The function returns full order rows and nested order-item rows.
- That is acceptable for a trusted admin-only panel, but it is more data than a minimal reporting endpoint would expose.
- If a future hardening pass wants a smaller surface, consider a dedicated admin view or an explicitly shaped JSON response.

## 5. Admin Limitations

### Current state

- Live Supabase admin orders are currently read-only in the frontend.
- There is no frontend role-management UI.
- There is no admin user promotion UI.
- Local/demo admin behavior remains separate from real Supabase admin behavior.

### Security conclusion

- These limitations are good from a safety perspective.
- They reduce the chance of accidental privilege escalation while the backend model is still settling.

### What to preserve

- Keep admin promotion out of the UI.
- Keep live Supabase order writes off the frontend until the backend path is intentionally designed.
- Keep demo admin separate from production admin.

## 6. Grants / Revokes

### Current behavior

- `anon` is revoked from the sensitive tables in the schema.
- `public` is revoked from the sensitive tables in the schema.
- `authenticated` has only the permissions needed for the intended flows.
- RPC execution is granted only to `authenticated`.

### Security conclusion

- The current grants look directionally correct for a locked-down customer/admin model.
- The main thing to avoid is broadening access in the name of convenience during a later demo fix.

### Areas to re-check

- `anon` should remain blocked from:
  - profiles
  - saved items
  - orders
  - order_items
  - admin RPC execution
- `authenticated` should only have:
  - the exact read/write permissions needed for customer-owned data
  - no direct path to admin-only reads except the guarded RPC

### Products note

- Product reads appear intentionally public elsewhere in the app.
- This plan does not recommend changing that behavior.
- Product catalog access should be reviewed separately if launch requirements change, but it is not the sensitive-data risk in this audit.

## 7. Environment Safety

### Current behavior

- The app already documents not committing `.env` or `.env.local`.
- Frontend Supabase values are treated as browser-facing values.
- Stripe and Supabase secret material should stay server-only.

### Security conclusion

- The environment model is acceptable if the current discipline is preserved.
- The biggest risk is accidental leakage of a service-role key or secret function credential.

### What to verify before production

- Confirm no secret keys are present in git history or committed env files.
- Confirm browser-bundled env vars are actually intended for client use.
- Confirm server-only keys stay in Netlify function or server config, not in React code.

## 8. Recommended Hardening Path

### Before real production

1. Re-verify the `public.profiles` ownership checks in a live Supabase project.
2. Re-verify that client-side profile writes cannot include `role`.
3. Re-verify `saved_items` ownership policies and duplicate protection.
4. Re-verify `orders` and `order_items` ownership policies.
5. Re-verify `get_admin_orders()` with a real admin user and confirm the admin-only check works.
6. Review grants/revokes after any schema refresh so no table becomes accidentally wider than intended.
7. Confirm there is still no frontend path for admin promotion.

### After demo, if needed

1. Consider a more minimal admin reporting shape if the full JSON payload becomes too broad.
2. Consider stronger operational hardening around admin fulfillment writes.
3. Consider database-level `FORCE ROW LEVEL SECURITY` only if the deployment model requires it and after careful validation.
4. Consider splitting operational admin writes from read paths if the admin surface grows.

### SQL to run carefully in Supabase SQL Editor

Run the following only after validating the target database state and backup plan:

- RLS and policy refresh:
  - `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
  - policy recreation for profiles, saved items, orders, and order_items
- Grant and revoke refresh:
  - table-level `REVOKE` for `anon` and `public`
  - column-level `GRANT` only on safe profile fields
  - `GRANT EXECUTE` only on the guarded admin RPC
- Admin-role maintenance:
  - controlled `UPDATE public.profiles SET role = 'admin' ...` for trusted operators only

Do not run any SQL that broadens access unless it is explicitly reviewed as part of a production change.

## 9. Watch List

- Any future change to `profiles.role` handling.
- Any future order admin write path.
- Any future RPC that returns all orders or customer details.
- Any future migration that changes table ownership or default grants.
- Any future attempt to simplify permissions by making things public.

## Bottom Line

The current schema and service code already show a reasonable security posture for a prototype with live Supabase customer flows and a guarded admin read path. The next production step should be a deliberate validation pass, not a rush to broaden access.

