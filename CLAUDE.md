# CLAUDE.md — Planning Pro
> Contrato de trabajo para agentes IA en este proyecto.  
> Leer completo antes de ejecutar cualquier acción.

---

## ¿Qué es este proyecto?

**Planning Pro** es una plataforma SaaS + PWA para organizadores profesionales de eventos. El usuario del software es siempre el organizador — no los invitados ni el cliente que contrató el servicio.

Es la evolución cloud-native de **Planning Manager Desktop** (Electron + SQLite, v0.11.0). El desktop validó el dominio. Planning Pro reescribe ese dominio sobre arquitectura moderna con 86 funcionalidades distribuidas en 12 módulos.

Documento de referencia completo: `PLANNING_PRO_MASTER_DOC.md`

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| PWA | Vite PWA Plugin + Service Worker |
| Estilos | Tailwind CSS + shadcn/ui |
| Estado global | Zustand |
| Backend | Hono.js + TypeScript |
| Base de datos | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (magic link + OAuth Google) |
| Tiempo real | Supabase Realtime (WebSocket) |
| Storage | Supabase Storage |
| Email | Resend |
| Deploy frontend | Vercel |
| Deploy backend | Render |
| Offline local | IndexedDB via idb |

---

## Estructura del monorepo

```
planning-pro/
├── apps/
│   ├── web/                    # Frontend PWA
│   │   └── src/
│   │       ├── core/
│   │       │   ├── domain/     # Entidades y value objects
│   │       │   ├── application/# Use cases
│   │       │   └── ports/      # Interfaces de repositorios
│   │       ├── infrastructure/
│   │       │   ├── supabase/   # Implementaciones de repos
│   │       │   ├── indexeddb/  # Cache offline
│   │       │   └── sync/       # Motor de sincronización
│   │       └── presentation/
│   │           ├── pages/      # Páginas por módulo
│   │           ├── components/ # Componentes reutilizables
│   │           ├── hooks/      # Custom hooks
│   │           └── stores/     # Zustand stores
│   │
│   └── api/                    # Backend Hono.js
│       └── src/
│           ├── routes/         # Endpoints por módulo
│           ├── middleware/     # Auth, CORS, rate limit
│           ├── services/       # Lógica de negocio
│           └── jobs/           # Cron jobs
│
├── packages/
│   ├── shared-types/           # DTOs y tipos compartidos
│   └── qr-generator/          # Lógica QR compartida
│
├── supabase/
│   ├── migrations/             # Migraciones SQL numeradas
│   ├── functions/              # Edge functions
│   └── seed.sql
│
├── CLAUDE.md                   # Este archivo
└── PLANNING_PRO_MASTER_DOC.md  # Documentación completa del producto
```

---

## Reglas de trabajo — LEER ANTES DE CUALQUIER ACCIÓN

### SIEMPRE hacer esto antes de codear:
1. **Leer el contexto** — entender en qué módulo estamos trabajando y cuál es la capa afectada
2. **Mostrar un plan** — listar qué archivos se van a crear o modificar y por qué
3. **Esperar aprobación** — no ejecutar cambios sin confirmación explícita
4. **Un módulo a la vez** — no mezclar cambios de múltiples módulos en una misma tarea
5. **Si algo no está claro**, preguntar antes de asumir

### NUNCA hacer esto:
- ❌ Mezclar lógica de negocio en la capa de presentación
- ❌ Acceder a Supabase directamente desde componentes React — siempre via repositorios
- ❌ Modificar migraciones existentes — solo agregar nuevas
- ❌ Romper el contrato de tipos en `packages/shared-types/`
- ❌ Hardcodear IDs, URLs o secrets — siempre via variables de entorno
- ❌ Instalar dependencias sin avisar primero
- ❌ Crear endpoints sin documentarlos en este archivo
- ❌ Saltarse Row Level Security — todas las tablas tienen RLS obligatorio

### Cuando toques la base de datos:
- ⚠️ ADVERTIR explícitamente antes de cualquier cambio de schema
- Crear SIEMPRE una nueva migración numerada en `supabase/migrations/`
- Seguir el patrón `YYYYMMDD_NNN_descripcion.sql`
- Nunca modificar migraciones existentes — solo agregar nuevas
- Toda tabla nueva debe tener `org_id` y su política RLS correspondiente

---

## Arquitectura — principios que no se negocian

### Clean Architecture estricta

```
Presentation → Application (Use Cases) → Domain ← Infrastructure
```

