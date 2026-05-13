# Planning Pro — Checklist de funcionalidades y casos de uso

> Fuente de verdad detallada: [`PLANNING_PRO_MASTER_DOC.md`](./PLANNING_PRO_MASTER_DOC.md)  
> Uso: estudio del alcance, priorización, MVP y oportunidades de mejora.

**Total ítems:** 86 (12 módulos M0–M11)

---

## Leyenda de origen

| Etiqueta | Significado |
|----------|-------------|
| `[DESK]` | Viene del desktop (dominio validado) |
| `[PRO]` | Rediseñado para SaaS / cloud |
| `[NEW]` | Nuevo en Planning Pro |

---

## M0 · Plataforma SaaS (7)

- [ ] `[NEW]` **Autenticación con magic link / OAuth Google** — Email o Google, sin contraseña por defecto, sesión persistente en PWA (Supabase Auth).
- [ ] `[NEW]` **Multi-tenant por organización** — Aislamiento con Row Level Security; un organizador no ve datos de otro.
- [ ] `[NEW]` **Planes Starter / Pro / Agency** — Starter: 3 eventos activos, 150 invitados/evento; Pro ilimitado; Agency cuenta paraguas con varios organizadores.
- [ ] `[NEW]` **PWA instalable** — Manifest + Service Worker; offline con IndexedDB.
- [ ] `[NEW]` **Roles Organizador / Recepción / Chef** — Vistas y permisos aislados.
- [ ] `[NEW]` **Invitación de staff por email** — Recepción o chef acceden solo a su módulo.
- [ ] `[NEW]` **Offline-first + sync** — Cola en IndexedDB, sincronización al reconectar; conflictos last-write-wins por `updated_at`.

---

## M1 · Gestión de eventos (6)

- [ ] `[DESK]` **Wizard de nuevo evento (3 pasos)** — Datos básicos → mesas (opcional) → resumen.
- [ ] `[DESK]` **Estados Planificación → Activo → Finalizado** — Confirmaciones y avisos (invitados, mesas, fecha).
- [ ] `[DESK]` **Dashboard multi-evento** — Orden por estado y fecha; contador de llegados en activos.
- [ ] `[DESK]` **Tipos de evento** — Social, corporativo, gala, conferencia; activan/desactivan módulos (ej. sin plano de mesas).
- [ ] `[DESK]` **Editar / eliminar evento** — Reglas según estado y datos asociados.
- [ ] `[PRO]` **Templates de evento reutilizables** — Mesas, timeline base, checklist, comanda tipo como punto de partida editable.
- [ ] `[PRO]` **Dashboard en tiempo real** — Contadores y progreso vía WebSocket (Supabase Realtime), sin polling fijo.

---

## M2 · Gestión de invitados (8)

- [ ] `[DESK]` **Importar desde Excel** — .xlsx/.xls, validación, preview, template, duplicados.
- [ ] `[DESK]` **CRUD invitados** — Detalle: QR, mesa, estado, acompañantes, restricciones.
- [ ] `[DESK]` **Búsqueda y filtros** — DNI, nombre, estado, mesa, grupo, restricción; orden y paginación.
- [ ] `[DESK]` **Acompañantes (+N)** — Esperados vs presentes en check-in.
- [ ] `[DESK]` **Exportar a Excel** — Todos los campos operativos.
- [ ] `[NEW]` **Restricciones dietarias múltiples** — Lista predefinida + “otro”; alimenta comanda.
- [ ] `[NEW]` **Estados de invitado** — Pendiente → Invitado → Visto → Confirmado → Check-in → Rechazó; bloqueo por capacidad llena.
- [ ] `[NEW]` **Invitado manual con QR directo** — Excepción para quien no puede RSVP (mayores, último momento).

---

## M3 · RSVP y sistema QR (10)

- [ ] `[DESK]` **QR único por invitado** — Formato con TOKEN irrepetible; en Pro se genera tras confirmar RSVP (no al crear invitado).
- [ ] `[DESK]` **Descarga QR individual (PNG)**.
- [ ] `[DESK]` **Descarga masiva (ZIP)**.
- [ ] `[DESK]` **Regenerar QR** — Invalida el anterior.
- [ ] `[NEW]` **Formulario RSVP configurable** — Campos obligatorios y diseño (foto, mensaje).
- [ ] `[NEW]` **Link público por evento** — `planningpro.app/rsvp/[slug]` hasta capacidad.
- [ ] `[NEW]` **QR al confirmar** — Validación DNI + capacidad → token → envío automático.
- [ ] `[NEW]` **Envío por email y WhatsApp** — Post-confirmación (Resend + API WhatsApp según doc).
- [ ] `[NEW]` **Recordatorios automáticos** — Por estado y proximidad al evento (48h, 24h, 2h, etc.).
- [ ] `[NEW]` **Cierre por capacidad** — Mensaje “evento completo”; el organizador puede ampliar cupos.
- [ ] `[NEW]` **Reenvío de QR** — Invitado (DNI + verificación) u organizador desde panel.

