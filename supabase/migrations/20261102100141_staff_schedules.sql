-- Staff work schedules.
-- Staff members have no login. The admin creates a personal link for each
-- one (random token, only its SHA-256 hash is stored). Through that link a
-- staff member reports busy times for the open week and later sees their
-- published shifts. Token access goes through the SECURITY DEFINER functions
-- at the bottom; everything else is admin-only through RLS.

create extension if not exists pgcrypto with schema extensions;

-- ===== Tables =====

create table public.staff_members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(trim(full_name)) between 1 and 100),
  phone text check (phone is null or char_length(phone) <= 20),
  is_active boolean not null default true,
  -- Hex SHA-256 of the link token. null = no link / link disabled.
  link_token_hash text unique
    check (link_token_hash is null or link_token_hash ~ '^[0-9a-f]{64}$'),
  link_created_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((link_token_hash is null) = (link_created_at is null))
);

-- Shift presets copied into every new week.
create table public.shift_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 50),
  start_time time not null,
  end_time time not null,
  sort_order smallint not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

create table public.schedule_weeks (
  id uuid primary key default gen_random_uuid(),
  -- Always a Monday.
  week_start date not null unique check (extract(isodow from week_start) = 1),
  -- open: staff can report busy times (until the deadline).
  -- published: staff can see their shifts.
  status text not null default 'open' check (status in ('open', 'published')),
  availability_deadline timestamptz not null,
  published_at timestamptz,
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'published') = (published_at is not null))
);

-- At most one open week at a time.
create unique index schedule_weeks_single_open
  on public.schedule_weeks (status)
  where status = 'open';

create table public.shifts (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references public.schedule_weeks(id) on delete cascade,
  shift_date date not null,
  name text not null check (char_length(trim(name)) between 1 and 50),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

create index shifts_week_id_idx on public.shifts (week_id);

create table public.shift_assignments (
  shift_id uuid not null references public.shifts(id) on delete cascade,
  staff_member_id uuid not null references public.staff_members(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (shift_id, staff_member_id)
);

create index shift_assignments_staff_member_id_idx
  on public.shift_assignments (staff_member_id);

-- Busy time is a time range, either on one date or repeated every week.
-- A whole day is 00:00-24:00.
create table public.staff_busy_times (
  id uuid primary key default gen_random_uuid(),
  staff_member_id uuid not null references public.staff_members(id) on delete cascade,
  repeat_weekly boolean not null default false,
  busy_date date,                                    -- when repeat_weekly = false
  weekday smallint check (weekday between 1 and 7),  -- when repeat_weekly = true (1 = Monday)
  start_time time not null,
  end_time time not null,
  note text check (note is null or char_length(note) <= 200),
  created_at timestamptz not null default now(),
  check (end_time > start_time),
  check (
    (repeat_weekly and weekday is not null and busy_date is null)
    or (not repeat_weekly and busy_date is not null and weekday is null)
  )
);

create index staff_busy_times_staff_member_id_idx
  on public.staff_busy_times (staff_member_id);

-- ===== RLS: only admins read/write these tables directly =====

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  )
$$;

revoke execute on function public.current_user_is_admin() from public, anon;
grant execute on function public.current_user_is_admin() to authenticated;

alter table public.staff_members     enable row level security;
alter table public.shift_templates   enable row level security;
alter table public.schedule_weeks    enable row level security;
alter table public.shifts            enable row level security;
alter table public.shift_assignments enable row level security;
alter table public.staff_busy_times  enable row level security;

revoke all on
  public.staff_members,
  public.shift_templates,
  public.schedule_weeks,
  public.shifts,
  public.shift_assignments,
  public.staff_busy_times
from anon;

create policy "admin_all" on public.staff_members for all to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "admin_all" on public.shift_templates for all to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "admin_all" on public.schedule_weeks for all to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "admin_all" on public.shifts for all to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "admin_all" on public.shift_assignments for all to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "admin_all" on public.staff_busy_times for all to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

-- ===== Create a week and copy active shift templates into it =====
-- SECURITY INVOKER: runs as the calling admin, so RLS still applies.
-- Both inserts happen in one transaction.

create or replace function public.create_schedule_week(
  p_week_start date,
  p_availability_deadline timestamptz
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_week_id uuid;
begin
  insert into public.schedule_weeks (week_start, availability_deadline)
  values (p_week_start, p_availability_deadline)
  returning id into v_week_id;

  insert into public.shifts (week_id, shift_date, name, start_time, end_time)
  select v_week_id, p_week_start + d, t.name, t.start_time, t.end_time
  from public.shift_templates t
  cross join generate_series(0, 6) as d
  where t.is_active;

  return v_week_id;
end;
$$;

revoke execute on function public.create_schedule_week(date, timestamptz) from public, anon;
grant execute on function public.create_schedule_week(date, timestamptz) to authenticated;

-- ===== Token access (SECURITY DEFINER) =====
-- These run as the function owner and bypass RLS, so each one finds the
-- staff member from the token first and only touches that staff member's rows.

-- Internal helper: raw token -> staff member id (null if invalid/disabled).
-- The token is hashed here, so a leaked hash cannot be used as a link.
create or replace function public.staff_member_id_from_token(p_token text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id
  from public.staff_members
  where is_active
    and p_token ~ '^[A-Za-z0-9_-]{43}$'
    and link_token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
$$;

revoke execute on function public.staff_member_id_from_token(text) from public, anon, authenticated;

-- Everything the staff link page shows, for one staff member only.
create or replace function public.staff_portal_get(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_staff_id uuid := public.staff_member_id_from_token(p_token);
  v_today date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  v_week public.schedule_weeks%rowtype;
begin
  if v_staff_id is null then
    return jsonb_build_object('status', 'invalid_token');
  end if;

  select * into v_week
  from public.schedule_weeks
  where status = 'open';

  return jsonb_build_object(
    'status', 'ok',

    'staff', (
      select jsonb_build_object('full_name', full_name)
      from public.staff_members
      where id = v_staff_id
    ),

    'open_week', case when v_week.id is null then null else jsonb_build_object(
      'week_start', v_week.week_start,
      'availability_deadline', v_week.availability_deadline,
      'can_edit', now() < v_week.availability_deadline,
      'shifts', (
        select coalesce(jsonb_agg(jsonb_build_object(
          'shift_date', s.shift_date,
          'name', s.name,
          'start_time', s.start_time,
          'end_time', s.end_time
        ) order by s.shift_date, s.start_time), '[]'::jsonb)
        from public.shifts s
        where s.week_id = v_week.id
      )
    ) end,

    -- Weekly busy times + one-off busy times inside the open week.
    'busy_times', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'repeat_weekly', b.repeat_weekly,
        'busy_date', b.busy_date,
        'weekday', b.weekday,
        'start_time', b.start_time,
        'end_time', b.end_time,
        'note', b.note
      ) order by b.repeat_weekly desc, b.weekday, b.busy_date, b.start_time), '[]'::jsonb)
      from public.staff_busy_times b
      where b.staff_member_id = v_staff_id
        and (
          b.repeat_weekly
          or (
            v_week.id is not null
            and b.busy_date between v_week.week_start and v_week.week_start + 6
          )
        )
    ),

    -- Only this staff member's shifts in published weeks, from today on.
    'my_shifts', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'shift_date', s.shift_date,
        'name', s.name,
        'start_time', s.start_time,
        'end_time', s.end_time
      ) order by s.shift_date, s.start_time), '[]'::jsonb)
      from public.shift_assignments a
      join public.shifts s on s.id = a.shift_id
      join public.schedule_weeks w on w.id = s.week_id
      where a.staff_member_id = v_staff_id
        and w.status = 'published'
        and s.shift_date >= v_today
    )
  );
