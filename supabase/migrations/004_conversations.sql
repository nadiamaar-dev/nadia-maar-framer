-- ============================================================
-- Migration: 004_conversations.sql
-- Tables:    conversations, messages
-- Used by:   ChatTab (client), ConversationManager (admin)
-- ============================================================


-- ── 1. ENUM types ─────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE conversation_status AS ENUM (
    'open',           -- new, waiting for admin reply
    'answered',       -- admin replied, waiting for client
    'has_questions',  -- client replied with new questions
    'closed'          -- resolved
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE author_role AS ENUM ('admin', 'client');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── 2. Conversations ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.conversations (
  id               UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        UUID                NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject          TEXT                NOT NULL,
  status           conversation_status NOT NULL DEFAULT 'open',
  -- Denormalized for fast sorting (updated on every new message)
  last_message_at  TIMESTAMPTZ         NOT NULL DEFAULT now(),
  created_at       TIMESTAMPTZ         NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ         NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.conversations              IS 'A conversation thread between admin and a client.';
COMMENT ON COLUMN public.conversations.status       IS 'open → answered → has_questions → closed (cycling until closed)';


-- ── 3. Messages ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.messages (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID         NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,

  -- Who wrote this message
  author_id        UUID         NOT NULL REFERENCES auth.users(id),
  author_role      author_role  NOT NULL,

  content          TEXT         NOT NULL,

  -- Attachments stored as JSON array:
  -- [{ "name": "file.pdf", "path": "conv1/file.pdf", "size": 12345, "type": "application/pdf" }]
  attachments      JSONB        NOT NULL DEFAULT '[]',

  -- Soft delete: content replaced by null, flag set true
  is_deleted       BOOLEAN      NOT NULL DEFAULT false,

  -- Edit tracking
  edited_at        TIMESTAMPTZ,

  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.messages             IS 'Individual messages within a conversation.';
COMMENT ON COLUMN public.messages.is_deleted  IS 'Soft delete. Content is nulled; message skeleton kept for thread continuity.';
COMMENT ON COLUMN public.messages.attachments IS 'JSON array of file metadata. Actual files stored in Supabase Storage bucket "message-attachments".';


-- ── 4. Indexes ────────────────────────────────────────────────

-- Client cabinet: conversations sorted newest-first for a client
CREATE INDEX IF NOT EXISTS idx_conversations_client
  ON public.conversations (client_id, last_message_at DESC);

-- Admin panel: all open/active conversations newest-first
CREATE INDEX IF NOT EXISTS idx_conversations_status_date
  ON public.conversations (status, last_message_at DESC);

-- Message thread: all messages for a conversation, chronological
CREATE INDEX IF NOT EXISTS idx_messages_conversation
  ON public.messages (conversation_id, created_at ASC);


-- ── 5. Auto-update triggers ───────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_conversations_updated_at ON public.conversations;
CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_messages_updated_at ON public.messages;
CREATE TRIGGER trg_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- After a new message, update conversation.last_message_at for sorting
CREATE OR REPLACE FUNCTION public.touch_conversation_on_message()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at, updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_touch_conversation ON public.messages;
CREATE TRIGGER trg_touch_conversation
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.touch_conversation_on_message();


-- ── 6. RLS ────────────────────────────────────────────────────

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages      ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "client_own_conversations"     ON public.conversations;
DROP POLICY IF EXISTS "client_create_conversation"   ON public.conversations;
DROP POLICY IF EXISTS "client_update_conversation"   ON public.conversations;
DROP POLICY IF EXISTS "admin_all_conversations"      ON public.conversations;
DROP POLICY IF EXISTS "client_read_own_messages"     ON public.messages;
DROP POLICY IF EXISTS "client_insert_message"        ON public.messages;
DROP POLICY IF EXISTS "client_edit_own_message"      ON public.messages;
DROP POLICY IF EXISTS "admin_all_messages"           ON public.messages;

-- Conversations
CREATE POLICY "client_own_conversations"
  ON public.conversations FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "client_create_conversation"
  ON public.conversations FOR INSERT
  WITH CHECK (client_id = auth.uid() AND status = 'open');

-- Client can only mark their conversation as 'has_questions'
CREATE POLICY "client_update_conversation"
  ON public.conversations FOR UPDATE
  USING (client_id = auth.uid())
  WITH CHECK (status IN ('has_questions', 'closed'));

CREATE POLICY "admin_all_conversations"
  ON public.conversations FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Messages
CREATE POLICY "client_read_own_messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id AND c.client_id = auth.uid())
  );

CREATE POLICY "client_insert_message"
  ON public.messages FOR INSERT
  WITH CHECK (
    author_id = auth.uid() AND author_role = 'client'
    AND EXISTS (SELECT 1 FROM public.conversations c
                WHERE c.id = conversation_id AND c.client_id = auth.uid()
                AND c.status != 'closed')
  );

-- Client can edit/soft-delete their own messages within 15 minutes
CREATE POLICY "client_edit_own_message"
  ON public.messages FOR UPDATE
  USING (
    author_id = auth.uid()
    AND created_at > now() - INTERVAL '15 minutes'
  );

CREATE POLICY "admin_all_messages"
  ON public.messages FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- ── 7. Storage bucket (run separately in Dashboard or via CLI) ─
-- supabase storage create message-attachments --public=false
--
-- RLS for storage (via Dashboard → Storage → Policies):
-- Client can upload to "message-attachments/{conversation_id}/*"
-- Admin can read/write all


-- ── 8. Verify ─────────────────────────────────────────────────
-- SELECT policyname, cmd FROM pg_policies WHERE tablename IN ('conversations','messages');