---

## M4 · Gestión de mesas (7)

- [ ] `[DESK]` **CRUD mesas** — Número, capacidad, nombre; creación al ampliar cantidad en evento.
- [ ] `[DESK]` **Drag & drop entre mesas** — Validación de capacidad al soltar.
- [ ] `[DESK]` **Asignación automática por grupos** — Familia, trabajo, VIP, etc.
- [ ] `[DESK]` **Ocupación por colores** — Sin asignar / parcial / confirmada / check-in completo.
- [ ] `[DESK]` **Modo sin mesas** — Conferencias, cocktail; plano puede existir sin personas en mesa.
- [ ] `[NEW]` **Menú diferenciado por mesa completa** — Ej. mesa kosher; reflejo en comanda.
- [ ] `[NEW]` **Mesa visible en check-in** — Pantalla recepción en grande para el invitado.

---

## M5 · Plano visual del salón (6)

- [ ] `[NEW]` **Editor canvas 2D** — Mesas, escenario, pista, entrada, barra/bufet; drag & drop.
- [ ] `[NEW]` **Biblioteca de salones** — Plantillas reutilizables por venue frecuente.
- [ ] `[NEW]` **Estado de mesa en vivo en el plano** — Gráfico tipo torta / colores; Realtime.
- [ ] `[NEW]` **Redimensionar mesas** — Handle; capacidad en proporción al radio.
- [ ] `[NEW]` **Tooltip hover** — Nombre mesa, capacidad, confirmados, check-ins, % ocupación.
- [ ] `[NEW]` **Plano ↔ mesas / invitados** — Estado calculado desde invitados, no duplicado en layout.

---

## M6 · Timeline del evento (6)

- [ ] `[DESK]` **CRUD etapas + reordenar** — Nombre, hora planificada, duración.
- [ ] `[DESK]` **Completar etapa + hora real** — Desvío vs planificado.
- [ ] `[DESK]` **Semáforo automático** — Verde / amarillo / rojo por desvío o manual.
- [ ] `[DESK]` **Barra de progreso global** — Etapas hechas vs pendientes.
- [ ] `[NEW]` **Push PWA** — Avisos 15 y 5 min antes de cada etapa.
- [ ] `[NEW]` **Timeline ↔ comanda** — Plato retrasado → aviso al timeline / organizador.

---

## M7 · Servicios y proveedores (7)

- [ ] `[DESK]` **CRUD servicios por evento**.
- [ ] `[DESK]` **Finanzas** — Costo × cantidad, pagos parciales, monedas ARS/USD/EUR.
- [ ] `[DESK]` **Estados** — Cotizado → Contratado → Pagado → Cancelado.
- [ ] `[DESK]` **Estadísticas y export** — Excel / PDF según doc.
- [ ] `[DESK]` **Import/export planilla de servicios**.
- [ ] `[PRO]` **Proveedores a nivel organización** — Reutilización entre eventos.
- [ ] `[NEW]` **Adjuntos en Storage** — Contratos, comprobantes.

---

## M8 · Checklist de servicios (5)

- [ ] `[NEW]` **Biblioteca maestra por categorías** — DJ, catering, seguridad, etc.
- [ ] `[NEW]` **Ítems obligatorios** — Avisos al activar evento si faltan.
- [ ] `[NEW]` **Copia al crear evento** — Destildar lo que no aplica.
- [ ] `[NEW]` **Checklist día D** — Pendiente / confirmado / problema + nota.
- [ ] `[NEW]` **Enlace opcional a servicios y costos** — Checklist → módulo financiero.

---

## M9 · Comanda del chef (7)

- [ ] `[NEW]` **Menú por cursos** — Orden, hora de salida, notas cocina.
- [ ] `[NEW]` **Cantidades por restricción** — Cruce invitados confirmados × dietas (+ mesas especiales).
- [ ] `[NEW]` **Mesas con menú especial** — Identificadas en comanda.
- [ ] `[NEW]` **Mise en place automático** — Vajilla/cristalería + repuesto sugerido (~+10%).
- [ ] `[NEW]` **Rol Chef** — Estados curso: preparación → listo → servido.
- [ ] `[NEW]` **Visibilidad tiempo real para organizador** — Alertas de retraso.
- [ ] `[NEW]` **Export PDF** — Impresión cocina.

