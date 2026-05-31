# ShopOra Checkout Payment Test Plan

## 1. Purpose
This document defines a safe Stripe test-mode checkout/payment validation plan for ShopOra.
It is intended to prove checkout confidence before pilot or production usage decisions.
This plan is not production certification by itself.
No real cards or live payments should be used without explicit approval.

## 2. Preconditions
- [ ] Runtime mode is understood for the environment under test (`demo`, `pilot`, or `production`).
- [ ] Stripe test mode is confirmed as active for all checkout/payment validation.
- [ ] Test publishable key is configured in the appropriate frontend/runtime environment.
- [ ] Test secret key is configured only in server-side/runtime contexts where required.
- [ ] Supabase project configuration is present and matches the environment under test.
- [ ] Netlify function environment expectations are understood for checkout-related flows.
- [ ] Test product/catalog data is available and suitable for checkout scenarios.
- [ ] Owner/admin access expectations are understood for order visibility verification.
- [ ] Related ShopOra docs are reviewed before execution.

## 3. Test environment checklist

### Local development
- [ ] Local runtime mode is explicitly confirmed before testing.
- [ ] Local env setup uses Stripe test-mode values only.
- [ ] Local checkout can reach expected Stripe test checkout/session flow.
- [ ] Local test results are captured with reproducible steps.

### Deploy preview or branch deploy (if intentionally used)
- [ ] Preview/branch runtime mode is confirmed.
- [ ] Preview/branch env vars are validated as test-only.
- [ ] Stripe test checkout/session flow is verified in deployed preview context.
- [ ] Evidence clearly identifies preview URL, branch, and commit.

### Production or pilot environment (boundary note)
- [ ] Environment is explicitly marked test-only for this validation pass.
- [ ] Stripe mode is confirmed test before any checkout attempt.
- [ ] No live payment testing is performed unless explicit approval is granted.

## 4. Stripe checkout test cases
- [ ] `TC-01` Product detail checkout flow reaches Stripe Checkout as expected.
- [ ] `TC-02` Cart checkout flow works as expected (if cart checkout entry is enabled).
- [ ] `TC-03` Multiple-item cart checkout behaves correctly (if supported in scope).
- [ ] `TC-04` Quantity/pricing values shown pre-checkout and in Stripe are consistent.
- [ ] `TC-05` Shipping/tax/fee visibility is validated where those values are expected.
- [ ] `TC-06` Successful payment with Stripe test card completes expected success path.
- [ ] `TC-07` Declined Stripe test card shows expected failure behavior.
- [ ] `TC-08` Cancel/back-to-store behavior is correct and non-destructive.
- [ ] `TC-09` Refresh/retry behavior does not create confusing or duplicate outcomes.
- [ ] `TC-10` Mobile checkout smoke test passes.
- [ ] `TC-11` Desktop checkout smoke test passes.

## 5. Order creation and post-checkout evidence
Without changing order logic, verify:
- [ ] Order record exists in expected location after successful checkout.
- [ ] Customer/contact details are present where expected for successful checkout.
- [ ] Line items match the selected cart/product configuration.
- [ ] Totals align across Stripe session, checkout context, and recorded order expectations.
- [ ] Admin can view the order through expected admin surfaces.
- [ ] Order status/default lifecycle state is understood and documented.
- [ ] No duplicate order is created from one successful checkout event.
- [ ] Failed/canceled checkout does not produce a misleading completed order.

## 6. Evidence capture template
Use this template for each test case execution:

- Date:
- Tester:
- Branch/commit:
- Runtime mode:
- Environment:
- Stripe mode (`test` or `live`):
- Test case ID:
- Steps performed:
- Expected result:
- Actual result:
- Pass/fail:
- Screenshot/link/reference:
- Notes/follow-up:

## 7. Red flags and stop conditions
Stop the test pass and escalate if any of the following are observed:
- [ ] Live Stripe keys appear unexpectedly.
- [ ] A real card is requested or attempted.
- [ ] Checkout succeeds but no order is visible where expected.
- [ ] Order is visible but totals mismatch expected values.
- [ ] Admin cannot view test order.
- [ ] Demo/local fallback data appears in pilot/production context.
- [ ] Secrets appear in logs, screenshots, or shared evidence.
- [ ] Any uncertainty exists around RLS/admin permissions or data trust boundaries.

## 8. Pilot-readiness summary
Before checkout is treated as pilot-ready:
- [ ] Test payments passed in intended pilot-like environment.
- [ ] Canceled and failed payment behaviors are understood and documented.
- [ ] Order visibility is confirmed for customer and admin expectations.
- [ ] Admin operational workflow is confirmed for test orders.
- [ ] Owner/operator understands test versus live boundary.
- [ ] No live payments are allowed without explicit approval.

## 9. Related docs
- `docs/SHOPORA_PRODUCTION_CONFIDENCE_CHECKLIST.md`
- `docs/SHOPORA_RUNTIME_ENV_SETUP_GUIDE.md`
- `docs/SHOPORA_PRODUCTION_MODE_BOUNDARIES.md`
- `docs/SHOPORA_OWNER_SETUP_READINESS.md`
- `docs/SHOPORA_HANDOFF.md`
