# ShopOra Production Mode Boundaries

## Purpose
This note defines a safer boundary between demo/local behavior and production-facing behavior.
It improves runtime clarity and guardrails, but it does not complete full production hardening.

## Runtime Modes
ShopOra now supports a centralized runtime mode helper with:

- `VITE_SHOPORA_RUNTIME_MODE=demo|pilot|production`
- Default mode: `demo` when not explicitly set

Current helper outputs:

- `SHOPORA_RUNTIME_MODE`
- `isProductionRuntime`
- `isDemoRuntime`
- `isDemoAdminEnabled`
- `getRuntimeModeLabel()`

## Current Default Behavior
Default behavior is intentionally preserved:

- If no new env flags are set, ShopOra behaves like demo mode today.
- Demo admin remains available by default in demo and pilot-style local usage.
- Existing localStorage fallback behavior is unchanged.

## Demo Admin Behavior
Demo admin access is now runtime-aware:

- `VITE_SHOPORA_ENABLE_DEMO_ADMIN` can explicitly enable/disable demo admin.
- In `production` runtime, demo admin is disabled by default unless explicitly re-enabled.
- In non-production runtime, demo admin remains enabled by default.
- When demo admin is disabled, the default demo admin user is not auto-created.

This is a boundary clarity change, not a full auth hardening rewrite.

## localStorage Fallback Behavior
localStorage fallback behavior remains in place for this sprint, including:

- local/demo auth/session fallback
- local cart persistence
- local fallback catalog/order behavior where applicable

No fallback systems were removed in this step.

## Supabase-Backed Behavior
Supabase-backed flows remain unchanged in this sprint:

- customer auth/profile paths
- saved-items persistence
- customer order persistence and read paths
- admin order read visibility via existing RPC

No Supabase schema or RLS changes are included here.

## Stripe Checkout Boundary
Stripe Checkout and Netlify Functions are intentionally untouched:

- no checkout submission logic changes
- no Stripe function changes
- no Netlify function changes
- no live payment behavior changes

Checkout/payment reliability still requires its own deployed test and hardening pass.

## What Must Be True Before Offering To A Real Business Owner
At minimum:

- server-trusted admin access and role enforcement are fully hardened
- demo admin/local fallback behavior is intentionally disabled for launch runtime
- checkout/webhook behavior is validated in deployed test mode with clear operational evidence
- order operations and fulfillment boundaries are explicit (or fully implemented)
- legal/policy/business copy is finalized for real business use

## Recommended Env Flags
Recommended starting points:

- Local/demo work:
  - `VITE_SHOPORA_RUNTIME_MODE=demo`
  - `VITE_SHOPORA_ENABLE_DEMO_ADMIN=true` (or unset)

- Pilot-style review:
  - `VITE_SHOPORA_RUNTIME_MODE=pilot`
  - `VITE_SHOPORA_ENABLE_DEMO_ADMIN=true|false` based on review needs

- Production-facing runtime:
  - `VITE_SHOPORA_RUNTIME_MODE=production`
  - `VITE_SHOPORA_ENABLE_DEMO_ADMIN=false` (explicitly recommended)

## Known Limitations
- This change does not replace client-side route gating with full server-side trust.
- This change does not remove local/demo fallback persistence.
- This change does not add live admin fulfillment writes.
- This change does not complete payment operations hardening.

## Future Hardening Checklist
- Remove or isolate demo auth paths from production runtime entirely.
- Replace remaining local fallback persistence with server-trusted production paths.
- Harden admin authorization and auditing beyond frontend guards.
- Complete checkout/webhook failure-path and reconciliation hardening.
- Add production operational tooling for fulfillment, refunds, and customer communications.

