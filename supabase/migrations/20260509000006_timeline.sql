-- Migration: 20260509_006_timeline.sql
-- Descripción: Etapas del timeline del evento
-- Módulo: M6 — Timeline del Evento
-- Nota: FK menu_course_id se agrega en 008_comanda.sql (tabla aún no existe)

CREATE TABLE IF NOT EXISTS timeline_etapas (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id         uuid        NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  nombre            text        NOT NULL,
  hora_planificada  time        NOT NULL,
  duracion_estimada int,
  hora_inicio_real  timestamptz,
  hora_fin_real     timestamptz,
  status            text        NOT NULL DEFAULT 'pendiente'
                    CHECK (status IN ('pendiente', 'en_curso', 'completada')),
  display_order     int         NOT NULL DEFAULT 0,
  menu_course_id    uuid,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ================================================================
-- ÍNDICES
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_timeline_evento_id ON timeline_etapas(evento_id);
CREATE INDEX IF NOT EXISTS idx_timeline_order     ON timeline_etapas(evento_id, display_order);

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

ALTER TABLE timeline_etapas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "timeline_org_access" ON timeline_etapas
  FOR ALL
  USING (
    evento_id IN (SELECT id FROM eventos WHERE org_id = auth_org_id())
  );

-- Chef y recepción: lectura (para coordinar timing del servicio)
CREATE POLICY "timeline_staff_read" ON timeline_etapas
  FOR SELECT
  USING (
    evento_id IN (
      SELECT evento_id FROM event_users WHERE user_id = auth.uid()
    )
  );

-- ================================================================
-- TRIGGERS
-- ================================================================

CREATE TRIGGER set_timeline_etapas_updated_at
  BEFORE UPDATE ON timeline_etapas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
