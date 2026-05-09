# ShopOra Production Readiness Audit

Milestone: `v0.22-production-readiness-audit`

Scope: documentation-first audit for launch readiness. This is a planning and risk document, not a behavior change.

See also: [docs/SHOPORA_SUPABASE_SECURITY_HARDENING_PLAN.md](./SHOPORA_SUPABASE_SECURITY_HARDENING_PLAN.md)
See also: [docs/SHOPORA_DEMO_SCREENSHOT_GUIDE.md](./SHOPORA_DEMO_SCREENSHOT_GUIDE.md)

## 1. Current Project State

### What is working

- React + Vite storefront and admin app with route-based navigation.
- Public storefront routes:
  - `/`
  - `/women`
  - `/men`
  - `/shoes`
  - `/accessories`
  - `/sale`
  - `/product/:id`
  - `/search`
  - `/cart`
  - `/checkout`
  - `/order-confirmation/:orderId`
  - `/about`
  - `/contact`
  - `/shipping`
  - `/returns`
  - `/privacy`
  - `/login`
  - `/register`
- Customer account routes:
  - `/account`
  - `/account/orders`
  - `/account/orders/:orderId`
  - `/account/saved`
- Admin routes:
  - `/admin/login`
  - `/admin`
  - `/admin/products`
  - `/admin/products/new`
  - `/admin/products/:id/edit`
  - `/admin/orders`
  - `/admin/customers`
- Storefront polish is in place for:
  - homepage merchandising
  - product detail presentation
  - catalog filters and sorting
  - checkout confidence cues
  - customer account/profile presentation
  - admin dashboard analytics polish
  - admin product editor polish
  - admin orders fulfillment polish
  - admin customers directory polish
- Supabase-backed customer features exist for authenticated users, including profile and saved-item/order reads where configured.
- `get_admin_orders()` RPC support exists for live admin order visibility.
- Stripe Checkout is wired through Netlify Functions for the supported customer checkout path.

### What is prototype/demo

- Demo auth still exists alongside Supabase customer auth flows.
- Client-side route protection is still part of the security model.
- Product catalog, cart, and some order flows still have browser-local/demo behavior.
- Local demo users and some demo records are stored in browser storage.
- Admin capabilities in the demo experience are not the same thing as Supabase-trusted admin authorization.
- Live admin order writes/status updates are not yet production-complete.
- Some copy, seeded data, and operational flows are still tuned for demo quality rather than live operations.

### What is production-adjacent but still needs review

- Checkout page behavior and payment confidence, especially around deployment context and function reliability.
- Supabase profile, order, and saved-item persistence as a production data model.
- Admin read/write separation for live orders and fulfillment.
- RLS policy coverage and role enforcement.
- Environment variable hygiene for local, preview, and deployed contexts.
- Mobile responsiveness across storefront, account, checkout, and admin pages.

## 2. Frontend Readiness

### Storefront

- The public home and merchandising surfaces are in a good presentation state.
- Category browsing is available by department and sale view.
- Trust and brand messaging are already improved enough for a strong demo.
- Remaining work is mostly validation and edge-case cleanup rather than new feature design.

### Product browsing

- Product detail and browsing flows are polished.
- Search, filtering, and sorting have already received refinement work.
- The browsing experience is good enough for demo review.
- Production review should still check empty states, broken image handling, and deep-link behavior.

### Cart

- Cart UX exists and is integrated into the main storefront flow.
- Cart state still needs production review for persistence expectations and multi-device behavior.
- Cart totals, item quantity handling, and edge-case recalculation should be checked again before launch.

### Checkout page

- The checkout page is functional enough for guided demo flow.
- Confidence messaging and user guidance are already improved.
- Production readiness still depends on end-to-end verification in the intended deployment environment.
- Do not change checkout submission logic as part of this audit.

### Customer account

- Account/profile presentation is in a better state than earlier milestones.
- Order history and saved-items areas exist.
- Remaining work is mostly around data trust, persistence, and production authorization behavior.

### Admin pages

- Admin dashboard, products, orders, and customers pages are present and polished.
- Admin orders now support Supabase live visibility through the secure read path.
- The current admin UX is still mixed-mode: some data is live, some is local/demo, and some actions remain limited.

### Responsive/mobile checks

