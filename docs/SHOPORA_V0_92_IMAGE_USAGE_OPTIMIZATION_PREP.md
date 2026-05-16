# ShopOra v0.92 Image Usage Optimization Prep

## Current Branch

- Branch: `v0.90-next-phase-foundation`
- Current branch tip at prep time: `17505fe Add v0.90 next phase foundation`
- v0.80 has been merged into `main` through PR #7.
- v0.90 foundation and v0.91 performance/image review checkpoints are already committed.
- This prep pass keeps behavior unchanged and focuses on safe image usage cleanup.

## What Was Inspected

- Shared brand logo usage in `src/components/BrandLogo.jsx`.
- Brand logo render locations in the navbar, footer, auth pages, account pages, cart, checkout, admin surfaces, and order receipt pages.
- Fallback brandmark usage inside `src/components/ShopOraImage.jsx`.
- The current build output and the largest emitted assets.
- Route-level code splitting in `src/App.jsx`.
- CSS sizing for brand logos and image wrappers in `src/styles/global.css` and `src/styles/admin.css`.

## Safe Change Made

- Added explicit intrinsic `width` and `height` attributes to the shared `BrandLogo` image element.
- The bag logo now reports `1254x1254` and the wordmark logo now reports `1448x1086`.
- This keeps the visual look unchanged while giving the browser the correct aspect ratio information up front.
- No image assets were replaced or removed.

## Changes Intentionally Avoided

- No checkout submission changes.
- No order creation changes.
- No cart business logic changes.
- No Stripe function changes.
- No Netlify function/env changes.
- No Supabase RLS changes.
- No auth behavior changes.
- No env files/secrets changes.
- No package/dependency changes.
- No new image tooling or optimization dependencies.
- No asset compression workflow changes.
- No app behavior changes.

## Build Result

- `npm run build` completed successfully after the prep change.
- The app still builds cleanly with the same overall routing and UI behavior.

## No-Touch Areas Preserved

- all app behavior
- checkout submission
- order creation
- cart business logic
- Stripe functions
- Netlify functions/env
- Supabase RLS
- auth behavior
- env files/secrets
- package/dependency changes

## Recommended Next Optimization Step

- If a future built-in asset workflow is available, reduce the on-disk size of the two brand logo PNGs before touching any broader image pipeline.
- If not, keep the current logo change as a safe baseline and review any future product-image optimization only after visual QA confirms the current image wrappers still behave correctly.

