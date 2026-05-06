# ShopOra

ShopOra is a standalone online clothing and lifestyle storefront prototype built to showcase a polished ecommerce experience for shoppers and for potential small business clients.

It is separate from the older ShopOraGo marketplace concept. This repo focuses on the ShopOra storefront, customer account flows, and the admin product management experience.

## Overview

The app is a React + Vite storefront with a department-store style catalog, product details, cart flows, customer accounts, saved items, order history, and admin tools. It is designed as a client-presentable prototype rather than a fully production-ready commerce platform.

## Features

- Department-store style storefront with category browsing and search
- Product catalog and product details pages
- Cart and mini-cart experience
- Stripe Checkout test mode flow for supported checkout paths
- Customer accounts and profile access
- Saved items
- Order history and order detail views
- Admin dashboard and product management screens
- Policy pages for shipping, returns, and privacy
- Local/demo fallback behavior when services are unavailable or not configured

## Tech Stack

- React
- Vite
- React Router
- Supabase
- Stripe Checkout
- Netlify
- Netlify Functions
- CSS

## Local Development

Install dependencies:

```bash
npm install
```

Start the local app:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

When testing Netlify Functions locally, use `netlify dev` so the frontend and functions run together in a Netlify-like environment.

## Environment Variable Safety

- Do not commit `.env` or `.env.local`
- Stripe secret keys and Supabase service role keys are server-only
- Public Vite environment variables should only contain client-safe values intended for the browser bundle
- Keep frontend and server-only configuration separated

## Project Status

Current status: working prototype.

Planned improvements:

- Admin orders polish
- Product discovery polish
- Analytics and dashboard improvements
- Production auth hardening
- Performance and code splitting

## Notes

- Build and routing are configured for Netlify deployment through `netlify.toml`
- The app uses demo-friendly fallback behavior when Supabase or other services are unavailable
- The repository is intended to support portfolio review and client presentation without overstating production readiness
