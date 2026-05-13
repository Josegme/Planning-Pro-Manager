-- Migration: 20260509_007_servicios.sql
-- Descripción: Servicios, control financiero y checklist operacional
-- Módulos: M7 (servicios y proveedores), M8 (checklist via checklist_status)

CREATE TABLE IF NOT EXISTS servicios (
  id               uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id        uuid          NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  org_id           uuid          NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider_id      uuid          REFERENCES providers(id) ON DELETE SET NULL,
  template_id      uuid          REFERENCES service_templates(id) ON DELETE SET NULL,
  nombre           text          NOT NULL,
  descripcion      text,
  costo_unitario   numeric(12,2) NOT NULL DEFAULT 0,
  cantidad         int           NOT NULL DEFAULT 1,
  moneda           text          NOT NULL DEFAULT 'ARS'
                   CHECK (moneda IN ('ARS', 'USD', 'EUR')),
  estado           text          NOT NULL DEFAULT 'cotizado'
                   CHECK (estado IN ('cotizado', 'contratado', 'pagado', 'cancelado')),
  checklist_status text          NOT NULL DEFAULT 'pendiente'
                   CHECK (checklist_status IN ('pendiente', 'confirmado', 'problema')),
  checklist_note   text,
  created_at       timestamptz   NOT NULL DEFAULT now(),
  updated_at       timestamptz   NOT NULL DEFAULT now()
);

-- ================================================================
-- ÍNDICES
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_servicios_evento_id   ON servicios(evento_id);
CREATE INDEX IF NOT EXISTS idx_servicios_org_id      ON servicios(org_id);
CREATE INDEX IF NOT EXISTS idx_servicios_provider_id ON servicios(provider_id);

-- ================================================================
-- ROW LEVEL SECURITY — datos financieros: solo el organizador
-- ================================================================

ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "servicios_org_access" ON servicios
  FOR ALL
  USING (org_id = auth_org_id())
  WITH CHECK (org_id = auth_org_id());

-- ================================================================
-- TRIGGERS
-- ================================================================

CREATE TRIGGER set_servicios_updated_at
  BEFORE UPDATE ON servicios
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
