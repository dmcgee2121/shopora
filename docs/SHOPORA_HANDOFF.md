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

## QA Checklist for Tomorrow

- Run `git status`
- Run `git checkout main`
- Run `git pull origin main`
- Run `npm run build`
- Create a new branch for the next milestone

## Summary of Current State

The app is in a good place for continued storefront refinement. The highest-priority code paths are stable, the merchandising layer is stronger, and the next phase should focus on presentation polish, admin visibility, and production hardening without disturbing the existing checkout/auth/order flows.
