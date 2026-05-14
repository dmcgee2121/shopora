# ShopOra v0.58 Admin Merchandising QA

## Branch And Build Status

- Branch: `v0.58-admin-merchandising-controls`
- Current local state: admin merchandising and catalog readiness polish completed locally
- Build status: `npm run build` passed with Vite and 153 modules transformed

## Files Changed

- `src/components/CatalogStatusNote.jsx`
- `src/pages/admin/AdminDashboard.jsx`
- `src/pages/admin/AdminProductsPage.jsx`
- `src/pages/admin/ProductFormPage.jsx`
- `src/utils/catalogReadiness.js`
- `src/styles/global.css`
- `docs/SHOPORA_HANDOFF.md`

## Admin Merchandising Areas Improved

- Catalog readiness now calls out more of the fields that make a product feel complete, including image, brand, SKU, category, department, pricing, stock, and merchandising detail gaps.
- The admin product list now shows clearer storefront-readiness labels and supporting merchandising cues so an admin can scan for missing images, low stock, sale readiness, and weak discovery signals faster.
- The admin dashboard readiness copy is more actionable and points admins toward the highest-value catalog fixes before screenshots, demos, or future launch prep.
- The product editor now has clearer guidance around images, review counts, merchandising details, and shipping/returns notes so the readiness panel and the form copy stay aligned.
- The shared catalog status note now explains what the admin readiness checks cover.

## Intentionally Not Touched

The following areas remain out of scope and unchanged:

- checkout submission
- order creation
- Stripe functions
- Netlify functions/env
- Supabase RLS
- auth behavior
- env files/secrets

## Local Smoke-Test Checklist

- Open `/admin/login` and confirm the admin shell still loads normally after sign-in.
- Open `/admin` and confirm the readiness summary, attention cards, and quick actions still render cleanly.
- Open `/admin/products` and confirm the table and mobile product cards show the new merchandising cues without breaking layout.
- Open `/admin/products/new` and `/admin/products/:id/edit` and confirm the editor guidance reads cleanly beside the product form.
- Confirm the readiness badges do not rely on color alone and still read clearly with keyboard focus.
- Confirm the product list still supports search, filters, edits, and deletes without changing the underlying catalog behavior.
- Scan the browser console for route-breaking errors.

## Accessibility Notes

- Readiness labels are paired with text and not color-only indicators.
- The shared status note and product list copy remain readable with keyboard focus and on smaller screens.
- The new helper text stays lightweight so it does not crowd the editor or table layouts.

## Known Limitations

- This is a frontend merchandising/readiness polish pass, not a backend catalog model change.
- No new data fields or persistence behavior were added.
- Discovery and readiness cues still depend on the existing catalog data already in the app.
- Product review and discovery support remain presentation-only signals.

## Recommended Next Step

- If this pass looks good locally, move to the next safe local branch or a deliberate release-candidate review after manual admin QA.
- Keep deploy decisions separate until you are ready to spend Netlify credits.
- Before any deploy, confirm live admin orders with `get_admin_orders()` RPC and the admin role mapping for `dmcgee2121@gmail.com`.
