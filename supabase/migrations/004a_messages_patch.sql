-- ============================================================
-- Patch: 004a_messages_patch.sql
-- Problem: `messages` table already existed in the DB before
--   Sprint 5. The CREATE TABLE IF NOT EXISTS in 004 was silently
--   skipped, so three new columns were never added:
--     - attachments  (JSONB)
--     - is_deleted   (BOOLEAN)
--     - edited_at    (TIMESTAMPTZ)
--
-- This script is IDEMPOTENT — safe to run multiple times.
-- Run in: Supabase → SQL Editor
-- ============================================================


-- ══════════════════════════════════════════════════════════════
-- STEP 1 ─ ENUM types (safe even if they already exist)
-- ══════════════════════════════════════════════════════════════

DO $$ BEGIN
  CREATE TYPE conversation_status AS ENUM (
    'open', 'answered', 'has_questions', 'closed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- author_role may already exist as TEXT on old messages table;
-- keep it as TEXT if so (don't try to cast existing data to ENUM).
-- The application code treats it as a plain string anyway.


-- ══════════════════════════════════════════════════════════════
-- STEP 2 ─ conversations (create if it does not exist yet)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.conversations (
  id               UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        UUID                NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject          TEXT                NOT NULL,
  status           conversation_status NOT NULL DEFAULT 'open',
  last_message_at  TIMESTAMPTZ         NOT NULL DEFAULT now(),
  created_at       TIMESTAMPTZ         NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ         NOT NULL DEFAULT now()
);

-- Add any columns that may be missing if conversations was only
-- partially created by a previous failed run:
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS subject         TEXT                NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ         NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_at      TIMESTAMPTZ         NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ         NOT NULL DEFAULT now();

-- Remove the DEFAULT '' helper on subject (it's a placeholder to
-- satisfy NOT NULL; real rows must always provide a subject).
DO $$ BEGIN
  ALTER TABLE public.conversations ALTER COLUMN subject DROP DEFAULT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;


-- ══════════════════════════════════════════════════════════════
-- STEP 3 ─ messages — ADD the three missing Sprint 5 columns
--
--   ADD COLUMN IF NOT EXISTS is fully idempotent in Postgres 9.6+.
--   Running this on a table that already has the column is a no-op.
-- ══════════════════════════════════════════════════════════════

-- 3a. File attachments (JSON array of {name, path, size, type})
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]';

-- 3b. Soft-delete flag
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;

-- 3c. Edit timestamp (NULL = never edited)
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

-- 3d. Ensure updated_at exists (some old schemas omit it)
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 3e. Ensure conversation_id exists (FK to conversations).
--   If the column exists but lacks the FK, the ADD COLUMN is a
--   no-op; the FK constraint below handles it separately.
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS conversation_id UUID;

-- Add FK constraint only if it doesn't already exist
DO $$ BEGIN
  ALTER TABLE public.messages
    ADD CONSTRAINT fk_messages_conversation
    FOREIGN KEY (conversation_id)
    REFERENCES public.conversations(id)
    ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3f. author_role — add as TEXT if missing (avoids ENUM cast issues)
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS author_role TEXT;


-- ══════════════════════════════════════════════════════════════
-- STEP 4 ─ Comments (purely informational, always safe)
-- ══════════════════════════════════════════════════════════════

COMMENT ON COLUMN public.messages.attachments IS
  'JSON array: [{name, path, size, type, publicUrl?}]. Files in bucket "message-attachments".';
COMMENT ON COLUMN public.messages.is_deleted IS
  'Soft delete — content cleared, row kept for thread continuity.';
COMMENT ON COLUMN public.messages.edited_at IS
  'Set when admin or client edits their own message (15-min window for clients).';


-- ══════════════════════════════════════════════════════════════
-- STEP 5 ─ Indexes (IF NOT EXISTS = idempotent)
-- ══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_conversations_client
  ON public.conversations (client_id, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_status_date
  ON public.conversations (status, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation
  ON public.messages (conversation_id, created_at ASC);

-- Fast lookup for soft-delete filter
CREATE INDEX IF NOT EXISTS idx_messages_not_deleted
  ON public.messages (conversation_id, created_at ASC)
  WHERE is_deleted = false;


-- ══════════════════════════════════════════════════════════════
-- STEP 6 ─ Triggers (DROP first = idempotent replace)
-- ══════════════════════════════════════════════════════════════

-- Shared updated_at function (creates or replaces — always safe)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- conversations updated_at
DROP TRIGGER IF EXISTS trg_conversations_updated_at ON public.conversations;
CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- messages updated_at
DROP TRIGGER IF EXISTS trg_messages_updated_at ON public.messages;
CREATE TRIGGER trg_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Touch conversation.last_message_at on every new message
CREATE OR REPLACE FUNCTION public.touch_conversation_on_message()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at,
      updated_at      = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_conversation ON public.messages;
CREATE TRIGGER trg_touch_conversation
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.touch_conversation_on_message();


-- ══════════════════════════════════════════════════════════════
-- STEP 7 ─ Row Level Security
-- ══════════════════════════════════════════════════════════════

-- Enable RLS (safe to call even if already enabled)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages      ENABLE ROW LEVEL SECURITY;

-- ── Drop all existing policies first (clean slate) ──────────

DROP POLICY IF EXISTS "client_own_conversations"   ON public.conversations;
DROP POLICY IF EXISTS "client_create_conversation" ON public.conversations;
DROP POLICY IF EXISTS "client_update_conversation" ON public.conversations;
DROP POLICY IF EXISTS "admin_all_conversations"    ON public.conversations;

DROP POLICY IF EXISTS "client_read_own_messages"   ON public.messages;
DROP POLICY IF EXISTS "client_insert_message"      ON public.messages;
DROP POLICY IF EXISTS "client_edit_own_message"    ON public.messages;
DROP POLICY IF EXISTS "admin_all_messages"         ON public.messages;

-- ── Re-create conversation policies ─────────────────────────

-- Clients read their own threads
CREATE POLICY "client_own_conversations"
  ON public.conversations FOR SELECT
  USING (client_id = auth.uid());

-- Clients create threads (status must start as 'open')
CREATE POLICY "client_create_conversation"
  ON public.conversations FOR INSERT
  WITH CHECK (client_id = auth.uid() AND status = 'open');

-- Clients can mark their thread 'has_questions' or 'closed' only
CREATE POLICY "client_update_conversation"
  ON public.conversations FOR UPDATE
  USING  (client_id = auth.uid())
  WITH CHECK (status IN ('has_questions', 'closed'));

-- Admin: unrestricted on all conversations
CREATE POLICY "admin_all_conversations"
  ON public.conversations FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin')
  );

-- ── Re-create message policies ───────────────────────────────

-- Clients read messages inside their own conversations
CREATE POLICY "client_read_own_messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND c.client_id = auth.uid()
    )
  );

