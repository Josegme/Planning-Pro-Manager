-- Migration: 20260509_004_eventos.sql
-- Descripción: Eventos y asignación de staff por evento
-- Módulos: M1 (eventos), M0 (event_users — roles por evento)

-- ================================================================
-- TABLAS
-- ================================================================

CREATE TABLE IF NOT EXISTS eventos (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  venue_id    uuid        REFERENCES venues(id) ON DELETE SET NULL,
  name        text        NOT NULL,
  type        text        NOT NULL
              CHECK (type IN ('social', 'corporativo', 'gala', 'conferencia')),
  status      text        NOT NULL DEFAULT 'planificacion'
              CHECK (status IN ('planificacion', 'activo', 'finalizado')),
  date        date        NOT NULL,
  time        time        NOT NULL,
  venue_name  text        NOT NULL,
  location    text,
  capacity    int         NOT NULL DEFAULT 0,
  has_tables  boolean     NOT NULL DEFAULT true,
  rsvp_slug   text        NOT NULL UNIQUE,
  rsvp_fields jsonb       NOT NULL DEFAULT '[]',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Staff invitado al evento (recepción y chef)
CREATE TABLE IF NOT EXISTS event_users (
  evento_id  uuid  NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  user_id    uuid  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       text  NOT NULL CHECK (role IN ('recepcion', 'chef')),
  PRIMARY KEY (evento_id, user_id)
);

-- ================================================================
-- ÍNDICES
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_eventos_org_id    ON eventos(org_id);
CREATE INDEX IF NOT EXISTS idx_eventos_status    ON eventos(status);
CREATE INDEX IF NOT EXISTS idx_eventos_date      ON eventos(date);
CREATE INDEX IF NOT EXISTS idx_event_users_user  ON event_users(user_id);

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_users ENABLE ROW LEVEL SECURITY;

-- Organizador: acceso completo a sus eventos
CREATE POLICY "eventos_org_access" ON eventos
  FOR ALL
  USING (org_id = auth_org_id())
  WITH CHECK (org_id = auth_org_id());

-- Recepción: lectura del evento asignado (check-in día del evento)
CREATE POLICY "eventos_recepcion_read" ON eventos
  FOR SELECT
  USING (
    id IN (
      SELECT evento_id FROM event_users
      WHERE user_id = auth.uid() AND role = 'recepcion'
    )
  );

-- Chef: lectura del evento asignado (comanda)
CREATE POLICY "eventos_chef_read" ON eventos
  FOR SELECT
  USING (
    id IN (
      SELECT evento_id FROM event_users
      WHERE user_id = auth.uid() AND role = 'chef'
    )
  );

-- Organizador: gestión del staff de sus eventos
CREATE POLICY "event_users_org_access" ON event_users
  FOR ALL
  USING (
    evento_id IN (SELECT id FROM eventos WHERE org_id = auth_org_id())
  );

-- Staff: puede ver su propia asignación
CREATE POLICY "event_users_self_read" ON event_users
  FOR SELECT
  USING (user_id = auth.uid());

-- ================================================================
-- TRIGGERS
-- ================================================================

CREATE TRIGGER set_eventos_updated_at
  BEFORE UPDATE ON eventos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
