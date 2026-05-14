-- Migration: 20260513_014_checkin_audit_log.sql
-- A-5: Tabla de auditoría para todos los intentos de check-in

CREATE TABLE IF NOT EXISTS checkin_audit_log (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id    uuid        NOT NULL REFERENCES eventos(id)       ON DELETE CASCADE,
  org_id       uuid        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invitado_id  uuid                 REFERENCES invitados(id)     ON DELETE SET NULL,
  scanned_by   uuid                 REFERENCES auth.users(id)   ON DELETE SET NULL,
  scanned_at   timestamptz NOT NULL DEFAULT now(),
  result       text        NOT NULL
    CHECK (result IN ('success', 'already_checked_in', 'token_not_found', 'not_confirmed', 'not_found')),
  token_hint   text
);

CREATE INDEX IF NOT EXISTS idx_checkin_audit_evento_id  ON checkin_audit_log(evento_id);
CREATE INDEX IF NOT EXISTS idx_checkin_audit_scanned_at ON checkin_audit_log(scanned_at);

ALTER TABLE checkin_audit_log ENABLE ROW LEVEL SECURITY;

-- Organizador: lee logs de sus eventos
CREATE POLICY "checkin_audit_org_read" ON checkin_audit_log
  FOR SELECT
  USING (org_id = auth_org_id());

-- Recepción / Chef / Organizador: puede insertar mientras pertenezca a la org
CREATE POLICY "checkin_audit_insert" ON checkin_audit_log
  FOR INSERT
  WITH CHECK (org_id = auth_org_id());
