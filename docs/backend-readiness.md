# ShopOra Backend Readiness Notes

## A. Current Prototype Architecture

ShopOra is currently a frontend-only React + Vite storefront/admin prototype. Most app state lives in client contexts and is persisted in `localStorage` so the demo survives refreshes:

- `AuthContext` owns mock users, the active session, and saved-item state for local fallback users.
- Supabase customers use `public.saved_items` for wishlist persistence.
- `ProductCatalogContext` owns the seeded catalog and admin product CRUD.
- `CartContext` owns the shopping cart.
- `OrdersContext` owns demo order creation, status updates, and cancellation, plus Supabase-backed customer order reads and writes when configured.
- Route guards are client-side only.
- Checkout supports Supabase customer orders and local/demo fallback, and Stripe Checkout test mode is wired through Netlify Functions for Supabase customers. Stripe payment-state fields are scaffolded on orders, but live payment capture is still test-mode only.

This is a useful prototype shape, but none of the current persistence or authorization behavior should be treated as production-ready.

## B. `localStorage` / `sessionStorage` Inventory

Search result summary:

- `localStorage` is used in the app.
- `sessionStorage` is not currently used.

| File | Storage key | What is stored | Data shape, if clear | Likely backend mapping |
|---|---|---|---|---|
| `src/context/AuthContext.jsx` | `shopora_users` | Demo user records, including the seeded admin account | Array of user objects with `id`, `firstName`, `lastName`, `email`, `password`, `phone`, `createdAt`, `role`, `defaultShippingAddress`, `savedProductIds` | `profiles` / `users`, plus a role field or related admin role table |
| `src/context/AuthContext.jsx` | `shopora_current_user` | The currently signed-in demo user session | Object with `userId` | Auth session / server-side session reference, not a client-stored identity |
| `src/context/ProductCatalogContext.jsx` | `shopora_product_catalog_v1` | Entire product catalog, including admin edits | Array of product objects with fields such as `id`, `sku`, `name`, `category`, `price`, `salePrice`, `image`, `images`, `description`, `details`, `stockCount`, `sizes`, `colors`, `rating`, `isNew`, `isSale` | `products` and `product_images` tables |
| `src/context/OrdersContext.jsx` | `shopora_orders` | Demo order history and order lifecycle | Array of order objects with `id`, `orderNumber`, `userId`, customer fields, `shippingAddress`, `items`, `subtotal`, `shipping`, `tax`, `total`, `status`, `paymentStatus`, `createdAt`, `updatedAt`, `demoMode` | `orders` and `order_items` tables, with address snapshots |
| `src/context/CartContext.jsx` | `shopora-cart-v1` | Active shopping cart | Array of cart line items with `key`, `productId`, `name`, `image`, `unitPrice`, `originalPrice`, `salePrice`, `size`, `color`, `quantity` | `carts` or `cart_items` if persistence is needed later; otherwise server cart state |
| `src/pages/ProductPage.jsx` | `shopora-recently-viewed-v1` | Recently viewed product IDs | Array of product ids, capped to a small number | Optional analytics or user-preference table, or keep client-only |

Notes:

- There is no current `sessionStorage` dependency.
- Some pages mention localStorage in copy, but they do not add additional storage keys.
- Passwords are stored in plain text in the demo user array. That must not carry into production.

## C. Proposed Backend Tables

The exact schema can vary by backend, but this is the safest baseline.

### `profiles` or `users`

Suggested fields:

- `id` UUID / string primary key
- `auth_user_id` if auth is split from profile records
- `first_name`
- `last_name`
- `email` unique
- `phone`
- `role` (`customer`, `admin`, etc.)
- `created_at`
- `updated_at`
- `default_shipping_address_id` nullable FK

Use this for customer profile data and to link authenticated identities to app users.

### `products`

Suggested fields:

- `id` UUID / string primary key
- `sku` unique
- `name`
- `brand`
- `category`
- `department`
- `description`
- `details` JSON or text
- `material`
- `care`
- `fit`
- `price`
- `sale_price`
- `stock_count`
- `is_new`
- `is_sale`
- `shipping_note`
- `return_note`
- `rating`
- `review_count`
- `created_at`
- `updated_at`
- `is_active`

### `product_images`

Suggested fields:

- `id` UUID / string primary key
- `product_id` FK
- `url`
- `alt_text`
- `sort_order`
- `is_primary`
- `created_at`

This table is useful even if the first version keeps remote image URLs.

### `orders`

Suggested fields:

- `id` UUID / string primary key
- `order_number` unique human-readable reference
- `user_id` FK to `auth.users`
- `customer_name`
- `customer_email`
- `customer_phone`
- `shipping_address_id` nullable FK, or snapshot fields if you prefer denormalized checkout history
- `billing_address_id` optional
- `subtotal`
- `shipping`
- `tax`
- `total`
- `status` (`Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`)
- `payment_status`
- `payment_provider` nullable
- `payment_reference` nullable
- `created_at`
- `updated_at`
- `cancelled_at` nullable

Store a shipping snapshot so past orders remain readable even if the profile address changes.

### `order_items`

Suggested fields:

- `id` UUID / string primary key
- `order_id` FK
- `product_id` FK nullable
- `product_name`
- `product_image`
- `sku`
- `size`
- `color`
- `quantity`
- `unit_price`
- `line_total`
- `created_at`

Snapshot product name, image, and price so order history stays stable after catalog edits.

### `saved_items`

Implemented fields:

- `id` UUID / string primary key
- `user_id` FK to the authenticated user
- `product_id` FK to the catalog product
- `created_at`

