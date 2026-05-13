# ShopOra Handoff Notes

## Project Overview

ShopOra is a standalone ecommerce storefront separate from ShopOraGo. The current codebase is a React + Vite storefront/admin prototype with customer-facing browsing, saved items, account areas, and a lightweight admin experience. The app is currently focused on merchandising, checkout readiness, and storefront polish rather than production hardening.

## Current Stack

- React 18
- Vite
- React Router
- Supabase client integration
- Stripe Checkout via Netlify Functions
- Local storage for some demo/local fallback flows

## Current Working Features

- Storefront browsing with department pages, product detail pages, search, cart, checkout, and order confirmation
- Supabase customer auth and customer data wiring
- Saved items / wishlist behavior
- Customer account and order history pages
- Admin product and admin order management views
- Route-level code splitting for the main app routes
- Department discovery and storefront merchandising sections on the homepage
- Product card badges and product storytelling polish
- Buyer receipt/order page polish
- Policy pages for shipping, returns, and privacy
- README documentation updates

## Recent Completed Milestones

- Supabase customer auth and customer data were wired
- Stripe Checkout works on deployed Netlify in test mode
- Local `npm run dev` remains the best path for UI work
- Local `netlify dev` can work, but it may require linked Netlify project environment variables and is sometimes fussy
- Products disappearing after load was fixed
- Buyer receipt/order pages were polished
- Policy pages were added
- Admin products and admin orders were polished
- Route-level code splitting was added
- Storefront merchandising polish was added
- README was improved

## v0.44 Customer Retention Touchpoints Polish

- Added a frontend-only customer retention polish pass on `v0.44-customer-retention-touchpoints-polish`.
- Tightened order history, order detail, saved items, cart, and account touchpoints so the buyer flow more clearly supports browsing again, revisiting favorites, and returning to the account area.
- Kept the changes honest and display-only: no real rewards backend, no points, no discounts, no store credit, and no checkout, order creation, Stripe, Netlify, Supabase RLS, or auth behavior changes.
- Added a small retention helper for frontend CTA/copy derivation from existing in-app state only.
- Documented the scope in `docs/SHOPORA_CUSTOMER_RETENTION_TOUCHPOINTS.md`.
- `npm run build` passed locally after the v0.44 edits.
- Still local-only: no push, deploy, or merge was performed.

## v0.45 Retention and Admin Link QA Pass

- Completed a local-only QA and cleanup pass on `v0.45-retention-and-admin-link-qa-pass` for the customer retention touchpoints and admin routes.
- Verified the scoped `Link` / `NavLink` imports in the admin and customer retention surfaces are present where JSX uses them, including the earlier `/admin/customers` `Link` fix.
- Re-checked the admin and customer-facing route surfaces at the source level for obvious broken imports, undefined CTA references, and invalid retention links; no new code changes were required.
- Routes reviewed in this pass: `/admin`, `/admin/products`, `/admin/orders`, `/admin/customers`, `/admin/login`, `/account`, `/orders`, `/account/orders`, `/saved`, `/account/saved`, `/cart`, `/checkout`, plus the existing order detail and order confirmation route patterns already used by the app.
- Build verification still passes locally.
- Still local-only: no push, deploy, or merge was performed.

## v0.46 Customer Support and Help Polish

- Added a local-only customer support/help polish pass on `v0.46-customer-support-and-help-polish`.
- Improved the customer-facing support pages and support touchpoints around contact, shipping, returns, account, orders, cart, and checkout with clearer help-oriented copy and frontend-only support CTAs.
- Added a small reusable `SupportLinkStrip` component and a shared support-link utility so the help paths stay consistent without introducing any backend support workflow.
- Kept the changes prototype-safe: no real support tickets, no live chat, no guaranteed response times, no checkout/order creation/Stripe/Netlify/Supabase RLS/auth changes, and no support backend work.
- Created `docs/SHOPORA_CUSTOMER_SUPPORT_NOTES.md` for the frontend-only support scope and future upgrade ideas.
- `npm run build` passed locally after the v0.46 edits.
- Still local-only: no push, deploy, or merge was performed.

## v0.47 Customer Trust and Policy QA Pass

