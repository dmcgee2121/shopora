# ShopOra v1.21 Portfolio Demo Readiness Planning

## Scope

This checkpoint is documentation-only. It records the current portfolio/demo strengths, the best route flow to present them, and the caveats to explain honestly before any public walkthrough. It does not change app behavior.

## Current ShopOra Demo And Portfolio Strengths

- The storefront already covers a believable shopper journey from discovery to checkout and receipt recovery.
- The customer account area shows persisted profile data, saved items, and order history in a way that can be explained clearly in a demo.
- The admin area shows a realistic operations view with dashboard summaries, order lists, quick-view detail panels, and read-only live Supabase messaging.
- The app already has a strong local-first story, which is useful for demos because it keeps the walkthrough stable and predictable.
- The UI has recently been tightened so read-only/live distinctions, receipt wording, and order-history states are easier to narrate.

## What Has Recently Improved

- Profile persistence now has a clearer, narrower Supabase-backed path.
- Saved-items persistence now has a clearer mixed local/demo and Supabase-backed model.
- Read-only order history work is parked and documented, so the customer story is easier to explain.
- The admin order-management prototype now presents fulfillment readiness, contact context, notes placeholders, and next-step guidance more clearly.
- Image optimization was completed, which helps the storefront and demo screens load more efficiently.
- The checkout and Stripe production test checklist is already documented, which supports a more honest demo narrative around checkout confidence.

## What Should Be Shown In A Portfolio Or Demo Walkthrough

- Show the customer journey first, because it tells the strongest end-to-end story.
- Show the account area second, because it demonstrates persistence and repeat visits.
- Show the admin area last, because it demonstrates operational maturity without implying unsupported live write behavior.
- Keep the walkthrough concise and intentional rather than trying to cover every page.
- Use the route sequence to show both storefront polish and the clearly separated admin workflow story.

## Recommended Demo Route Flow

1. Home
2. Category or search
3. Product detail
4. Saved items
5. Account profile
6. Order history
7. Admin dashboard
8. Admin orders
9. Checkout render-only

## Route Notes For The Walkthrough

- Home: show merchandising, featured products, and the overall storefront tone.
- Category or search: show discovery, filtering, and product browsing depth.
- Product detail: show product storytelling, image quality, and buying confidence cues.
- Saved items: show that saved items are persisted and revisitable.
- Account profile: show persisted profile data and customer self-service context.
- Order history: show that customer orders are read-only and recoverable.
- Admin dashboard: show the operations summary and live vs local/demo distinction.
- Admin orders: show the list, quick views, prototype panels, and live-read-only wording.
- Checkout render-only: show that checkout is present and stable without implying live payment testing in a public demo.

## Risks And Caveats To Explain Honestly

- Admin order mutation is still prototype/read-only in the live Supabase path.
- Checkout should be demo or test-mode only when shown in a public walkthrough.
- Netlify deploys should be batched because deploy credits are limited.
- Local/demo behavior should not be presented as production admin authorization.
- The portfolio narrative should avoid promising live fulfillment actions that are not implemented yet.

## Suggested Future Polish Before Showing Publicly

- Do a small mobile pass on the key demo routes.
- Recheck the empty, loading, and read-only states on account and order pages.
- Make sure the demo identity and order state are clean and intentional.
- Confirm the admin source labels remain obvious in the current browser profile.
- Keep any future copy tweaks separate from behavior changes.

## Netlify Credit Strategy Reminder

- Do not merge every small branch.
- Batch release intentionally.
- Spend deploy credits only when the change set is worth a public deploy or preview.

## No-Touch Areas Preserved

- Checkout submission.
- Order creation.
- Cart business logic.
- Stripe functions.
- Netlify functions and environment settings.
- Supabase RLS.
- Auth behavior.
- Env files and secrets.
- Package and dependency files.
- Backend schema work.
- Live order mutation behavior.

## Confirmation

This checkpoint does not change app behavior. It only records the portfolio and demo readiness plan for future presentation work.
