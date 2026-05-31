# ShopOra Admin Access Verification Checklist

## 1. Purpose
This checklist verifies owner/admin access readiness before pilot usage.
It is an operational verification guide and is not a security audit or production certification.

## 2. Admin access model overview
Expected access boundaries:
- Normal shopper/customer access: storefront and customer account areas only.
- Owner/admin access: administrative surfaces used to run catalog and order operations.
- Demo admin access: demo-mode helper access for local/demo flows where intentionally enabled.
- Production/pilot admin access: intentional, verified access path for real owner/operator usage.

Actual behavior depends on ShopOra's existing auth, profile, and role setup in the current environment.

## 3. Preconditions
- [ ] Runtime mode is understood for the environment under test.
- [ ] Supabase project configuration is present for the target environment.
- [ ] Owner/admin account to test is identified.
- [ ] Expected admin role/profile model is understood before testing.
- [ ] Demo admin boundary expectations are reviewed.
- [ ] Related production/runtime docs are reviewed.

## 4. Supabase and profile verification checklist
Without changing schema or RLS, verify:
- [ ] Expected owner/admin user exists.
- [ ] Profile row exists where required by current app behavior.
- [ ] Role/admin field is set as expected where applicable.
- [ ] Service role key is not exposed client-side.
- [ ] RLS assumptions are understood for admin-related reads/writes.
- [ ] Admin access does not depend on local/demo fallback state.
- [ ] Production and demo/test data contexts are not being confused.

## 5. Admin login verification checklist
- [ ] Admin login page loads.
- [ ] Expected admin user can sign in.
- [ ] Normal shopper account cannot access admin area.
- [ ] Failed login shows understandable feedback.
- [ ] Logout works as expected.
- [ ] Refreshing admin pages preserves expected consistency.
- [ ] Mobile admin login smoke test passes.
- [ ] Desktop admin login smoke test passes.

## 6. Demo admin and production safety
- [ ] Demo admin is available only where intentionally allowed.
- [ ] Demo admin is disabled by default in production/pilot unless intentionally enabled.
- [ ] Reserved demo admin email remains protected where existing docs/code indicate that behavior.
- [ ] Admin UI context clearly indicates demo/pilot/production mode where applicable.

## 7. Admin area access checks
Document verification only, no behavior changes:
- [ ] Admin dashboard access.
- [ ] Products/catalog admin access.
- [ ] Product editor/admin create-edit flow visibility.
- [ ] Orders admin access.
- [ ] Customers admin access.
- [ ] Owner setup/readiness checklist visibility.
- [ ] Production/runtime notices shown in admin where expected.

## 8. Evidence capture template
Use this template for each admin access verification case:

- Date:
- Tester:
- Branch/commit:
- Runtime mode:
- Environment:
- Account tested:
- Expected role/access level:
- Admin area tested:
- Expected result:
- Actual result:
- Pass/fail:
- Screenshot/link/reference:
- Notes/follow-up:

## 9. Red flags and stop conditions
Stop and escalate if any of the following occur:
- [ ] Normal shopper can access admin area.
- [ ] Expected owner/admin cannot access admin area.
- [ ] Demo admin appears in production unexpectedly.
- [ ] Admin behavior depends on local/demo fallback data.
- [ ] Service role key appears client-side.
- [ ] Role/profile expectations are unclear or contradictory.
- [ ] Admin pages fail silently or without actionable feedback.
- [ ] Order/customer admin data is not visible when expected.

## 10. Pilot-readiness summary
Before treating admin access as pilot-ready:
- [ ] Owner/admin account is verified.
- [ ] Normal shopper is blocked from admin.
- [ ] Demo admin boundary is confirmed.
- [ ] Supabase role/profile expectation is documented.
- [ ] Admin dashboard/products/orders/customers access is checked.
- [ ] Evidence is captured for tested scenarios.
- [ ] Unresolved access risks are documented before pilot.

## 11. Related docs
- `docs/SHOPORA_PRODUCTION_CONFIDENCE_CHECKLIST.md`
- `docs/SHOPORA_RUNTIME_ENV_SETUP_GUIDE.md`
- `docs/SHOPORA_CHECKOUT_PAYMENT_TEST_PLAN.md`
- `docs/SHOPORA_PRODUCTION_MODE_BOUNDARIES.md`
- `docs/SHOPORA_OWNER_SETUP_READINESS.md`
- `docs/SHOPORA_HANDOFF.md`
