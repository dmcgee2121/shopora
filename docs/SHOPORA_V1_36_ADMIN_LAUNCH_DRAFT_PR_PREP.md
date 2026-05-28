# ShopOra v1.36 Admin Launch Draft PR Prep

## Suggested Draft PR Title

`Admin launch readiness batch: seller launch command center, QA notes, release notes, and local QA prep`

## Suggested Base / Head

- Base: `main`
- Head: `v1.36-admin-launch-draft-pr-prep`

## Suggested Draft PR Body

### Summary

This draft PR packages the parked v1.29-v1.35 admin launch-readiness batch into a clean review bundle for a future intentional release decision.

The batch focuses on launch-readiness visibility, manual QA guidance, and honest prototype/read-only messaging for the admin and storefront surfaces.

### What Changed

#### Admin seller launch readiness

- v1.29 added the seller launch command center.
- v1.30 polished the launch-readiness hierarchy and summary copy.
- v1.31 added launch QA notes for manual smoke testing.
- v1.32 added the launch release notes panel for a concise readiness recap.

#### Product / storefront readiness guidance

- v1.25 added the admin store-readiness dashboard.
- v1.26 added the admin product launch checklist.
- v1.27 added the admin product editor readiness guidance.
- v1.28 added the admin storefront preview checklist.
- The launch-readiness work now gives the seller a clearer buyer-facing and admin-facing view of what is ready, what needs review, and what remains future backend work.

#### QA and release-prep documentation

- v1.33 added the admin launch batch handoff checkpoint.
- v1.34 added the local QA checkpoint for the parked launch-readiness batch.
- v1.35 added the visual QA checklist for manual browser inspection.
- These checkpoints make it easier to review the parked batch locally before any future draft PR or batched release review.

#### Honest prototype / read-only / future-backend messaging

- Order history remains read-only where applicable.
- Admin order operations remain prototype/read-only.
- Checkout remains test-mode or render-only in the readiness messaging unless a deliberate payment QA session is being run.
- Live order mutation, refunds, and fulfillment are still future backend work and are not implied as implemented.

### What Did Not Change

- Checkout submission
- Order creation
- Cart business logic
- Stripe functions
- Netlify functions/env
- Supabase RLS
- Auth behavior
- Env files/secrets
- Package/dependency files

### Testing

- `npm run build`
- Manual local visual QA performed
- Admin dashboard launch-readiness panels reviewed
- Route checklist reviewed in local/dev context

### Deployment Note

- This is a draft PR prep checkpoint only.
- Do not merge or deploy without explicit approval.
- Netlify credits are limited, so future release decisions should stay intentional.
- These branches are parked for future batching, not for automatic release.

### Notes For Reviewers

- The batch is documentation-heavy and UI-light.
- The changes are centered on launch readiness, QA guidance, and honest prototype boundaries.
- No live mutation, refund, fulfillment, or production admin order operations were added.
- No checkout or backend behavior was changed.

## Quick PR Checklist

- [ ] Build passes locally
- [ ] Manual QA notes are current
- [ ] Visual QA checklist is current
- [ ] Draft PR description is ready to paste
- [ ] No merge/deploy action has been taken

## Confirmation

This checkpoint is documentation-first and does not change app or backend behavior.
