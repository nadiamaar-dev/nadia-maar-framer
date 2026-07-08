-- Sending a message also stamps the sender's own read marker, so unread
-- derivation (last_message_at > *_last_read_at) never flags your own message.
create or replace function public.touch_conversation_on_message()
returns trigger
language plpgsql
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