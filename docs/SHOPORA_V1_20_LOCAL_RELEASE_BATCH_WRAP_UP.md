# ShopOra v1.20 Local Release Batch Wrap-Up

## Scope

This checkpoint is documentation-only. It records the current release baseline, the parked local batch history, and the next batch options without changing app behavior.

## Current Main Baseline

- The current main baseline remains the v0.80 local QA release batch that was merged into `main` through PR #7.
- Later work from v1.12 through v1.19 is local, pushed, or parked as part of the ongoing release-batch trail.
- No new deploy has been triggered as part of this wrap-up.

## Parked Local Batch Summary

- v1.12: read-only Supabase order history helper.
- v1.13: order history release hold.
- v1.14: checkout and Stripe production test checklist.
- v1.15: Netlify credit strategy.
- v1.16: order history UI polish.
- v1.17: account/orders release batch QA checklist.
- v1.18: admin live order-status planning.
- v1.19: admin order operations QA checklist.

## What Has Been Built Or Tested Locally

- The customer account and order-history release notes were documented and parked.
- The admin order-management planning and QA checkpoints were documented and parked.
- The current admin UI remains read-only for live Supabase orders.
- The customer order-history UI remains read-only for persisted Supabase records.
- `npm run build` remains the local verification gate for the docs-only checkpoints in this batch.

## What Is Intentionally Not Merged Or Deployed Yet

- No live admin order mutation behavior has been introduced.
- No checkout submission changes have been merged in this checkpoint.
- No order creation changes have been merged in this checkpoint.
- No cart, Stripe, Netlify function, Supabase RLS, auth, env, secret, or dependency changes are part of this wrap-up.
- No deploy has been spent on this wrap-up checkpoint.

## Netlify Credit Strategy

- Do not merge every small branch.
- Keep local work moving and park related checkpoints together.
- Spend deploy credits only when the batch is large enough to justify the release.
- Use docs checkpoints to make the next release decision easier without burning credits.

## Recommended Next Release Batch Contents

- Admin order management release follow-up, if live write support is approved.
- Any backend/RLS work required for safe live admin status updates.
- Remaining customer/admin QA polish that benefits from one combined deploy.
- Any checkout or Stripe follow-up that is ready for a deliberate batch release.

## Recommended Next Local Work Options

1. Continue with a focused admin backend/RLS implementation plan.
2. Return to customer account or order-history polish only if it supports the next release batch.
3. Keep documenting release boundaries until the batch is ready for deployment.

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
- Production SQL.

## Confirmation

This checkpoint does not change app behavior. It only records the release batch wrap-up and the next batching options.
