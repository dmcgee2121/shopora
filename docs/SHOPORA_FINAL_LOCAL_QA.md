# ShopOra Final Local QA

Milestone: `v0.27-final-local-qa-pass`

Purpose: final local QA pass before any intentional GitHub push or Netlify deploy.

## What This Pass Found

- Route-level lazy loading is still in place for the main app routes.
- The requested customer and admin routes are already present in `src/App.jsx`.
- No obvious broken route targets were found in the main navigation, footer, product cards, account links, or admin links during the audit.
- The app still uses some intentional local/demo wording in customer and admin flows to distinguish prototype behavior from live Supabase behavior.
- No risky `.env` references were introduced in the docs reviewed for this pass.

## Route Checklist

Use this as the final manual route sweep before deployment.

### Customer Routes

- [ ] `/`
- [ ] `/women`
- [ ] `/men`
- [ ] `/shoes`
- [ ] `/accessories`
- [ ] `/sale`
- [ ] `/search`
- [ ] `/product/:id`
- [ ] `/cart`
- [ ] `/checkout`
- [ ] `/order-confirmation/:orderId`
- [ ] `/login`
- [ ] `/register`
- [ ] `/account`
- [ ] `/account/orders`
- [ ] `/account/orders/:orderId`
- [ ] `/account/saved`
- [ ] `/about`
- [ ] `/contact`
- [ ] `/shipping`
- [ ] `/returns`
- [ ] `/privacy`

### Admin Routes

- [ ] `/admin/login`
- [ ] `/admin`
- [ ] `/admin/products`
- [ ] `/admin/products/new`
- [ ] `/admin/products/:id/edit`
- [ ] `/admin/orders`
- [ ] `/admin/customers`

## Link And Button Checks

- [ ] Main nav routes open the expected pages.
- [ ] Footer links open valid legal and account pages.
- [ ] Product cards open product detail pages.
- [ ] Add-to-cart and saved-item actions still work from product cards and product detail.
- [ ] Category/filter controls remain keyboard accessible.
- [ ] Admin action buttons and table links still point to the intended admin pages.

## Lazy Loading Check

- [ ] Route transitions still show the accessible loading fallback.
- [ ] Lazy-loaded routes continue to resolve without blank screens.
- [ ] The loading state still reads clearly for screen readers and remains visually consistent.

## Copy Check

- [ ] No user-facing label says `demo` where `preview` or `prototype` is clearly better.
- [ ] Any remaining `demo` wording is intentional and used to distinguish local fallback or prototype behavior.
- [ ] Empty states explain what the user should do next.
- [ ] Admin copy clearly separates local/demo behavior from live Supabase behavior.

## Layout And Responsiveness Check

- [ ] No horizontal scrolling on the main customer pages.
- [ ] Product grids wrap cleanly on tablet and mobile widths.
- [ ] Cart and checkout remain readable on smaller screens.
- [ ] Account and order cards stay stacked and scannable on mobile.
- [ ] Admin tables and panels remain usable on smaller widths.
- [ ] Admin modals, drawers, and forms do not clip off-screen.
- [ ] Tap targets remain comfortable on mobile.

## Supabase Admin Requirements

Before trusting live admin orders in a real Supabase environment:

- [ ] Apply `get_admin_orders()` in the live Supabase project.
- [ ] Use a real Supabase Auth user for admin access.
- [ ] Set `public.profiles.role = 'admin'` for that user.
- [ ] Confirm the live admin order view is still read-only unless a separate write path has been deliberately added.
- [ ] Confirm local/demo admin behavior is not being mistaken for live Supabase admin authorization.

## Admin Behavior Notes

- Local/demo admin flows remain presentation-oriented.
- Live Supabase admin order visibility depends on the protected RPC and the admin profile role.
- Admin user promotion is not exposed in the frontend and should not be added casually.
- Status-update support for live Supabase orders is still limited and should be treated as a deliberate future milestone.

## Environment And Secret Safety

- [ ] No `.env` or `.env.local` files are committed.
- [ ] Frontend env vars remain browser-safe.
- [ ] Stripe and Supabase service-role keys stay server-only.
- [ ] Docs do not instruct anyone to paste secrets into the client app.

## Before Deploy Checklist

- [ ] `git status` is clean.
- [ ] `npm run build` passes.
- [ ] `npm run preview` is used if you want a production-like local check.
- [ ] Manual route checks are complete.
- [ ] Supabase admin requirements are verified if live admin orders are part of the rollout.
- [ ] Netlify deploy is intentional, not accidental.

## Related Docs

- [ShopOra Demo QA Checklist](./SHOPORA_DEMO_QA_CHECKLIST.md)
- [ShopOra Demo Screenshot Guide](./SHOPORA_DEMO_SCREENSHOT_GUIDE.md)
- [ShopOra Production Readiness Audit](./SHOPORA_PRODUCTION_READINESS_AUDIT.md)
- [ShopOra Supabase Security Hardening Plan](./SHOPORA_SUPABASE_SECURITY_HARDENING_PLAN.md)

## Final Read

ShopOra is in a strong local demo state with route coverage, responsive fixes, accessibility cleanup, and Supabase admin guidance already documented. The remaining work before a real deployment is mostly verification: route sweep, build check, admin-role validation, and a final pass on any copy that still intentionally uses demo language.

## v0.31 Addendum

- Status: final screenshot/demo readiness pass completed locally.
- Homepage personalization: verified both fallback merchandising and recently viewed states.
- Recently viewed: verified on product detail pages and on the cart flow after viewing real catalog products.
- Route sweep: confirmed the main storefront, account, policy, search, cart, checkout, and admin entry routes render cleanly; `/orders` and `/saved` now redirect to the real account routes.
- Build: `npm run build` passed during the pass.
- Scope: still local-only; no push, no deploy, no Netlify changes, no checkout/order/Stripe changes, and no env-file changes.
