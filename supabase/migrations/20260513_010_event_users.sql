-- Migration: 20260513_010_event_users.sql
-- Descripción: Tabla de asignación de usuarios (recepcion/chef) a eventos específicos
-- Módulo: M10 (check-in) + M9 (comanda) — requerida por las policies de recepción en migración 005

-- ================================================================
-- TABLA
-- ================================================================

CREATE TABLE IF NOT EXISTS event_users (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id  uuid        NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       text        NOT NULL CHECK (role IN ('recepcion', 'chef')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (evento_id, user_id)
);

-- ================================================================
-- ÍNDICES
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_event_users_evento   ON event_users(evento_id);
CREATE INDEX IF NOT EXISTS idx_event_users_user     ON event_users(user_id);

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

ALTER TABLE event_users ENABLE ROW LEVEL SECURITY;

-- Organizador gestiona las asignaciones de su organización
CREATE POLICY "event_users_org_access" ON event_users
  FOR ALL
  USING (
    evento_id IN (SELECT id FROM eventos WHERE org_id = auth_org_id())
  )
  WITH CHECK (
    evento_id IN (SELECT id FROM eventos WHERE org_id = auth_org_id())
  );

-- Recepción y chef pueden leer su propia asignación
CREATE POLICY "event_users_self_read" ON event_users
  FOR SELECT
  USING (user_id = auth.uid());
