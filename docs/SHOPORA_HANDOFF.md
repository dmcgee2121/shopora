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

## Recommended Next Milestones

- Admin dashboard analytics polish
- Product detail page merchandising polish
- Catalog filters / sorting refinement
- Customer account / profile polish
- Production security / RLS review
- Client demo checklist
- Portfolio case study / screenshots

## QA Checklist for Tomorrow

- Run `git status`
- Run `git checkout main`
- Run `git pull origin main`
- Run `npm run build`
- Create a new branch for the next milestone

## Summary of Current State

The app is in a good place for continued storefront refinement. The highest-priority code paths are stable, the merchandising layer is stronger, and the next phase should focus on presentation polish, admin visibility, and production hardening without disturbing the existing checkout/auth/order flows.
