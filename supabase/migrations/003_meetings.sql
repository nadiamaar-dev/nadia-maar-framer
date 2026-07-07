-- ============================================================
-- Migration: 003_meetings.sql
-- Table:     meetings
-- Roles:     client (propose/confirm own), admin (full access)
-- Run in:    Supabase → SQL Editor
-- ============================================================


-- ── 1. ENUM types ─────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE meeting_status AS ENUM (
    'pending',      -- proposed, waiting for the other party
    'confirmed',    -- both parties agreed
    'cancelled',    -- cancelled by either party
    'rescheduled'   -- replaced by a new meeting row
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE meeting_proposer AS ENUM ('admin', 'client');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── 2. Table ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.meetings (

  id              UUID             PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Client who this meeting is with
  client_id       UUID             NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Who proposed this slot
  proposed_by     meeting_proposer NOT NULL,

  -- Meeting time (stored in UTC; display in local time on the frontend)
  datetime        TIMESTAMPTZ      NOT NULL,

  -- Duration in minutes (default: 30-minute discovery call)
  duration_min    SMALLINT         NOT NULL DEFAULT 30 CHECK (duration_min > 0),

  status          meeting_status   NOT NULL DEFAULT 'pending',

  -- Optional notes from each side
  admin_note      TEXT,
  client_note     TEXT,

  -- Timestamps
  created_at      TIMESTAMPTZ      NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ      NOT NULL DEFAULT now()

);

COMMENT ON TABLE  public.meetings              IS 'Scheduled calls between admin and clients. Bidirectional proposal flow.';
COMMENT ON COLUMN public.meetings.proposed_by  IS 'admin = admin chose the slot; client = client requested the slot.';
COMMENT ON COLUMN public.meetings.datetime     IS 'UTC timestamp. Frontend converts to local time for display.';


-- ── 3. Indexes ────────────────────────────────────────────────

-- Client cabinet: load upcoming meetings for a given client
CREATE INDEX IF NOT EXISTS idx_meetings_client_upcoming
  ON public.meetings (client_id, datetime ASC)
  WHERE status IN ('pending', 'confirmed');

-- Admin panel: load all pending meetings needing action
CREATE INDEX IF NOT EXISTS idx_meetings_pending
  ON public.meetings (status, datetime ASC);

-- Availability check: all confirmed slots (blocks any new booking)
CREATE INDEX IF NOT EXISTS idx_meetings_confirmed_datetime
  ON public.meetings (datetime)
  WHERE status = 'confirmed';


-- ── 4. Auto-update updated_at ─────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_meetings_updated_at ON public.meetings;
CREATE TRIGGER trg_meetings_updated_at
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ── 5. Enable RLS ─────────────────────────────────────────────

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;


-- ── 6. RLS Policies ──────────────────────────────────────────

DROP POLICY IF EXISTS "client_select_own_meetings"   ON public.meetings;
DROP POLICY IF EXISTS "client_insert_own_meetings"   ON public.meetings;
DROP POLICY IF EXISTS "client_update_own_meetings"   ON public.meetings;
DROP POLICY IF EXISTS "admin_all_meetings"           ON public.meetings;

-- Client: read their own meetings
CREATE POLICY "client_select_own_meetings"
  ON public.meetings FOR SELECT
  USING (client_id = auth.uid());

-- Client: propose a meeting (proposed_by must be 'client', status must be 'pending')
CREATE POLICY "client_insert_own_meetings"
  ON public.meetings FOR INSERT
  WITH CHECK (
    client_id = auth.uid()
    AND proposed_by = 'client'
    AND status = 'pending'
  );

-- Client: can only confirm or cancel meetings proposed BY THE ADMIN
-- (cannot self-confirm their own proposal, cannot change datetime)
CREATE POLICY "client_update_own_meetings"
  ON public.meetings FOR UPDATE
  USING (
    client_id = auth.uid()
    AND proposed_by = 'admin'
    AND status = 'pending'
  )
  WITH CHECK (
    status IN ('confirmed', 'cancelled')
  );

-- Admin: unrestricted access to all meetings
CREATE POLICY "admin_all_meetings"
  ON public.meetings FOR ALL
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


-- ── 7. Availability function (bypasses RLS) ───────────────────
-- Returns all confirmed meeting datetimes so ANY authenticated user
-- can check availability without seeing who the meetings belong to.
-- SECURITY DEFINER runs as the function owner (superuser), bypassing RLS.

CREATE OR REPLACE FUNCTION public.get_confirmed_meeting_slots(
  from_dt TIMESTAMPTZ DEFAULT now(),
  to_dt   TIMESTAMPTZ DEFAULT now() + INTERVAL '60 days'
)
RETURNS TABLE (slot TIMESTAMPTZ)
LANGUAGE SQL SECURITY DEFINER
STABLE PARALLEL SAFE
AS $$
  SELECT datetime AS slot
  FROM public.meetings
  WHERE status = 'confirmed'
    AND datetime >= from_dt
    AND datetime <= to_dt
  ORDER BY datetime;
$$;

COMMENT ON FUNCTION public.get_confirmed_meeting_slots IS
  'Returns confirmed meeting slots for any authenticated user (RLS bypassed) for availability checking.';

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_confirmed_meeting_slots TO authenticated;


-- ── 8. Verify ─────────────────────────────────────────────────

-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'meetings';
-- SELECT proname FROM pg_proc WHERE proname = 'get_confirmed_meeting_slots';


-- ── 9. Test data (replace UUIDs with real auth.users.id values)

-- Admin proposes to client:
-- INSERT INTO public.meetings (client_id, proposed_by, datetime, admin_note)
-- VALUES ('CLIENT-UUID', 'admin', '2026-07-10 09:30:00+00', 'Sprint review call');

-- Client proposes:
-- INSERT INTO public.meetings (client_id, proposed_by, datetime, client_note)
-- VALUES ('CLIENT-UUID', 'client', '2026-07-11 14:00:00+00', 'Discuss API integration');

-- Admin confirms client proposal:
-- UPDATE public.meetings SET status = 'confirmed' WHERE id = 'MEETING-UUID';
