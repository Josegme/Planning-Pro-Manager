-- Migration: 20260513_012_qr_token_hash.sql
-- C-2: Reemplazar qr_token en texto plano por SHA-256 hash
-- Usar pgcrypto (instalado en migración 001) para migrar datos existentes

ALTER TABLE invitados ADD COLUMN IF NOT EXISTS qr_token_hash text;

-- Migrar registros existentes (dev data)
UPDATE invitados
SET qr_token_hash = encode(digest(qr_token, 'sha256'), 'hex')
WHERE qr_token IS NOT NULL AND qr_token_hash IS NULL;

ALTER TABLE invitados
  ADD CONSTRAINT invitados_qr_token_hash_unique UNIQUE (qr_token_hash);

ALTER TABLE invitados DROP COLUMN IF EXISTS qr_token;