- Los use cases NO conocen React, Supabase ni ningún framework
- Los repositorios son interfaces en `core/ports/` — las implementaciones van en `infrastructure/`
- Los componentes React solo llaman hooks, los hooks llaman use cases
- Nunca importar desde `infrastructure/` en `core/domain/` o `core/application/`

### Multi-tenant con RLS

Cada tabla tiene `org_id uuid NOT NULL REFERENCES organizations(id)`. Las políticas RLS garantizan que cada query devuelva solo datos del tenant activo. Nunca filtrar por `org_id` manualmente en el código — el RLS lo hace automáticamente a nivel de base de datos.

### Offline-first obligatorio

Todo flujo crítico debe funcionar sin internet:
- Los datos del evento activo se cachean en IndexedDB al abrirlo
- Las escrituras se intentan en Supabase primero; si falla, se encolan localmente
- La cola se procesa automáticamente al recuperar conexión
- Resolución de conflictos: last-write-wins por `updated_at` timestamp

### El QR no se genera al crear el invitado

El QR se genera ÚNICAMENTE cuando el invitado confirma asistencia via formulario RSVP. Un QR válido = una persona con datos verificados. Esta regla no tiene excepciones salvo el caso de "agregar invitado manual" donde el organizador lo hace explícitamente.

---

## Módulos y su estado

| # | Módulo | Estado |
|---|--------|--------|
| M0 | Plataforma SaaS (auth, multitenancy, PWA, roles) | ✅ Completo y testeado |
| M1 | Gestión de Eventos | ✅ Completo y testeado |
| M2 | Gestión de Invitados | ✅ Completo y testeado |
| M3 | RSVP y Sistema QR | ✅ Completo y testeado |
| M4 | Gestión de Mesas | ✅ Completo y testeado |
| M5 | Plano Visual del Salón | ✅ Completo y testeado |
| M6 | Timeline del Evento | ✅ Completo y testeado |
| M7 | Servicios y Proveedores | ✅ Completo y testeado |
| M8 | Checklist de Servicios | ✅ Completo y testeado |
| M9 | Comanda del Chef | ✅ Completo y testeado |
| M10 | Check-in en Tiempo Real | ✅ Completo y testeado |
| M11 | Reportes y Analytics | ✅ Completo y testeado |

Actualizar el estado de cada módulo a medida que se completa:
- ⬜ Pendiente
- 🟡 En desarrollo
- ✅ Completo y testeado
- 🚀 En producción

---

## Roles del sistema

**Organizador** — control total. Crea el evento, configura el formulario RSVP, gestiona invitados, mesas, plano, timeline, servicios, comanda y reportes. Único rol con acceso a datos financieros.

**Recepción** — acceso exclusivo al check-in el día del evento. Puede escanear QR, buscar por nombre/DNI y confirmar ingreso con acompañantes. Sin acceso a configuración, finanzas ni lista completa.

**Chef** — acceso exclusivo a la comanda del evento asignado. Puede ver platos, cantidades y restricciones, y marcar el estado de cada curso. Sin acceso a ningún otro módulo.

> El cliente que contrató el servicio al organizador NO usa Planning Pro. Es externo al sistema. El organizador es el único usuario de la plataforma.

---

## Flujo RSVP — regla de negocio central

1. Organizador crea evento y configura campos del formulario RSVP
2. Sistema genera URL pública: `planningpro.app/rsvp/[slug]`
3. Organizador entrega el link a su cliente (fuera de Planning Pro)
4. Invitados abren el link, completan el formulario con sus datos
5. Sistema valida: DNI no duplicado + hay capacidad disponible
6. Sistema genera QR único con TOKEN irrepetible
7. Sistema envía QR al invitado por email/WhatsApp automáticamente
8. Día del evento: recepción escanea QR → sistema verifica TOKEN → marca como usado → muestra nombre + mesa

---

## Variables de entorno requeridas

```bash
# apps/web/.env.local
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=

# apps/api/.env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
JWT_SECRET=
```

---

## Convenciones de código

### Nombres
- Componentes React: PascalCase (`EventoCard.tsx`)
- Hooks: camelCase con prefijo `use` (`useEventos.ts`)
- Use cases: PascalCase descriptivo (`CreateEventoUseCase.ts`)
- Repositorios: interfaz `I` prefix (`IEventoRepository.ts`), implementación sin prefix (`SupabaseEventoRepository.ts`)
- Rutas API: kebab-case (`/api/eventos/:id/invitados`)
- Tablas DB: snake_case plural (`eventos`, `invitados`, `timeline_etapas`)

### Commits
Seguir conventional commits:
- `feat(m1): crear wizard de nuevo evento`
- `fix(m10): deduplicar escaneo QR en recepción`
- `chore(db): migración restricciones dietarias en invitados`
- `refactor(m4): separar lógica de asignación automática`