This table is now implemented in `supabase/schema.sql` with:

- a unique constraint on `(user_id, product_id)`
- indexes on `user_id` and `product_id`
- RLS policies that restrict select/insert/delete to the owning authenticated user
- grants for `authenticated` only

### `addresses`

Suggested fields:

- `id` UUID / string primary key
- `user_id` FK nullable
- `label` nullable
- `first_name`
- `last_name`
- `street`
- `street2` nullable
- `city`
- `state`
- `postal_code`
- `country`
- `phone` nullable
- `created_at`
- `updated_at`

Use this for reusable customer addresses and order snapshots if desired.

### `admin_roles` or `role` field

Two reasonable approaches:

- Simpler: store `role` on `profiles`.
- More flexible: use `admin_roles` or `user_roles` if you need multiple permissions.

Suggested fields if you choose a role table:

- `id`
- `user_id`
- `role`
- `created_at`

### Optional `inventory_events`

Suggested fields:

- `id`
- `product_id`
- `event_type` (`adjustment`, `sale`, `restock`, `import`)
- `quantity_delta`
- `reason`
- `created_by`
- `created_at`

This is optional, but it becomes valuable once stock changes need auditing.

## D. Suggested Migration Order

Recommended sequence:

1. Products and catalog first.
2. Auth and profiles next.
3. Saved items.
4. Orders.
5. Checkout and Stripe/payment integration.
6. Product image uploads and storage.
7. Admin roles and permissions.

Why this order:

- Products/catalog first gives you the smallest, clearest backend slice and replaces the largest static dataset without touching checkout.
- Auth/profiles next lets you replace the demo user/session model before adding user-owned features.
- Saved items depends on profiles and products, but is lower risk than orders.
- Orders should migrate after auth so order ownership is server-traceable.
- Stripe comes after order persistence so payment events can reference real order records.
- Image uploads should come after product storage exists so the media layer has stable foreign keys.
- Permissions should be hardened last, once server-side data ownership is established.

## E. Supabase Option

Supabase is a good fit for this codebase because it gives you:

- Postgres for relational data
- Auth for email/password or social sign-in
- Storage for product and user-uploaded images
- Row-level security for customer/admin access control
- Edge functions if you later need server-side checkout helpers or webhooks

Recommended usage pattern:

- Keep the React UI as-is.
- Replace local contexts with server reads/writes one domain at a time.
- Use RLS policies so the client cannot directly read or edit another user’s orders, saved items, or profile data.
- Avoid treating client-side role flags as authoritative.

## F. Stripe / Payment Option

Do not add payment processing until orders exist server-side.

Recommended path:

- Create the order record first.
- Start a Stripe Checkout Session from a Netlify Function.
- Attach the backend order ID to the payment metadata.
- Confirm payment via webhook, then update `payment_status`, `paid_at`, and Stripe ID fields.
- Keep the frontend out of the Stripe secret path.
- Required Netlify env vars live in the server-only function configuration, not the frontend bundle
- Webhook events to handle: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.expired`

For this prototype, the safest future implementation is:

- frontend checkout collects shipping and contact details
- backend creates the order
- Stripe handles payment
- webhook updates order payment state

## G. Product Image Upload / Storage Plan

Current state:

- The app mostly consumes image URLs from the seeded catalog.

Future plan:

- Store uploaded product images in backend object storage.
- Keep metadata in `product_images`.
- Mark one image as primary per product.
- Generate optimized renditions if the backend supports it.

Implementation options:

- Supabase Storage
- S3-compatible storage
- A CDN-backed asset bucket

Recommended minimum:

- Save original uploads in storage.
- Store public URL, alt text, and ordering metadata in the database.
- Do not hardcode image URLs as the system of record.

## H. Admin Roles and Permissions Plan

Current admin protection is client-side only and therefore not secure.

Backend plan:

- Authenticated users should have a server-trusted identity.
- Admin capability should come from a server-side role or permission record.
- Customer routes should only allow access to the owner’s data.
- Admin routes should require a role check on the server, not just the UI.

Recommended enforcement layers:

- Row-level security for database access
- Server or edge-function checks for sensitive writes
- UI gating only as a convenience layer, not as security

## I. Risks / Cleanup Needed Before Backend

Main risks to address during migration:

- Passwords are currently plain text in the demo auth store.
- Client-side `localStorage` data is mutable and untrusted.
- The current cart and order state are browser-scoped, so users do not share state across devices.
- Saved items are now server-backed for authenticated Supabase customers, but the local demo fallback still mirrors them in browser storage.
- Customer orders are now server-backed for authenticated Supabase customers, while local/demo orders still live in browser storage for the seeded demo experience.
- Inventory is informational only and does not currently decrement on checkout.
- Existing order history is a snapshot store, not a canonical fulfillment system.
- Product/admin CRUD is local and can diverge from any future server records.
- Role checks must move from UI logic to server-side policy.
- Any backend import will need a migration path from demo state into server tables, or a clean reset policy for demo data.

## J. Recommended Next Implementation Milestone

Best next milestone:

1. Handle inventory after payment confirmation.
2. Add Supabase admin roles and admin product writes later.
3. Add image uploads/storage later.
4. Harden deployment and production settings later.

Reason:

- Inventory should wait until payment exists so stock changes happen after confirmed orders.
- Stripe Checkout test mode is now in place; the next step is post-payment inventory and fulfillment logic.
- Admin writes and media uploads can follow once customer commerce is stable.

If you want the lowest-risk production path, start with products + storage + profiles before touching payment.
