You are working in my local ShopOra repo.

Project:
- ShopOra
- Repo: dmcgee2121/shopora
- Local path: C:\Users\flygr\OneDrive\Desktop\ShopOra
- Stack: React 18 + Vite + React Router + Supabase + Stripe Checkout via Netlify Functions

Current branch:
- v0.64-docs-merge-and-deploy-prep

Current state:
- The v0.64 prep pass is documentation-only and did not modify any `src` files
- Top commit at the start of this prep was `0572dbc Add v0.63 docs-only merge prep`
- The working tree was clean when the v0.64 prep began
- `npm run build` passed locally before the docs update
- Important branch-scope note: `git diff origin/main...HEAD -- src` is not empty at the repository-history level because the cumulative branch history still includes older `src` work from the v0.57-v0.61 trail
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
2. Reconfirm the branch scope against `origin/main` and treat the source-history mismatch honestly.
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
- Reconcile the branch scope against `origin/main`, then decide whether a docs-only merge, a separate deployment review, or a clean branch cut is the right next step.
