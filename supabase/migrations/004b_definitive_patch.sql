-- ============================================================
-- 004b_definitive_patch.sql
-- Uso:   Supabase → SQL Editor → Run
-- Sicuro: nessun DROP TABLE, nessun DROP COLUMN.
--         Solo ADD COLUMN IF NOT EXISTS e sostituzioni idempotenti.
-- ============================================================
-- Mappa completa delle colonne richieste dal codice TypeScript
-- (ricavata dalle query Supabase commentate in adminApi.ts):
--
--   conversations: id, client_id, subject, status,
--                  last_message_at, created_at, updated_at
--
--   messages:      id, conversation_id, author_id, author_role,
--                  content, attachments, is_deleted, edited_at,
--                  created_at, updated_at
-- ============================================================


-- ══════════════════════════════════════════════════════════════
-- 1. NIENTE ENUM — usiamo TEXT per status e author_role
--    per evitare qualsiasi conflitto con tipi già esistenti.
--    Il codice TS legge/scrive stringhe semplici, non tipi Postgres.
-- ══════════════════════════════════════════════════════════════


-- ══════════════════════════════════════════════════════════════
-- 2. TABELLA conversations
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.conversations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject         TEXT        NOT NULL DEFAULT '',
  status          TEXT        NOT NULL DEFAULT 'open',
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Aggiunge le colonne se la tabella esisteva già con struttura ridotta
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS client_id        UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS subject          TEXT        NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS status           TEXT        NOT NULL DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS last_message_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ NOT NULL DEFAULT now();


-- ══════════════════════════════════════════════════════════════
-- 3. TABELLA messages — ADD COLUMN IF NOT EXISTS per ogni campo
--    Questo è idempotente: se la colonna esiste già, è un no-op.
-- ══════════════════════════════════════════════════════════════

-- 3a. Collegamento alla conversazione (FK aggiunta separatamente)
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS conversation_id UUID;

-- 3b. Autore del messaggio
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS author_id   UUID;

-- 3c. Ruolo autore ('admin' | 'client') — TEXT per compatibilità massima
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS author_role TEXT;

-- 3d. Testo del messaggio (potrebbe già chiamarsi "body" o "message" —
--     se esiste già come "content" il comando è un no-op)
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS content TEXT;

-- 3e. Allegati — array JSON di oggetti file
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]';

-- 3f. Soft-delete — contenuto svuotato, riga conservata nel thread
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;

-- 3g. Tracciamento modifiche (null = mai modificato)
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

-- 3h. Timestamp standard
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();


-- ══════════════════════════════════════════════════════════════
-- 4. FOREIGN KEY conversation_id → conversations
--    Nel blocco DO per gestire il caso in cui esista già.
-- ══════════════════════════════════════════════════════════════

DO $$ BEGIN
  ALTER TABLE public.messages
    ADD CONSTRAINT fk_messages_conversation_id
    FOREIGN KEY (conversation_id)
    REFERENCES public.conversations(id)
    ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object    THEN NULL;  -- constraint già presente
  WHEN duplicate_column    THEN NULL;
  WHEN undefined_column    THEN NULL;  -- conversation_id non ancora esistente
END $$;

