-- Migration: 20260513_013_auth_trigger_secure.sql
-- A-4: Prevenir inyección de org_id/role via metadata de signup
-- - Valida que org_id exista en organizations antes de asignar
-- - Clampea role a ('recepcion', 'chef') — nunca 'organizador' via metadata

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id   uuid;
  meta_org_id  uuid;
  meta_role    text;
BEGIN
  meta_org_id := NULLIF(NEW.raw_user_meta_data->>'org_id', '')::uuid;
  meta_role   := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'recepcion');

  IF meta_org_id IS NOT NULL THEN
    -- Valida que la organización exista (bloquea cross-tenant injection)
    IF NOT EXISTS (SELECT 1 FROM organizations WHERE id = meta_org_id) THEN
      RAISE EXCEPTION 'Organización % no encontrada', meta_org_id;
    END IF;
    -- 'organizador' nunca puede venir de metadata — solo recepcion o chef
    IF meta_role NOT IN ('recepcion', 'chef') THEN
      meta_role := 'recepcion';
    END IF;
    INSERT INTO users (id, org_id, role)
    VALUES (NEW.id, meta_org_id, meta_role)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
  END IF;

  -- Nuevo organizador: crear su organización
  INSERT INTO organizations (name, plan)
  VALUES (
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      split_part(NEW.email, '@', 1)
    ),
    'starter'
  )
  RETURNING id INTO new_org_id;

  INSERT INTO users (id, org_id, role)
  VALUES (NEW.id, new_org_id, 'organizador');

  RETURN NEW;
END;
$$;
