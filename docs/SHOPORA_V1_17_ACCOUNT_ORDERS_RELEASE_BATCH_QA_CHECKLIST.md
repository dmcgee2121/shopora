# ShopOra v1.17 Account And Orders Release Batch QA Checklist

## Scope

This checkpoint is documentation-only. It packages the parked account/orders release batch history and records the recommended QA checklist before any future merge or deploy. It does not change app behavior.

## Current Parked Local Batch Status

- v1.12 read-only Supabase order history helper is complete and parked.
- v1.13 release hold is complete and parked.
- v1.14 checkout/Stripe production test checklist is complete and parked.
- v1.15 Netlify credit strategy is complete and parked.
- v1.16 order history UI polish is complete and parked.
- v1.17 captures the current account/orders release batch QA checkpoint.

## Recommended QA Checklist Before Any Future Merge Or Deploy

- Account profile persistence: confirm editable profile fields still save, reload, and remain consistent after refresh.
- Saved-items persistence: confirm saved items still persist for the current auth source split and remain stable after refresh or sign-out/sign-in.
- Order history read-only behavior: confirm customer order history remains read-only and does not expose mutation controls.
- Order detail views: confirm receipt and detail pages still resolve the expected order record and show the right unavailable state when needed.
- Local/demo fallback behavior: confirm browser-local customer flows still work when Supabase-backed reads are unavailable.
- Logged-out behavior: confirm anonymous users still see safe fallback behavior and do not leak account-only data.
- Cart: confirm the cart still behaves exactly as expected and no unrelated totals or item-state regressions appear.
- Checkout render-only: confirm the checkout page renders correctly without changing checkout submission, order creation, or payment logic.
- Admin orders: confirm admin order views still load and remain read-only where expected.
- Mobile spot check: confirm the account and order surfaces still read cleanly on a small-screen viewport.

## Netlify Credit Reminder

- Do not merge every small branch.
- Batch release intentionally.
- Deploy only when the batch is ready and worth the credit spend.

## No-Touch Areas Preserved

- App runtime behavior.
- Checkout submission.
- Order creation.
- Cart business logic.
- Stripe functions.
- Netlify functions and environment settings.
- Supabase RLS.
- Auth behavior.
- Env files and secrets.
- Package and dependency files.
- Backend or schema work.
- Live order mutation behavior.

## Confirmation

This checkpoint does not change app behavior. It only records the parked batch status and the QA checklist for future merge or deploy decisions.
