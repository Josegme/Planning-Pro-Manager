-- Migration: 20260509000009_m3_rsvp_config.sql
-- Descripción: Columnas de configuración RSVP en eventos (M3)

ALTER TABLE eventos
  ADD COLUMN IF NOT EXISTS rsvp_welcome_message text,
  ADD COLUMN IF NOT EXISTS rsvp_banner_url      text;
