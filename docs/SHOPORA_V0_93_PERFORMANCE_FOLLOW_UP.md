# ShopOra v0.93 Performance Follow-Up

## Current Branch

- Branch: `v0.90-next-phase-foundation`
- Current branch tip at follow-up time: `17505fe Add v0.90 next phase foundation`
- v0.80 was merged into `main` through PR #7.
- v0.90 foundation, v0.91 performance/image review, and v0.92 image usage optimization prep are already committed.
- This follow-up is documentation-only and does not change app behavior.

## Current Build Result Summary

- `npm run build` completed successfully.
- The current production build remains healthy after the v0.92 image usage prep pass.
- The app behavior is unchanged by this follow-up checkpoint.

## Current Largest Assets / Chunks

- `dist/assets/index-BYcvreMc.js` - 459.64 kB
- `dist/assets/index-Ce4WWcv_.css` - 112.40 kB
- `dist/assets/shopora-wordmark-logo-D46bfnsE.png` - 915.13 kB
- `dist/assets/shopora-bag-logo-kWImXUbU.png` - 876.04 kB
- `dist/assets/AccountPage-DZbe_qwD.js` - 22.23 kB
- `dist/assets/ProductFormPage-Ctf5MonM.js` - 21.98 kB
- `dist/assets/AdminDashboard-BWwAt0Ue.js` - 20.47 kB

## What Changed After v0.92

- The shared `BrandLogo` component now includes intrinsic `width` and `height` attributes for the wordmark and bag logo images.
- The production build output reflects a small JS chunk hash/size shift because the component source changed.
- The two source logo PNG files themselves were not compressed, replaced, or removed.

## What Did Not Change

- The rendered brand look did not change.
- Checkout submission did not change.
- Order creation did not change.
- Cart business logic did not change.
- Stripe functions did not change.
- Netlify functions/env did not change.
- Supabase RLS did not change.
- Auth behavior did not change.
- Env files and secrets did not change.
- Package and dependency files did not change.
- Route splitting remained in place as already implemented in `src/App.jsx`.

## Image Compression Guidance

- Image-file compression should be handled later as a separate manual or asset task.
- The current task intentionally avoided image compression, new image tooling, and asset pipeline changes.
- The brand logos remain the clearest future asset-size target if a safe built-in workflow is already available.

## Safe Next Recommendations

- Keep the current `BrandLogo` sizing metadata as the baseline.
- If image optimization is pursued later, start with manual logo export reduction before touching broader image handling.
- Use visual QA to confirm the existing shared wrappers still render correctly across the navbar, footer, auth pages, account pages, admin pages, and order receipts.
- Review any future performance work only after confirming the current build remains stable.

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

## Review Decision

- No additional safe code change was obvious for this follow-up pass.
- This checkpoint is therefore docs-only and serves as a stable handoff note for future performance or asset work.

