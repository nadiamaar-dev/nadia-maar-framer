-- Admin panel subscribes to profiles (live client-signup refresh).
-- Events are RLS-scoped: admins see all, clients only their own row.
alter publication supabase_realtime add table public.profiles;
