# ShopOra v1.23 Portfolio Case Study Outline

## Scope

This checkpoint is documentation-only. It provides a polished portfolio case-study outline for ShopOra. It does not change app behavior.

## Project Overview

ShopOra is a React 18 + Vite ecommerce storefront with customer-facing browsing, account persistence, saved items, order history, and an admin operations prototype. The project is intentionally local-first and release-batch oriented because Netlify deploy credits are limited.

## Problem Statement

ShopOra was built to show how a small storefront can still feel like a complete commerce experience:

- customers need a clean browsing-to-checkout path
- repeat visits need persistence for profiles and saved items
- orders need to be recoverable without pretending every action is live-editable
- the admin side needs a credible operations story even before live mutation support is added

## Target User

- primary: shoppers who browse products, save items, and return to complete purchases
- secondary: operators or reviewers who need a believable admin workflow prototype
- tertiary: portfolio reviewers who want to see a realistic React storefront with clear backend boundaries

## Main Features

- storefront browsing
- product detail
- cart and checkout readiness
- Supabase auth and profile persistence
- saved-items persistence
- read-only order history direction
- admin dashboard, products, and orders prototype
- release-batch workflow

## Tech Stack

- React 18
- Vite
- React Router
- Supabase
- Stripe Checkout via Netlify Functions
- local storage for demo/local fallback flows

## Architecture Summary

- React Router organizes the storefront, customer account, and admin routes.
- Supabase-backed flows handle authenticated profile, saved-items, and order-history persistence.
- Local/demo flows remain available for prototype presentation and fallback behavior.
- Order history is intentionally mixed: local/demo orders remain browser-local while authenticated customer orders use Supabase-backed reads.
- The admin order-management surface is a prototype/read-only view for live Supabase orders until a deliberate backend write path is designed.
- Checkout and Stripe remain separated behind the existing checkout and Netlify function boundary.
- The release process is intentionally batch-based to avoid spending deploy credits on every small checkpoint.

## What I Built

- A storefront with discovery, product detail, cart, and checkout surfaces.
- Account persistence for profile data and saved items.
- Read-only customer order-history support for authenticated users.
- An admin dashboard and admin orders prototype that explain live-vs-local behavior clearly.
- Documentation checkpoints that separate planning, QA, wrap-up, and portfolio presentation work.

## Challenges Solved

- Keeping customer persistence meaningful without overpromising live mutation behavior.
- Separating local/demo fallback from Supabase-backed behavior in a way that is easy to explain.
- Presenting order history as read-only while still making it useful for support and recovery.
- Framing the admin workflow as a credible prototype without implying live write support that is not there yet.
- Keeping checkout and Stripe confidence documented without moving into unsafe test or production changes.
- Maintaining a local-first release rhythm when deploy credits are limited.

## What I Learned

- A portfolio-friendly ecommerce app needs clear behavioral boundaries, not just features.
- Persistence is more convincing when the app can explain which data is local, which data is backed by Supabase, and which data is intentionally read-only.
- Admin prototypes are stronger when they show operational context instead of fake mutation controls.
- Documentation checkpoints help make release decisions easier when deploys are intentionally batched.

## Honest Limitations

- Admin order mutation remains prototype/read-only in the live Supabase path.
- Checkout should be demonstrated in test mode or render-only unless intentionally testing.
- Netlify deploys are intentionally batched due to limited credits.
- Local/demo behavior is not the same as production authorization.
- Live backend write work is still a future step, not part of this checkpoint.

## Future Improvements

- Add a safe live admin write model if and when backend/RLS work is approved.
- Tighten mobile presentation on the key demo and portfolio routes.
- Add more public-facing polish if the project is prepared for a wider portfolio audience.
- Expand QA around any future live status or fulfillment workflow.
- Refine release batching and deploy timing as the feature set grows.

## Suggested Screenshots To Capture

- home page hero and merchandising section
- category or search results page
- product detail page
- saved items
- account profile
- order history
- cart
- checkout render-only view
- admin dashboard
- admin products
- admin orders prototype

## Suggested Portfolio Wording

Use concise, confident language:

- “ShopOra is a React 18 and Vite ecommerce storefront with Supabase-backed account persistence and a prototype admin operations layer.”
- “The app combines customer browsing, saved items, and read-only order history with a local-first release workflow.”
- “Checkout readiness and Stripe confidence are documented separately so the release story stays honest and controlled.”
- “The admin experience is intentionally framed as a prototype until live write support is approved.”

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

This checkpoint does not change app behavior. It only records the portfolio case-study outline for future presentation use.
