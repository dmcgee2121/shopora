# ShopOra Production Confidence Checklist

## 1. Purpose
This checklist is for moving ShopOra from demo-with-owner-ready toward pilot-business-ready.
It is a confidence and verification framework, not a production certification.
Completing this checklist does not make ShopOra production-ready by itself.

## 2. Current readiness level
- Current level: `demo-with-owner-ready`
- Next target: `pilot-business-ready`
- Not yet: `production-business-ready`

## 3. Stripe checkout confidence checklist
- [ ] Stripe test mode is configured and confirmed in the active pilot environment.
- [ ] Stripe live mode is intentionally not used until explicit business/operator approval.
- [ ] Checkout session creation is tested end-to-end from cart to Stripe-hosted checkout.
- [ ] Successful payment path is tested and evidence is captured.
- [ ] Cancelled checkout path is tested and storefront behavior is confirmed.
- [ ] Failed or expired payment path is tested where feasible and fallback behavior is documented.
- [ ] Webhook delivery is verified in test mode (including expected event arrival).
- [ ] Payment status updates are verified against expected order/payment state behavior.
- [ ] Order confirmation behavior is verified for timing, messaging, and data consistency.
- [ ] No real cards or live payments are used without explicit approval.

## 4. Supabase data confidence checklist
- [ ] Required environment variables are configured for the intended runtime.
- [ ] `products` table is available and readable by expected storefront flows.
- [ ] `product_images` table is available and linked behavior is verified.
- [ ] `profiles` table is available and profile read/write expectations are validated.
- [ ] `orders` and `order_items` tables are available for expected read/write paths.
- [ ] Saved-items behavior is verified for signed-in users and expected fallback conditions.
- [ ] Admin role signals in `profiles` are verified for intended admin accounts.
- [ ] RLS policies are reviewed for least-privilege alignment with pilot scope.
- [ ] localStorage fallback behavior is explicitly understood and documented.

## 5. Admin access confidence checklist
- [ ] Demo admin is disabled for production-mode runtime usage.
- [ ] Supabase-backed admin account is configured and validated.
- [ ] Admin route access is tested while authenticated as admin.
- [ ] Admin route access is denied while authenticated as non-admin.
- [ ] Runtime mode label is checked in-app for clarity during testing.
- [ ] Demo/local versus live-backed data boundaries are clearly understood by operator.

## 6. Order lifecycle confidence checklist
- [ ] Order creation is verified across the intended checkout success path.
- [ ] `order_items` creation is verified for each order.
- [ ] Customer order history visibility is verified in account experience.
- [ ] Admin order visibility is verified in admin views.
- [ ] Live Supabase order status is treated as read-only unless separately implemented.
- [ ] Fulfillment, refund, and cancellation workflows are clearly defined or explicitly marked as not yet implemented.

## 7. Storefront confidence checklist
- [ ] Home page smoke-tested for core content and navigation.
- [ ] Category pages smoke-tested.
- [ ] Search behavior smoke-tested.
- [ ] Product detail page smoke-tested.
- [ ] Cart flow smoke-tested.
- [ ] Checkout entry path smoke-tested.
- [ ] Account area smoke-tested.
- [ ] Saved items experience smoke-tested.
- [ ] Order confirmation page/route smoke-tested.
- [ ] Mobile smoke test completed across primary buyer flows.
- [ ] Policy/support pages reviewed for presence and correctness.

## 8. Business owner setup checklist
- [ ] Brand assets are finalized (logo, voice, visual consistency).
- [ ] Real products, photos, prices, and inventory are prepared for pilot usage.
- [ ] Policies are finalized (shipping, returns, privacy, terms as applicable).
- [ ] Support/contact path is operational and owned.
- [ ] Domain plan is defined (temporary or final domain for pilot).
- [ ] Stripe account ownership and environment readiness are confirmed.
- [ ] Supabase project ownership and access boundaries are confirmed.
- [ ] Production runtime flags are explicitly set for each environment.
- [ ] Admin credentials are provisioned and access-tested.

## 9. Demo/local fallback risk checklist
- [ ] Auth/session-adjacent local fallback areas are identified and documented.
- [ ] Cart/local persistence areas using browser-local state are identified and documented.
- [ ] Any demo/local fallback catalog or order behavior is identified and documented.
- [ ] Operator understands why local browser state can diverge from live operational truth.
- [ ] Pilot-facing usage either disables fallback paths, isolates them, or explains them clearly to owner/operator.

Why this matters for a real business owner:
- Browser-local state can create false confidence if data appears persistent or authoritative but is not server-trusted.
- Operational decisions (inventory, order handling, customer support) should rely on live-backed data paths.

## 10. Must-fix before pilot-business-ready

### P0 blockers
- Stripe test-mode checkout + webhook flow lacks complete evidence for success, cancel, and failure/expiry paths.
- Admin access boundaries are not verified with Supabase-backed admin and non-admin scenarios.
- Order lifecycle visibility is not verified across customer and admin surfaces.
- Demo/local fallback risks are not documented and controlled for pilot usage.

### P1 important
- Runtime-mode configuration and labeling are not consistently validated across environments.
- Policy/support pages are incomplete or not operationally owned.
- Business-owner setup artifacts (catalog quality, support workflow, operational SOP notes) are incomplete.

### P2 later
- Broader production hardening beyond pilot scope (monitoring, deeper audit trails, advanced ops tooling).
- Full fulfillment/refund/cancellation tooling implementation if currently manual.
- Launch-grade scale/performance hardening beyond pilot traffic assumptions.

## 11. Suggested next implementation sprints
1. Checkout/payment test harness and evidence capture sprint.
2. Admin access verification and trust-boundary hardening sprint.
3. Order operations MVP sprint (fulfillment/refund/cancellation baseline workflow).
4. Production runtime/environment setup guide sprint (`docs/SHOPORA_RUNTIME_ENV_SETUP_GUIDE.md`).
5. Final pilot QA sweep with sign-off rubric sprint.

## 12. Final note
This checklist exists to prevent overselling ShopOra.
It should guide a clear decision on when ShopOra is safe to show, safe to pilot, and not yet safe to fully launch.

