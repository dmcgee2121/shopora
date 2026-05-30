# ShopOra Owner Setup Readiness

## Purpose
This guide gives a small business owner a practical launch-readiness checklist inside ShopOra admin.
It is operational guidance only and does not change checkout, order creation, payment flows, or backend contracts.

## What a business owner needs before launch
- A clear understanding of what is configured today versus what still needs setup.
- Intentional runtime settings so demo/local behavior is not confused with production behavior.
- A final manual verification pass for payment, order, and security operations.

## Storefront setup
- Add final business name, brand voice, and logo treatment across storefront and admin surfaces.
- Review homepage, category, and support copy for accuracy.
- Confirm contact and support information shown to shoppers is current.

## Catalog setup
- Add real product names, descriptions, prices, photos, sizes/colors, and inventory counts.
- Review sale/new/stock labels so merchandising signals remain accurate.
- Resolve product records flagged by admin readiness panels before launch review.

## Payment setup
- Configure Stripe test and live credentials in the correct environment.
- Run deliberate Stripe checkout and webhook testing before launch approval.
- Keep checkout messaging honest about test-mode versus live behavior.

## Order/fulfillment setup
- Define internal steps for packing, shipping, cancellation handling, and refunds.
- Review admin order visibility and current operational limitations with your team.
- Confirm support handoff expectations for order-related customer questions.

## Policy/support setup
- Finalize shipping, returns, privacy, and contact content.
- Set a real support inbox/contact process with ownership and response expectations.
- Ensure policy links and help routes are visible from key shopper flows.

## Runtime/production safety
- Set runtime mode intentionally for each environment (`demo`, `pilot`, `production`).
- Disable demo admin before launch and verify approved admin access only.
- Confirm Supabase admin roles and RLS posture for production data boundaries.
- Avoid mixing local/demo fallback assumptions with live-backed operational expectations.

## What is still not production-ready
- This checklist does not replace final live payment and webhook confidence testing.
- This checklist does not add backend order mutation features or fulfillment automation.
- This checklist does not replace full production security hardening and operational monitoring.

## Recommended next sprint
- Run an explicit production-confidence sprint focused on:
  - Stripe live-ready checkout and webhook verification
  - Order operations/fulfillment workflow hardening
  - Runtime/auth boundary validation in production mode
  - Final business-policy and support operations sign-off
