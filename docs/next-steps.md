# ShopOra Next Steps

## v0.5

Post-payment inventory and fulfillment.

## Recommended Roadmap

1. Add inventory handling after payment confirmation.
2. Add Supabase admin roles and admin product writes later.
3. Add image uploads and storage later.
4. Harden deployment, environment configuration, and production observability later.

## Notes

- Keep the demo admin flow local-only until admin auth is deliberately designed.
- Keep local/demo fallback behavior intact while Stripe is introduced.
- Treat inventory changes as a post-payment concern, not a checkout concern.
