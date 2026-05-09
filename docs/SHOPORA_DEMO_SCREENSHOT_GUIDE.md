# ShopOra Demo and Screenshot Guide

Milestone: `v0.24-demo-data-and-screenshot-polish`

Purpose: make ShopOra easier to present in demos, screenshots, and portfolio review without changing persistence or backend behavior.

## 1. Recommended Demo Data

### Demo customer names

Use a small, memorable set of names so screenshots feel intentional:

- Avery Chen
- Jordan Rivera
- Maya Patel
- Sam Taylor

Optional supporting names for a fuller directory:

- Riley Brooks
- Casey Morgan
- Priya Shah
- Theo Johnson

### Demo admin expectations

- Use the seeded local demo admin only for local presentation work.
- For real Supabase testing, use a real authenticated admin user with `public.profiles.role = 'admin'`.
- Expect live Supabase admin orders to be readable through `get_admin_orders()` but not necessarily editable yet.
- Keep the local demo admin clearly separate from the real Supabase admin account in any screenshot or walkthrough.

### Sample order statuses to show

Choose a set that tells a clear operations story:

- Pending
- Processing
- Shipped
- Delivered
- Cancelled

For screenshots, a strong sequence is:

1. One pending order
2. One processing order
3. One shipped order
4. One delivered order
5. One cancelled order only if you want to show exception handling

### Sample product states to show

Use products that visually demonstrate merchandising depth:

- Sale item
- New arrival
- Low stock item
- Out of stock item
- Standard in-stock item with no badge

Recommended mix:

- one sale product with a strong discount badge
- one new product near the top of the catalog
- one low-stock product to show urgency
- one out-of-stock product to show catalog handling
- one evergreen full-price product for balance

## 2. Cleaning Local Demo Data Before Screenshots

### Why this matters

Browser-local demo state can make screenshots look inconsistent:

- stale cart contents
- old demo orders
- repeated test accounts
- saved items from earlier sessions
- edited local catalog data that no longer matches the intended story

### Recommended reset steps

Use a clean browser profile or incognito window when possible.

If you want to keep the same browser profile, clear the local demo storage before capturing screenshots:

- `shopora_users`
- `shopora_current_user`
- `shopora_orders`
- `shopora-cart-v1`
- `shopora_product_catalog_v1`
- `shopora-recently-viewed-v1`

Suggested approach:

1. Sign out of any current session.
2. Clear the ShopOra local storage keys listed above.
3. Reload the app.
4. Sign in with the intended demo customer or demo admin account.
5. Rebuild the cart, saved items, and order state that you want to show.

### Screenshot hygiene tips

- Use a single customer identity consistently within a screenshot set.
- Keep product counts and order counts believable.
- Avoid mixing local demo admin behavior with live Supabase admin behavior in the same narrative.
- If the catalog is using seeded demo data, do not show stale half-edited items in the same set.

## 3. Supabase Demo Testing Guidance

### Required admin setup

- A real Supabase-authenticated admin user must exist.
- `public.profiles.role` must be set to `admin` for that user.
- `get_admin_orders()` must be applied in the live Supabase project.

### Read-only expectation

- Live Supabase admin orders may still be read-only in the frontend.
- That is acceptable for now if the goal is screenshots, demos, or review.
- Make sure the demo narrative does not promise live admin write support unless it has been intentionally added.

### Safe verification sequence

1. Sign in with the real Supabase admin account.
2. Confirm the admin dashboard loads.
3. Confirm admin orders appear through the protected RPC path.
4. Confirm the order list reflects only the data you expect to present.
5. Confirm the admin UI labels clearly distinguish live Supabase data from local demo data where relevant.

## 4. Suggested Screenshot Set

Capture the app in this order for a clean portfolio narrative:

### Homepage

- Show the hero, trust strip, and merchandising blocks.
- Prefer a scroll position that includes the main brand story and a visible product grid or featured section.

### Category page with filters

- Show one department page with filters or sorting open.
- Capture a state with visible filter controls and a meaningful product subset.

### Product detail page

- Capture a product with a strong image, pricing, and status badges.
- If possible, choose one sale item and one regular item for variety.

### Cart

- Show 2 to 4 items so the cart feels real without looking cluttered.
- Include a visible subtotal and checkout path.

### Checkout

- Capture the checkout form in a clean, readable state.
- Avoid showing test or error states unless you are documenting them intentionally.

### Customer account

- Show profile summary plus saved items or order shortcuts.
- Keep the screen uncluttered and use one primary customer identity.

### Order receipt

- Show an order confirmation or detailed receipt with status and totals visible.
- Prefer an order with a clean, readable order number and item summary.

### Admin dashboard

- Capture the metrics summary and recent order activity.
- Show a balanced mix of catalog and order health signals.

### Admin products

- Capture a product list or editor view with sale/new/stock signals visible.
- Include the image previews if they help communicate catalog quality.

### Admin orders

- Show the order table and the source note that distinguishes local demo orders from live Supabase orders.
- Include one or two orders with different statuses.

### Admin customers

- Show the customer directory with saved-item or order summaries if present.
- Keep the list readable and avoid showing empty or placeholder-only states.

## 5. Suggested Demo Story

If you want a short, coherent walkthrough:

1. Start on the homepage.
2. Open a category page and show filtering.
3. Open a product detail page with sale or new badges.
4. Add to cart and show checkout confidence.
5. Show the customer account and receipt flow.
6. Switch to the admin dashboard.
7. Show admin products, admin orders, and admin customers.

This gives reviewers a complete storefront-to-operations arc without needing extra explanation.

## 6. Before Deploy or Demo Checklist

- `git status` is clean or intentionally staged.
- `npm run build` passes.
- `npm run preview` is used if you want a production-like local check.
- No `.env` or `.env.local` files are committed.
- Netlify deploy only happens when the release is intentional.
- Supabase demo testing uses the correct admin role and RPC setup.
- The screenshot set uses clean local demo storage or an incognito profile.

## 7. Quick Capture Notes

- Keep the browser zoom at a consistent level.
- Use the same viewport sizes for comparable screenshots.
- Prefer readable tables and cards over overly dense mobile captures unless mobile is the point.
- Avoid showing half-finished local edits from a previous session.
- If a screen is already visually strong, do not over-edit the demo state just for variety.

## Bottom Line

The strongest demo set for ShopOra should show a believable customer journey, a credible product catalog, and a clearly separated admin story. Clean local storage first, verify the Supabase admin path separately, and capture screenshots in a deliberate order so the app looks intentional rather than incidental.
