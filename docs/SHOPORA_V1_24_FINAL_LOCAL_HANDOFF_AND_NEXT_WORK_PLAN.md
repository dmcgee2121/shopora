# ShopOra v1.24 Final Local Handoff And Next Work Plan

## Scope

This checkpoint is documentation-only. It records the current baseline, the merged and parked release trail, and the next work options for ShopOra. It does not change app behavior.

## Current Main Baseline

- The current main baseline remains the v0.80 local QA release batch that was merged into `main` through PR #7.
- The repo has continued through a longer local-first release trail after that baseline.
- This checkpoint does not trigger a merge, push, or deploy.

## What Has Been Merged Already

- v1.06 profile persistence release.
- v1.09 saved-items persistence release.

## What Is Currently Parked, Local, Or Pushed

- v1.12 read-only order history helper / draft PR #13.
- v1.13 order history release hold.
- v1.14 checkout and Stripe checklist.
- v1.15 Netlify credit strategy.
- v1.16 order history UI polish.
- v1.17 account/orders QA checklist.
- v1.18 admin live order-status planning.
- v1.19 admin order operations QA checklist.
- v1.20 local release batch wrap-up.
- v1.21 portfolio/demo readiness planning.
- v1.22 portfolio demo walkthrough script.
- v1.23 portfolio case-study outline.

## Netlify Credit Strategy

- Do not merge or deploy every small branch.
- Keep working locally.
- Use draft PRs and branches as parking spots.
- Batch releases intentionally so deploy credits are spent only when the change set is worth it.

## Recommended Next Work Options

1. Package v1.12-v1.23 into a future release batch.
2. Continue portfolio and demo polish.
3. Create screenshots and case-study assets.
4. Plan admin live order-mutation backend and RLS work.
5. Plan checkout and Stripe production confidence testing.

## Suggested Next-Session Starting Commands

- `git branch --show-current`
- `git status --short`
- `npm run build`
- `git log --oneline -10`
- `git diff origin/main...HEAD --stat`
- `git diff origin/main...HEAD --name-only`

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

This checkpoint does not change app behavior. It only records the final local handoff and the next work plan.
