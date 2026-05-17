# ShopOra v0.91 Performance and Image Review

## Current Branch

- Branch: `v0.90-next-phase-foundation`
- Current branch tip at review time: `17505fe Add v0.90 next phase foundation`
- v0.80 was merged into `main` through PR #7.
- v0.90 starts from the updated `main` baseline.
- This review is documentation-only and does not change app behavior.

## Current Build Result

- `npm run build` completed successfully for the current branch.
- The latest Vite production build is healthy and can be used as the current baseline for review.

## Largest Visible Assets From The Latest Build

- `dist/assets/index-BzCnlPBl.js` - 459.58 kB
- `dist/assets/index-Ce4WWcv_.css` - 112.40 kB
- `dist/assets/shopora-wordmark-logo-D46bfnsE.png` - 915.13 kB
- `dist/assets/shopora-bag-logo-kWImXUbU.png` - 876.04 kB
- `dist/assets/AccountPage-IIeBVV5O.js` - 22.23 kB
- `dist/assets/ProductFormPage-KruXjA9O.js` - 21.98 kB
- `dist/assets/AdminDashboard-C0cpNN9w.js` - 20.47 kB

## Logo Usage Review

- `src/components/BrandLogo.jsx` is the shared import point for both brand assets.
- `shopora-wordmark-logo.png` is used for wordmark display surfaces such as the footer and order receipt areas.
- `shopora-bag-logo.png` is used for the bag brandmark and as the fallback image inside `ShopOraImage`.
- The brand images are not duplicated across multiple components as separate imports; they flow through the shared `BrandLogo` component.
- The bag logo file is 1254x1254 pixels and the wordmark file is 1448x1086 pixels, which is large relative to the rendered UI sizes.
- Current CSS renders the bag brandmark at roughly 42-48px in most places and the wordmark at roughly 150-235px wide, so the source images are significantly larger than the displayed size.

## Route Splitting Review

- `src/App.jsx` uses `React.lazy` and `Suspense` for route-level code splitting.
- Primary site routes, auth pages, account pages, admin pages, search, and confirmation pages are already split into separate async chunks.
- This is a good baseline because most route payload is deferred until needed.
- Safe follow-up opportunities, if needed later, are mostly in import ordering and further chunk-splitting of any heavy shared page dependencies rather than changing route behavior.

## Image Duplication And Oversize Review

- The same shared brand assets are reused through `BrandLogo`, which avoids asset duplication in source code.
- The logo images themselves appear oversized for their rendered dimensions, so there is likely room for future asset-size optimization without changing UI behavior.
- Product and order imagery already go through `ShopOraImage`, which gives the project a single fallback path and simplifies later image workflow review.

## Risk Level Of Changing Images

- Risk level: medium.
- The UI depends on these assets for branding consistency, so any replacement should preserve dimensions, fallback behavior, and page readability.
- The safest future changes are asset-only swaps or size reductions that do not alter component logic.
- Any image compression or format changes should be validated against the existing build and visual QA flow before adoption.

## Safe Future Optimization Ideas

- Replace the two large logo PNGs with smaller exported versions if a safe built-in asset workflow is already available.
- Consider modern image formats only if the current Vite asset flow can serve them without introducing new dependency or build complexity.
- Audit any repeated product imagery at the page level for oversized source files or unnecessary full-resolution usage.
- Keep the shared `BrandLogo` and `ShopOraImage` wrappers as the stable place for future image policy changes.
- Review whether any route chunk can be split further only if it is clearly heavy and independent.

## Recommended First Optimization Task

- Start with the shared brand logo assets.
- The logo files are the clearest high-impact optimization target because they are large on disk, heavily reused, and rendered at much smaller dimensions.
- Any future work should focus on producing smaller brand assets while preserving the exact visual identity and fallback behavior.

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

## Review Confirmation

- This review does not change app behavior.
- No checkout, order, cart, Stripe, Netlify, Supabase RLS, auth, env, or dependency changes were made.
- This checkpoint is limited to documentation and inspection notes for the next phase.

