# ShopOra v1.22 Portfolio Demo Walkthrough Script

## Scope

This checkpoint is documentation-only. It provides a polished walkthrough script for presenting ShopOra as a portfolio demo. It does not change app behavior.

## Demo Goal

Show ShopOra as a credible React storefront and admin prototype with:

- a clean customer journey
- persisted account data
- saved-items persistence
- read-only order history direction
- an admin operations story
- Stripe Checkout readiness
- a local-first release-batch workflow

## Suggested Demo Order

1. Home page
2. Category/search browsing
3. Product detail
4. Saved items
5. Account profile persistence
6. Order history/read-only behavior
7. Cart
8. Checkout render-only/test-mode explanation
9. Admin dashboard
10. Admin products
11. Admin orders prototype/read-only workflow

## Talking Points

- ShopOra is built as a React 18 + Vite app with routed customer and admin experiences.
- Supabase handles auth-backed persistence for the customer account, saved items, and order history paths.
- Saved items persist across visits for the supported auth source split.
- Order history is intentionally read-only for the live Supabase customer flow.
- The admin area is a prototype operational surface, not a live write console yet.
- Stripe Checkout is wired and documented with a test-mode confidence checklist.
- The release process stays local-first and batch-oriented because deploy credits are limited.

## Short Version: 2-Minute Walkthrough

Use this when the goal is a fast overview.

1. Home page.
2. Category or search browsing.
3. One product detail page.
4. Saved items.
5. Account profile and order history.
6. Cart and checkout render-only note.
7. Admin dashboard and admin orders.

### 2-Minute Script

“ShopOra is a React 18 and Vite storefront with a clear customer and admin split. On the customer side, it supports discovery through the home page, browsing by category or search, product detail pages, saved items, profile persistence, and read-only order history. On the operations side, the admin dashboard and admin orders views give a realistic fulfillment and support workflow, but the live Supabase path is still read-only where it should be. Checkout is in place and documented for test-mode use, and the project stays local-first so releases can be batched carefully instead of spending deploy credits on every small change.”

## Long Version: 5-7 Minute Walkthrough

Use this when you want a more complete story without dragging the demo out.

### 1. Home Page

Script:

“I’ll start on the home page because it shows the core storefront story immediately. This is a React and Vite app with a polished merchandising layout, featured products, and a clear shopping path.”

Callouts:

- product discovery
- visual merchandising
- overall storefront tone
- route-based structure

### 2. Category Or Search Browsing

Script:

“From here I can move into category browsing or search. That shows the app is not just a static landing page. It supports practical product discovery with filters and browsing depth.”

Callouts:

- category navigation
- search flow
- filtering and browsing confidence
- route coverage

### 3. Product Detail

Script:

“On a product detail page, the app shows the product image, pricing, and merchandising detail that a real storefront needs. This is where the buying story becomes concrete.”

Callouts:

- product imagery
- pricing clarity
- buying confidence cues
- responsive product presentation

### 4. Saved Items

Script:

“Saved items are persisted, so this is a good moment to show repeat-visit behavior. That makes the app feel like a real account-based storefront instead of a one-off catalog.”

Callouts:

- persisted wishlist-style behavior
- repeat visit value
- local/demo versus Supabase-backed split

### 5. Account Profile Persistence

Script:

“The account area shows persisted profile data and customer self-service context. This helps demonstrate that the app handles real account state, not just browsing state.”

Callouts:

- Supabase auth-backed persistence
- profile fields surviving refresh
- clear account copy

### 6. Order History And Read-Only Behavior

Script:

“Order history is intentionally read-only in the live Supabase path. That matters because it shows the app can surface real order data without implying unsupported live edits.”

Callouts:

- read-only order recovery
- honest live/local distinction
- support-friendly receipt story

### 7. Cart

Script:

“The cart keeps the shopping flow grounded. It shows the app still handles the basics cleanly before checkout.”

Callouts:

- item count and totals
- shopping continuity
- no business logic caveats

### 8. Checkout Render-Only And Test-Mode Explanation

Script:

“Checkout is present and ready for test-mode verification, but for a portfolio demo I’d treat it as render-only unless I’m intentionally doing a test checkout. That keeps the demo honest and avoids accidental live payment claims.”

Callouts:

- Stripe Checkout readiness
- test-mode only framing
- no live payment promises

### 9. Admin Dashboard

Script:

“The admin dashboard gives the operations story. It summarizes live order activity and makes the customer-support side of the app feel real.”

Callouts:

- operational summary
- live/local source distinction
- readiness and attention signals

### 10. Admin Products

Script:

“Admin products shows that the app also has catalog-side operations and merchandising controls. That rounds out the product story beyond the storefront itself.”

Callouts:

- catalog readiness
- product health signals
- merchandising confidence

### 11. Admin Orders Prototype And Read-Only Workflow

Script:

“Admin orders is the clearest place to explain the prototype boundary. The live Supabase path is still read-only, and the interface is set up to show the future operations workflow without pretending live mutation is ready.”

Callouts:

- prototype/read-only distinction
- fulfillment readiness copy
- order attention flags
- contact context
- next-step planning

## Honest Caveats To Say Out Loud

- Admin order mutation remains prototype/read-only in the live Supabase path.
- Checkout should be shown in test mode or render-only unless intentionally testing.
- Netlify deploys should be batched because deploy credits are limited.
- Local/demo behavior should not be presented as production admin authorization.

## Suggested Closing Line

“ShopOra is already strong as a customer-facing storefront and as a documented operations prototype. The app demonstrates the right architecture and workflow boundaries, and the remaining work is mostly about deciding which pieces deserve a controlled release batch next.”

## No-Touch Areas Preserved

- Checkout submission.
- Order creation.
- Cart business logic.
- Stripe functions.
- Netlify functions and environment settings.
- Supabase RLS.
- Auth behavior.
- Env files and secrets.
- Package and dependency files.
- Backend schema work.
- Live order mutation behavior.

## Confirmation

This checkpoint does not change app behavior. It only records a portfolio demo walkthrough script for future presentation use.
