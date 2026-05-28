# ShopOra v1.58 Release Batch Readiness Map

## Purpose

- v1.58 is a docs-only planning checkpoint.
- This checkpoint maps parked local-only work into a safer future release review path.
- This checkpoint does not merge, deploy, open PRs, or change runtime behavior.

## Current Confirmed Latest Parked Branch

- Branch: `v1.57-buyer-product-detail-draft-pr-deploy-prep`
- Commit: `03010eb` - Add v1.57 buyer product detail draft PR deploy prep
- Status: pushed/parked, working tree clean based on last terminal verification
- No PR opened
- No merge/deploy performed

## Parked Branch Batches

### Launch-readiness/admin seller batch

- Range: v1.29 through v1.36
- Purpose: admin seller launch command center, readiness polish, QA notes, release notes, handoff, local QA, visual QA checklist, draft PR prep

### Admin operations/readiness mini-batch

- Range: v1.37 through v1.43
- Purpose: admin store operations snapshot, priority actions, weekly review, health summary, handoff, local QA, draft PR prep

### Buyer liveliness mini-batch

- Range: v1.44 through v1.51
- Purpose: make ShopOra feel less static through honest visual rhythm, activity cues, micro-interactions, category polish, empty states, handoff, local QA, draft PR prep
- Explicit rule: no fake live customer activity, fake urgency, fake sales velocity, fake personalization, or unsupported real-time behavior

### Buyer product-detail polish mini-batch

- Range: v1.52 through v1.57
- Purpose: improve product-detail page polish, trust cues, recommendations, batch handoff, local QA, and draft PR/deploy prep

## Safe Release Philosophy

- Keep releases small and reviewable.
- Prefer docs/readiness checkpoints before deployment.
- Do not deploy just because Netlify renewal is close.
- Use controlled deploy only after branch, build, smoke test, PR notes, and explicit user approval are confirmed.

## Candidate Release Paths

### Option A: Buyer-only release candidate

- Covers v1.44-v1.57
- Best if the goal is to deploy visible buyer-facing polish first
- Lower risk than combining buyer and admin batches
- Still requires full build/local smoke test and PR review

### Option B: Product-detail-only release candidate

- Covers v1.52-v1.57
- Best if the goal is a smaller deploy centered on product-detail pages
- Lowest near-term risk
- Good candidate for a controlled Netlify deploy if approved

### Option C: Admin readiness release candidate

- Covers v1.29-v1.43
- Best if the goal is improving internal/admin planning views
- Should be kept separate from buyer-facing deploy if minimizing risk

### Option D: Full parked batch release candidate

- Covers v1.29-v1.57
- Broadest release
- Highest review burden
- Not recommended unless there is enough time to QA thoroughly

## Recommended Next Move

- Start with a product-detail-only release candidate or buyer-only release candidate, depending on desired caution level.
- If Netlify credits/renewal timing makes one controlled deploy attractive, prefer the smaller product-detail-only release path first.
- Still no deploy without explicit approval.

## Controlled Pre-Deploy Checklist

- [ ] Confirm exact source branch.
- [ ] Confirm exact target/base branch.
- [ ] Confirm working tree clean.
- [ ] Run `npm run build`.
- [ ] Run local smoke test.
- [ ] Review changed files and protected areas.
- [ ] Prepare or review draft PR notes.
- [ ] Confirm no open PR conflict, especially PR #13.
- [ ] Confirm Netlify deploy timing.
- [ ] Explicit approval required before merge/deploy.

## Protected No-Touch Areas

- Do not change checkout submission.
- Do not change order creation.
- Do not change cart business logic.
- Do not change Stripe functions.
- Do not change Netlify functions/env.
- Do not change Supabase RLS.
- Do not change auth behavior.
- Do not change env files/secrets.
- Do not change package/dependency files.
- Do not add dependencies.
- Do not run live payments.
- Do not run production SQL.
- Do not change product data schemas.
- Do not alter saved-items persistence behavior.
- Do not alter customer profile/account persistence behavior.
- Do not alter order history behavior.
- Do not alter product routing behavior.
- Do not alter pricing, stock, cart quantity, add-to-cart behavior, saved-items behavior, filters, or search logic.
- Do not imply live inventory syncing, fake live customer activity, live order fulfillment, refunds, or production order operations are implemented.

## Honest Liveliness Rules

### Good

- Curated copy
- Better visual rhythm
- Subtle hover/focus states
- Warmer empty states
- Better product-detail guidance
- Honest trust cues
- Better browsing flow
- Accessibility-friendly motion

### Avoid

- Fake "12 people are viewing"
- Fake "selling fast"
- Fake recent purchases
- Fake real-time stock
- Fake inventory pressure
- Fake personalization
- Unsupported delivery/refund/fulfillment promises

## Final Status Template

- Branch:
- Commit:
- npm run build:
- git status:
- Files changed:
- Scope notes:
- Recommended next step:
