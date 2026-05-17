# ShopOra v1.35 Admin Launch Visual QA Checklist

## Checkpoint Summary

- v1.35 is a local visual QA checkpoint for the parked admin launch-readiness batch.
- Use this branch to manually click through and visually inspect the v1.29-v1.34 admin launch-readiness work.
- No merge or deploy should happen unless the batch is explicitly approved.

## Manual Browser Flow

- Open the app locally.
- Sign into the admin area if needed.
- Navigate to the admin dashboard.
- Click through the launch-readiness panels and route links.
- Verify the pages read clearly at each viewport.

## Route Checklist

- `/admin`
- `/admin/products`
- `/admin/products/new` if the route exists
- `/admin/orders`
- `/`
- `/search`
- `/account`
- `/saved`
- `/orders`
- `/checkout` only in a safe local or test-mode context

## Visual QA Checklist

### Admin Dashboard

- [ ] Admin dashboard loads without layout breakage
- [ ] Seller launch command center is visible
- [ ] Launch readiness labels are clear and honest
- [ ] Pre-launch QA notes are visible and advisory only
- [ ] Launch release notes panel is visible and honest

### Storefront And Product Flow

- [ ] Storefront preview/checklist CTAs point to existing routes only
- [ ] Product launch checklist is readable
- [ ] Product editor readiness guidance is readable
- [ ] Store readiness section is readable
- [ ] Product/admin CTAs point to existing routes only

### Account And Orders

- [ ] Admin orders area remains prototype/read-only where applicable
- [ ] Customer account/profile persistence messaging remains accurate
- [ ] Saved-items persistence messaging remains accurate
- [ ] Customer order history/read-only messaging remains accurate
- [ ] Checkout/test-mode messaging does not imply live payment changes

### Visual Safety Checks

- [ ] No overlapping text
- [ ] No clipped buttons or badges
- [ ] Status badges remain understandable
- [ ] CTA buttons remain readable
- [ ] Cards wrap cleanly
- [ ] Long dashboard scroll behavior feels usable
- [ ] No excessive visual clutter

## Viewport Checks

- [ ] Desktop width
- [ ] Tablet-ish width
- [ ] Mobile width
- [ ] Dashboard panels reflow cleanly on narrower screens
- [ ] CTA rows wrap without overflow
- [ ] Status badges stay legible at smaller sizes

## Safe QA Notes

- `npm run build`
- `npm run dev`
- Browser click-through only
- No live payments
- No production SQL
- No writes to checkout, orders, cart, auth, or admin mutation flows

## Pass / Fail Notes Template

- Admin dashboard:
  - Pass / Fail:
  - Notes:
- Seller launch command center:
  - Pass / Fail:
  - Notes:
- Launch readiness polish:
  - Pass / Fail:
  - Notes:
- QA notes:
  - Pass / Fail:
  - Notes:
- Release notes panel:
  - Pass / Fail:
  - Notes:
- Storefront preview links:
  - Pass / Fail:
  - Notes:
- Product/admin links:
  - Pass / Fail:
  - Notes:
- Orders read-only behavior:
  - Pass / Fail:
  - Notes:
- Account and saved-items messaging:
  - Pass / Fail:
  - Notes:
- Checkout messaging:
  - Pass / Fail:
  - Notes:

## Untouched Systems

- Checkout submission
- Order creation
- Cart business logic
- Stripe functions
- Netlify functions/env
- Supabase RLS
- Auth behavior
- Env files/secrets
- Package/dependency files
- Storefront behavior

## Release-Hold Reminder

- v1.29 through v1.35 remain parked release-hold branches.
- Do not merge or deploy unless explicitly approved.
- Keep future release review intentional so Netlify credits are spent only when the batch is worth it.

## Confirmation

This checkpoint does not change app or backend behavior. It only records the local visual QA checklist for the parked launch-readiness batch.
