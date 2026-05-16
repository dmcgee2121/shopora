# ShopOra v0.96 Checkout and Stripe Confidence Review

## Current Branch

- Branch: `v0.90-next-phase-foundation`
- Current branch tip at review time: `17505fe Add v0.90 next phase foundation`
- v0.80 was merged into `main` through PR #7.
- v0.90-v0.95 are already committed on the next-phase foundation branch.
- This checkpoint is documentation-first and does not change app behavior.

## Current Checkout Behavior

- `src/pages/CheckoutPage.jsx` validates customer and shipping fields before placing an order.
- The checkout page computes shipping, tax, and total in the client for display and order payload use.
- When the current auth source is Supabase, the checkout flow creates an order and then hands off to Stripe Checkout.
- When the current auth source is local/demo, the checkout flow creates a local demo order and routes to the local confirmation page.
- Checkout submission is currently a two-step behavior in Supabase mode: order first, Stripe session second.

## Current Stripe Touchpoints

- `src/services/stripeCheckoutService.js` is the main Stripe Checkout session touchpoint.
- The service builds the Netlify Functions base URL from `VITE_NETLIFY_FUNCTIONS_BASE_URL` or the default `/.netlify/functions`.
- The service uses Supabase session state when present and sends the order id to the checkout session function.
- The checkout page expects a redirect URL back from the Stripe session response.
- Stripe-related errors are surfaced as user-facing messages that say the order was saved but payment could not continue.

## Current Local / Demo Fallback Behavior

- If the auth source is local, checkout creates a demo order in browser-local state.
- Demo checkout does not attempt a Stripe redirect.
- Demo checkout routes to the local order confirmation page.
- Local cart data remains browser-local through `src/context/CartContext.jsx`.
- Local order persistence and local order history live in browser storage and the local orders context.

## Current Production / Supabase / Stripe Behavior Assumptions

- Supabase-backed checkout assumes the current user session is valid and available.
- Supabase-backed checkout assumes the `create_customer_order` RPC can save the order before Stripe handoff.
- Stripe-backed checkout assumes the Netlify function can create a checkout session and return a usable redirect URL.
- Production checkout confidence depends on both the order write path and the Stripe redirect path staying healthy.
- If either the order write or the Stripe session path fails, the user sees a save-or-payment error state rather than a silent failure.

## Known Risks

- A failure between order creation and Stripe redirect can leave a saved order without a completed payment.
- Netlify function availability or environment mismatch could break the Stripe session step.
- Supabase order writes depend on the current auth session and backend permissions.
- Checkout validation is client-side, so backend validation must still remain authoritative.
- Local/demo behavior can make the checkout page feel healthy even when live Supabase/Stripe paths still need separate verification.

## Recommended Future Test Checklist

- Confirm checkout validation rejects missing and malformed customer fields.
- Confirm local/demo checkout creates a demo order and routes to confirmation without Stripe.
- Confirm Supabase-backed checkout creates an order before Stripe handoff.
- Confirm Stripe session creation returns a redirect URL in the live path.
- Confirm the redirect lands on the expected success/confirmation flow.
- Confirm failure handling preserves the saved order and shows a clear message.
- Confirm the order appears in the customer account and admin order views after checkout.
- Confirm the Netlify function base URL matches the deployment target used for checkout.

## What Should Remain Untouched Until A Dedicated Checkout Task

- checkout submission flow.
- order creation flow.
- cart business logic.
- Stripe functions.
- Netlify functions/env.
- Supabase RLS.
- auth behavior.
- env files/secrets.
- package/dependency files.
- any live payment behavior changes.

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

## Confirmation

- This checkpoint does not change checkout submission behavior.
- This checkpoint does not change order creation behavior.
- This checkpoint does not change Stripe functions.
- This checkpoint does not change Netlify functions or env handling.
- This checkpoint does not change Supabase RLS, auth, or cart behavior.
- This checkpoint is limited to inspection notes and readiness documentation.

