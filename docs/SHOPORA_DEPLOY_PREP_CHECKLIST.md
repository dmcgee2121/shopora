# ShopOra Deploy Prep Checklist

Milestone: `v0.32-merge-prep-for-intentional-deploy`

Purpose: local-only merge/deploy readiness check before any intentional push, merge to `main`, or Netlify production deploy.

## Current Local State

- Branch: `v0.32-merge-prep-for-intentional-deploy`
- Latest feature commit before this checklist: `5d94e81 Add final screenshot demo pass`
- Working tree before checklist work: clean
- No push performed
- No deploy performed
- No merge to `main` performed
- Netlify was not touched

## Included Since `main`

If this branch is eventually merged, it would include:

- Demo screenshot guide and final local QA documentation
- Production-readiness and Supabase security hardening documentation
- Storefront trust, brand, mobile, performance, accessibility, and screenshot polish
- Admin product editor, admin orders fulfillment, and related admin polish
- Product recommendation sections
- Recently viewed product utilities and product/cart rails
- Homepage personalization with recently viewed and first-look fallback merchandising
- Final screenshot/demo route pass with `/orders` and `/saved` account-route aliases

## Sensitive File Check

- `git ls-files | findstr /i ".env"` currently reports only `.env.example`
- `.env.local` is ignored and not tracked
- `.netlify/` is ignored and not tracked
- `dist/` is ignored and not tracked
- local Vite/dev logs are ignored and not tracked
- `node_modules/` is ignored and not tracked

Before any future push, rerun:

```powershell
git status --ignored
git ls-files | findstr /i ".env"
```

## Pre-Deploy Local Checks

- [ ] Confirm the intended branch is checked out.
- [ ] Run `git status` and confirm the working tree is clean.
- [ ] Run `git log --oneline -8` and confirm the expected recent branch chain is present.
- [ ] Run `git diff --stat main..HEAD` and review the full merge scope.
- [ ] Run `npm run build`.
- [ ] Optionally run `npm run preview` for a production-like local render check.
- [ ] Re-check that no `.env` or `.env.local` files are tracked.
- [ ] Confirm no checkout, order creation, Stripe function, Netlify function, or env-handling changes were added unintentionally.

## Manual Route Sweep

- [ ] `/`
- [ ] `/women`
- [ ] `/men`
- [ ] `/shoes`
- [ ] `/accessories`
- [ ] `/sale`
- [ ] `/search`
- [ ] `/cart`
- [ ] `/checkout`
- [ ] `/about`
- [ ] `/contact`
- [ ] `/shipping`
- [ ] `/returns`
- [ ] `/privacy`
- [ ] `/account`
- [ ] `/orders`
- [ ] `/saved`
- [ ] `/admin/login`
- [ ] `/admin`
- [ ] `/admin/products`
- [ ] `/admin/orders`
- [ ] `/admin/customers`

## Supabase Checks Before Deploy

- [ ] Confirm `get_admin_orders()` RPC exists in the Supabase project used by Netlify.
- [ ] Confirm `dmcgee2121@gmail.com` has `public.profiles.role = 'admin'`.
- [ ] Confirm the `public.profiles` role row exists for auth user id `f92c6b28-f9de-4c32-b434-13ff0502a0bc`.
- [ ] Confirm live admin orders still appear after login.
- [ ] Confirm RLS remains enabled and has not been weakened.
- [ ] Confirm frontend-exposed Supabase values are browser-safe and server-only keys stay in environment-managed storage.

## Netlify Warning

Pushing or merging `main` can trigger a production Netlify deploy and use credits. Only push or merge when the deploy is intentional and the checklist above has been completed.

Do not run Netlify deploy commands during local prep unless the next task explicitly asks for a deploy.

## Rollback Notes

- Record the current production commit before deploy if possible.
- Keep this local branch available until production is verified.
- If deploy has issues, revert the merge commit or redeploy the last known good production commit.
- Keep notes on any Supabase migration or admin-role change made during deploy validation.

## Current v0.32 Result

- Local merge/deploy prep completed on `v0.32-merge-prep-for-intentional-deploy`.
- No push, deploy, or merge was performed.
- No tracked `.env` or `.env.local` file was detected.
- Build result should be recorded again after the final v0.32 commit.
