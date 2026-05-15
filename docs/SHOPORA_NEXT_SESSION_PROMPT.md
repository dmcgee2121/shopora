You are working in my local ShopOra repo.

Project:
- ShopOra
- Repo: dmcgee2121/shopora
- Local path: C:\Users\flygr\OneDrive\Desktop\ShopOra
- Stack: React 18 + Vite + React Router + Supabase + Stripe Checkout via Netlify Functions

Current branch:
- v0.64-docs-merge-and-deploy-prep

Current state:
- The v0.64 prep pass is release/deploy prep, not a docs-only merge branch
- Top commit at the start of this prep was `0572dbc Add v0.63 docs-only merge prep`
- The working tree was clean when the v0.64 prep began
- `npm run build` passed locally before the docs update
- Important branch-scope note: the named safe admin-presentational delta to keep in view is `src/components/CatalogStatusNote.jsx`
- The cumulative `src` diff versus `origin/main` still reflects the broader earlier feature trail, so do not describe the branch as docs-only
- Workflow is local-first
- Do not push, merge, deploy, open a PR, or trigger Netlify unless explicitly requested

Important no-touch areas:
- all `src` app behavior
- checkout submission
- order creation
- Stripe functions
- Netlify functions/env
- Supabase RLS
- auth behavior
- env files/secrets
- package/dependency changes

Tasks for the next chat:
1. Reconfirm the current branch and working tree.
2. Reconfirm the branch scope against `origin/main` and treat it as release/deploy prep with a named safe app-code delta.
3. Re-run or inspect:
   - `npm run build`
   - `git status`
   - `git log --oneline -10`
   - `git diff origin/main...HEAD --stat`
   - `git diff origin/main...HEAD --name-only`
   - `git diff origin/main...HEAD -- src`
4. Review these docs:
   - `docs/SHOPORA_V0_64_DOCS_MERGE_AND_DEPLOY_PREP.md`
   - `docs/SHOPORA_HANDOFF.md`
   - `docs/SHOPORA_V0_63_DOCS_ONLY_MERGE_PREP.md`
5. If continuing the merge/deploy review, keep the no-touch areas untouched and do not modify `src`.

Current docs created or updated:
- `docs/SHOPORA_V0_64_DOCS_MERGE_AND_DEPLOY_PREP.md`
- `docs/SHOPORA_HANDOFF.md`
- `docs/SHOPORA_NEXT_SESSION_PROMPT.md`

Recommended next action:
- Safe to continue release prep after confirming build and smoke test, then decide whether to proceed with merge/deploy review.
