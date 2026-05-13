-- Migration: 20260509_005_invitados_mesas.sql
-- Descripción: Invitados, mesas y layout visual del salón
-- Módulos: M2 (invitados), M4 (mesas), M5 (event_layouts)

-- ================================================================
-- TABLAS
-- ================================================================

CREATE TABLE IF NOT EXISTS mesas (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id     uuid        NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  number        int         NOT NULL,
  name          text,
  capacity      int         NOT NULL DEFAULT 10,
  menu_especial text,
  position      jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (evento_id, number)
);

CREATE TABLE IF NOT EXISTS invitados (
  id                     uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id              uuid    NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  org_id                 uuid    NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  mesa_id                uuid    REFERENCES mesas(id) ON DELETE SET NULL,
  nombre                 text    NOT NULL,
  apellido               text    NOT NULL,
  dni                    text,
  email                  text,
  whatsapp               text,
  grupo                  text,
  acompanantes_esperados int     NOT NULL DEFAULT 0,
  acompanantes_presentes int,
  dietary_restrictions   text[]  NOT NULL DEFAULT '{}',
  status                 text    NOT NULL DEFAULT 'pendiente'
                         CHECK (status IN (
                           'pendiente', 'invitado', 'visto',
                           'confirmado', 'checkin', 'rechazo'
                         )),
  rsvp_token             text    UNIQUE,
  qr_token               text    UNIQUE,
  qr_used_at             timestamptz,
  checkin_at             timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

-- Posiciones visuales del plano del salón
-- El estado de las mesas NO se almacena aquí — se calcula desde invitados en tiempo real
CREATE TABLE IF NOT EXISTS event_layouts (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id  uuid        NOT NULL UNIQUE REFERENCES eventos(id) ON DELETE CASCADE,
  elements   jsonb       NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ================================================================
-- ÍNDICES
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_mesas_evento_id    ON mesas(evento_id);
CREATE INDEX IF NOT EXISTS idx_invitados_evento   ON invitados(evento_id);
CREATE INDEX IF NOT EXISTS idx_invitados_org_id   ON invitados(org_id);
CREATE INDEX IF NOT EXISTS idx_invitados_status   ON invitados(status);
CREATE INDEX IF NOT EXISTS idx_invitados_mesa     ON invitados(mesa_id);
-- Índice parcial para búsqueda de DNI por evento (deduplicación RSVP)
CREATE INDEX IF NOT EXISTS idx_invitados_dni      ON invitados(evento_id, dni) WHERE dni IS NOT NULL;
-- Índice parcial para lookup de QR en check-in (crítico en tiempo real)
CREATE INDEX IF NOT EXISTS idx_invitados_qr       ON invitados(qr_token) WHERE qr_token IS NOT NULL;

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

ALTER TABLE mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitados ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_layouts ENABLE ROW LEVEL SECURITY;

-- Mesas: organizador acceso completo
CREATE POLICY "mesas_org_access" ON mesas
  FOR ALL
  USING (
    evento_id IN (SELECT id FROM eventos WHERE org_id = auth_org_id())
  );

-- Mesas: recepción puede leer (mostrar mesa asignada al hacer check-in)
CREATE POLICY "mesas_recepcion_read" ON mesas
  FOR SELECT
  USING (
    evento_id IN (
      SELECT evento_id FROM event_users
      WHERE user_id = auth.uid() AND role = 'recepcion'
    )
  );

-- Invitados: organizador acceso completo
CREATE POLICY "invitados_org_access" ON invitados
  FOR ALL
  USING (org_id = auth_org_id())
  WITH CHECK (org_id = auth_org_id());

-- Invitados: recepción puede leer la lista (para búsqueda manual)
CREATE POLICY "invitados_recepcion_read" ON invitados
  FOR SELECT
  USING (
    evento_id IN (
      SELECT evento_id FROM event_users
      WHERE user_id = auth.uid() AND role = 'recepcion'
    )
  );

-- Invitados: recepción puede actualizar status + campos de check-in
CREATE POLICY "invitados_recepcion_checkin" ON invitados
  FOR UPDATE
  USING (
    evento_id IN (
      SELECT evento_id FROM event_users
      WHERE user_id = auth.uid() AND role = 'recepcion'
    )
  )
  WITH CHECK (
    evento_id IN (
      SELECT evento_id FROM event_users
      WHERE user_id = auth.uid() AND role = 'recepcion'
    )
  );

-- Layout: solo organizador
CREATE POLICY "event_layouts_org_access" ON event_layouts
  FOR ALL
  USING (
    evento_id IN (SELECT id FROM eventos WHERE org_id = auth_org_id())
  );

-- ================================================================
-- TRIGGERS
-- ================================================================

CREATE TRIGGER set_mesas_updated_at
  BEFORE UPDATE ON mesas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_invitados_updated_at
  BEFORE UPDATE ON invitados
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_event_layouts_updated_at
  BEFORE UPDATE ON event_layouts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