- Completed a local-only trust, support, and policy QA pass on `v0.47-customer-trust-and-policy-qa-pass`.
- Tightened prototype-safe wording on the contact and privacy pages so the support language stays clearly presentation-only and does not imply a live ticketing or response system.
- Re-reviewed the customer trust and policy surfaces for route/link consistency and confirmed the support CTA paths point to existing storefront routes.
- Routes reviewed in this pass: `/contact`, `/shipping`, `/returns`, `/privacy`, `/about`, `/cart`, `/checkout`, `/account`, `/orders`, `/saved`, plus the existing order detail and order confirmation route patterns already used by the app.
- Created `docs/SHOPORA_CUSTOMER_TRUST_POLICY_QA.md` to capture the QA scope and limitations.
- Build verification still passes locally.
- Still local-only: no push, deploy, or merge was performed.

## v0.48 Post-Customer Local Merge Prep

- Created a local-only merge/deploy readiness checkpoint on `v0.48-post-customer-polish-local-merge-prep`.
- Compared the current local branch against deployed `main` and documented the work that would be included in a future merge.
- Completed a sensitive-file check and confirmed `.env` / `.env.local` are not tracked.
- Added `docs/SHOPORA_POST_CUSTOMER_LOCAL_MERGE_PREP.md` with the branch chain, diff summary, sensitive-file check, build result, and future deploy reminders.
- Build verification still passes locally.
- Still local-only: no push, deploy, or merge was performed.
- Next recommended step: decide later whether to keep building locally or intentionally merge/deploy after a deliberate review.

## v0.42 Local Merge Prep After Admin Polish

- Prepared a local-only merge/deploy readiness summary after the admin polish chain and storefront QA pass.
- Compared the current local branch against deployed `main` without merging or pushing.
- Added a dedicated merge-prep note that records the branch chain, sensitive-file check, build result, route sweep checklist, and Netlify/Supabase reminders.
- Kept checkout submission, order creation, Stripe functions, Netlify behavior, Supabase RLS, and auth behavior untouched.
- Verified with `npm run build` locally on branch-only work.
- Still local-only: no push, deploy, or merge was performed.

## v0.41 Storefront Post-Admin Polish Pass

- Completed a local-only storefront and customer QA sweep after the admin-focused milestone work.
- Fixed a small account order-history copy artifact so the order date and item count separator renders cleanly.
- Verified the storefront, discovery, cart, checkout, account, orders, and saved routes still fit together cleanly.
- Kept checkout submission, order creation, Stripe functions, Netlify behavior, Supabase RLS, and auth behavior untouched.
- Verified with `npm run build` locally on branch-only work.
- Still local-only: no push, deploy, or merge was performed.

## v0.40 Admin Local QA and Handoff

- Completed a local-only QA sweep across the admin surface to verify the v0.35 through v0.39 polish passes work together cleanly.
- Checked the admin routes `/admin/login`, `/admin`, `/admin/products`, `/admin/products/new`, `/admin/products/:id/edit`, `/admin/orders`, and `/admin/customers` locally.
- Verified the admin readiness flow still reads coherently across dashboard, products, product editor, orders, and customers.
- Kept checkout submission, order creation, Stripe functions, Netlify behavior, Supabase RLS, auth behavior, and env handling untouched.
- Verified with `npm run build` locally on branch-only work.
- Still local-only: no push, deploy, or merge was performed.

## v0.39 Admin Customers Relationship Polish

- Added a clearer customer relationship summary on the admin customers page with totals for customers, customers with orders, saved-item activity, returning customers, recent activity, total spend, and average order value.
- Added a compact relationship snapshot that previews active storefront accounts and highlights new, returning, high-value, and recently active customers using existing order and saved-item data.
- Refined customer table and mobile card labels so relationship status, activity, spend, and saved-item signals are easier to scan without changing auth, order, or customer data behavior.
- Kept checkout submission, order creation, Stripe functions, Netlify behavior, Supabase RLS, and auth behavior untouched.
- Verified with `npm run build` locally on branch-only work.
- Still local-only: no push, deploy, or merge was performed.

## v0.38 Admin Orders Operations Polish

- Added a clearer admin orders operations summary with paid, payment-pending, processing, shipped/fulfilled, cancelled/refunded, needs-attention, and recent-activity signals.
- Added a compact order attention preview that reuses the catalog-readiness helper so order issue labels stay consistent across the admin area.
- Improved live Supabase versus local-demo messaging so the page is honest about read-only live order behavior while still being useful for prototype review.
- Refined the order detail modal, empty states, and mobile order cards for easier scanning without changing checkout, order creation, Stripe, Supabase RLS, Netlify, or env behavior.
- Verified with `npm run build` locally on branch-only work.
- Still local-only: no push, deploy, or merge was performed.

