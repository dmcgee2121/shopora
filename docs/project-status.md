# ShopOra Project Status

## v0.3

Supabase Customer Commerce Foundation.

## Completed Frontend Features

- React + Vite storefront and admin prototype
- Client-side routing and protected admin/customer areas
- Mock auth with register, login, logout, and role-based redirects
- Saved items and profile flows
- Product catalog browsing and admin catalog CRUD
- Cart and mini-cart flows
- Demo checkout and order history flows, plus Supabase-backed customer orders
- Admin order management views
- Stripe payment-state scaffolding on Supabase orders
- Stripe Checkout test mode wired through Netlify Functions for Supabase customer checkout

## Current Limitations

- Auth is split between Supabase customer sessions and local demo fallback users
- Product data is still browser-local and uses `localStorage`
- Cart state is browser-local and uses `localStorage`
- Order history is split between Supabase-backed customer orders and browser-local demo orders
- Route protection is client-side only
- Checkout uses Stripe Checkout test mode for Supabase customers, but live payment capture is not enabled yet
- Admin roles and admin product writes are still local-only
- Inventory decrement/reservation is not implemented

## Recommended Next Milestone

Move inventory handling to post-payment workflows. After that, add Supabase admin roles/admin product writes, image uploads/storage, and deployment hardening.

See also: [`docs/backend-readiness.md`](./backend-readiness.md)
