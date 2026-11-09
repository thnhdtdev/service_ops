-- Quick customer search for the create order form.
-- Staff type a name, the last digits of the phone, or both ("yen 202"), and
-- get a few matching customers to pick from.
-- Accents are ignored, so "yen" also finds "Yến".

create extension if not exists unaccent with schema extensions;

-- Lowercase and remove Vietnamese accents: 'Nguyễn Thị Yến' -> 'nguyen thi yen'.
-- The dictionary is named explicitly: the one-argument unaccent() looks it up
-- through search_path, which is empty here.
create or replace function public.normalize_search_text(p_text text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select lower(extensions.unaccent('extensions.unaccent'::regdictionary, p_text));
$$;

revoke execute on function public.normalize_search_text(text) from public, anon;
grant execute on function public.normalize_search_text(text) to authenticated;

-- p_name:   name part of the search, e.g. 'yen' (null = any name)
-- p_digits: digits of the search, e.g. '202' (null = any phone)
-- The backend only sends letters, digits and spaces, so no LIKE wildcard
-- (% or _) can come from the user.
-- SECURITY INVOKER: runs as the caller, the RLS on customers still applies.
create or replace function public.suggest_customers(p_name text, p_digits text)
returns table (
  id uuid,
  name text,
  phone text,
  last_order_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select c.id, c.name, c.phone, last_order.created_at
  from public.customers c
  left join lateral (
    select max(o.created_at) as created_at
    from public.orders o
    where o.customer_id = c.id
      and o.status <> 'cancelled'
  ) last_order on true
  where (
      p_name is null
      or public.normalize_search_text(c.name)
        like '%' || public.normalize_search_text(p_name) || '%'
    )
    and (
      p_digits is null
      or c.normalized_phone like '%' || p_digits || '%'
    )
  order by
    -- Phone ending with the typed digits first ("202" -> ...202),
    (p_digits is not null and c.normalized_phone like '%' || p_digits) desc,
    -- then customers who came most recently.
    last_order.created_at desc nulls last,
    c.name
  limit 6;
$$;

revoke execute on function public.suggest_customers(text, text) from public, anon;
grant execute on function public.suggest_customers(text, text) to authenticated;
