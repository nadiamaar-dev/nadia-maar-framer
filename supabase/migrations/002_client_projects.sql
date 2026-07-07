-- ============================================================
-- Migration: 002_client_projects.sql
-- Table:     client_projects
-- Used by:   ProjectTab (client cabinet), AdminPanel (admin CRM)
-- Run in:    Supabase → SQL Editor
-- ============================================================


-- ── 1. Status ENUM ────────────────────────────────────────────
-- pending_approval → client submitted, waiting admin review
-- active           → admin approved, work in progress
-- paused           → temporarily on hold
-- completed        → project delivered

DO $$ BEGIN
  CREATE TYPE project_status AS ENUM (
    'pending_approval',
    'active',
    'paused',
    'completed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── 2. Table ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.client_projects (

  id            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Owner — references auth.users so RLS can filter by auth.uid()
  client_id     UUID            NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Project metadata (set by client at creation, editable by admin)
  name          TEXT            NOT NULL,
  description   TEXT,

  -- Lifecycle — default is pending_approval; only admin can advance
  status        project_status  NOT NULL DEFAULT 'pending_approval',

  -- Optional admin note shown to the client (e.g. "Approvato, iniziamo lunedì")
  admin_note    TEXT,

  -- Timestamps
  created_at    TIMESTAMPTZ     NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ     NOT NULL DEFAULT now()

);

COMMENT ON TABLE  public.client_projects              IS 'One project per client. Created by the client, approved/managed by admin.';
COMMENT ON COLUMN public.client_projects.status       IS 'pending_approval → active → paused | completed';
COMMENT ON COLUMN public.client_projects.admin_note   IS 'Optional message from admin visible to the client.';


-- ── 3. Constraint: one active project per client ──────────────
-- Prevents duplicates. If you want to allow project history,
-- remove this constraint and filter by status='active' in queries.

CREATE UNIQUE INDEX IF NOT EXISTS uq_client_projects_active
  ON public.client_projects (client_id)
  WHERE status IN ('pending_approval', 'active', 'paused');


-- ── 4. Indexes ────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_client_projects_client_id
  ON public.client_projects (client_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_client_projects_status
  ON public.client_projects (status);


-- ── 5. Auto-update updated_at ─────────────────────────────────
-- Reuse the function created in migration 001 if it exists.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_client_projects_updated_at ON public.client_projects;

CREATE TRIGGER trg_client_projects_updated_at
  BEFORE UPDATE ON public.client_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();


-- ── 6. Row Level Security ─────────────────────────────────────

ALTER TABLE public.client_projects ENABLE ROW LEVEL SECURITY;


-- ── 7. RLS Policies ──────────────────────────────────────────

DROP POLICY IF EXISTS "client_select_own_project"   ON public.client_projects;
DROP POLICY IF EXISTS "client_insert_own_project"   ON public.client_projects;
DROP POLICY IF EXISTS "admin_select_all_projects"   ON public.client_projects;
DROP POLICY IF EXISTS "admin_update_all_projects"   ON public.client_projects;
DROP POLICY IF EXISTS "admin_delete_all_projects"   ON public.client_projects;

-- Client: read their own project
CREATE POLICY "client_select_own_project"
  ON public.client_projects FOR SELECT
  USING (client_id = auth.uid());

-- Client: create a project for themselves only
CREATE POLICY "client_insert_own_project"
  ON public.client_projects FOR INSERT
  WITH CHECK (
    client_id = auth.uid()
    -- status is enforced by DEFAULT 'pending_approval'; the CHECK below
    -- prevents clients from self-approving by setting a different status
    AND status = 'pending_approval'
  );

-- Admin: read all projects
CREATE POLICY "admin_select_all_projects"
  ON public.client_projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin: update any project (approve, pause, add note, etc.)
CREATE POLICY "admin_update_all_projects"
  ON public.client_projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin: delete any project
CREATE POLICY "admin_delete_all_projects"
  ON public.client_projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ── 8. Verify ─────────────────────────────────────────────────

-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'client_projects'
-- ORDER BY ordinal_position;

-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'client_projects';


-- ── 9. Test insert (replace UUID with a real auth.users.id) ───

-- INSERT INTO public.client_projects (client_id, name, description)
-- VALUES (
--   '00000000-0000-0000-0000-000000000001',
--   'Sito Web Aziendale',
--   'Sviluppo del nuovo sito con e-commerce e ottimizzazione SEO.'
-- );
-- -- status is automatically set to 'pending_approval'

-- To approve (run as admin):
-- UPDATE public.client_projects
-- SET status = 'active',
--     admin_note = 'Approvato! Iniziamo la settimana prossima.'
-- WHERE client_id = '00000000-0000-0000-0000-000000000001';