DO $$ BEGIN
  ALTER TABLE public.messages
    ADD CONSTRAINT fk_messages_author_id
    FOREIGN KEY (author_id)
    REFERENCES auth.users(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;


-- ══════════════════════════════════════════════════════════════
-- 5. INDICI
-- ══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_conversations_client_last
  ON public.conversations (client_id, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_status
  ON public.conversations (status, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_date
  ON public.messages (conversation_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_messages_not_deleted
  ON public.messages (conversation_id, created_at ASC)
  WHERE is_deleted = false;


-- ══════════════════════════════════════════════════════════════
-- 6. FUNZIONI E TRIGGER
--    CREATE OR REPLACE + DROP TRIGGER IF EXISTS = idempotente
-- ══════════════════════════════════════════════════════════════

-- 6a. Funzione updated_at universale
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 6b. Trigger updated_at su conversations
DROP TRIGGER IF EXISTS trg_conversations_updated_at ON public.conversations;
CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6c. Trigger updated_at su messages
DROP TRIGGER IF EXISTS trg_messages_updated_at ON public.messages;
CREATE TRIGGER trg_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6d. Aggiorna last_message_at della conversazione ad ogni nuovo messaggio
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
-- 7. ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages      ENABLE ROW LEVEL SECURITY;

-- Rimuovi policy esistenti (DROP IF EXISTS è idempotente)
DROP POLICY IF EXISTS "client_own_conversations"   ON public.conversations;
DROP POLICY IF EXISTS "client_create_conversation" ON public.conversations;
DROP POLICY IF EXISTS "client_update_conversation" ON public.conversations;
DROP POLICY IF EXISTS "admin_all_conversations"    ON public.conversations;
DROP POLICY IF EXISTS "client_read_own_messages"   ON public.messages;
DROP POLICY IF EXISTS "client_insert_message"      ON public.messages;
DROP POLICY IF EXISTS "client_edit_own_message"    ON public.messages;
DROP POLICY IF EXISTS "admin_all_messages"         ON public.messages;

-- ── conversations ────────────────────────────────────────────

-- Il cliente legge solo i propri thread
CREATE POLICY "client_own_conversations"
  ON public.conversations FOR SELECT
  USING (client_id = auth.uid());

-- Il cliente crea thread con status='open'
CREATE POLICY "client_create_conversation"
  ON public.conversations FOR INSERT
  WITH CHECK (client_id = auth.uid() AND status = 'open');

-- Il cliente può portare lo stato solo a 'has_questions' o 'closed'
CREATE POLICY "client_update_conversation"
  ON public.conversations FOR UPDATE
  USING  (client_id = auth.uid())
  WITH CHECK (status IN ('has_questions', 'closed'));

-- L'admin ha accesso totale
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

-- ── messages ─────────────────────────────────────────────────

-- Il cliente legge i messaggi delle proprie conversazioni
CREATE POLICY "client_read_own_messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id   = conversation_id
        AND c.client_id = auth.uid()
    )
  );

-- Il cliente inserisce messaggi solo nelle proprie conversazioni aperte
CREATE POLICY "client_insert_message"
  ON public.messages FOR INSERT
  WITH CHECK (
    author_id   = auth.uid()
    AND author_role = 'client'
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id         = conversation_id
        AND c.client_id  = auth.uid()
        AND c.status    <> 'closed'
    )
  );

-- Il cliente modifica/elimina i propri messaggi entro 15 minuti
CREATE POLICY "client_edit_own_message"
  ON public.messages FOR UPDATE
  USING (
    author_id  = auth.uid()
    AND created_at > now() - INTERVAL '15 minutes'
  );

-- L'admin ha accesso totale
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
-- 8. VERIFICA — esegui queste query DOPO aver applicato il patch
-- ══════════════════════════════════════════════════════════════

-- A. Controlla che TUTTE le colonne richieste esistano su messages:
/*
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'messages'
  AND column_name IN (
    'id','conversation_id','author_id','author_role',
    'content','attachments','is_deleted','edited_at',
    'created_at','updated_at'
  )
ORDER BY column_name;
-- Atteso: 10 righe
*/

-- B. Controlla conversations:
/*
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'conversations'
  AND column_name IN (
    'id','client_id','subject','status',
    'last_message_at','created_at','updated_at'
  )
ORDER BY column_name;
-- Atteso: 7 righe
*/

-- C. RLS attivo su entrambe le tabelle:
/*
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('conversations','messages');
-- Atteso: rowsecurity = true su entrambe
*/

-- D. Policy attive:
/*
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('conversations','messages')
ORDER BY tablename, policyname;
-- Atteso: 4 policy per tabella = 8 totali
*/

-- E. Trigger attivi:
/*
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('conversations','messages')
ORDER BY event_object_table, trigger_name;
-- Atteso: trg_conversations_updated_at, trg_messages_updated_at, trg_touch_conversation
*/
