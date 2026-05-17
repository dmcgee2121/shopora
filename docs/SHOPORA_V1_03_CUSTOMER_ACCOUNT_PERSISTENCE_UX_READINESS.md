# ShopOra v1.03 Customer Account Persistence UX Readiness

## Scope

This checkpoint is a copy-and-clarity pass for the customer account experience. It makes the current account page easier to read as a mix of persisted account data, local/demo fallback state, and future persistence work, without changing behavior.

## What Was Improved

- Clarified that saved items and order history follow the current account context.
- Clarified that recently viewed products are still browser-local.
- Clarified that the preference preview is derived from saved items and recent views and does not create a backend preference record.
- Clarified that the account dashboard snapshot mixes persisted account data with local browser activity where appropriate.
- Clarified the profile readiness and order history copy so the page better signals what is already tied to the account.

## Current Behavior

- The customer account page still shows profile details, default shipping address, saved items, order history, recently viewed products, and derived preference hints.
- The profile edit form still saves through the existing profile flow.
- Saved items and orders still follow the existing auth/source behavior.
- Recently viewed products still stay local to the browser.
- Account preference hints still remain frontend-only and derived from existing state.

## Persisted Versus Local / Demo

- Persisted or account-tied today:
  - profile information, including default shipping address
  - saved items when the Supabase path is active
  - order history from the current account source
- Local or browser-only today:
  - recently viewed products
  - derived preference preview content
  - demo fallback user/session state
- Future work only:
  - any separate preference center
  - any broader account persistence redesign

## What Remains Intentionally Unimplemented

- No new persistence model was added.
- No new Supabase mutation path was added.
- No backend, schema, or RLS work was introduced.
- No auth, checkout, cart, order creation, Stripe, or Netlify behavior was changed.

## No-Touch Areas Preserved

- Auth login, register, session, and logout behavior.
- Profile persistence behavior.
- Saved items persistence behavior.
- Checkout submission.
- Order creation.
- Cart business logic.
- Stripe functions.
- Netlify functions and environment settings.
- Supabase RLS.
- Package and dependency files.
- Backend/schema work.

## Recommended Next Step

- If the product wants real account persistence expansion, the next milestone should be a dedicated auth/RLS/backend task that defines the customer data model before any write-path changes.

## Confirmation

This checkpoint does not change:

- auth behavior
- profile persistence
- saved items persistence
- checkout submission
- order creation
- Stripe
- Netlify functions or env
- Supabase RLS
- cart behavior

