-- 1) profiles_update_own has no column guard: without this trigger a client
--    could UPDATE their own row and set role='admin' (privilege escalation).
create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  if not is_admin() then
    if new.role is distinct from old.role
       or new.plan is distinct from old.plan
       or new.status is distinct from old.status
       or new.tags is distinct from old.tags
       or new.joined_at is distinct from old.joined_at then
      raise exception 'not allowed to change protected profile fields';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.guard_profile_privileges() from public, anon, authenticated;

drop trigger if exists trg_guard_profile_privileges on public.profiles;
create trigger trg_guard_profile_privileges
  before update on public.profiles
  for each row execute function public.guard_profile_privileges();

-- 2) Read receipts: client_update_conversation's WITH CHECK forces status
--    changes, so marking-as-read needs its own ownership-validated RPC.
--    Server-side now() also makes the marker immune to client clock skew.
create or replace function public.mark_conversation_read(p_conversation uuid)
returns void
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  if is_admin() then
    update public.conversations set admin_last_read_at = now() where id = p_conversation;
  else
    update public.conversations set client_last_read_at = now()
    where id = p_conversation and client_id = auth.uid();
  end if;
end;
$$;
revoke all on function public.mark_conversation_read(uuid) from public, anon;
grant execute on function public.mark_conversation_read(uuid) to authenticated;