end;
$$;

revoke execute on function public.staff_portal_get(text) from public, authenticated;
grant execute on function public.staff_portal_get(text) to anon;

-- Replaces the staff member's busy times: all weekly ones and the one-off
-- ones inside the open week. Only allowed before the deadline.
create or replace function public.staff_portal_save_busy_times(
  p_token text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_staff_id uuid := public.staff_member_id_from_token(p_token);
  v_week public.schedule_weeks%rowtype;
begin
  if v_staff_id is null then
    return jsonb_build_object('status', 'invalid_token');
  end if;

  if jsonb_typeof(p_items) is distinct from 'array'
    or jsonb_array_length(p_items) > 50 then
    return jsonb_build_object('status', 'invalid_input');
  end if;

  -- Lock the week row so the admin cannot publish it halfway through.
  select * into v_week
  from public.schedule_weeks
  where status = 'open'
  for share;

  if not found then
    return jsonb_build_object('status', 'no_open_week');
  end if;

  if now() >= v_week.availability_deadline then
    return jsonb_build_object('status', 'deadline_passed');
  end if;

  -- One-off busy dates must be inside the open week.
  if exists (
    select 1
    from jsonb_array_elements(p_items) i
    where not coalesce((i->>'repeat_weekly')::boolean, false)
      and (i->>'busy_date')::date not between v_week.week_start and v_week.week_start + 6
  ) then
    return jsonb_build_object('status', 'invalid_input');
  end if;

  delete from public.staff_busy_times
  where staff_member_id = v_staff_id
    and (
      repeat_weekly
      or busy_date between v_week.week_start and v_week.week_start + 6
    );

  insert into public.staff_busy_times (
    staff_member_id, repeat_weekly, busy_date, weekday, start_time, end_time, note
  )
  select
    v_staff_id,
    coalesce((i->>'repeat_weekly')::boolean, false),
    (i->>'busy_date')::date,
    (i->>'weekday')::smallint,
    (i->>'start_time')::time,
    (i->>'end_time')::time,
    nullif(trim(i->>'note'), '')
  from jsonb_array_elements(p_items) i;

  return jsonb_build_object('status', 'ok');
end;
$$;

revoke execute on function public.staff_portal_save_busy_times(text, jsonb) from public, authenticated;
grant execute on function public.staff_portal_save_busy_times(text, jsonb) to anon;
