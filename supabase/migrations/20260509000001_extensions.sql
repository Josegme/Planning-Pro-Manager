-- Migration: 20260509_001_extensions.sql
-- Descripción: Extensiones PostgreSQL y función updated_at reutilizable
-- Prerrequisito de todas las migraciones

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Función reutilizada por todos los triggers de updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
