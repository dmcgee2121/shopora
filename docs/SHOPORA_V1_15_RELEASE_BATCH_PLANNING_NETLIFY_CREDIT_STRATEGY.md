# ShopOra v1.15 Release Batch Planning And Netlify Credit Strategy

## Scope

This checkpoint records the current release posture and the next batching strategy for ShopOra. It is documentation only and does not change application behavior.

## What Is Currently Merged Into Main

- v0.80 local QA release batch.
- The repo has continued through multiple documentation and prototype checkpoints after that base merge.

## What Is Currently Parked

- Draft PR #13 for the read-only customer order history helper work is parked and intentionally not merged.
- v1.13 order history local QA and release hold is documented as a release-hold checkpoint.
- v1.14 checkout and Stripe production test checklist is documented as a readiness checkpoint.

## Checkpoint Status Summary

- v1.12 read-only order history support is complete.
- v1.13 release-hold status is complete and pushed.
- v1.14 checkout/Stripe checklist status is complete and pushed.

## Netlify Credit Strategy

- Avoid merging every small branch.
- Keep local-first work moving even when deploy credits are limited.
- Use draft PRs as parking spots for completed but unmerged work.
- Batch releases intentionally instead of deploying every checkpoint.
- Deploy only when the batch is worth spending credits.

## Suggested Next Release Batch Contents

- Order history UI polish around loading, error, and empty states.
- Checkout and Stripe test-mode verification updates if any runtime follow-up is needed.
- Admin live order-status update planning if it becomes release-ready.
- Customer account persistence release batch planning if that work is ready to roll up.
- Portfolio or demo readiness polish that benefits from one combined deploy.

## Suggested Next Local Work Options

1. Order history UI polish around loading, error, and empty states.
2. Production checkout and Stripe test checklist execution.
3. Admin live order-status update planning.
4. Customer account persistence release batch planning.
5. Portfolio or demo readiness polish.

## Recommended Merge And Deploy Criteria

- The batch contains enough user-visible value to justify a Netlify deploy.
- The batch does not depend on a separate follow-up deploy to make sense.
- The batch can be QA’d locally before spending credits.
- The batch does not require touching protected no-change areas.
- The batch is small enough to remain reversible if a follow-up issue appears.
- The release timing is aligned with Netlify credit availability, not only feature completion.

## No-Touch Areas Preserved

- Checkout submission.
- Order creation.
- Cart business logic.
- Stripe functions.
- Netlify functions and environment settings.
- Supabase RLS.
- Auth login, register, session, and logout behavior.
- Env files and secrets.
- Package and dependency files.

## Rollback Notes

- This checkpoint is documentation-only.
- If the release plan changes, update the docs rather than rolling back runtime code.
- No database, runtime, or deploy rollback is required for this checkpoint.

## Confirmation

This checkpoint does not change:

- app behavior
- checkout submission
- order creation
- cart business logic
- Stripe
- Netlify functions or env
- Supabase RLS
- auth behavior
- env files or secrets
- package/dependency files

