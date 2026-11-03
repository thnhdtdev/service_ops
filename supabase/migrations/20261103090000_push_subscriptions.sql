-- Web Push subscriptions for admins.
-- Each row is one device (browser / iPhone home screen app) of an admin that
-- turned on notifications. The backend sends a push to every admin device when
-- a payment is recorded.
--
-- Admins manage their own rows through RLS. Payments are mostly recorded by
-- the staff account, which cannot read admin rows through RLS, so the backend
-- reads and cleans up subscriptions through the two SECURITY DEFINER
-- functions at the bottom. Sending a push also needs the VAPID private key,
-- which only the backend has.

-- ===== Table =====

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  -- URL of the browser's push service (Apple, Google, Mozilla...).
  endpoint text not null unique
    check (endpoint ~ '^https://' and char_length(endpoint) <= 2048),
  -- { "p256dh": "...", "auth": "..." } used to encrypt the message.
  -- coalesce(..., false): a missing key gives NULL, and a CHECK that is NULL
  -- counts as passed, so turn it into false.
  keys jsonb not null
    check (
      coalesce(jsonb_typeof(keys -> 'p256dh') = 'string', false)
      and coalesce(jsonb_typeof(keys -> 'auth') = 'string', false)
    ),
  user_agent text check (user_agent is null or char_length(user_agent) <= 500),
  created_at timestamptz not null default now()
);

create index push_subscriptions_profile_id_idx
  on public.push_subscriptions (profile_id);

-- ===== RLS: an admin only sees and changes their own devices =====

alter table public.push_subscriptions enable row level security;

revoke all on public.push_subscriptions from anon;

create policy "admin_own_rows" on public.push_subscriptions for all to authenticated
  using (profile_id = (select auth.uid()) and public.current_user_is_admin())
  with check (profile_id = (select auth.uid()) and public.current_user_is_admin());

-- ===== Who may read / clean up admin subscriptions =====
-- An admin (e.g. "Gửi thử"), or a user that recorded a payment in the last
-- 2 minutes (the backend calls right after recording it). This stops the staff
-- account from listing admin devices at any other time.
-- Only called from the two functions below (which run as the owner), so
-- nobody gets execute on it directly.

create or replace function public.push_notifications_allowed()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select public.current_user_is_admin()
    or exists (
      select 1
      from public.payments
      where created_by = (select auth.uid())
        and created_at > now() - interval '2 minutes'
    );
$$;

revoke execute on function public.push_notifications_allowed()
  from public, anon, authenticated;

-- ===== Devices of all admins (to send a payment notification) =====

create or replace function public.get_admin_push_subscriptions()
returns table (endpoint text, keys jsonb)
language sql
stable
security definer
set search_path = ''
as $$
  select s.endpoint, s.keys
  from public.push_subscriptions s
  join public.profiles p on p.id = s.profile_id
  where p.role = 'admin'
    and public.push_notifications_allowed();
$$;

revoke execute on function public.get_admin_push_subscriptions() from public, anon;
grant execute on function public.get_admin_push_subscriptions() to authenticated;

-- ===== Remove a dead device (push service answered 404 / 410) =====

create or replace function public.delete_push_subscription(p_endpoint text)
returns void
language sql
volatile
security definer
set search_path = ''
as $$
  delete from public.push_subscriptions
  where endpoint = p_endpoint
    and public.push_notifications_allowed();
$$;

revoke execute on function public.delete_push_subscription(text) from public, anon;
grant execute on function public.delete_push_subscription(text) to authenticated;
