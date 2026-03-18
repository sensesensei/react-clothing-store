-- Guest checkout RPC.
-- Lets anon/authenticated storefront users create an order and its items
-- without opening public SELECT access to orders.

create or replace function public.create_public_order(
  order_payload jsonb,
  order_items_payload jsonb
)
returns table (
  id bigint,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  inserted_order_id bigint;
  inserted_order_created_at timestamptz;
begin
  if order_payload is null or jsonb_typeof(order_payload) <> 'object' then
    raise exception 'Order payload must be a JSON object.';
  end if;

  if (
    order_items_payload is null
    or jsonb_typeof(order_items_payload) <> 'array'
    or jsonb_array_length(order_items_payload) = 0
  ) then
    raise exception 'Order items payload must be a non-empty JSON array.';
  end if;

  insert into public.orders (
    customer_name,
    email,
    phone,
    telegram,
    city,
    delivery_method,
    delivery_price,
    street,
    house,
    entrance,
    floor,
    apartment_office,
    comment,
    total_amount,
    total_items,
    status
  )
  values (
    nullif(trim(order_payload->>'customer_name'), ''),
    nullif(trim(order_payload->>'email'), ''),
    nullif(trim(order_payload->>'phone'), ''),
    nullif(trim(order_payload->>'telegram'), ''),
    nullif(trim(order_payload->>'city'), ''),
    nullif(trim(order_payload->>'delivery_method'), ''),
    coalesce(nullif(order_payload->>'delivery_price', '')::numeric, 0),
    nullif(trim(order_payload->>'street'), ''),
    nullif(trim(order_payload->>'house'), ''),
    nullif(trim(order_payload->>'entrance'), ''),
    nullif(trim(order_payload->>'floor'), ''),
    nullif(trim(order_payload->>'apartment_office'), ''),
    nullif(trim(order_payload->>'comment'), ''),
    coalesce(nullif(order_payload->>'total_amount', '')::numeric, 0),
    coalesce(nullif(order_payload->>'total_items', '')::integer, 0),
    'new'
  )
  returning orders.id, orders.created_at
  into inserted_order_id, inserted_order_created_at;

  insert into public.order_items (
    order_id,
    product_id,
    product_title,
    product_slug,
    image_url,
    price,
    size,
    quantity
  )
  select
    inserted_order_id,
    nullif(trim(item.value->>'product_id'), ''),
    nullif(trim(item.value->>'product_title'), ''),
    nullif(trim(item.value->>'product_slug'), ''),
    nullif(trim(item.value->>'image_url'), ''),
    coalesce(nullif(item.value->>'price', '')::numeric, 0),
    nullif(trim(item.value->>'size'), ''),
    greatest(coalesce(nullif(item.value->>'quantity', '')::integer, 1), 1)
  from jsonb_array_elements(order_items_payload) as item(value);

  return query
  select inserted_order_id, inserted_order_created_at;
end;
$$;

revoke all on function public.create_public_order(jsonb, jsonb) from public;
grant execute on function public.create_public_order(jsonb, jsonb) to anon, authenticated;
