# ShopOra v1.14 Checkout And Stripe Production Test Checklist

## Scope

This checkpoint records the production-readiness test checklist for checkout and Stripe. It is documentation only and does not change checkout submission, order creation, cart behavior, Stripe functions, Netlify functions, auth, or any runtime behavior.

## Current Checkout And Stripe Behavior

- Checkout is split by auth source.
- Supabase-authenticated customers use the Stripe checkout handoff path.
- Local/demo users stay on the demo checkout path.
- Checkout creates orders before Stripe handoff for the Supabase path.
- The checkout flow expects the existing order and order-item snapshot structure to remain stable.
- Stripe session creation happens through the existing Netlify function path.
- Order confirmation and receipt recovery still depend on the persisted order record and, for the Stripe path, the checkout session identifier.

## What Should Be Tested Before Any Future Checkout-Related Release

- Confirm the cart still reaches checkout with the expected item, subtotal, shipping, tax, and total values.
- Confirm local/demo checkout still creates a demo order and returns to the order confirmation page.
- Confirm Supabase-authenticated checkout still creates the order record before Stripe handoff.
- Confirm Stripe handoff still produces a redirect URL in test mode.
- Confirm order confirmation still resolves the order after redirect.
- Confirm receipt/detail pages still show the same order snapshot after checkout.
- Confirm checkout failures still leave the app in a recoverable state.
- Confirm no branch of the checkout flow changes local/demo behavior unintentionally.

## Local Test Checklist

- Add items to the cart and open `/checkout`.
- Verify the shipping, tax, and total calculations are correct for the current cart.
- Verify the signed-in customer form is prefilled from the current profile when available.
- Verify the local/demo checkout branch still creates a demo order.
- Verify the Supabase-authenticated checkout branch still proceeds to Stripe handoff.
- Verify the confirmation page loads after a local/demo checkout.
- Verify the receipt page loads from the order list after checkout.
- Verify the checkout error state is readable and does not lose cart context.

## Netlify Deploy-Preview And Production Checklist

- Confirm the Netlify function path for Stripe checkout is correct in the deployed environment.
- Confirm the deploy-preview build can reach the checkout page and submit a test-order flow.
- Confirm the deploy-preview build does not require any new env vars or secrets.
- Confirm the production build still uses the same checkout and order creation paths as local.
- Confirm any checkout changes are batched intentionally before spending deploy credits.
- Confirm the release candidate is worth deploying before moving a branch to main.

## Stripe Test-Mode Checklist

- Use Stripe test mode only.
- Confirm checkout session creation returns a redirect URL.
- Confirm the Stripe redirect shows the expected test payment flow.
- Confirm canceled or failed test sessions return the app to a safe state.
- Confirm successful test checkout still leads back to the order confirmation path.
- Confirm no live payments are attempted during checklist execution.

## Supabase Order And Order Items Verification Checklist

- Confirm the checkout-created order appears in `public.orders` for the authenticated customer.
- Confirm the related rows appear in `public.order_items`.
- Confirm the order snapshot includes the fields the receipt pages need.
- Confirm the row ownership still matches the authenticated user.
- Confirm the order can be recovered by order id after refresh.
- Confirm the order can be recovered by Stripe checkout session id when relevant.
- Confirm live SQL is not run against production.
- Confirm no Supabase migrations or RLS changes are required for the test pass.

## Netlify Credit Strategy

- Do not merge or deploy every small branch.
- Batch changes intentionally.
- Use draft PRs and local QA as parking spots.
- Only deploy when the release batch is worth spending credits.
- Hold checkout or Stripe work until there is enough related work to justify a deploy preview or production deploy.

## Rollback Notes

- This checkpoint is documentation-only.
- If a future checkout or Stripe release needs rollback, start with the docs and then the specific runtime changes that introduced the issue.
- No database rollback is required for this checklist checkpoint.

## No-Touch Areas Preserved

- Checkout submission.
- Order creation.
- Cart business logic.
- Stripe functions.
- Netlify functions and environment settings.
- Supabase RLS.
- Auth login, register, session, and logout behavior.
- Env files and secrets.
- Package and dependency files.

## Confirmation

This checkpoint does not change:

- checkout submission
- order creation
- cart business logic
- Stripe
- Netlify functions or env
- Supabase RLS
- auth behavior
- env files or secrets
- package/dependency files