### Tests
- Use cases: tests unitarios obligatorios
- Repositorios: tests de integración con Supabase local (supabase start)
- Componentes: tests de comportamiento con Vitest + Testing Library

---

## Endpoints API documentados

> Completar a medida que se implementan

### Auth
- `POST /api/auth/magic-link` — enviar magic link por email

### Eventos
- Sin endpoints — acceso directo a Supabase vía `SupabaseEventoRepository` (cliente con anon key + RLS)

### Invitados
- Sin endpoints — acceso directo a Supabase vía `SupabaseInvitadoRepository` (cliente con anon key + RLS)

### RSVP público (sin auth)
- `GET /rsvp/:slug` — obtener datos del formulario RSVP del evento (campos, welcome message, banner, isFull)
- `POST /rsvp/:slug` — confirmar asistencia: valida capacidad y DNI, genera QR token, envía email con QR
- `POST /rsvp/:slug/resend` — reenviar QR por email buscando por DNI + email

### Check-in
- (pendiente)

---

## Orden de desarrollo

Seguir este orden estrictamente. Cada módulo va a producción funcionando antes de arrancar el siguiente.

```
Fase 0: Setup
  └── Monorepo + CI/CD + Supabase local + variables de entorno

Fase 1: Infraestructura base
  └── Schema DB completo + RLS + Auth + roles + PWA shell

Fase 2: Módulos core (M1 → M2 → M3)
  └── Eventos → Invitados → RSVP + QR
  └── Deploy parcial a producción y prueba real

Fase 3: Operación del evento (M4 → M5 → M6 → M10)
  └── Mesas → Plano del salón → Timeline → Check-in
  └── Deploy y prueba en evento real

Fase 4: Módulos operacionales (M7 → M8 → M9)
  └── Servicios → Checklist → Comanda del chef

Fase 5: Reportes y pulido (M11)
  └── Reportes PDF → Analytics → optimizaciones finales

Fase 6: Producción
  └── Performance → seguridad → onboarding → pricing
```

---

## Especialistas del Squad

El proyecto tiene 5 agentes especializados en `.claude/agents/`. Usá `/squad` para routing automático, o activá el especialista directamente según la tarea.

| Agente | Activar cuando... |
|--------|------------------|
| `security-specialist` | RLS, auth, JWT, OWASP, validación de inputs, seguridad de API |
| `ui-designer` | Componentes React, flujos UX, Tailwind + shadcn/ui, accesibilidad, PWA UI |
| `claude-code-expert` | Hooks, MCP, subagents, settings.json, nuevos skills |
| `copywriter` | Emails transaccionales, microcopy, labels, mensajes de error |
| `data-analyst` | M11 Reportes, queries PostgreSQL, métricas SaaS, dashboards |

**Comando `/squad`** — describí la tarea y el skill enruta al especialista correcto automáticamente.

**Regla:** Si una tarea involucra uno de estos dominios, recomendá activar el especialista antes de implementar.

Los squads fuente están en `squad/squads/` (solo los relevantes para desarrollo):
`claude-code-mastery`, `cybersecurity`, `design-squad`, `data-squad`, `copy-squad`, `storytelling`

---

## Skills del proyecto

Comandos disponibles en `.claude/skills/`. Se invocan con `/nombre` en el chat.

| Skill | Cuándo usar |
|-------|-------------|
| `/squad` | Routing automático al especialista correcto según la tarea |
| `/migration` | Crear nueva migración SQL con naming convention + RLS template |
| `/module` | Scaffold completo de un módulo (domain → port → use cases → repo → store → page) |
| `/security-review` | Auditoría de seguridad de los cambios en la rama actual |
| `/review` | Review de pull request |
| `/simplify` | Revisar código generado y eliminar sobreingeniería |

**Skills de uso frecuente durante desarrollo:**
- Empezar un módulo nuevo → `/module M[N] [entidad]`
- Tocar la base de datos → `/migration`
- Antes de mergear → `/security-review` luego `/review`

---

## Referencias

- `PLANNING_PRO_MASTER_DOC.md` — documentación completa del producto con todos los módulos, modelo de datos y decisiones técnicas
- `design-prototype/` — prototipo clickable completo de los 11 módulos (React + Tailwind + shadcn). Cada `mod-*.jsx` es la especificación UX del correspondiente `apps/web/src/presentation/pages/`. Abrir `design-prototype/Planning Pro.standalone.html` en el browser para navegar.
- Planning Manager Desktop — repositorio de referencia del sistema original (dominio validado)