## v0.37 Admin Dashboard Store Readiness Polish

- Added a compact admin dashboard store-readiness section that summarizes total products, active products, low stock, out of stock, products needing attention, and missing merchandising information.
- Added a dashboard "Needs attention" preview that reuses the catalog-readiness helper so product issues stay consistent with the admin products and editor guidance work.
- Refined dashboard quick actions to better support the operational flow: add product, review catalog, review orders, view customers, and check storefront readiness.
- Kept checkout submission, order creation, Stripe functions, Netlify behavior, Supabase RLS, and env handling untouched.
- Verified with `npm run build` locally on branch-only work.
- Still local-only: no push, deploy, or merge was performed.

## v0.36 Product Editor Guidance Polish

- Added editor guidance to the admin product create/edit page for name, brand, SKU, price, sale pricing, stock count, category, department, description, images, and merchandising detail fields.
- Added a live product readiness panel that checks the current draft for storefront-readiness signals and highlights missing or weak merchandising data.
- Refined the storefront preview copy so it communicates status, stock state, and draft completeness more clearly without changing save behavior.
- Kept checkout submission, order creation, Stripe functions, Netlify behavior, Supabase RLS, and env handling untouched.
- Verified with `npm run build` locally on branch-only work.
- Still local-only: no push, deploy, or merge was performed.

## v0.35 Admin Catalog Readiness Polish

- Added a compact admin catalog readiness summary on the products page with totals for active products, draft/inactive records, low stock, out of stock, catalog gaps, and sale/featured merchandising signals.
- Added a defensive "Catalog readiness" panel that highlights products needing attention for missing images, brands, SKUs, prices, stock counts, descriptions, details, or inactive status.
- Tightened the admin product table and mobile card copy so incomplete stock data is labeled clearly instead of being treated as a normal zero-inventory item.
- Kept checkout submission, order creation, Stripe functions, Netlify behavior, Supabase RLS, and env handling untouched.
- Verified with `npm run build` locally on `main`-derived branch work only.
- Still local-only: no push, deploy, or merge was performed.

## GitHub / Netlify Workflow

- Use GitHub branches for milestone work
- Keep changes small and focused, then open a PR or merge request when ready
- Use Netlify preview deploys for UI review when branch previews are available
- Use the deployed Netlify site for Stripe Checkout QA, especially when local function wiring is unreliable
- Treat the deployed test environment as the reliable path for end-to-end payment verification

## Local Development Workflow

- Install dependencies with `npm install`
- Start the app with `npm run dev`
- Use this path for most storefront, layout, and merchandising work
- Use `npm run build` before handoff or milestone completion
- If you need a production-like local check, use `npm run preview` after building

## Local Stripe / Netlify Dev Notes

- Local Stripe testing may still be annoying
- `netlify dev` may require a linked Netlify project and the correct environment variables
- If local Stripe behavior is flaky, use the deployed Netlify environment for QA instead
- Do not change checkout submission logic or order creation logic while debugging Stripe setup

## Environment Variable Safety

- Keep server-only keys out of GitHub
- Do not commit `.env` or `.env.local`
- Keep frontend-exposed values limited to browser-safe variables
- Treat Supabase and Stripe secrets as environment-managed values only
- Preserve existing Netlify env handling

## Known Issues / Watch Items

- Vite may still show non-blocking chunk-size warnings depending on build output
- Local Stripe testing can still be cumbersome; deployed Netlify is the reliable Stripe QA path
- Admin/demo auth is prototype-level and should not be treated as production security
- Future production hardening should revisit admin auth, RLS, Stripe webhook confidence, and final policy/legal copy
- Admin live order visibility now depends on the `get_admin_orders()` Supabase RPC plus an admin profile role in `public.profiles`
- The demo checklist lives at `docs/SHOPORA_DEMO_QA_CHECKLIST.md`
- The final local QA pass lives at `docs/SHOPORA_FINAL_LOCAL_QA.md`
- The production-readiness audit lives at `docs/SHOPORA_PRODUCTION_READINESS_AUDIT.md`
- The Supabase security hardening plan lives at `docs/SHOPORA_SUPABASE_SECURITY_HARDENING_PLAN.md`
- The demo and screenshot guide lives at `docs/SHOPORA_DEMO_SCREENSHOT_GUIDE.md`

