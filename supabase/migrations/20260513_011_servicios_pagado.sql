-- Migration: 20260513_011_servicios_pagado.sql
-- Descripción: Agrega tracking de pago y fecha de vencimiento a servicios
-- Módulo: M7 (Servicios y Proveedores)

ALTER TABLE servicios
  ADD COLUMN IF NOT EXISTS monto_pagado numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vencimiento  date;

-- Índice parcial: servicios con vencimiento próximo y sin pagar (consulta frecuente en dashboard)
CREATE INDEX IF NOT EXISTS idx_servicios_vencimiento
  ON servicios(vencimiento)
  WHERE vencimiento IS NOT NULL AND estado NOT IN ('pagado', 'cancelado');
