# Planning Pro Manager

Plataforma SaaS + PWA para organizadores profesionales de eventos. Sistema operativo de eventos en tiempo real: check-in por QR, plano visual del salón, comanda del chef, timeline, RSVP digital y reportes automáticos.

> Evolución cloud-native de Planning Manager Desktop (Electron + SQLite, v0.11.0).  
> Documentación completa del producto: [`PLANNING_PRO_MASTER_DOC.md`](./PLANNING_PRO_MASTER_DOC.md)  
> Contrato de trabajo para agentes IA: [`CLAUDE.md`](./CLAUDE.md)

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| PWA | Vite PWA Plugin + Service Worker |
| Estilos | Tailwind CSS + shadcn/ui |
| Estado | Zustand |
| Backend | Hono.js + TypeScript |
| Base de datos | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (magic link + OAuth Google) |
| Tiempo real | Supabase Realtime (WebSocket) |
| Storage | Supabase Storage |
| Email | Resend |
| Offline | IndexedDB via idb |
| Deploy frontend | Vercel |
| Deploy backend | Render |

---

## Estructura del monorepo

```
planning-pro-manager/
├── apps/
│   ├── web/                    # Frontend PWA (React + Vite)
│   │   └── src/
│   │       ├── core/           # Domain + Application (use cases + ports)
│   │       ├── infrastructure/ # Supabase repos + IndexedDB + sync
│   │       └── presentation/   # Pages + components + hooks + stores
│   │
│   └── api/                    # Backend (Hono.js + TypeScript)
│       └── src/
│           ├── routes/         # Endpoints por módulo
│           ├── middleware/     # Auth, CORS, rate limit
│           ├── services/       # Lógica de negocio del servidor
│           └── jobs/           # Cron jobs (recordatorios, reportes)
│
├── packages/
│   ├── shared-types/           # DTOs y tipos compartidos web ↔ api
│   └── qr-generator/          # Lógica de generación y validación de QR
│
├── supabase/
│   ├── migrations/             # Migraciones SQL numeradas (YYYYMMDD_NNN_desc.sql)
│   ├── functions/              # Edge functions
│   └── seed.sql                # Datos de desarrollo
│
├── turbo.json
├── package.json
├── CLAUDE.md                   # Contrato para agentes IA — leer antes de codear
├── PLANNING_PRO_MASTER_DOC.md  # Documentación completa del producto
└── README.md                   # Este archivo
```

---

## Módulos del sistema

| # | Módulo | Estado |
|---|--------|--------|
| M0 | Plataforma SaaS — auth, multitenancy, PWA, roles | ⬜ Pendiente |
| M1 | Gestión de Eventos | ⬜ Pendiente |
| M2 | Gestión de Invitados | ⬜ Pendiente |
| M3 | RSVP y Sistema QR | ⬜ Pendiente |
| M4 | Gestión de Mesas | ⬜ Pendiente |
| M5 | Plano Visual del Salón | ⬜ Pendiente |
| M6 | Timeline del Evento | ⬜ Pendiente |
| M7 | Servicios y Proveedores | ⬜ Pendiente |
| M8 | Checklist de Servicios | ⬜ Pendiente |
| M9 | Comanda del Chef | ⬜ Pendiente |
| M10 | Check-in en Tiempo Real | ⬜ Pendiente |
| M11 | Reportes y Analytics | ⬜ Pendiente |

---

## Requisitos previos

- Node.js >= 20
- npm >= 10
- Cuenta en [Supabase](https://supabase.com) con proyecto creado
- CLI de Supabase instalado: `npm install -g supabase`

---

## Variables de entorno

Crear los siguientes archivos antes de arrancar:

**`apps/web/.env.local`**
```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=http://localhost:3001
```

**`apps/api/.env`**
```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
JWT_SECRET=
PORT=3001
```

---

## Comandos

```bash
# Instalar dependencias (desde la raíz)
npm install

# Desarrollo — levanta web + api simultáneamente
npm run dev

# Desarrollo individual
npm run dev --filter=web
npm run dev --filter=api

# Build completo
npm run build

# Tests
npm run test

# Lint
npm run lint

# Supabase local
supabase start        # Levanta Supabase local
supabase db reset     # Aplica migraciones + seed
supabase stop         # Detiene Supabase local
```

---

## Orden de desarrollo

```
Fase 0  Setup — monorepo + CI/CD + Supabase local + env
Fase 1  Infraestructura — schema DB + RLS + Auth + roles + PWA shell
Fase 2  Core — Eventos (M1) → Invitados (M2) → RSVP + QR (M3)
Fase 3  Operación — Mesas (M4) → Plano (M5) → Timeline (M6) → Check-in (M10)
Fase 4  Operacional — Servicios (M7) → Checklist (M8) → Comanda (M9)
Fase 5  Cierre — Reportes (M11) → optimizaciones → deploy final
```

Cada fase se despliega a producción y se prueba antes de avanzar a la siguiente.

---

## Roles del sistema

- **Organizador** — control total del evento
- **Recepción** — solo check-in el día del evento
- **Chef** — solo comanda del evento asignado

El cliente que contrató el servicio al organizador **no usa Planning Pro**. Es externo al sistema.

---

## Convención de commits

```
feat(m1): descripción
fix(m10): descripción
chore(db): descripción
refactor(m4): descripción
```