---

## M10 · Check-in en tiempo real (8)

- [ ] `[DESK]` **Scan QR + deduplicación** — Cooldown / flag para no procesar dos veces seguidas.
- [ ] `[DESK]` **Búsqueda manual** — Nombre o DNI.
- [ ] `[DESK]` **Acompañantes presentes** — Puede ser menor a esperados.
- [ ] `[DESK]` **Offline** — Caché + cola + indicador de pendientes de sync.
- [ ] `[PRO]` **Multi-dispositivo simultáneo** — Misma verdad vía Realtime (doc: hasta ~10 entradas).
- [ ] `[PRO]` **PWA recepción** — Link de invitación, sin instalar store.
- [ ] `[NEW]` **Mesa grande al escanear** — Nombre + mesa.
- [ ] `[NEW]` **QR ya usado** — Mensaje + hora del primer check-in.

---

## M11 · Reportes y analytics (9)

- [ ] `[DESK]` **Export invitados Excel** — (También cubierto en flujo M2; figura en resumen heredado.)
- [ ] `[PRO]` **PDF asistencia** — Confirmado vs presente, horas, acompañantes.
- [ ] `[PRO]` **PDF financiero** — Servicios, pagos, por proveedor.
- [ ] `[PRO]` **PDF mesas** — Ocupación real vs capacidad, % asistencia, restricciones.
- [ ] `[PRO]` **PDF timeline** — Plan vs real, desvíos.
- [ ] `[PRO]` **PDF comanda** — Cantidades finales según check-ins reales.
- [ ] `[NEW]` **Reporte ejecutivo al cerrar** — PDF resumen + email automático.
- [ ] `[NEW]` **Curva de check-in** — Llegadas por franja (ej. 15 min).
- [ ] `[NEW]` **No-show y histórico** — Por tipo de evento en la organización.

---

## Resumen por módulo (conteo)

| Módulo | DESK | PRO | NEW | Total |
|--------|:----:|:---:|:---:|:-----:|
| M0 Plataforma SaaS | 0 | 0 | 7 | **7** |
| M1 Eventos | 4 | 2 | 0 | **6** |
| M2 Invitados | 5 | 0 | 3 | **8** |
| M3 RSVP y QR | 3 | 0 | 7 | **10** |
| M4 Mesas | 5 | 0 | 2 | **7** |
| M5 Plano salón | 0 | 0 | 6 | **6** |
| M6 Timeline | 4 | 0 | 2 | **6** |
| M7 Servicios | 5 | 1 | 1 | **7** |
| M8 Checklist | 0 | 0 | 5 | **5** |
| M9 Comanda chef | 0 | 0 | 7 | **7** |
| M10 Check-in | 4 | 2 | 2 | **8** |
| M11 Reportes | 1 | 5 | 3 | **9** |
| **TOTAL** | **31** | **10** | **45** | **86** |

---

## Casos de uso agrupados (para evaluar mejoras)

| # | Caso de uso | Módulos |
|---|-------------|---------|
| 1 | Onboarding organizador y facturación por plan | M0 |
| 2 | Planificar y activar un evento | M0, M1 |
| 3 | Construir y mantener lista de invitados | M2 |
| 4 | Autoregistro de invitados y entrega de QR | M3 |
| 5 | Asignar personas a mesas y reglas de menú por mesa | M4 |
| 6 | Diseñar salón y monitorear estado visual | M5 |
| 7 | Ejecutar cronograma del día y coordinar avisos | M6 |
| 8 | Controlar costos, proveedores y documentación | M7 |
| 9 | Verificar que contrataciones críticas estén “presentes” | M8 |
| 10 | Operar cocina alineada con invitados y tiempos | M9 |
| 11 | Entrada multi-punto, con posible fallo de red | M10 |
| 12 | Cierre, entregables al cliente y aprendizaje | M11 |

---

## Notas para tu evaluación

- **Duplicidad lógica:** export Excel de invitados aparece en M2 y M11; al priorizar MVP conviene unificar criterio de “dónde vive” la feature en producto.
- **Dependencias críticas:** M3 y M10 encajan con M2/M4; M5 asume M4; M9 conecta M2, M4 y M6 según doc.
- **Mejora continua:** usar esta lista para marcar `MVP` / `v2` / `descartar` / `rediseñar` sin borrar el ítem hasta tener decisión documentada.

---

*Extraído y condensado desde Planning Pro Master Doc (abril 2026).*
