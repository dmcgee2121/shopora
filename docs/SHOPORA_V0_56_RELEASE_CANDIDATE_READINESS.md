# ShopOra v0.56 Release Candidate Readiness

## Branch And Status

- Branch: `v0.56-release-candidate-readiness`
- Local head at start of this pass: `0eabbdf` `Add v0.55 local full-app QA merge prep`
- Current build status: `npm run build` passes locally

## What Changed Since Main

Since deployed `main` / `origin/main` commit `c20937e` (`Polish product discovery experience`), the local branch stack now includes the storefront, account, admin, accessibility, QA, and merge-prep work from the v0.35 through v0.55 local milestones.

The current local delta includes:

- storefront merchandising and discovery polish
- customer retention and customer support/help polish
- customer trust and policy QA notes
- customer account/profile preference polish
- product review display polish
- accessibility and keyboard-focus polish
- admin catalog, dashboard, orders, and customers readiness work
- local QA and merge-prep documentation across multiple milestones

This readiness pass is documentation-only. No application behavior is changed here.

## Intentionally Untouched Areas

The following areas remain out of scope and should stay untouched:

- checkout submission
- order creation
- Stripe functions
- Netlify functions/env
- Supabase RLS
- auth behavior
- env files/secrets

## Final Local Smoke-Test Checklist

- Run `npm run build`
- Open the storefront home page
- Open department routes and verify product grids render
- Open at least two product detail pages
- Verify product cards remain clickable
- Open cart and confirm quantity controls still work
- Open saved items and orders pages
- Open login and register screens
- Open checkout visually only
- Open admin login and the admin shell
- Open admin products, orders, and customers pages
- Confirm keyboard focus remains visible on links, buttons, cards, filters, and admin nav
- Check browser console for new route-breaking errors

## Pre-Merge Checklist

- Confirm the working tree is clean
- Confirm the branch diff is documentation-only or intentionally scoped
- Re-read the latest handoff and merge-prep docs
- Re-run `npm run build`
- Review the exact files changed since `main`
- Confirm no protected checkout/order/auth/Stripe/Supabase/Netlify paths were touched
- Decide whether the next step is another local branch, a manual review, or an intentional merge request later

## Pre-Netlify-Deploy Checklist

- Confirm this is the intended release candidate
- Confirm live admin orders support still depends on `get_admin_orders()` in the Supabase project used by Netlify
- Confirm `dmcgee2121@gmail.com` has `role = admin`
- Confirm auth user id `f92c6b28-f9de-4c32-b434-13ff0502a0bc` is present and mapped correctly
- Re-check any route or copy changes that would appear in the deployed preview
- Verify no sensitive env values are staged or committed
- Confirm the deploy target is intentional before spending Netlify credits

## Post-Deploy Smoke-Test Checklist

- Load the storefront home page
- Open `/women`, `/men`, `/shoes`, `/accessories`, `/sale`, and `/search`
- Open at least two product detail pages
- Open `/cart` and confirm quantity and remove controls work
- Open `/checkout` and verify the page renders visually without modifying submission logic
- Open `/login` and `/register`
- Open `/account`, `/orders`, `/saved`
- Open `/about`, `/contact`, `/shipping`, `/returns`, `/privacy`
- Open `/admin/login`, then the admin shell, products, orders, and customers views
- Confirm keyboard focus remains clear in the browser
- Check browser console and network for any new route-breaking issues

## Rollback Notes

- Keep the current committed local state available as the rollback reference.
- If a future deploy introduces a regression, revert to the last known-good deployed commit `c20937e`.
- Do not attempt to patch checkout, order, Stripe, auth, or Supabase behavior as part of a rollback review unless that is the explicit incident scope.
- Prefer a fresh local branch for follow-up fixes instead of rewriting this readiness checkpoint.

## Recommended Next Branch

- If this readiness review stays green, the next step can be either a safe feature/polish branch or an intentional merge/deploy preparation branch.
- Keep the deploy decision separate until you are ready to spend Netlify credits.
- Before any deploy, confirm live admin orders with `get_admin_orders()` RPC and the admin role mapping for `dmcgee2121@gmail.com`.
