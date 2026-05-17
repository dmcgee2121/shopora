You are working in my local ShopOra repo.

Project:
- ShopOra
- Repo: dmcgee2121/shopora
- Local path: C:\Users\flygr\OneDrive\Desktop\ShopOra
- Stack: React 18 + Vite + React Router + Supabase + Stripe Checkout via Netlify Functions

Current branch:
- v1.06-customer-profile-persistence-implementation

Current state:
- v0.80 Local QA release batch has been merged into `main` through PR #7
- PR #8 exists for the `v0.90-v0.97` next-phase foundation and roadmap branch
- v0.98 completed a safe image asset optimization pass
- v0.99 was the local-first admin order-management prototype planning pass
- v1.00 is a local-first admin order-management prototype UI pass
- v1.01 is a local-first admin order-detail prototype polish pass
- The admin order modal now includes a top-level detail banner plus prototype-safe sections for order summary, customer/contact context, fulfillment readiness, order attention flags, internal notes, and next operational step
- v1.02 is a local-first customer account persistence planning checkpoint
- v1.03 is a local-first customer account persistence UX readiness pass
- v1.04 is a local-first customer profile persistence implementation plan checkpoint
- v1.05 is a local-first Supabase customer profile persistence audit
- v1.06 is a local-first customer profile persistence implementation checkpoint
- The first safe profile write improvement limits Supabase profile updates to the editable customer fields and keeps local/demo fallback behavior intact
- The current checkpoint should not change app behavior beyond the profile-save improvement and documentation updates
- No checkout submission, order creation, cart, Stripe, Netlify, Supabase RLS, auth, env, secrets, or dependency changes are in scope
- Workflow is local-first
- Do not push, merge, deploy, open a PR, or trigger Netlify unless explicitly requested

Important no-touch areas:
- all `src` app behavior
- auth login/register/session behavior
- profile persistence
- saved items persistence
- checkout submission
- order creation
- Stripe functions
- Netlify functions/env
- Supabase RLS
- auth behavior
- env files/secrets
- package/dependency changes
- backend/schema work
- real live order mutation behavior

Tasks for the next chat:
1. Reconfirm the current branch and working tree.
2. Reconfirm the branch scope as a safe admin order-detail prototype polish pass on top of the existing v0.94-v1.01 trail.
3. Re-run or inspect:
   - `npm run build`
   - `git status`
   - `git log --oneline -10`
   - `git diff origin/main...HEAD --stat`
   - `git diff origin/main...HEAD --name-only`
   - `git diff origin/main...HEAD -- src`
4. Review these docs:
   - `docs/SHOPORA_V1_01_ADMIN_ORDER_DETAIL_PROTOTYPE_POLISH.md`
   - `docs/SHOPORA_V1_00_ADMIN_ORDER_MANAGEMENT_PROTOTYPE_UI.md`
   - `docs/SHOPORA_V0_99_ADMIN_ORDER_MANAGEMENT_PROTOTYPE_PLANNING.md`
   - `docs/SHOPORA_V0_94_ADMIN_ORDER_MANAGEMENT_READINESS.md`
   - `docs/SHOPORA_V0_97_NEXT_PHASE_ROADMAP_WRAP_UP.md`
   - `docs/SHOPORA_V0_96_CHECKOUT_STRIPE_CONFIDENCE_REVIEW.md`
   - `docs/SHOPORA_V0_95_CUSTOMER_ACCOUNT_BACKEND_READINESS.md`
   - `docs/SHOPORA_HANDOFF.md`
   - `docs/SHOPORA_ADMIN_LOCAL_QA.md`
   - `docs/SHOPORA_V0_98_IMAGE_ASSET_OPTIMIZATION.md`
5. Keep the no-touch areas untouched and do not modify `src` beyond safe prototype-safe copy changes unless explicitly requested.

