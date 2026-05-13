-- Migration: 20260509_002_organizations_users.sql
-- Descripción: Organizaciones, usuarios y roles del sistema
-- Módulo: M0 — Plataforma SaaS (multitenancy + roles)

-- ================================================================
-- TABLAS
-- ================================================================

CREATE TABLE IF NOT EXISTS organizations (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  plan       text        NOT NULL DEFAULT 'starter'
             CHECK (plan IN ('starter', 'pro', 'agency')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Extiende auth.users de Supabase con rol y tenant
CREATE TABLE IF NOT EXISTS users (
  id         uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id     uuid        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role       text        NOT NULL DEFAULT 'organizador'
             CHECK (role IN ('organizador', 'recepcion', 'chef')),
  invited_by uuid        REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ================================================================
-- ÍNDICES
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(org_id);

-- ================================================================
-- FUNCIÓN HELPER — devuelve org_id del usuario activo sin recursión RLS
-- SECURITY DEFINER: se ejecuta con privilegios del owner (postgres),
-- evitando el loop RLS al consultar la tabla users desde sus propias policies.
-- ================================================================

CREATE OR REPLACE FUNCTION auth_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id FROM users WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION auth_org_id() TO authenticated, anon;

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Organización: cada usuario ve solo la suya
CREATE POLICY "organizations_tenant_access" ON organizations
  FOR ALL
  USING (id = auth_org_id())
  WITH CHECK (id = auth_org_id());

-- Usuarios: acceso propio (escritura) + lectura del tenant completo
CREATE POLICY "users_self_access" ON users
  FOR ALL
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "users_org_read" ON users
  FOR SELECT
  USING (org_id = auth_org_id());

-- ================================================================
-- TRIGGERS
-- ================================================================

CREATE TRIGGER set_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ================================================================
-- TRIGGER DE ALTA: crea org + user al registrarse
-- Si el metadata trae org_id → es staff invitado, no crea org nueva
-- ================================================================

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id uuid;
BEGIN
  -- Staff invitado: metadata contiene org_id y role
  IF (NEW.raw_user_meta_data->>'org_id') IS NOT NULL THEN
    INSERT INTO users (id, org_id, role)
    VALUES (
      NEW.id,
      (NEW.raw_user_meta_data->>'org_id')::uuid,
      COALESCE(NEW.raw_user_meta_data->>'role', 'recepcion')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
  END IF;

  -- Nuevo organizador: crear su organización
  INSERT INTO organizations (name, plan)
  VALUES (
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();