- Mobile checks are still required across:
  - homepage
  - category pages
  - product detail
  - cart
  - checkout
  - account pages
  - admin dashboard and tables
- Table-heavy admin views need special attention on smaller screens.
- The production launch bar should include a full pass on at least one narrow mobile width and one mid-size tablet width.

## 3. Supabase Readiness

### Auth

- Supabase auth is wired for customer-facing flows.
- The current project still needs a production review of auth boundaries between customer identity, demo identity, and admin identity.
- Do not treat local demo auth as authoritative for production.

### Profiles

- `public.profiles` is part of the current model and is used for admin role checks.
- The profile record should be verified against `auth.users.id` before launch.
- Any profile fields used in the UI should be reviewed for completeness and null-safety.

### Saved items

- Saved items are already part of the Supabase-backed customer flow.
- This path should be checked for RLS coverage, duplicate prevention, and owner-only access.

### Orders

- Customer order persistence exists and is important to the launch path.
- The order model should be reviewed for snapshot fidelity, ownership, and status transitions.
- Local/demo orders should remain clearly separated from production order data.

### `order_items`

- The order item snapshot model needs the usual production checks:
  - product name stability
  - image stability
  - unit price fidelity
  - size/color snapshotting
  - owner-only read access through the order relationship

### `get_admin_orders()` RPC

- This RPC is the current live admin order read path.
- It is a key production-adjacent dependency and should be treated as required infrastructure, not optional demo sugar.
- The RPC should be verified for:
  - correct output shape
  - admin-only access
  - no leakage of unrelated customer data
  - stable behavior when orders are empty or partially populated

### RLS review needs

- RLS should be reviewed for:
  - profiles
  - saved items
  - orders
  - order_items
  - any admin-only read paths
- The review should confirm that the client cannot read or mutate another user's records.
- Any current UI role flag should be assumed untrusted until backed by server policy.

### Admin role setup

- Admin access must be verified through a real Supabase-authenticated user with the correct profile role.
- The admin role should not rely on demo-only local state.
- Production readiness requires a clear answer to:
  - who can read admin orders
  - who can edit product records
  - who can change fulfillment status
  - who can access customer-sensitive data

## 4. Stripe / Netlify Readiness

### Stripe Checkout

- Stripe Checkout is wired for the supported customer flow.
- Test-mode behavior has been validated in earlier milestones, but production launch still needs deliberate deployment validation.
- Checkout should be treated as production-adjacent until payment and order handling are confirmed in the target environment.

### Netlify Functions

- Netlify Functions are part of the checkout integration surface.
- Function behavior should be reviewed without changing the checkout or order-creation contracts.
- Any function-side assumptions should be rechecked before launch, especially if deployment environment variables differ from local values.

### Deployed testing expectations

- Real payment-path validation should happen in a deliberate deployed test environment, not only local development.
- The final launch checklist should confirm:
  - test checkout completes
  - order records are created as expected
  - post-checkout pages resolve correctly
  - admin order visibility matches expectations

### Local `netlify dev` caveats

- Local `netlify dev` can be useful, but it is not always the most reliable path for Stripe verification.
- It may depend on the correct linked project and environment variables.
- If local function behavior is flaky, the deployed test environment is the more trustworthy QA path.

### Environment variable safety

- Keep secret values out of the frontend bundle and out of git history.
- Do not commit `.env` or `.env.local`.
- Verify that any Stripe and Supabase values intended for the browser are actually safe for client exposure.
- Treat server-only keys as server-only in all environments.

## 5. Admin / Security Gaps

### Local/demo admin vs Supabase admin

- The local/demo admin experience should be treated as a presentation layer only.
- Supabase admin should be the only path considered for real production admin behavior.
- This distinction needs to stay obvious in the docs and in any future rollout plan.

### Live admin orders read-only limitation

- Live Supabase admin order reads are available.
- Status updates for live orders remain limited and should be treated as a production gap until backend support exists.
- Production launch should not assume live fulfillment writes are complete.

### Role management

- Role management needs a clear server-trusted model.
- UI checks alone are not enough for production.
- The admin path should be audited for role escalation risk and accidental overexposure.

### Status update support

- Status update behavior should be explicitly defined for:
  - demo/local orders
  - live Supabase orders