Current docs created or updated:
- `docs/SHOPORA_V1_06_CUSTOMER_PROFILE_PERSISTENCE_IMPLEMENTATION.md`
- `docs/SHOPORA_V1_05_SUPABASE_PROFILE_PERSISTENCE_AUDIT.md`
- `docs/SHOPORA_V1_04_CUSTOMER_PROFILE_PERSISTENCE_IMPLEMENTATION_PLAN.md`
- `docs/SHOPORA_V1_03_CUSTOMER_ACCOUNT_PERSISTENCE_UX_READINESS.md`
- `docs/SHOPORA_V1_02_CUSTOMER_ACCOUNT_PERSISTENCE_PLANNING.md`
- `docs/SHOPORA_V1_01_ADMIN_ORDER_DETAIL_PROTOTYPE_POLISH.md`
- `docs/SHOPORA_V1_00_ADMIN_ORDER_MANAGEMENT_PROTOTYPE_UI.md`
- `docs/SHOPORA_V0_99_ADMIN_ORDER_MANAGEMENT_PROTOTYPE_PLANNING.md`
- `docs/SHOPORA_HANDOFF.md`
- `docs/SHOPORA_NEXT_SESSION_PROMPT.md`
- `docs/SHOPORA_V0_98_IMAGE_ASSET_OPTIMIZATION.md`
- `docs/SHOPORA_V0_97_NEXT_PHASE_ROADMAP_WRAP_UP.md`
- `docs/SHOPORA_V0_96_CHECKOUT_STRIPE_CONFIDENCE_REVIEW.md`
- `docs/SHOPORA_V0_95_CUSTOMER_ACCOUNT_BACKEND_READINESS.md`
- `docs/SHOPORA_V0_94_ADMIN_ORDER_MANAGEMENT_READINESS.md`
- `docs/SHOPORA_V0_93_PERFORMANCE_FOLLOW_UP.md`
- `docs/SHOPORA_V0_92_IMAGE_USAGE_OPTIMIZATION_PREP.md`
- `docs/SHOPORA_V0_91_PERFORMANCE_IMAGE_REVIEW.md`
- `docs/SHOPORA_V0_90_NEXT_PHASE_FOUNDATION.md`
- `docs/SHOPORA_V0_80_FINAL_LOCAL_QA_BEFORE_PR.md`
- `docs/SHOPORA_V0_79_FUTURE_RELEASE_PR_PREP.md`
- `docs/SHOPORA_V0_77_RELEASE_CANDIDATE_REVIEW.md`
- `docs/SHOPORA_V0_76_CUSTOMER_ACCOUNT_LITE_POLISH.md`
- `docs/SHOPORA_V0_75_LOCAL_ROADMAP_AND_RELEASE_DECISION.md`
- `docs/SHOPORA_V0_74_FUTURE_RELEASE_PR_PREP.md`
- `docs/SHOPORA_V0_73_LOCAL_FEATURE_BATCH_CHECKPOINT.md`
- `docs/SHOPORA_V0_72_STOREFRONT_POLISH_LITE.md`
- `docs/SHOPORA_V0_71_LOCAL_BRANCH_SCOPE_CLARIFICATION.md`
- `docs/SHOPORA_V0_70_LOCAL_RELEASE_CHECKPOINT.md`
- `docs/SHOPORA_V0_69_ADMIN_QA_DASHBOARD_POLISH.md`
- `docs/SHOPORA_V0_68_STOREFRONT_CONTENT_SEO_POLISH.md`
- `docs/SHOPORA_V0_67_MOBILE_RESPONSIVE_POLISH.md`
- `docs/SHOPORA_V0_66_PRODUCTION_QA_POLISH.md`
- `docs/SHOPORA_V0_65_POST_DEPLOY_SMOKE_AND_STABILITY.md`

Recommended next action:
- Run `npm run build`.
- If build stays clean, treat this as a planning checkpoint and move on to the next scoped implementation branch.
