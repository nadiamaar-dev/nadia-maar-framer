-- Message-insert bookkeeping must not depend on the caller's RLS rights:
-- as SECURITY INVOKER, a client's INSERT failed because the conversations
-- UPDATE policy (with check: status in has_questions/closed) rejected the
-- trigger's touch of an 'open'/'answered' conversation. Admin passed via
-- the admin ALL policy — hence "admin can write, client cannot".
create or replace function public.touch_conversation_on_message()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  update public.conversations
  set last_message_at     = new.created_at,
      updated_at          = now(),
      client_last_read_at = case when new.author_role = 'client' then new.created_at else client_last_read_at end,
      admin_last_read_at  = case when new.author_role = 'admin'  then new.created_at else admin_last_read_at  end
  where id = new.conversation_id;
  return new;
end;
$$;

-- Trigger-internal: never callable via the REST API.
revoke execute on function public.touch_conversation_on_message() from public, anon, authenticated;
