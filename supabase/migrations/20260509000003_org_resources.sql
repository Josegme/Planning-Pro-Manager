-- Migration: 20260509_003_org_resources.sql
-- Descripción: Recursos reutilizables a nivel organización
-- Módulos: M5 (venues), M7 (providers), M8 (service_templates)

-- ================================================================
-- TABLAS
-- ================================================================

-- Salones guardados — reutilizables entre eventos
CREATE TABLE IF NOT EXISTS venues (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  description text,
  elements    jsonb       NOT NULL DEFAULT '[]',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Proveedores a nivel organización — reutilizables entre eventos
CREATE TABLE IF NOT EXISTS providers (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  phone       text,
  email       text,
  address     text,
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Biblioteca maestra de servicios — plantilla para checklist de cada evento
CREATE TABLE IF NOT EXISTS service_templates (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name          text        NOT NULL,
  category      text        NOT NULL,
  description   text,
  is_required   boolean     NOT NULL DEFAULT false,
  display_order int         NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ================================================================
-- ÍNDICES
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_venues_org_id            ON venues(org_id);
CREATE INDEX IF NOT EXISTS idx_providers_org_id          ON providers(org_id);
CREATE INDEX IF NOT EXISTS idx_service_templates_org_id  ON service_templates(org_id);

-- ================================================================
-- ROW LEVEL SECURITY — solo el organizador del tenant
-- ================================================================

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "venues_org_access" ON venues
  FOR ALL
  USING (org_id = auth_org_id())
  WITH CHECK (org_id = auth_org_id());

CREATE POLICY "providers_org_access" ON providers
  FOR ALL
  USING (org_id = auth_org_id())
  WITH CHECK (org_id = auth_org_id());

CREATE POLICY "service_templates_org_access" ON service_templates
  FOR ALL
  USING (org_id = auth_org_id())
  WITH CHECK (org_id = auth_org_id());

-- ================================================================
-- TRIGGERS
-- ================================================================

CREATE TRIGGER set_venues_updated_at
  BEFORE UPDATE ON venues
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_providers_updated_at
  BEFORE UPDATE ON providers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_service_templates_updated_at
  BEFORE UPDATE ON service_templates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
