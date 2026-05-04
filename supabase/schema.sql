create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  department text,
  category text,
  price numeric not null,
  sale_price numeric,
  description text,
  image text,
  sizes text[],
  colors text[],
  rating numeric default 0,
  review_count integer default 0,
  stock_count integer default 0,
  is_new boolean default false,
  is_sale boolean default false,
  sku text unique,
  material text,
  care text,
  fit text,
  details text[],
  shipping_note text,
  return_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  image_url text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text,
  phone text,
  role text default 'customer',
  default_shipping_address jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint profiles_role_check check (role in ('customer', 'admin'))
);

create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz default now(),
  constraint saved_items_user_product_key unique (user_id, product_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_number text unique,
  status text default 'processing',
  payment_status text default 'pending',
  payment_provider text default 'demo',
  currency text default 'usd',
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  paid_at timestamptz,
  subtotal numeric(10, 2) not null default 0,
  shipping numeric(10, 2) not null default 0,
  tax numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  customer_email text,
  customer_name text,
  shipping_address jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists public.orders
  add column if not exists payment_provider text default 'demo',
  add column if not exists currency text default 'usd',
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists paid_at timestamptz;

alter table if exists public.orders
  alter column payment_status set default 'pending';

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_brand text,
  product_image text,
  sku text,
  selected_size text,
  selected_color text,
  quantity integer not null default 1,
  unit_price numeric(10, 2) not null default 0,
  line_total numeric(10, 2) not null default 0,
  created_at timestamptz default now()
);

create index if not exists products_department_idx on public.products (department);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_brand_idx on public.products (brand);
create index if not exists products_sku_idx on public.products (sku);
create index if not exists product_images_product_id_idx on public.product_images (product_id);
create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists saved_items_user_id_idx on public.saved_items (user_id);
create index if not exists saved_items_product_id_idx on public.saved_items (product_id);
create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_payment_status_idx on public.orders (payment_status);
create index if not exists orders_stripe_checkout_session_id_idx on public.orders (stripe_checkout_session_id);
create index if not exists orders_stripe_payment_intent_id_idx on public.orders (stripe_payment_intent_id);
create unique index if not exists orders_stripe_checkout_session_id_key on public.orders (stripe_checkout_session_id) where stripe_checkout_session_id is not null;
create unique index if not exists orders_stripe_payment_intent_id_key on public.orders (stripe_payment_intent_id) where stripe_payment_intent_id is not null;
create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_product_id_idx on public.order_items (product_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.saved_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Profiles can read own profile" on public.profiles;
create policy "Profiles can read own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Profiles can insert own profile" on public.profiles;
create policy "Profiles can insert own profile"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id and coalesce(role, 'customer') = 'customer');

drop policy if exists "Profiles can update own profile" on public.profiles;
create policy "Profiles can update own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id and role = 'customer');

revoke all on public.profiles from anon;
revoke all on public.profiles from public;
grant select on public.profiles to authenticated;
revoke insert on public.profiles from authenticated;
grant insert (id, first_name, last_name, email, phone, default_shipping_address) on public.profiles to authenticated;
revoke update on public.profiles from authenticated;
grant update (first_name, last_name, email, phone, default_shipping_address) on public.profiles to authenticated;

drop policy if exists "Saved items can read own items" on public.saved_items;
create policy "Saved items can read own items"
on public.saved_items
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Saved items can insert own items" on public.saved_items;
create policy "Saved items can insert own items"
on public.saved_items
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Saved items can delete own items" on public.saved_items;
create policy "Saved items can delete own items"
on public.saved_items
for delete
to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.saved_items from anon;
revoke all on public.saved_items from public;
grant select, insert, delete on public.saved_items to authenticated;

drop policy if exists "Orders can read own orders" on public.orders;
create policy "Orders can read own orders"
on public.orders
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Orders can insert own orders" on public.orders;
create policy "Orders can insert own orders"
on public.orders
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Order items can read items for own orders" on public.order_items;
create policy "Order items can read items for own orders"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_id
      and o.user_id = (select auth.uid())
  )
);

drop policy if exists "Order items can insert items for own orders" on public.order_items;
create policy "Order items can insert items for own orders"
on public.order_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.orders o
    where o.id = order_id
      and o.user_id = (select auth.uid())
  )
);

revoke all on public.orders from anon;
revoke all on public.orders from public;
grant select, insert on public.orders to authenticated;

revoke all on public.order_items from anon;
revoke all on public.order_items from public;
grant select, insert on public.order_items to authenticated;

create or replace function public.create_customer_order(order_payload jsonb, items_payload jsonb)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  new_order public.orders%rowtype;
  item jsonb;
  safe_user_id uuid;
begin
  safe_user_id := nullif(trim(coalesce(order_payload->>'user_id', '')), '')::uuid;

  if auth.uid() is null then
    raise exception 'Not authenticated.';
  end if;

  if safe_user_id is null or safe_user_id <> (select auth.uid()) then
    raise exception 'Cannot create an order for another user.';
  end if;

  insert into public.orders (
    user_id,
    order_number,
    status,
    payment_status,
    payment_provider,
    currency,
    subtotal,
    shipping,
    tax,
    total,
    customer_email,
    customer_name,
    shipping_address
  ) values (
    safe_user_id,
    nullif(trim(coalesce(order_payload->>'order_number', '')), ''),
    coalesce(nullif(trim(coalesce(order_payload->>'status', '')), ''), 'processing'),
    coalesce(nullif(trim(coalesce(order_payload->>'payment_status', '')), ''), 'pending'),
    coalesce(nullif(trim(coalesce(order_payload->>'payment_provider', '')), ''), 'demo'),
    coalesce(nullif(trim(coalesce(order_payload->>'currency', '')), ''), 'usd'),
    coalesce((order_payload->>'subtotal')::numeric, 0),
    coalesce((order_payload->>'shipping')::numeric, 0),
    coalesce((order_payload->>'tax')::numeric, 0),
    coalesce((order_payload->>'total')::numeric, 0),
    nullif(trim(coalesce(order_payload->>'customer_email', '')), ''),
    nullif(trim(coalesce(order_payload->>'customer_name', '')), ''),
    coalesce(order_payload->'shipping_address', '{}'::jsonb)
  )
  returning * into new_order;

  for item in select value from jsonb_array_elements(coalesce(items_payload, '[]'::jsonb)) loop
    insert into public.order_items (
      order_id,
      product_id,
      product_name,
      product_brand,
      product_image,
      sku,
      selected_size,
      selected_color,
      quantity,
      unit_price,
      line_total
    ) values (
      new_order.id,
      nullif(trim(coalesce(item->>'productId', item->>'product_id', '')), '')::uuid,
      nullif(trim(coalesce(item->>'name', item->>'product_name', '')), ''),
      nullif(trim(coalesce(item->>'brand', item->>'product_brand', '')), ''),
      nullif(trim(coalesce(item->>'image', item->>'product_image', '')), ''),
      nullif(trim(coalesce(item->>'sku', '')), ''),
      nullif(trim(coalesce(item->>'size', item->>'selected_size', '')), ''),
      nullif(trim(coalesce(item->>'color', item->>'selected_color', '')), ''),
      coalesce((item->>'quantity')::integer, 1),
      coalesce((item->>'unitPrice')::numeric, (item->>'unit_price')::numeric, 0),
      coalesce((item->>'lineTotal')::numeric, (item->>'line_total')::numeric, 0)
    );
  end loop;

  return new_order;
end;
$$;

revoke all on function public.create_customer_order(jsonb, jsonb) from public;
grant execute on function public.create_customer_order(jsonb, jsonb) to authenticated;
