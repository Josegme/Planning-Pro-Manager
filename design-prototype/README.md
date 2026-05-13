# Planning Pro — Prototipo de diseño

Prototipo clickable completo de los **11 módulos** de Planning Pro, hecho con React + Tailwind + estilo shadcn/ui (el mismo stack del proyecto).

## Cómo abrirlo

### Versión simple (un solo archivo)
Abrí `Planning Pro.standalone.html` en cualquier navegador. Funciona offline.

### Versión modular (para inspeccionar el código)
Servir la carpeta con cualquier servidor estático:

```bash
# Desde la raíz del repo
npx serve design-prototype
# o
python3 -m http.server -d design-prototype
```

Y abrir `http://localhost:3000/Planning Pro.html`.

## Estructura

```
design-prototype/
├── Planning Pro.html              # Entry point modular
├── Planning Pro.standalone.html   # Versión single-file (offline)
├── app.jsx                        # App shell + router de módulos
├── lib-icons.jsx                  # Iconos lucide-style inline
├── lib-ui.jsx                     # Primitivos shadcn (Button, Card, Badge...)
├── lib-data.jsx                   # Mock: Boda Pérez-García, 180 invitados
├── tweaks-panel.jsx               # Panel de tweaks
├── mod-eventos.jsx                # M1 — Eventos
├── mod-invitados.jsx              # M2 — Invitados
├── mod-rsvp.jsx                   # M3 — RSVP y QR
├── mod-mesas.jsx                  # M4 — Mesas (drag & drop)
├── mod-plano.jsx                  # M5 — Plano del salón (SVG canvas)
├── mod-timeline.jsx               # M6 — Timeline
├── mod-servicios.jsx              # M7 — Servicios y proveedores
├── mod-checklist.jsx              # M8 — Checklist
├── mod-comanda.jsx                # M9 — Comanda del chef
├── mod-checkin.jsx                # M10 — Check-in (recepción)
└── mod-reportes.jsx               # M11 — Reportes y analytics
```

Cada `mod-*.jsx` mapea 1:1 a un archivo en `apps/web/src/presentation/pages/*` de tu codebase.

## Cómo subirlo al repo

```bash
# Desde la raíz de Planning-Pro-Manager
mkdir -p design-prototype
cp -r /ruta/a/este/folder/* design-prototype/

git add design-prototype
git commit -m "design: prototipo clickable de los 11 módulos"
git push
```

O simplemente arrastrá la carpeta a GitHub desde la web (Add file → Upload files).

## Tweaks disponibles

Botón **Tweaks** abajo a la derecha:

- **Simular evento en vivo** — activa check-ins en curso, etapas en progreso, alertas en checklist, comanda en preparación, actividad en recepción. Útil para ver M10 y M5 con datos "vivos".
- **Navegación rápida** — saltar a cualquier módulo por su ID (M2, M5...).

## Mock data

Evento principal: **Boda Pérez-García** — 180 invitados con distribución realista de estados (56% confirmado, 12% visto, 18% invitado, 5% pendiente, 6% rechazo). 22 mesas, 22 etapas de timeline, 7 servicios, ~15% de invitados con restricciones dietarias para que la Comanda muestre cálculos reales.

## Stack del prototipo

| Capa | Tecnología |
|------|-----------|
| UI | React 18 (umd) + Babel inline |
| Estilos | Tailwind CSS (CDN) con tokens shadcn |
| Tipografía | Geist (Google Fonts) |
| Iconos | SVG inline lucide-style |

> Las dependencias se cargan desde CDN. Para producción, migrar al setup Vite del repo principal (`apps/web`).

## Mapeo a Master Doc

Cada componente del prototipo corresponde a una funcionalidad del checklist en `PLANNING_PRO_MASTER_DOC.md`:

| Módulo | Estado del doc | Cubierto en prototipo |
|--------|---------------|----------------------|
| M0 Plataforma SaaS | ✅ | Auth, roles (visualmente en sidebar) |
| M1 Eventos | ✅ | Dashboard multi-evento + overview |
| M2 Invitados | ✅ | Lista, filtros, detalle, QR |
| M3 RSVP y QR | ✅ | Configurador + preview público |
| M4 Mesas | ⬜ | Drag & drop, capacidad, menú especial |
| M5 Plano del salón | ⬜ | Canvas SVG con estados en vivo |
| M6 Timeline | ⬜ | Etapas, semáforo, progreso |
| M7 Servicios | ⬜ | Financiero + CRM proveedores |
| M8 Checklist | ⬜ | Biblioteca + estados del día |
| M9 Comanda del chef | ⬜ | Auto-cálculo por restricción + mise en place |
| M10 Check-in | ⬜ | Scanner + búsqueda + offline |
| M11 Reportes | ⬜ | Curva check-in + reportes exportables |

---

*Generado como referencia visual para la implementación. Las decisiones de UX están alineadas con `CLAUDE.md` y el Master Doc.*
