You are working in my local ShopOra repo.

Project:
- ShopOra
- Repo: dmcgee2121/shopora
- Local path: C:\Users\flygr\OneDrive\Desktop\ShopOra
- Stack: React 18 + Vite + React Router + Supabase + Stripe Checkout via Netlify Functions

Current branch:
- v0.63-docs-only-merge-prep

Current state:
- This branch is a documentation-only merge-prep cleanup built on the v0.57-v0.62 trail
- The reviewed app snapshot top commit before this cleanup is `e9357f2 Add v0.62 deployment readiness review`
- The v0.63 work does not change app behavior
- The cumulative diff against `origin/main` still includes the earlier v0.57-v0.61 feature sequence
- `npm run build` passed before this docs-only cleanup was committed
- Workflow is local-first
- Do not push, merge, deploy, open a PR, or trigger Netlify unless explicitly requested

Important no-touch areas:
- checkout submission
- order creation
- Stripe functions
- Netlify functions/env
- Supabase RLS
- auth behavior
- env files/secrets
- package/dependency changes
- app behavior

Recent sequence:
- v0.57 `44a7c12 Polish product discovery experience`
- v0.58 `baa422a Polish admin merchandising readiness`
- v0.59 `1bf7d15 Polish customer retention experience`
- v0.60 `d09d35b Add v0.60 local release wrap-up`
- v0.61 `3dcbd51 Polish support and policy experience`
- v0.62 `e9357f2 Add v0.62 deployment readiness review`
- v0.63 docs-only merge prep

Relevant docs:
- `docs/SHOPORA_V0_63_DOCS_ONLY_MERGE_PREP.md`
- `docs/SHOPORA_V0_62_DEPLOYMENT_READINESS_REVIEW.md`
- `docs/SHOPORA_V0_61_SUPPORT_POLICY_QA.md`
- `docs/SHOPORA_V0_60_LOCAL_RELEASE_WRAP_UP.md`
- `docs/SHOPORA_V0_59_CUSTOMER_RETENTION_QA.md`
- `docs/SHOPORA_V0_58_ADMIN_MERCHANDISING_QA.md`
- `docs/SHOPORA_V0_57_PRODUCT_DISCOVERY_QA.md`
- `docs/SHOPORA_HANDOFF.md`

Current diff notes:
- The v0.63 change set is docs-only.
- The cumulative diff against `origin/main` still includes earlier app and admin work from v0.57-v0.61.
- No `src` files should be modified in this branch.

Known non-blocking warnings:
- Vite can still emit non-blocking bundle-size style warnings on future code changes.
- The cumulative branch diff is large because it still includes earlier feature work.

Recommended next options:
- A. merge docs only
- B. Netlify deployment prep
- C. next app feature branch

If you need a starting command set, use:
```bash
git status
git log --oneline -10
git diff origin/main...HEAD --stat
git diff origin/main...HEAD --name-only
npm run build
```
