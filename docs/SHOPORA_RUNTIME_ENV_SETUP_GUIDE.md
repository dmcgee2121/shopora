# ShopOra Runtime Environment Setup Guide

## 1. Purpose
This guide helps configure ShopOra for demo, pilot, and eventual production operation.
It is intended for owner/operators and developers to reduce environment mistakes and runtime confusion.
This guide is not production certification and does not by itself make ShopOra production-ready.

## 2. Runtime mode overview
ShopOra supports runtime modes with different expectations:

- `demo`: local/demo-focused behavior where demo tooling can remain available for development and walkthroughs.
- `pilot`: controlled real-owner trial mode with stricter boundaries than demo and intentional verification of live-backed behavior.
- `production`: launch-facing mode with strongest safeguards, explicit environment ownership, and demo behavior disabled unless intentionally overridden.

Runtime mode should directly influence:
- Demo admin availability expectations (available for demo/local usage, restricted for pilot/production usage unless intentionally enabled).
- Production safety posture (clear env ownership, verified boundaries, and reduced fallback assumptions).
- Operator expectations (what data is authoritative, what behavior is test-only, and what is launch-safe).

## 3. Environment variable checklist
Use checklist validation per environment and never commit secret values.

### Frontend/Vite public variables
- [ ] `VITE_SHOPORA_RUNTIME_MODE` is explicitly set (`demo`, `pilot`, or `production`).
- [ ] `VITE_SHOPORA_ENABLE_DEMO_ADMIN` is explicitly set for intended behavior.
- [ ] `VITE_SUPABASE_URL` is set to the correct Supabase project URL.
- [ ] `VITE_SUPABASE_ANON_KEY` is set to the correct anon/public key.
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` is set to the matching Stripe environment key.

### Server-side/Netlify variables
- [ ] `STRIPE_SECRET_KEY` is configured server-side only (never exposed in frontend code).
- [ ] `STRIPE_WEBHOOK_SECRET` is configured where webhook verification is used.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is present only if required by server-side flows.
- [ ] Netlify function/runtime environment variables are present and mapped per site environment.

### Secret hygiene
- [ ] No real secrets are documented in repo docs.
- [ ] No secrets are hard-coded in client code.
- [ ] Environment changes are tracked and retested before pilot usage.

## 4. Stripe test/live separation
Stripe test and live environments must remain strictly separated to avoid accidental live charges.

Checklist:
- [ ] Test publishable key is configured for demo/pilot verification paths.
- [ ] Test secret key is configured only in server-side runtime where needed.
- [ ] Test products/prices are used for checkout validation.
- [ ] Test checkout is validated for success and cancellation paths.
- [ ] Live key readiness is reviewed but not activated until explicit approval.
- [ ] Explicit business/operator approval is captured before any live payment activity.
- [ ] No real cards or live payments are used without explicit approval.

## 5. Supabase setup checklist
- [ ] Supabase project URL is set correctly for the environment.
- [ ] Supabase anon key is set correctly for frontend access.
- [ ] Service role key is server-side only and never exposed client-side.
- [ ] Admin role/profile verification is completed for intended operator accounts.
- [ ] RLS awareness is documented for team members handling data access assumptions.
- [ ] Production data is separated from demo/testing datasets and workflows.
- [ ] Demo/local fallback data is not treated as real operational source of truth.

## 6. Demo admin and production safety
Demo admin should remain available for local/demo usage but be disabled by default in pilot/production unless intentionally enabled for a controlled reason.

Safety expectations:
- [ ] Demo admin behavior is intentionally configured per runtime.
- [ ] Reserved demo admin identity is not treated as a normal customer registration path when boundary controls are in place.
- [ ] Admin access validation is performed using Supabase-backed admin accounts for pilot/production use.

Related boundary reference:
- `docs/SHOPORA_PRODUCTION_MODE_BOUNDARIES.md`

## 7. Netlify configuration checklist
Netlify is now safe to use operationally, so treat this as a required verification pass rather than an urgent blocker.

- [ ] Site environment variables are configured by environment (preview/production as applicable).
- [ ] Function environment variables are configured and aligned with checkout/webhook needs.
- [ ] Build command is confirmed (for this repo: `npm run build`).
- [ ] Publish directory is confirmed (for this repo: `dist`).
- [ ] Deploy previews/branch deploy behavior is understood so test and production configs are not mixed.
- [ ] Build/deploy usage is monitored for cost-control and team workflow discipline.

## 8. Pilot launch checklist
Before handing ShopOra to a real small business owner for pilot use:

- [ ] Owner account and admin access are confirmed.
- [ ] Demo/admin runtime boundary is confirmed for the pilot environment.
- [ ] Stripe test checkout is validated with evidence.
- [ ] Supabase project configuration is verified.
- [ ] Products/catalog are reviewed for real pilot quality.
- [ ] Order lifecycle expectations are documented (including known limitations).
- [ ] Customer support and policy surfaces are reviewed and operationally owned.
- [ ] No live payments are enabled without explicit approval.

## 9. Troubleshooting / red flags
Investigate immediately if any of the following are true:

- Demo admin is visible in production unexpectedly.
- Live Stripe keys are present before explicit approval.
- Supabase URL or key is missing/mismatched.
- Checkout fails silently or without actionable operator feedback.
- Orders are not visible to admin where expected.
- Production site appears to rely on demo/local fallback data.
- Environment variables changed without a documented retest pass.

## 10. Related docs
- `docs/SHOPORA_PRODUCTION_CONFIDENCE_CHECKLIST.md`
- `docs/SHOPORA_PRODUCTION_MODE_BOUNDARIES.md`
- `docs/SHOPORA_OWNER_SETUP_READINESS.md`
- `docs/SHOPORA_HANDOFF.md`
