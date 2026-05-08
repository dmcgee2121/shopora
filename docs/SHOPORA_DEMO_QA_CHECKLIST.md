# ShopOra Demo QA Checklist

Use this checklist to review ShopOra locally before any intentional Netlify deployment.

## 1. Local Setup

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`

## 2. Netlify Credit-Saving Workflow

- Work locally first.
- Commit locally when a milestone is ready.
- Do not push or deploy until the milestone is intentionally approved.
- Keep branch deploys and deploy previews disabled unless you are deliberately testing them.
- Use the deployed Netlify site only when you need a real deployment check.

## 3. Storefront QA

- Homepage
- Category pages
- Search
- Product detail page
- Cart
- Saved items

## 4. Customer Account QA

- Register / login
- Profile and account overview
- Saved items
- Order history
- Order detail / receipt

## 5. Checkout QA

- Local checkout expectations
- Deployed Netlify Stripe test checkout expectations
- Do not change checkout or order creation while debugging local Netlify dev

## 6. Admin QA

- Local/demo admin behavior
- Supabase admin behavior
- Admin dashboard
- Admin products
- Admin orders
- Live Supabase admin orders require `profiles.role = 'admin'`

## 7. Supabase Admin Setup Reminder

- Use a real Supabase Auth user.
- Make sure `public.profiles.id` matches `auth.users.id`.
- Set `public.profiles.role` to `admin`.
- Apply the `get_admin_orders()` RPC from `supabase/schema.sql`.

## 8. Pre-Deploy Checklist

- `git status` is clean.
- `npm run build` passes.
- Manual route checks are complete.
- No `.env` files are committed.
- Deploy only when you intentionally want to publish a milestone.

## 9. Known Watch Items

- Local Stripe and Netlify dev can be fussy.
- Admin status updates for live Supabase orders may remain read-only or prototype-level.
- RLS and security should be reviewed before any production rollout.

## Suggested Manual Route Check

- `/`
- `/category/...`
- `/search`
- `/product/:id`
- `/cart`
- `/checkout`
- `/account`
- `/account/orders`
- `/account/orders/:orderId`
- `/account/saved`
- `/admin`
- `/admin/products`
- `/admin/orders`
- `/admin/customers`

