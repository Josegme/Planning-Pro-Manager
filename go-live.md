# Go-Live Checklist — Planning Pro

> Documento temporal de trabajo para el deploy a producción.  
> Una vez completado, incorporar el resumen al README y eliminar este archivo.

---

## Estado actual

Todo el software está completo (M0–M11 + Fase 6). Lo que sigue es infraestructura y servicios externos.

---

## Paso 1 — Supabase producción

- [ ] Crear proyecto nuevo en [supabase.com](https://supabase.com) (separado del de dev)
- [ ] Obtener `SUPABASE_URL` y `SUPABASE_ANON_KEY` (para el frontend)
- [ ] Obtener `SUPABASE_SERVICE_ROLE_KEY` (para el backend — nunca al frontend)
- [ ] Instalar CLI: `npm install -g supabase`
- [ ] Enlazar proyecto: `supabase link --project-ref <ref>`
- [ ] Aplicar las 15 migraciones: `supabase db push`
- [ ] Verificar en el dashboard de Supabase que todas las tablas tienen RLS activo
- [ ] Configurar Auth: habilitar magic link + OAuth Google en el panel de Supabase

---

## Paso 2 — Resend (email de QR)

> Sin esto el flujo RSVP no entrega los QR a los invitados.

- [ ] Crear cuenta en [resend.com](https://resend.com)
- [ ] Agregar y verificar el dominio de email (ej. `planningpro.app`)
- [ ] Obtener `RESEND_API_KEY`
- [ ] Probar envío de email con QR adjunto en staging antes de prod

---

## Paso 3 — Deploy backend (Render)

- [ ] Crear servicio Web en [render.com](https://render.com) apuntando al repo, directorio `apps/api`
- [ ] Configurar variables de entorno en Render:
  ```
  SUPABASE_URL=
  SUPABASE_SERVICE_ROLE_KEY=
  RESEND_API_KEY=
  JWT_SECRET=                  # string aleatorio seguro (openssl rand -hex 32)
  FRONTEND_URL=                # URL pública del frontend en Vercel
  PORT=3001
  NODE_ENV=production
  ```
- [ ] Verificar que `GET /health` responde `{ status: "ok" }` en la URL pública

---

## Paso 4 — Deploy frontend (Vercel)

- [ ] Importar repo en [vercel.com](https://vercel.com), directorio raíz `apps/web`
- [ ] Configurar variables de entorno en Vercel:
  ```
  VITE_SUPABASE_URL=
  VITE_SUPABASE_ANON_KEY=
  VITE_API_URL=                # URL pública del backend en Render
  ```
- [ ] Verificar que el login con magic link funciona end-to-end
- [ ] Verificar que la PWA es instalable (manifest + service worker)

---

## Paso 5 — Mercado Pago (integración real)

> El mock actual (`/payments/checkout` y `/payments/mock-confirm`) debe reemplazarse.

- [ ] Crear app en [mercadopago.com/developers](https://www.mercadopago.com.ar/developers)
- [ ] Obtener `MP_ACCESS_TOKEN` de producción
- [ ] Agregar `MP_ACCESS_TOKEN` a las variables de entorno de Render
- [ ] Reescribir `apps/api/src/routes/payments.ts`:
  - `POST /payments/checkout` → usar SDK de MP, crear Preference, devolver `init_point`
  - Eliminar `POST /payments/mock-confirm`
  - Agregar `POST /payments/webhook` → endpoint que MP llama al aprobar el pago (actualiza `subscription_status = 'active'`)
- [ ] Configurar la URL del webhook en el panel de MP: `https://<render-url>/payments/webhook`
- [ ] Actualizar `apps/web/src/presentation/pages/payment/MockPaymentPage.tsx` → reemplazar por página de éxito/error post-redirect de MP
- [ ] Probar el flujo completo: crear cuenta → agotar 2 eventos → pagar → suscripción activa

---

## Verificación final antes de abrir al público

- [ ] Flujo completo de un organizador nuevo: registro → onboarding → crear evento → RSVP → invitado confirma → QR llega por email
- [ ] Flujo de check-in: escanear QR → invitado marcado → tiempo real en panel
- [ ] Flujo de pago: evento #3 → paywall → MP → suscripción activa
- [ ] Roles: recepción solo ve check-in, chef solo ve comanda
- [ ] PWA instalable en Android y iPhone
- [ ] Sin errores en consola del navegador en flujos críticos

---

## Variables de entorno — resumen

| Variable | Dónde va | Fuente |
|----------|----------|--------|
| `VITE_SUPABASE_URL` | Vercel | Panel Supabase → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Vercel | Panel Supabase → Project Settings → API |
| `VITE_API_URL` | Vercel | URL del servicio en Render |
| `SUPABASE_URL` | Render | Panel Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Render | Panel Supabase → Project Settings → API (secret) |
| `RESEND_API_KEY` | Render | Panel Resend → API Keys |
| `JWT_SECRET` | Render | Generado localmente (`openssl rand -hex 32`) |
| `FRONTEND_URL` | Render | URL del deploy en Vercel |
| `MP_ACCESS_TOKEN` | Render | Panel Mercado Pago → Credenciales de producción |
| `NODE_ENV` | Render | `production` |