- If live order updates remain read-only, that constraint should be documented and intentionally accepted until the backend path is added.

### Production admin hardening

- Admin views should be checked for:
  - unauthorized access attempts
  - data leakage in list/detail views
  - stale state after updates
  - browser refresh behavior
  - empty-state correctness
- Treat admin hardening as a pre-launch requirement, not a nice-to-have.

## 6. Data / Content Readiness

### Product data quality

- The catalog is useful for demo work, but production readiness still depends on consistent data quality.
- Review:
  - names
  - prices
  - sale flags
  - stock counts
  - categories and departments
  - image coverage
  - size/color coverage

### Seeded / demo customers

- Seeded demo customers are useful for local review but should not be mistaken for production customers.
- Any demo password or local profile data must not be allowed to influence launch decisions.

### Policy copy

- Policy pages exist and should be reviewed for completeness and legal accuracy before any real launch.
- Shipping, returns, and privacy copy should be considered a launch blocker if they are incomplete or inaccurate.

### Brand copy

- Brand and merchandising copy are in a stronger state than before.
- Final review should still check tone consistency, product storytelling, and whether the copy reads like a live store instead of a demo.

### Screenshots / demo polish

- The project is currently in a good state for screenshots and portfolio capture.
- Before launch, confirm that the visual polish holds up on:
  - the home page
  - a category page
  - a product detail page
  - checkout
  - customer account
  - admin dashboard

## 7. QA Checklist Before Intentional Deployment

- Run `git status` and confirm the tree is intentionally clean.
- Run `npm run build`.
- Run `npm run preview`.
- Manually verify routes:
  - `/`
  - `/women`
  - `/men`
  - `/shoes`
  - `/accessories`
  - `/sale`
  - `/product/:id`
  - `/search`
  - `/cart`
  - `/checkout`
  - `/account`
  - `/account/orders`
  - `/account/orders/:orderId`
  - `/account/saved`
  - `/admin`
  - `/admin/products`
  - `/admin/products/new`
  - `/admin/products/:id/edit`
  - `/admin/orders`
  - `/admin/customers`
- Confirm the Supabase SQL / RPC changes expected by the app are already applied.
- Verify the admin role with a real Supabase-authenticated test user.
- Confirm that no `.env` files are committed.
- Confirm checkout behavior in the intended deployment environment.

## 8. Recommended Next Milestones

1. **Production Supabase hardening**
   - Finish the RLS and role review first because it protects customer data and admin access.
2. **Live admin fulfillment support**
   - Add or confirm a safe backend path for order status updates so admin operations are not read-only forever.
3. **Deployment-context payment verification**
   - Recheck Stripe Checkout and Netlify Functions in the intended deployed test flow before a real launch.
4. **Replace remaining demo-local persistence**
   - Reduce or isolate browser-local fallbacks for catalog, cart, and order-related state where production expects server-trusted data.
5. **Policy and content finalization**
   - Lock shipping, returns, privacy, and brand copy once the technical path is stable.
6. **Mobile and table QA sweep**
   - Finish a final responsive pass so the storefront and admin pages hold up on smaller screens.

## 9. Red / Yellow / Green Risk Summary

### Red

- Client-side-only admin trust is not sufficient for production.
- RLS and role enforcement need final review before a real launch.
- Live admin order status updates are still limited.
- Demo/local auth and demo passwords must not be treated as production-grade security.
- Any committed secret or unsafe environment variable would be a launch blocker.

### Yellow

- Mobile/table responsiveness still needs a deliberate final pass.
- Product data, seeded demo content, and policy copy need production review.
- Local `netlify dev` reliability is not guaranteed for payment-path verification.
- Browser-local fallback state still creates ambiguity if not clearly isolated from production behavior.

### Green

- Core storefront browsing is demo-ready.
- Product merchandising and product-detail presentation are in a strong state.
- Customer account pages are present and usable.
- Admin dashboard and admin order visibility are in a good demo state.
- The project has enough structure for a serious pre-launch audit and a controlled next milestone plan.

## Bottom Line

ShopOra is in a credible demo-ready state with several production-adjacent pieces already in place, especially the storefront, admin presentation, and Supabase customer flows. The remaining launch blockers are mostly around server-trusted authorization, RLS, live admin write support, deployment-context payment verification, and final content/legal/mobile review.

