# /migration — Crear migración Supabase

Crea una nueva migración SQL en `supabase/migrations/` siguiendo las convenciones del proyecto.

## Proceso obligatorio

1. **Leer el directorio** `supabase/migrations/` para determinar el número secuencial siguiente.
   - Si no hay migraciones: empieza en `001`
   - Si la última es `20260509_003_...`: el siguiente es `004`

2. **Pedir confirmación** — si el usuario no especificó descripción, preguntar:
   > "¿Nombre descriptivo para la migración? (ej: `create_eventos_table`, `add_rsvp_slug_to_eventos`)"

3. **Advertir explícitamente antes de crear el archivo:**
   > "⚠️ Voy a crear `supabase/migrations/YYYYMMDD_NNN_descripcion.sql` — ¿confirmas?"

4. **Crear el archivo** con la estructura estándar (ver abajo).

## Nombre del archivo

```
YYYYMMDD_NNN_descripcion_en_snake_case.sql
```

- `YYYYMMDD` = fecha actual del sistema
- `NNN` = número secuencial con ceros (001, 002, 003...)
- `descripcion` = kebab/snake_case, qué hace la migración

## Estructura estándar de cada migración

```sql
-- Migration: NOMBRE_ARCHIVO
-- Descripción: QUÉ HACE ESTA MIGRACIÓN
-- Fecha: FECHA ACTUAL
-- Módulo: M[N] — Nombre del módulo

-- ================================================================
-- TABLAS
-- ================================================================

CREATE TABLE IF NOT EXISTS nombre_tabla (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  -- campos específicos del módulo --
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ================================================================
-- ÍNDICES
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_nombre_tabla_org_id ON nombre_tabla(org_id);

-- ================================================================
-- ROW LEVEL SECURITY — obligatorio en todas las tablas
-- ================================================================

ALTER TABLE nombre_tabla ENABLE ROW LEVEL SECURITY;

-- Organizador: acceso completo a datos de su organización
CREATE POLICY "nombre_tabla_org_access" ON nombre_tabla
  FOR ALL
  USING (
    org_id = (SELECT org_id FROM users WHERE id = auth.uid())
  )
  WITH CHECK (
    org_id = (SELECT org_id FROM users WHERE id = auth.uid())
  );

-- ================================================================
-- TRIGGER updated_at
-- ================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_nombre_tabla_updated_at
  BEFORE UPDATE ON nombre_tabla
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

## Checklist de seguridad por migración

Antes de crear el archivo, verificar que la migración:

- [ ] Toda tabla nueva tiene `org_id uuid NOT NULL`
- [ ] Toda tabla nueva tiene `ENABLE ROW LEVEL SECURITY`
- [ ] Toda tabla nueva tiene al menos una policy RLS
- [ ] La policy RLS usa `auth.uid()` — no filtrar por `org_id` en la app
- [ ] Se añade índice en `org_id` para performance
- [ ] Si hay FK a otras tablas: verificar que esas tablas ya existen en migraciones anteriores
- [ ] NUNCA modificar una migración existente — siempre crear una nueva

## Roles de acceso — patrones frecuentes

```sql
-- Solo organizador (control total)
CREATE POLICY "tabla_organizador_only" ON tabla
  FOR ALL
  USING (
    org_id = (SELECT org_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) = 'organizador'
  );

-- Recepción: solo lectura del evento asignado
CREATE POLICY "tabla_recepcion_read" ON tabla
  FOR SELECT
  USING (
    evento_id IN (
      SELECT evento_id FROM event_users
      WHERE user_id = auth.uid() AND role = 'recepcion'
    )
  );

-- Chef: solo su comanda
CREATE POLICY "tabla_chef_read" ON tabla
  FOR SELECT
  USING (
    evento_id IN (
      SELECT evento_id FROM event_users
      WHERE user_id = auth.uid() AND role = 'chef'
    )
  );
```

## Regla de oro

> Si la tabla no tiene RLS, la migración no se aprueba. Sin excepciones.
