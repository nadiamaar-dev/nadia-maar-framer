-- ============================================================
-- Migration: 001_client_tasks.sql
-- Table:     client_tasks
-- Used by:   TaskManager (admin), ProjectProgress (client cabinet)
-- Run this in: Supabase → SQL Editor
-- ============================================================


-- ── 0. Prerequisites ─────────────────────────────────────────
-- This script assumes the `profiles` table already exists with:
--   id   UUID PRIMARY KEY REFERENCES auth.users(id)
--   role TEXT NOT NULL DEFAULT 'client'  -- 'client' | 'admin'
--
-- If profiles does not exist yet, create it first:
-- CREATE TABLE IF NOT EXISTS public.profiles (
--   id   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--   role TEXT NOT NULL DEFAULT 'client',
--   created_at TIMESTAMPTZ NOT NULL DEFAULT now()
-- );


-- ── 1. Custom ENUM types ──────────────────────────────────────

-- Task lifecycle phase (matches TaskPhase in adminApi.ts)
DO $$ BEGIN
  CREATE TYPE task_phase AS ENUM (
    'strategia',
    'design',
    'sviluppo',
    'testing',
    'deploy'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Task status (matches TaskStatus in adminApi.ts)
DO $$ BEGIN
  CREATE TYPE task_status AS ENUM (
    'todo',
    'in-progress',
    'review',
    'done'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── 2. Table ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.client_tasks (

  -- Primary key
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key: which client this task belongs to
  -- References auth.users so RLS can filter by auth.uid()
  client_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Content fields (used by adminApi.ts createTask / updateTask)
  title        TEXT        NOT NULL,
  description  TEXT,
  category     TEXT        NOT NULL DEFAULT '',

  -- Lifecycle fields
  phase        task_phase  NOT NULL DEFAULT 'strategia',
  status       task_status NOT NULL DEFAULT 'todo',
  progress     SMALLINT    NOT NULL DEFAULT 0
                           CHECK (progress >= 0 AND progress <= 100),

  -- Human-readable due date (e.g. "Lug 2025") — stored as text to
  -- match the adminApi interface; use a DATE column if you need sorting
  due_date     TEXT,

  -- Timestamps
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()

);

COMMENT ON TABLE  public.client_tasks           IS 'Project tasks visible to clients in their cabinet and managed by admins.';
COMMENT ON COLUMN public.client_tasks.client_id IS 'auth.users.id of the client who owns this task.';
COMMENT ON COLUMN public.client_tasks.progress  IS '0–100 percent completion, set by admin.';
COMMENT ON COLUMN public.client_tasks.due_date  IS 'Human-readable date string, e.g. "Lug 2025".';


-- ── 3. Indexes ────────────────────────────────────────────────

-- Main query pattern: all tasks for a given client, ordered by creation
CREATE INDEX IF NOT EXISTS idx_client_tasks_client_id
  ON public.client_tasks (client_id, created_at ASC);

-- Admin queries: filter by status across all clients
CREATE INDEX IF NOT EXISTS idx_client_tasks_status
  ON public.client_tasks (status);

-- Admin queries: filter by phase
CREATE INDEX IF NOT EXISTS idx_client_tasks_phase
  ON public.client_tasks (phase);


-- ── 4. Auto-update updated_at ─────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_client_tasks_updated_at ON public.client_tasks;

CREATE TRIGGER trg_client_tasks_updated_at
  BEFORE UPDATE ON public.client_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();


-- ── 5. Enable Row Level Security ─────────────────────────────

ALTER TABLE public.client_tasks ENABLE ROW LEVEL SECURITY;


-- ── 6. RLS Policies ──────────────────────────────────────────

-- Drop existing policies before recreating (idempotent)
DROP POLICY IF EXISTS "client_select_own_tasks"  ON public.client_tasks;
DROP POLICY IF EXISTS "admin_select_all_tasks"   ON public.client_tasks;
DROP POLICY IF EXISTS "admin_insert_tasks"        ON public.client_tasks;
DROP POLICY IF EXISTS "admin_update_tasks"        ON public.client_tasks;
DROP POLICY IF EXISTS "admin_delete_tasks"        ON public.client_tasks;

-- ┌─────────────────────────────────────────────────────────┐
-- │  CLIENT: can only SELECT their own tasks                │
-- └─────────────────────────────────────────────────────────┘
CREATE POLICY "client_select_own_tasks"
  ON public.client_tasks
  FOR SELECT
  USING (client_id = auth.uid());

-- ┌─────────────────────────────────────────────────────────┐
-- │  ADMIN: full access to all rows                         │
-- │  Reads role from public.profiles (assumed to exist)     │
-- └─────────────────────────────────────────────────────────┘
CREATE POLICY "admin_select_all_tasks"
  ON public.client_tasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

CREATE POLICY "admin_insert_tasks"
  ON public.client_tasks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

CREATE POLICY "admin_update_tasks"
  ON public.client_tasks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

CREATE POLICY "admin_delete_tasks"
  ON public.client_tasks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );


-- ── 7. Verify ─────────────────────────────────────────────────
-- Run these SELECT statements after applying to confirm setup:

-- Check table columns
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'client_tasks'
-- ORDER BY ordinal_position;

-- Check RLS is enabled
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public' AND tablename = 'client_tasks';

-- Check active policies
-- SELECT policyname, cmd, roles, qual
-- FROM pg_policies
-- WHERE tablename = 'client_tasks';


-- ── 8. Sample data (optional — for manual testing only) ───────
-- Replace the UUIDs with real user IDs from auth.users.
-- To find them: SELECT id, email FROM auth.users;

-- INSERT INTO public.client_tasks
--   (client_id, title, description, category, phase, status, progress, due_date)
-- VALUES
--   -- Replace '00000000-0000-0000-0000-000000000001' with a real client UUID
--   ( '00000000-0000-0000-0000-000000000001',
--     'Analisi & Briefing',
--     'Raccolta degli obiettivi, analisi del mercato di riferimento e definizione della roadmap operativa.',
--     'Strategia', 'strategia', 'done', 100, 'Gen 2025' ),

--   ( '00000000-0000-0000-0000-000000000001',
--     'Design System & Identità Visiva',
--     'Palette cromatica, tipografia, iconografia e libreria di componenti UI riutilizzabili.',
--     'Design', 'design', 'done', 100, 'Feb 2025' ),

--   ( '00000000-0000-0000-0000-000000000001',
--     'Sviluppo Interfaccia Principale',
--     'Codice delle sezioni chiave, animazioni, interazioni e ottimizzazione delle performance.',
--     'Frontend', 'sviluppo', 'in-progress', 72, 'Lug 2025' ),

--   ( '00000000-0000-0000-0000-000000000001',
--     'Visibilità & Distribuzione',
--     'Ottimizzazione per i motori di ricerca, struttura URL canonici e integrazione canali di distribuzione.',
--     'Marketing', 'sviluppo', 'todo', 0, 'Ago 2025' );
