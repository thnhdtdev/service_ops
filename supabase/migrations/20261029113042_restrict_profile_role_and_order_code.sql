-- Prevent users from changing their own role.
-- RLS on profiles limits which row a user can write, but not which columns,
-- so a staff user could set role = 'admin' on their own profile.
-- Users may only write full_name; role keeps its default ('staff') and is
-- changed by an admin from the Supabase dashboard.
revoke insert, update on public.profiles from authenticated;
grant insert (id, full_name) on public.profiles to authenticated;
grant update (full_name, updated_at) on public.profiles to authenticated;

-- next_order_code() is SECURITY DEFINER and has no caller check, so anyone
-- (including anon) could call it and skip order numbers. It only needs to be
-- called from create_order_transaction(), which runs as the function owner.
revoke execute on function public.next_order_code() from public, anon, authenticated;