## Recommended Next Milestones

- Admin dashboard analytics polish
- Product detail page merchandising polish
- Catalog filters / sorting refinement
- Customer account / profile polish
- Production security / RLS review
- Client demo checklist
- Portfolio case study / screenshots

## v0.31 Final Screenshot / Demo Pass

- Completed a local screenshot/demo readiness sweep across the public storefront, account area, saved/orders aliases, and admin entry routes.
- Verified homepage personalization in both states:
  - fallback merchandising shows when there are no recently viewed products
  - recently viewed products appear after visiting real product detail pages
- Verified recently viewed behavior on product detail pages and the cart flow using real catalog product IDs from the current local session.
- Added small route polish so `/orders` and `/saved` now resolve to the real account routes instead of landing on the 404 page.
- Kept the work local-only: no push, no deploy, no Netlify changes, no checkout/order/Stripe logic changes, and no env-file changes.
- `npm run build` passed as part of the pass.

## v0.32 Merge / Deploy Prep

- Completed a local-only merge/deploy readiness pass on `v0.32-merge-prep-for-intentional-deploy`.
- Compared the branch against `main` without merging or pushing.
- Created `docs/SHOPORA_DEPLOY_PREP_CHECKLIST.md` with pre-deploy checks, route sweep items, Supabase admin requirements, Netlify deploy warnings, and rollback notes.
- Confirmed `.env.local` is ignored and the only tracked env-related file found was `.env.example`.
- No push, deploy, Netlify action, or merge to `main` was performed.
- `npm run build` passed for this prep pass.
- Next recommended step: intentionally merge and deploy only when ready, after recording the current production commit and verifying the Supabase admin requirements.

## v0.33 Customer Account Dashboard Polish

- Polished the local-only customer account landing page on `v0.33-customer-account-dashboard-polish`.
- Added a dashboard-style account overview with profile readiness, order count, saved item count, member-since details, and department shopping shortcuts.
- Added polished order and saved-item preview states, including useful empty-state CTAs for accounts with no orders or saved items.
- Added a compact continue-shopping section that uses recently viewed products when available and recommendation fallback products otherwise.
- Checked the customer account routes `/account`, `/orders`, and `/saved` during local QA.
- No checkout submission, order creation, Stripe, Netlify, RLS, push, deploy, or merge changes were performed.
- `npm run build` passed for this polish pass.

## v0.34 Product Discovery Experience Polish

- Polished product discovery locally on `v0.34-product-discovery-experience-polish`.
- Added reusable discovery helpers for department profiles, shortcut links, category discovery picks, search suggestions, and search landing products.
- Added department discovery panels, top-pick product sections, and compact shortcut cards to category routes including women, men, shoes, accessories, and sale.
- Improved the no-query search landing state with suggested searches, department CTAs, and recommended starting products.
- Improved search no-results support with clearer actions, department links, suggested searches, and recommendation fallback products.
- Kept existing catalog filters, sorting, product cards, product links, and saved-item behavior intact.
- No checkout submission, order creation, Stripe, Netlify, RLS, push, deploy, or merge changes were performed.
- `npm run build` passed for this discovery polish pass.

## v0.43 Customer Loyalty Lite Polish

- Added a frontend-only customer loyalty-lite polish layer on `v0.43-customer-loyalty-lite-polish`.
- Added a ShopOra member benefits section and a small member-journey readiness card to the account page using only existing profile, saved-item, order, and recently viewed data.
- Refined saved-items and cart empty-state copy so the customer experience feels more like a polished department-store wishlist and account workflow without implying real rewards or redemption balances.
- Kept the work honest and display-only: no loyalty backend, no points table, no discounts, no store credit, and no checkout or order behavior changes.
- Created `docs/SHOPORA_CUSTOMER_LOYALTY_LITE_NOTES.md` to capture the frontend-only scope and future upgrade ideas.
- `npm run build` passed for this loyalty-lite pass.
- Still local-only: no push, no deploy, no merge, and no Netlify changes.

## QA Checklist for Tomorrow

- Run `git status`
- Run `git checkout main`
- Run `git pull origin main`
- Run `npm run build`
- Create a new branch for the next milestone

## Summary of Current State

The app is in a good place for continued storefront refinement. The highest-priority code paths are stable, the merchandising layer is stronger, and the next phase should focus on presentation polish, admin visibility, and production hardening without disturbing the existing checkout/auth/order flows.
