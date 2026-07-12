-- ============================================================
-- PORTAL 09 · PROFILE SELF-EDIT GUARD
-- Clients may edit their own card (company/contact/phone) via
-- profiles_update_own, but must never escalate role/plan/status.
-- A BEFORE UPDATE trigger pins the privileged columns for non-admins.
-- ============================================================

create or replace function public.guard_profile_self_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    new.role       := old.role;
    new.plan       := old.plan;
    new.status     := old.status;
    new.id         := old.id;
    new.email      := old.email;
    new.joined_at  := old.joined_at;
    new.tags       := old.tags;
  end if;
  return new;
end $$;
revoke execute on function public.guard_profile_self_update() from public, anon, authenticated;

drop trigger if exists profile_self_update_guard on public.profiles;
create trigger profile_self_update_guard
  before update on public.profiles
  for each row execute function public.guard_profile_self_update();
