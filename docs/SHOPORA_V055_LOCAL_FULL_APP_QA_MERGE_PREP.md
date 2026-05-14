# ShopOra v0.55 Local Full App QA / Merge Prep

- Branch: `v0.55-local-full-app-qa-merge-prep`

## Purpose

- Local full-app QA checkpoint after v0.51 through v0.54.
- Intended to prepare for a future intentional merge/deploy decision.
- No push, deploy, merge, or PR performed.

## Recent Local Feature Stack

- v0.51 storefront visual merchandising polish
- v0.52 customer profile preferences polish
- v0.53 product review display polish
- v0.54 accessibility keyboard focus QA

## Current Protected Areas

These should remain untouched:

- checkout submission
- order creation
- Stripe functions
- Netlify functions/env
- Supabase RLS
- auth behavior
- env files/secrets

## QA Routes To Manually Verify

### Storefront

- `/`
- `/women`
- `/men`
- `/shoes`
- `/accessories`
- `/sale`
- `/search`
- at least two product detail pages

### Customer

- `/login`
- `/register`
- `/account`
- `/orders`
- `/saved`
- `/cart`
- `/checkout` visual load only, without changing checkout submission logic

### Policy/Support

- `/about`
- `/contact`
- `/shipping`
- `/returns`
- `/privacy`

### Admin

- `/admin/login`
- `/admin`
- `/admin/products`
- `/admin/orders`
- `/admin/customers`

## QA Checklist

- App builds successfully.
- Major routes load without crashing.
- Product grids render correctly.
- Product detail pages render correctly.
- Product cards remain clickable.
- Product review/rating display appears reasonable.
- Account/profile preference UI appears readable.
- Saved items page loads.
- Orders page loads.
- Cart page loads.
- Checkout page visually loads, but checkout submission is not modified.
- Admin shell loads.
- Admin products/orders/customers pages load.
- Keyboard focus remains visible after v0.54.
- Mobile layout remains usable.
- Browser console has no new route-breaking errors.

## Build Status

- `npm run build` result: _pending_
- Module count: _pending_
- Final QA notes: _pending_

## Recommended Next Decision

- If QA passes, consider either another safe local feature branch or an intentional merge/deploy prep plan.
- Do not push/deploy until ready to spend Netlify credits.
- Before any deploy, confirm live admin orders with `get_admin_orders()` RPC and `dmcgee2121@gmail.com` role = `admin`.
