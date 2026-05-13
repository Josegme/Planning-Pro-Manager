-- Migration: 20260509_008_comanda.sql
-- Descripción: Comanda del chef — cursos, cantidades por restricción, mise en place
-- Módulo: M9 — Comanda del Chef

-- ================================================================
-- TABLAS
-- ================================================================

CREATE TABLE IF NOT EXISTS menu_courses (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id     uuid        NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  nombre        text        NOT NULL,
  tipo          text        NOT NULL
                CHECK (tipo IN (
                  'entrada_fria', 'entrada_caliente', 'principal',
                  'guarnicion', 'postre', 'otro'
                )),
  hora_salida   time,
  display_order int         NOT NULL DEFAULT 0,
  notas_cocina  text,
  status        text        NOT NULL DEFAULT 'pendiente'
                CHECK (status IN ('pendiente', 'preparacion', 'listo', 'servido')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Cantidades por restricción dietaria (generadas automáticamente desde invitados)
CREATE TABLE IF NOT EXISTS course_requirements (
  id               uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id        uuid    NOT NULL REFERENCES menu_courses(id) ON DELETE CASCADE,
  restriccion      text,   -- NULL = porción estándar
  cantidad         int     NOT NULL DEFAULT 0,
  mesas_afectadas  text[]  NOT NULL DEFAULT '{}',
  notas_especiales text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Mise en place: vajilla y cristalería con repuesto sugerido (+10%)
CREATE TABLE IF NOT EXISTS table_settings (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id         uuid        NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  item              text        NOT NULL,
  cantidad_total    int         NOT NULL DEFAULT 0,
  cantidad_repuesto int         NOT NULL DEFAULT 0,
  notas             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- FK diferida: timeline_etapas.menu_course_id → menu_courses.id
-- No pudo declararse en 006_timeline.sql porque esta tabla no existía aún
ALTER TABLE timeline_etapas
  ADD CONSTRAINT fk_timeline_menu_course
  FOREIGN KEY (menu_course_id) REFERENCES menu_courses(id) ON DELETE SET NULL;

-- ================================================================
-- ÍNDICES
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_menu_courses_evento    ON menu_courses(evento_id);
CREATE INDEX IF NOT EXISTS idx_menu_courses_order     ON menu_courses(evento_id, display_order);
CREATE INDEX IF NOT EXISTS idx_course_requirements    ON course_requirements(course_id);
CREATE INDEX IF NOT EXISTS idx_table_settings_evento  ON table_settings(evento_id);

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

ALTER TABLE menu_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_settings ENABLE ROW LEVEL SECURITY;

-- Menu courses: organizador acceso completo
CREATE POLICY "menu_courses_org_access" ON menu_courses
  FOR ALL
  USING (
    evento_id IN (SELECT id FROM eventos WHERE org_id = auth_org_id())
  );

-- Chef: lectura de su comanda
CREATE POLICY "menu_courses_chef_read" ON menu_courses
  FOR SELECT
  USING (
    evento_id IN (
      SELECT evento_id FROM event_users
      WHERE user_id = auth.uid() AND role = 'chef'
    )
  );

-- Chef: puede actualizar status del curso (preparacion → listo → servido)
CREATE POLICY "menu_courses_chef_update" ON menu_courses
  FOR UPDATE
  USING (
    evento_id IN (
      SELECT evento_id FROM event_users
      WHERE user_id = auth.uid() AND role = 'chef'
    )
  )
  WITH CHECK (
    evento_id IN (
      SELECT evento_id FROM event_users
      WHERE user_id = auth.uid() AND role = 'chef'
    )
  );

-- Course requirements: organizador acceso completo
CREATE POLICY "course_requirements_org_access" ON course_requirements
  FOR ALL
  USING (
    course_id IN (
      SELECT mc.id FROM menu_courses mc
      JOIN eventos e ON e.id = mc.evento_id
      WHERE e.org_id = auth_org_id()
    )
  );

-- Chef: lectura de cantidades (para preparar porciones)
CREATE POLICY "course_requirements_chef_read" ON course_requirements
  FOR SELECT
  USING (
    course_id IN (
      SELECT mc.id FROM menu_courses mc
      JOIN event_users eu ON eu.evento_id = mc.evento_id
      WHERE eu.user_id = auth.uid() AND eu.role = 'chef'
    )
  );

-- Table settings: solo organizador
CREATE POLICY "table_settings_org_access" ON table_settings
  FOR ALL
  USING (
    evento_id IN (SELECT id FROM eventos WHERE org_id = auth_org_id())
  );

-- ================================================================
-- TRIGGERS
-- ================================================================

CREATE TRIGGER set_menu_courses_updated_at
  BEFORE UPDATE ON menu_courses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_table_settings_updated_at
  BEFORE UPDATE ON table_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
