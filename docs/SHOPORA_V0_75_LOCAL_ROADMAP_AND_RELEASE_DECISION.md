# ShopOra v0.75 Local Roadmap And Release Decision

## Current Branch

- Branch: `v0.75-local-roadmap-and-release-decision`
- Current branch tip at decision time: `146ea94 Add v0.74 future release PR prep`
- This checkpoint evaluates the next move after the local-only v0.65-v0.74 batch.
- The branch is not docs-only versus `origin/main`.
- This checkpoint is documentation-only and does not change app behavior.

## Deployed Baseline

- v0.64 was merged to `main` and deployed successfully.
- The v0.64 production smoke test passed.
- v0.65-v0.74 remain local-only follow-on work after that deployed baseline.

## Local-Only Batch Summary

- v0.65 captured the post-deploy smoke and stability checkpoint.
- v0.66 added a small production QA polish pass plus QA documentation.
- v0.67 added mobile and responsive polish for storefront and admin surfaces.
- v0.68 added storefront content and SEO polish.
- v0.69 added admin QA and dashboard readability polish.
- v0.70 recorded the local release checkpoint.
- v0.71 clarified the local branch scope.
- v0.72 added storefront polish lite.
- v0.73 recorded the local feature batch checkpoint.
- v0.74 prepared the batch for a future controlled release PR.

## Current Files Different From `origin/main`

### App / Source Files

- `src/components/CategoryPage.jsx`
- `src/components/Footer.jsx`
- `src/components/Hero.jsx`
- `src/components/HomeCampaign.jsx`
- `src/components/ProductCard.jsx`
- `src/components/SupportLinkStrip.jsx`
- `src/hooks/useDocumentTitle.js`
- `src/pages/AboutPage.jsx`
- `src/pages/CartPage.jsx`
- `src/pages/CheckoutPage.jsx`
- `src/pages/ContactPage.jsx`
- `src/pages/HomePage.jsx`
- `src/pages/OrderDetailPage.jsx`
- `src/pages/OrdersPage.jsx`
- `src/pages/PrivacyPage.jsx`
- `src/pages/ProductPage.jsx`
- `src/pages/ReturnsPage.jsx`
- `src/pages/SearchResults.jsx`
- `src/pages/ShippingPage.jsx`
- `src/pages/admin/AdminDashboard.jsx`
- `src/pages/admin/AdminProductsPage.jsx`
- `src/pages/admin/ProductFormPage.jsx`
- `src/styles/admin.css`
- `src/styles/global.css`
- `src/utils/supportLinks.js`

### Docs Files

- `docs/SHOPORA_HANDOFF.md`
- `docs/SHOPORA_NEXT_SESSION_PROMPT.md`
- `docs/SHOPORA_V0_65_POST_DEPLOY_SMOKE_AND_STABILITY.md`
- `docs/SHOPORA_V0_66_PRODUCTION_QA_POLISH.md`
- `docs/SHOPORA_V0_67_MOBILE_RESPONSIVE_POLISH.md`
- `docs/SHOPORA_V0_68_STOREFRONT_CONTENT_SEO_POLISH.md`
- `docs/SHOPORA_V0_69_ADMIN_QA_DASHBOARD_POLISH.md`
- `docs/SHOPORA_V0_70_LOCAL_RELEASE_CHECKPOINT.md`
- `docs/SHOPORA_V0_71_LOCAL_BRANCH_SCOPE_CLARIFICATION.md`
- `docs/SHOPORA_V0_72_STOREFRONT_POLISH_LITE.md`
- `docs/SHOPORA_V0_73_LOCAL_FEATURE_BATCH_CHECKPOINT.md`
- `docs/SHOPORA_V0_74_FUTURE_RELEASE_PR_PREP.md`
- `docs/SHOPORA_V0_75_LOCAL_ROADMAP_AND_RELEASE_DECISION.md`

## Build And Smoke-Test Status

- `npm run build` has been run for this planning checkpoint.
- The Vite production build completed successfully.
- v0.64 production smoke testing passed after the deployed release.
- v0.65 documented the post-deploy smoke and stability checkpoint.
- v0.72 documented a local smoke-test checklist for storefront polish-lite.
- v0.73 documented the local feature-batch checkpoint.
- v0.74 documented future release PR prep.
- No new deployment or production smoke test was triggered for v0.75.

## No-Touch Areas Preserved

- checkout submission
- order creation
- cart business logic
- Stripe functions
- Netlify functions/env
- Supabase RLS
- auth behavior
- env files/secrets
- package/dependency changes
- app behavior outside the scoped presentation and documentation updates

## Why Continued Local-Only Work Has Risk

- The source diff is already spread across storefront, account, admin, support, and shared styling surfaces.
- Keeping the branch local-only for too long makes review harder because the history becomes harder to separate into small, meaningful changes.
- A larger local batch increases the chance that later release prep has to sift through stale assumptions, outdated checkpoints, or overly broad review scope.
- Even when the code is still healthy, the planning overhead grows once the diff stops looking like a small feature batch.

## Why One More Small Feature Branch Can Still Make Sense

- A small feature branch can be useful if it stays tightly scoped and clearly improves the user experience.
- If the local source diff remains manageable, one more incremental feature is easier to review than an immediate release-candidate review of a large batch.
- A focused feature branch can also clarify whether the current presentation direction still has one obvious, low-risk improvement left.

## Recommendation

- If the local source diff remains manageable, one more small feature branch is acceptable.
- If the source diff grows further, the next move should be release-candidate review instead of another feature branch.
- The preferred next branch is:
  - A. `v0.76-customer-account-lite-polish` if there is still a small, clearly bounded presentation-only improvement worth making.
  - B. `v0.76-release-candidate-review` if the branch should shift from feature work to controlled release assessment.
  - C. Pause as a handoff checkpoint if the current scope is already enough for clean review later.

## Decision Criteria

- Choose `v0.76-customer-account-lite-polish` only if the remaining scope is narrow and the diff can stay easy to review.
- Choose `v0.76-release-candidate-review` if new work would mainly add more files, more checkpoints, or more review complexity.
- Choose pause only if the best outcome is to stop changing the branch and hand it off in its current state.