-- Clients can post only to their own open conversations
CREATE POLICY "client_insert_message"
  ON public.messages FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND author_role = 'client'
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND c.client_id = auth.uid()
        AND c.status <> 'closed'
    )
  );

-- Clients can edit/soft-delete their own messages within 15 min
CREATE POLICY "client_edit_own_message"
  ON public.messages FOR UPDATE
  USING (
    author_id = auth.uid()
    AND created_at > now() - INTERVAL '15 minutes'
  );

-- Admin: unrestricted on all messages
CREATE POLICY "admin_all_messages"
  ON public.messages FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin')
  );


-- ══════════════════════════════════════════════════════════════
-- STEP 8 ─ Verify (run these manually after applying)
-- ══════════════════════════════════════════════════════════════

-- 1. Confirm all 3 new columns exist on messages:
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name   = 'messages'
--   AND column_name IN ('attachments', 'is_deleted', 'edited_at', 'updated_at')
-- ORDER BY column_name;
-- Expected: 4 rows returned.

-- 2. Confirm RLS is enabled on both tables:
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
--   AND tablename IN ('conversations', 'messages');
-- Expected: both rows show rowsecurity = true.

-- 3. Confirm all 8 policies exist:
-- SELECT tablename, policyname, cmd
-- FROM pg_policies
-- WHERE tablename IN ('conversations', 'messages')
-- ORDER BY tablename, policyname;
-- Expected: 4 rows per table.

-- 4. Confirm triggers exist:
-- SELECT trigger_name, event_object_table, event_manipulation
-- FROM information_schema.triggers
-- WHERE trigger_schema = 'public'
--   AND event_object_table IN ('conversations', 'messages')
-- ORDER BY event_object_table, trigger_name;
-- Expected: trg_conversations_updated_at, trg_messages_updated_at,
--           trg_touch_conversation.
