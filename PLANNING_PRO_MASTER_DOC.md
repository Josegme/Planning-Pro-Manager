# Planning Pro — Documentación Maestra del Producto
> Versión 1.0 · Abril 2026  
> Estado: Definición de producto completada · Listo para desarrollo

---

## Índice

1. [Visión del Producto](#1-visión-del-producto)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Roles del Sistema](#3-roles-del-sistema)
4. [Flujo RSVP y QR](#4-flujo-rsvp-y-qr)
5. [Módulos — Checklist Completo](#5-módulos--checklist-completo)
   - [M0 · Plataforma SaaS](#m0--plataforma-saas)
   - [M1 · Gestión de Eventos](#m1--gestión-de-eventos)
   - [M2 · Gestión de Invitados](#m2--gestión-de-invitados)
   - [M3 · RSVP y Sistema QR](#m3--rsvp-y-sistema-qr)
   - [M4 · Gestión de Mesas](#m4--gestión-de-mesas)
   - [M5 · Plano Visual del Salón](#m5--plano-visual-del-salón)
   - [M6 · Timeline del Evento](#m6--timeline-del-evento)
   - [M7 · Servicios y Proveedores](#m7--servicios-y-proveedores)
   - [M8 · Checklist de Servicios](#m8--checklist-de-servicios)
   - [M9 · Comanda del Chef](#m9--comanda-del-chef)
   - [M10 · Check-in en Tiempo Real](#m10--check-in-en-tiempo-real)
   - [M11 · Reportes y Analytics](#m11--reportes-y-analytics)
6. [Modelo de Datos](#6-modelo-de-datos)
7. [Arquitectura Técnica](#7-arquitectura-técnica)
8. [Resumen de Funcionalidades](#8-resumen-de-funcionalidades)

---

## 1. Visión del Producto

**Planning Pro** es una plataforma SaaS + PWA para organizadores profesionales de eventos. Evoluciona desde Planning Manager (aplicación desktop) hacia un sistema operativo de eventos en tiempo real, accesible desde cualquier dispositivo, con capacidades offline-first y sincronización en la nube.

### Problema que resuelve

Los organizadores de eventos profesionales trabajan con herramientas fragmentadas: listas en Excel, dibujos de salón en papel, comandas del chef por WhatsApp, confirmaciones de invitados por llamada telefónica. Planning Pro centraliza todo el ciclo operativo del evento en una sola plataforma.

### Principios del sistema

- **Offline-first**: funciona sin internet. Sincroniza automáticamente cuando vuelve la conexión.
- **Mobile-first**: diseñado para uso en eventos, desde celular o tablet.
- **Tiempo real**: el estado del evento se actualiza en todos los dispositivos simultáneamente.
- **Multi-tenant**: cada organizador tiene su espacio aislado. Un organizador nunca ve datos de otro.
- **El organizador es el centro**: el software lo usa únicamente el organizador y su equipo. El cliente que contrató el servicio no usa Planning Pro.

### Origen del sistema

Planning Pro es la evolución directa de **Planning Manager Desktop** (Electron + React + SQLite, v0.11.0). El desktop validó el dominio del problema. Planning Pro reescribe ese dominio sobre arquitectura cloud-native, agregando los módulos nuevos surgidos de la validación con organizadores reales.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Frontend | React 18 + TypeScript + Vite | Ecosistema moderno, tipado estricto, build rápido |
| PWA | Vite PWA Plugin + Service Worker | Instalable, offline-first, sin App Store |
| Estilos | Tailwind CSS + shadcn/ui | Utilidades + componentes accesibles |
| Estado global | Zustand | Liviano, sin boilerplate, compatible con offline |
| Backend API | Hono.js + TypeScript | Ultra liviano, edge-compatible, API-first |
| Base de datos | Supabase (PostgreSQL) | Multi-tenant con RLS, Realtime integrado |
| Auth | Supabase Auth | Magic link + OAuth Google, sin contraseñas |
| Tiempo real | Supabase Realtime (WebSocket) | Reemplaza el polling del desktop |
| Storage | Supabase Storage | Contratos, comprobantes, QRs |
| Email | Resend | Transaccional: QRs, invitaciones, recordatorios |
| Deploy frontend | Vercel | Edge network, CI/CD automático |
| Deploy backend | Render | Node.js persistent, cron jobs |
| Dominio | Hostinger | DNS + SSL |
| Offline local | IndexedDB (via idb) | Cache de datos del evento para uso sin internet |

---

## 3. Roles del Sistema

Planning Pro tiene tres roles internos. El cliente que contrató el servicio al organizador **no usa Planning Pro** — es externo al sistema.

### Organizador
Control total del evento. Único usuario con acceso a configuración, datos financieros, lista de invitados, plano del salón, comanda, reportes y todos los módulos. Crea el evento, configura el formulario RSVP, genera el link que entrega a su cliente, gestiona todo el ciclo operativo.

### Recepción
Usuario invitado por el organizador para el día del evento. Acceso exclusivo a la pantalla de check-in: escanear QR, buscar invitado por nombre/DNI, confirmar ingreso con acompañantes. Sin acceso a configuración, datos financieros ni lista completa de invitados.

### Chef
Usuario invitado por el organizador. Acceso exclusivo a la comanda del evento asignado. Puede ver los platos, cantidades y restricciones, y marcar el estado de cada curso (en preparación → listo para salir → servido). Sin acceso a ningún otro módulo.

---

## 4. Flujo RSVP y QR

Este es el flujo central del sistema. Define cómo un invitado pasa de "desconocido" a "confirmado con QR" sin que el organizador tenga que cargar datos manualmente.

```
ORGANIZADOR                    SISTEMA                      INVITADO
     |                            |                              |
     | Crea evento y configura    |                              |
     | formulario RSVP            |                              |
     |--------------------------->|                              |
     |                            |                              |
     | Genera link RSVP           |                              |
     | planningpro.app/rsvp/slug  |                              |
     |<---------------------------|                              |
     |                            |                              |
     | Entrega link a su cliente  |                              |
     | (WhatsApp, email, etc.)    |                              |
     |                            |                              |
     |                            |          Abre el link        |
     |                            |<-----------------------------|
     |                            |                              |
     |                            | Muestra formulario RSVP     |
     |                            |---------------------------->|
     |                            |                              |
     |                            |   Completa: nombre, apellido,|
     |                            |   DNI, email, WhatsApp,      |
     |                            |   acompañantes, restricciones|
     |                            |<-----------------------------|
     |                            |                              |
     |                            | Valida: DNI no duplicado,    |
     |                            | hay capacidad disponible     |
     |                            |                              |
     |                            | Genera QR único:             |
     |                            | EVT-{id}:INV-{id}:TOKEN-{h}  |
     |                            |                              |
     |                            | Envía QR por email/WhatsApp  |
     |                            |---------------------------->|
     |                            |                              |
     | Ve confirmación en panel   |                              |
     | en tiempo real             |                              |
     |<---------------------------|                              |
     |                            |                              |
     |        [DÍA DEL EVENTO]    |                              |
     |                            |                              |
RECEPCIÓN                         |          Muestra QR          |
     |                            |<-----------------------------|
     | Escanea QR                 |                              |
     |--------------------------->|                              |
     |                            | Verifica TOKEN               |
     |                            | Marca QR como usado          |
     |                            | Actualiza estado a check-in  |
     |<---------------------------|                              |
     | Ve: nombre + mesa asignada |                              |
```

### Estados del invitado

| Estado | Descripción | Color en plano |
|--------|-------------|----------------|
| Pendiente | Cargado por el organizador, link no enviado | Gris |
| Invitado | Link RSVP entregado, no abrió el formulario | Gris/violeta |
| Visto | Abrió el formulario pero no confirmó | Ámbar |
| Confirmado | Completó el formulario, tiene QR | Rojo/naranja |
| Check-in | Escaneó QR en la entrada | Azul |
| Rechazó | Hizo clic en "No puedo asistir" | Gris oscuro |

### Seguridad del QR

El QR contiene tres partes: `EVT-{evento_id}:INV-{invitado_id}:TOKEN-{hash}`.

- El TOKEN se genera en el momento de la confirmación y se almacena en base de datos.
- El TOKEN se "quema" al primer uso — si se intenta usar dos veces, el sistema muestra "Ya utilizado" con hora del primer check-in.
- El link RSVP solo puede completarse una vez. Si ya fue usado, muestra "Invitación ya utilizada".
- El organizador puede invalidar cualquier QR y regenerarlo manualmente.

---

## 5. Módulos — Checklist Completo

### Leyenda de origen

- `[DESK]` Viene del desktop (funcionalidad probada y validada)
- `[PRO]` Rediseñado para SaaS/cloud (mismo concepto, nueva arquitectura)
- `[NEW]` Nuevo — no existía en el desktop

---

### M0 · Plataforma SaaS

> Infraestructura base. Todo nuevo, no existía en el desktop.

- [ ] `[NEW]` **Autenticación con magic link / OAuth Google** — El organizador accede con email o Google. Sin contraseña por defecto. Sesión persistente en PWA. Implementado con Supabase Auth.
- [ ] `[NEW]` **Multi-tenant con aislamiento por organización** — Cada cuenta de organizador es un tenant independiente. Row Level Security en Supabase garantiza que un organizador nunca vea datos de otro.
- [ ] `[NEW]` **Planes de suscripción: Starter / Pro / Agency** — Starter: hasta 3 eventos activos, 150 invitados/evento. Pro: eventos ilimitados, todas las funciones. Agency: múltiples organizadores bajo una cuenta paraguas.
- [ ] `[NEW]` **PWA instalable en celular y desktop** — Se instala desde el navegador como app nativa. Funciona offline con IndexedDB. Sin App Store necesario. Manifest + Service Worker.
- [ ] `[NEW]` **Roles: Organizador / Recepción / Chef** — Organizador: control total. Recepción: solo check-in el día del evento. Chef: solo comanda. Cada rol tiene su vista y permisos aislados.
- [ ] `[NEW]` **Invitación de usuarios al evento por email** — El organizador invita a su personal de recepción o al chef con un link. Ellos acceden solo al módulo que les corresponde.
- [ ] `[NEW]` **Offline-first con sincronización automática** — Toda la app funciona sin internet. Los cambios se encolan en IndexedDB y se sincronizan con Supabase cuando vuelve la conexión. Resolución de conflictos por último timestamp.

---

### M1 · Gestión de Eventos

> Base del sistema. Proviene del desktop con mejoras cloud.

- [ ] `[DESK]` **Crear evento con wizard guiado (3 pasos)** — Paso 1: datos básicos (nombre, tipo, fecha, hora, lugar, descripción). Paso 2: configuración de mesas (con/sin mesas, cantidad, capacidad). Paso 3: resumen y confirmación.
- [ ] `[DESK]` **Estados del evento: Planificación → Activo → Finalizado** — Modal de confirmación al activar. Avisos si faltan invitados, mesas incompletas o la fecha no coincide con la programada.
- [ ] `[DESK]` **Dashboard multi-evento del organizador** — Vista de todos los eventos ordenados: Activos primero, luego Planificación, luego Finalizados. Dentro de cada grupo, por fecha más próxima. Contador de invitados llegados por evento activo.
- [ ] `[DESK]` **Tipos de evento** — Social, corporativo, gala, conferencia. Cada tipo activa o desactiva módulos. Los eventos sin mesas (conferencias, standings) no muestran el módulo de plano de salón.
- [ ] `[DESK]` **Editar y eliminar evento** — Edición habilitada mientras no está finalizado. Eliminación solo si no tiene datos asociados, con modal de confirmación.
- [ ] `[PRO]` **Templates de evento reutilizables** — El organizador guarda la configuración de un evento exitoso como template: mesas, timeline base, checklist de servicios, comanda tipo. Al crear un evento nuevo, puede elegir un template como punto de partida. Es opcional, no obligatorio. Los eventos no son todos iguales — el template es un punto de partida editable.
- [ ] `[PRO]` **Dashboard en tiempo real con WebSocket** — Los contadores de asistencia, estado de mesas y progreso del timeline se actualizan solos sin recargar. En desktop era polling cada 10 segundos. En Pro es push via Supabase Realtime.

---

### M2 · Gestión de Invitados

> Núcleo operativo. La mayoría viene del desktop con extensiones nuevas.

- [ ] `[DESK]` **Importar invitados desde Excel (.xlsx/.xls)** — Parser con validación automática de DNI, email y teléfono. Vista previa antes de importar. Template descargable con estructura fija. Detección y manejo de duplicados.
- [ ] `[DESK]` **CRUD completo de invitados** — Crear manualmente, editar, eliminar con confirmación. Ver detalle completo: QR, mesa asignada, estado, acompañantes, restricciones de menú.
- [ ] `[DESK]` **Búsqueda y filtros avanzados** — Búsqueda en tiempo real por DNI, nombre, apellido. Filtros por estado (confirmado, pendiente, check-in), por mesa asignada, por grupo, por restricción de menú. Ordenamiento por columnas. Paginación en listas grandes.
- [ ] `[DESK]` **Acompañantes con indicador (+N)** — Cada invitado puede tener N acompañantes esperados. Se muestra junto al nombre en la vista de mesas como "(+2)". Al hacer check-in se registra cuántos llegaron efectivamente.
- [ ] `[DESK]` **Exportar invitados a Excel** — Export completo con todos los campos: nombre, apellido, DNI, email, WhatsApp, mesa asignada, estado, hora de check-in, acompañantes confirmados/presentes, restricciones de menú.
- [ ] `[NEW]` **Campo restricción dietaria múltiple por invitado** — Array de restricciones seleccionables: vegetariano, vegano, sin TACC (celíaco), sin lactosa, kosher, halal, sin mariscos, sin frutos secos, otro (con campo libre). Este campo alimenta automáticamente la comanda del chef.
- [ ] `[NEW]` **6 estados de invitado con ciclo de vida completo** — Pendiente → Invitado → Visto → Confirmado → Check-in → Rechazó. También: Bloqueado (evento lleno). Cada estado tiene color y comportamiento diferente en el plano del salón.
- [ ] `[NEW]` **Agregar invitado manual con QR directo** — Para invitados que no pueden completar el formulario RSVP solos (personas mayores, invitados de último momento). El organizador carga sus datos y el sistema genera el QR directamente, saltando el flujo de confirmación.

---

### M3 · RSVP y Sistema QR

> El flujo de auto-registro. Parcialmente en desktop (solo QR), completamente nuevo en Pro (RSVP completo).

- [ ] `[DESK]` **Generación automática de QR único por invitado** — Formato: `EVT-{id}:INV-{id}:TOKEN-{hash}`. El token es irrepetible y se quema al primer uso. En Pro se genera DESPUÉS de que el invitado confirma vía formulario RSVP, no antes.
- [ ] `[DESK]` **Descarga QR individual (PNG)** — Botón en el modal de cada invitado para descargar su QR como imagen PNG.
- [ ] `[DESK]` **Descarga QR masiva (ZIP)** — Botón en la página de invitados para descargar todos los QRs del evento en un único archivo ZIP. Para impresión o distribución masiva.
- [ ] `[DESK]` **Regenerar QR individual** — Si el invitado perdió su QR o se lo reenviaron a otra persona, el organizador lo regenera. El QR anterior queda invalidado automáticamente.
- [ ] `[NEW]` **Formulario RSVP configurable por evento** — El organizador define qué campos son obligatorios: nombre, apellido, DNI, email, WhatsApp, cantidad de acompañantes, restricciones de menú. También configura el diseño visual: foto del evento, mensaje de bienvenida personalizado.
- [ ] `[NEW]` **Link RSVP público único por evento** — URL única: `planningpro.app/rsvp/[evento-slug]`. El organizador lo entrega a su cliente. Cualquier persona que abra el link puede completar el formulario y quedar registrada como invitada, hasta el límite de capacidad configurado.
- [ ] `[NEW]` **QR generado automáticamente al confirmar** — Invitado completa formulario → sistema valida (DNI no duplicado, hay capacidad) → genera QR único con TOKEN → envía QR por email y/o WhatsApp automáticamente. Sin intervención del organizador.
- [ ] `[NEW]` **Envío de QR por email y WhatsApp** — Envío automático post-confirmación via Resend (email) o integración WhatsApp Business API. El mensaje incluye el QR adjunto como imagen, fecha, hora, lugar e instrucciones de uso.
- [ ] `[NEW]` **Recordatorios automáticos por estado** — "Visto" sin confirmar: recordatorio a las 48hs. "Confirmado": recordatorio 24hs antes con QR adjunto. "Confirmado": recordatorio 2hs antes ("¡Hoy es el gran día!"). Triggers automáticos basados en la fecha del evento.
- [ ] `[NEW]` **Cierre automático del formulario al llegar a capacidad** — Cuando se alcanzan los cupos, el formulario muestra "Evento completo" y deja de aceptar nuevos registros. El organizador puede ampliar la capacidad manualmente desde el panel para hacer excepciones.
- [ ] `[NEW]` **Reenvío de QR a pedido** — Si el invitado no encuentra su QR, puede volver al link RSVP y pedir reenvío verificando su DNI + email/WhatsApp. El organizador también puede reenviarlo manualmente desde el panel.

---

### M4 · Gestión de Mesas

> Módulo consolidado. Base del desktop con extensiones operacionales.

- [ ] `[DESK]` **CRUD de mesas con capacidad configurable** — Crear mesa con número, capacidad y nombre opcional. Editar, eliminar (solo si está vacía). Creación automática si se aumenta la cantidad en la configuración del evento.
- [ ] `[DESK]` **Drag & drop de invitados entre mesas** — Arrastrar invitados desde la lista sin asignar a cualquier mesa. También mover entre mesas. Validación de capacidad máxima al soltar.
- [ ] `[DESK]` **Asignación automática por grupos** — Algoritmo que mantiene invitados del mismo grupo (familia, amigos, trabajo, VIP) juntos dentro de la misma mesa. El organizador puede revisar y ajustar manualmente.
- [ ] `[DESK]` **Visualización de ocupación con estados de color** — Sin invitados: gris. Parcialmente ocupada: ámbar/amarillo. Completamente confirmada: rojo/naranja. Check-in completado: azul.
- [ ] `[DESK]` **Modo sin mesas para eventos informales** — El organizador puede desactivar el módulo de mesas para eventos tipo conferencia, cocktail, standing. El plano del salón sigue disponible pero sin asignación de personas a mesas.
- [ ] `[NEW]` **Restricciones de menú por mesa completa** — Una mesa puede tener un menú diferenciado completo: mesa kosher, mesa vegetariana VIP, etc. Esto genera instrucciones específicas en la comanda del chef identificadas por número de mesa.
- [ ] `[NEW]` **Mesa asignada visible al hacer check-in** — Al escanear el QR del invitado, la pantalla de recepción muestra en grande el número y nombre de la mesa asignada. El invitado sabe a dónde ir sin que nadie lo lleve.

---

### M5 · Plano Visual del Salón

> 100% nuevo. Reemplaza el dibujo en papel que los organizadores hacen antes de cada evento.

- [ ] `[NEW]` **Editor visual de planta de salón con drag & drop** — Canvas interactivo (HTML Canvas 2D) donde el organizador arrastra y suelta elementos. Elementos disponibles: mesas redondas, mesas rectangulares, escenario/DJ, pista de baile, entrada, barra/bufet. Reemplaza completamente el dibujo en papel.
- [ ] `[NEW]` **Biblioteca de salones guardados** — El organizador guarda la forma y elementos estructurales de cada salón que usa frecuentemente. Al crear un evento, elige el salón de la biblioteca y todos los elementos estructurales están pre-posicionados. Solo debe mover las mesas según la disposición del evento particular.
- [ ] `[NEW]` **Mesas con estado visual en tiempo real** — Cada mesa circular en el plano muestra un gráfico de torta interno que refleja su estado: gris=sin asignar, ámbar=parcialmente confirmada, rojo=completamente confirmada, azul=check-in completado. Se actualiza en tiempo real durante el evento vía WebSocket.
- [ ] `[NEW]` **Redimensionar mesas por capacidad** — El tamaño visual de la mesa se ajusta arrastrando un handle de redimensionado. La capacidad se recalcula automáticamente en proporción al radio de la mesa redonda.
- [ ] `[NEW]` **Tooltip de detalle al hover** — Al pasar el cursor sobre cualquier mesa: nombre, capacidad total, invitados confirmados, check-ins realizados y porcentaje de ocupación.
- [ ] `[NEW]` **Vinculación plano ↔ módulo de mesas** — Las mesas del plano visual están enlazadas directamente a las mesas del módulo de invitados. Cuando un invitado hace check-in, el color de su mesa en el plano cambia automáticamente. No hay datos duplicados.

> **Nota técnica:** El estado de las mesas (confirmados, check-in) no se almacena en el plano — se calcula en tiempo real desde el módulo de invitados. El plano solo almacena la posición `{x, y}` de cada elemento en coordenadas relativas (0-1) para que funcione en cualquier tamaño de pantalla.

---

### M6 · Timeline del Evento

> Módulo consolidado del desktop con extensiones de tiempo real.

- [ ] `[DESK]` **CRUD de etapas con drag & drop para reordenar** — Crear etapa: nombre, hora planificada, duración estimada. Reordenar arrastrando. Editar descripción y tiempos. Eliminar con confirmación.
- [ ] `[DESK]` **Marcar etapa completada con registro de hora real** — Al completar una etapa se registra la hora real de inicio y fin. Se calcula automáticamente el desvío en minutos respecto a lo planificado.
- [ ] `[DESK]` **Semáforo automático de estado** — Verde: a tiempo (desvío < 5 min). Amarillo: retraso leve (5-15 min) o marcado manualmente. Rojo: retraso significativo (> 15 min). Estado calculado automáticamente.
- [ ] `[DESK]` **Barra de progreso del evento** — Visualización del avance: etapas completadas vs pendientes. Porcentaje de progreso global del evento en tiempo real.
- [ ] `[NEW]` **Notificaciones push PWA por etapa próxima** — La PWA envía notificación push 15 y 5 minutos antes de cada etapa. "En 10 minutos: Servicio del plato principal". Funciona aunque la app esté minimizada o el celular en el bolsillo.
- [ ] `[NEW]` **Vinculación timeline ↔ comanda del chef** — Cada etapa de servicio gastronómico en el timeline puede vincularse a un plato de la comanda. Si el chef marca un plato como retrasado, el timeline recibe un aviso automático para que el organizador ajuste el programa.

---

### M7 · Servicios y Proveedores

> Módulo financiero del desktop con evolución hacia CRM de proveedores.

- [ ] `[DESK]` **CRUD de servicios por evento** — Crear servicio: nombre, descripción, proveedor vinculado. Editar y eliminar. Cada servicio pertenece a un evento específico.
- [ ] `[DESK]` **Control financiero completo** — Costo unitario × cantidad = total automático. Registro de pagos parciales con fecha. Porcentaje pagado calculado automáticamente. Multi-moneda: ARS, USD, EUR.
- [ ] `[DESK]` **Estados de servicio** — Cotizado → Contratado → Pagado → Cancelado. Vista de estado con color en la lista de servicios.
- [ ] `[DESK]` **Estadísticas financieras del evento** — Total de costos del evento, total pagado, total pendiente, resumen por proveedor. Exportar planilla a Excel e imprimir/guardar como PDF.
- [ ] `[DESK]` **Import/export de planilla de servicios** — Importar desde Excel con estructura validada y template descargable. Exportar a Excel. Imprimir o guardar como PDF directamente desde la app.
- [ ] `[PRO]` **CRM de proveedores reutilizable entre eventos** — Los proveedores pertenecen a la organización, no al evento individual. Una vez cargado "Sonido Total — DJ Ramírez", está disponible en todos los eventos futuros sin necesidad de recargar datos.
- [ ] `[NEW]` **Adjuntar contratos y comprobantes de pago** — Por cada servicio se pueden adjuntar archivos: contrato firmado (PDF), comprobante de transferencia (imagen o PDF), presupuesto original. Almacenados en Supabase Storage, accesibles desde el panel.

---

### M8 · Checklist de Servicios del Evento

> 100% nuevo. Reemplaza la lista mental o en papel del organizador sobre qué debe tener contratado.

- [ ] `[NEW]` **Biblioteca maestra de servicios del organizador** — El organizador configura una sola vez todos los servicios que usa habitualmente en sus eventos: DJ, pantalla LED, decoración floral, catering, barra de bebidas, seguridad, photobooth, iluminación, carpas, etc. Organizados por categorías (Entretenimiento, Gastronomía, Infraestructura, Técnica, etc.).
- [ ] `[NEW]` **Marcado de ítems como requeridos** — El organizador puede marcar ciertos servicios como obligatorios (ej: catering, seguridad). Si al activar el evento estos ítems no están tildados, el sistema avisa con el mismo mecanismo que avisa de mesas incompletas.
- [ ] `[NEW]` **Aplicación de biblioteca al crear un evento nuevo** — Al crear un evento, la biblioteca completa se copia como punto de partida. El organizador destilda los servicios que NO aplican a este evento particular. En 2 minutos tiene el checklist listo sin empezar desde cero.
- [ ] `[NEW]` **Checklist operacional el día del evento** — Los ítems tildados sirven como lista de verificación en tiempo real el día del evento. "¿Llegó el DJ? ✓ ¿Armaron la pantalla? ✓ ¿Está el servicio de seguridad? ✓". Cada ítem tiene estados: pendiente / confirmado / problema (con campo de nota).
- [ ] `[NEW]` **Vínculo checklist → módulo de servicios y finanzas** — Un ítem tildado en el checklist puede vincularse al proveedor correspondiente y al costo. Al hacerlo, se convierte en un servicio del evento y alimenta automáticamente el control financiero. La vinculación es opcional — no todos los ítems necesitan costo registrado.

---

### M9 · Comanda del Chef

> 100% nuevo. Digitaliza la hoja de cocina y la conecta directamente con la lista de invitados.

- [ ] `[NEW]` **Definición del menú por cursos** — El organizador carga los platos del menú en orden de servicio: entrada fría, entrada caliente, plato principal, guarnición, postre, tabla de quesos, mesa dulce, otros. Cada curso tiene nombre, descripción, hora de salida planificada y notas para cocina.
- [ ] `[NEW]` **Generación automática de cantidades por restricción dietaria** — El sistema cruza el total de invitados confirmados con las restricciones dietarias registradas en cada invitado y genera las cantidades exactas por plato y por variante. Ejemplo: 210 porciones estándar + 18 vegetarianas + 12 sin TACC + 10 kosher (mesa 7 completa). Sin cálculo manual por parte del organizador.
- [ ] `[NEW]` **Identificación de mesas con menú especial** — Si una mesa completa tiene un menú diferenciado (kosher, vegetariana VIP), aparece en la comanda identificada por número de mesa, con la instrucción de preparación separada del flujo principal.
- [ ] `[NEW]` **Mise en place automático (vajilla y cristalería)** — Basado en el menú cargado y la cantidad de invitados, el sistema genera la lista completa de vajilla y cristalería necesaria: copas de vino, copas de champagne para el brindis, vasos, platos de entrada, platos principales, cuchillos de carne, cucharas de postre, etc. Con cantidades exactas y repuesto sugerido (+10%).
- [ ] `[NEW]` **Rol Chef con acceso exclusivo a la comanda** — El chef accede con su usuario (invitado por el organizador) y ve únicamente la comanda del evento asignado. Puede marcar el estado de cada curso: en preparación → listo para salir → servido.
- [ ] `[NEW]` **Estado de cocina visible en dashboard del organizador en tiempo real** — El organizador ve en su dashboard si el plato principal ya está listo o se está retrasando. Si el chef marca un retraso, el organizador recibe una alerta y puede ajustar el timeline del evento en consecuencia.
- [ ] `[NEW]` **Export de comanda a PDF** — La comanda completa se puede exportar como PDF para impresión física en cocina. Incluye: todos los cursos con horarios, cantidades por variante, restricciones por mesa, mise en place.

---

### M10 · Check-in en Tiempo Real

> Base sólida del desktop, rediseñado para múltiples dispositivos simultáneos en Pro.

- [ ] `[DESK]` **Check-in por escaneo QR con cámara del dispositivo** — La cámara del celular o tablet escanea el QR del invitado. Sistema de deduplicación: no procesa el mismo QR dos veces aunque la cámara lo detecte repetidamente (cooldown + flag de procesamiento).
- [ ] `[DESK]` **Búsqueda manual por nombre o DNI** — Si el invitado no tiene QR disponible o no lo encuentra, recepción puede buscarlo por nombre completo o número de DNI y hacer el check-in manualmente.
- [ ] `[DESK]` **Registro de acompañantes presentes al hacer check-in** — Al confirmar el check-in, recepción indica cuántos acompañantes llegaron efectivamente. Puede ser menor a los acompañantes esperados — el sistema registra ambos valores.
- [ ] `[DESK]` **Caché offline con cola de check-ins pendientes** — Si se pierde la conexión durante el evento, el dispositivo de recepción sigue funcionando con la última lista cacheada en IndexedDB. Los check-ins se encolan localmente y se sincronizan automáticamente al reconectar. Indicador visible de "X check-ins pendientes de sincronizar".
- [ ] `[PRO]` **Múltiples puntos de check-in simultáneos sin conflicto** — En desktop era 1 tablet por red LAN. En Pro, N dispositivos en cualquier red (WiFi del salón, datos móviles) se conectan al mismo evento. Todos ven el mismo estado en tiempo real via WebSocket. Hasta 10 entradas simultáneas sin conflicto de datos.
- [ ] `[PRO]` **Pantalla de recepción mobile-first como PWA** — En desktop era la misma app Electron en otra PC. En Pro es la PWA desde cualquier celular, sin instalar nada. El rol de recepción se activa con el link de invitación que genera el organizador.
- [ ] `[NEW]` **Mesa asignada visible inmediatamente al escanear** — Tras escanear el QR, la pantalla muestra en texto grande el nombre del invitado y su número y nombre de mesa asignada. El invitado sabe a dónde ir sin que nadie lo acompañe.
- [ ] `[NEW]` **Detección de QR ya utilizado** — Si el mismo QR se intenta usar por segunda vez, el sistema muestra "QR ya utilizado" junto con la hora del primer check-in. Previene que se preste el QR a otra persona.

---

### M11 · Reportes y Analytics

> Pendiente crítico en el desktop (0%). Se implementa completamente en Pro.

- [ ] `[DESK]` **Exportar invitados a Excel** — Ya implementado en desktop. Lista completa con todos los campos del invitado.
- [ ] `[PRO]` **Reporte PDF de asistencia** — Lista completa de todos los invitados con estado final: confirmado vs presente, hora de llegada, acompañantes confirmados vs presentes. Ordenable por mesa, por hora, por apellido.
- [ ] `[PRO]` **Reporte PDF financiero** — Todos los servicios del evento con costos, pagos realizados y pendientes. Resumen consolidado por proveedor. Total del evento, total pagado, deuda pendiente.
- [ ] `[PRO]` **Reporte PDF de mesas** — Distribución final de invitados por mesa: ocupación real vs capacidad, porcentaje de asistencia por mesa, restricciones de menú por mesa.
- [ ] `[PRO]` **Reporte PDF de timeline** — Etapas planificadas vs tiempos reales. Desvíos en minutos por etapa. Desvío acumulado. Para análisis post-evento y mejora continua.
- [ ] `[PRO]` **Reporte PDF de comanda** — La comanda del chef exportada con cantidades finales reales (basadas en check-ins efectivos, no en confirmados). Útil para reconciliación con el proveedor de catering.
- [ ] `[NEW]` **Reporte ejecutivo automático al cerrar el evento** — Al marcar el evento como Finalizado, el sistema genera automáticamente un PDF de resumen ejecutivo: asistencia total, porcentaje de no-show, estado de mesas, desvíos de timeline, resumen financiero. Se envía por email al organizador automáticamente.
- [ ] `[NEW]` **Curva de check-in: asistencia por franja horaria** — Gráfico de línea que muestra cuántas personas llegaron por franja de 15 minutos durante el evento. Permite al organizador entender el patrón de llegada para dimensionar mejor la recepción en futuros eventos similares.
- [ ] `[NEW]` **Tasa de no-show automática** — Calculada al cerrar el evento: (invitados confirmados - invitados presentes) / invitados confirmados. Con histórico comparativo entre todos los eventos del mismo tipo organizados por la misma organización.

---

## 6. Modelo de Datos

### Entidades principales

```
Organization
├── id (uuid)
├── name
├── plan (starter | pro | agency)
├── created_at
└── [RLS: all tables filtered by org_id]

User
├── id (uuid, FK → Supabase Auth)
├── org_id (FK → Organization)
├── role (organizador | recepcion | chef)
└── invited_by (FK → User, nullable)

Venue (salón guardado)
├── id · org_id
├── name · description
├── elements: JSON [{type, x, y, w?, h?, r?, label}]
└── created_at

ServiceTemplate (biblioteca de servicios)
├── id · org_id
├── name · category · description
├── is_required: boolean
└── display_order

Provider (proveedor - nivel organización)
├── id · org_id
├── name · phone · email · address
└── notes

Evento
├── id · org_id
├── name · type · status
├── date · time · venue_name · location
├── capacity · has_tables: boolean
├── venue_id (FK → Venue, nullable)
├── rsvp_slug (único, para URL pública)
├── rsvp_fields: JSON [campos obligatorios del formulario]
└── created_at

EventUser (staff del evento)
├── evento_id · user_id
└── role (recepcion | chef)

Invitado
├── id · evento_id · org_id
├── nombre · apellido · dni · email · whatsapp
├── grupo · acompañantes_esperados · acompañantes_presentes
├── dietary_restrictions: string[] 
├── status (pendiente|invitado|visto|confirmado|checkin|rechazo)
├── rsvp_token (para link RSVP de formulario público)
├── qr_token (para escaneo en check-in, generado al confirmar)
├── qr_used_at · checkin_at
└── mesa_id (FK → Mesa, nullable)

Mesa
├── id · evento_id
├── number · name · capacity
├── menu_especial: string (nullable)
└── position: JSON {x, y} en plano

EventLayout (posición visual de todos los elementos del plano)
├── id · evento_id
└── elements: JSON [{type, x, y, w?, h?, r?, label, mesa_id?}]

TimelineEtapa
├── id · evento_id
├── nombre · hora_planificada · duracion_estimada
├── hora_inicio_real · hora_fin_real
├── status (pendiente|en_curso|completada)
├── display_order
└── menu_course_id (FK → MenuCourse, nullable)

Servicio
├── id · evento_id · org_id
├── nombre · descripcion
├── provider_id (FK → Provider)
├── template_id (FK → ServiceTemplate, nullable)
├── costo_unitario · cantidad · moneda
├── estado (cotizado|contratado|pagado|cancelado)
├── checklist_status (pendiente|confirmado|problema)
└── checklist_note

EventService ← esta es la instancia del checklist
(mismo modelo que Servicio, distinguido por template_id null o no)

MenuCourse (comanda)
├── id · evento_id
├── nombre · tipo (entrada_fria|entrada_caliente|principal|guarnicion|postre|etc)
├── hora_salida · display_order
└── notas_cocina

CourseRequirement (generado automáticamente)
├── id · course_id
├── restriccion (null=estándar|vegetariano|sin_tacc|etc)
├── cantidad
├── mesas_afectadas: string[]
└── notas_especiales

TableSetting (mise en place)
├── id · evento_id
├── item (copa_vino|copa_champagne|plato_entrada|etc)
├── cantidad_total · cantidad_repuesto
└── notas
```

---

## 7. Arquitectura Técnica

### Estructura de carpetas (monorepo)

```
planning-pro/
├── apps/
│   ├── web/                    # Frontend PWA (React + Vite)
│   │   ├── src/
│   │   │   ├── core/
│   │   │   │   ├── domain/     # Entidades y value objects
│   │   │   │   ├── application/# Use cases
│   │   │   │   └── ports/      # Interfaces de repositorios
│   │   │   ├── infrastructure/
│   │   │   │   ├── supabase/   # Implementaciones de repositorios
│   │   │   │   ├── indexeddb/  # Cache offline
│   │   │   │   └── sync/       # Motor de sincronización
│   │   │   └── presentation/
│   │   │       ├── pages/      # Páginas por módulo
│   │   │       ├── components/ # Componentes reutilizables
│   │   │       ├── hooks/      # Custom hooks
│   │   │       └── stores/     # Zustand stores
│   │   └── public/
│   │       ├── manifest.json   # PWA manifest
│   │       └── sw.js           # Service worker
│   │
│   └── api/                    # Backend (Hono.js)
│       └── src/
│           ├── routes/         # Endpoints por módulo
│           ├── middleware/      # Auth, CORS, rate limit
│           ├── services/       # Lógica de negocio del servidor
│           └── jobs/           # Cron jobs (recordatorios, reportes)
│
├── packages/
│   ├── shared-types/           # DTOs y tipos compartidos
│   └── qr-generator/          # Lógica de generación QR
│
└── supabase/
    ├── migrations/             # Migraciones de DB
    ├── functions/              # Edge functions
    └── seed.sql                # Datos iniciales de desarrollo
```

### Decisiones arquitecturales clave

**Por qué Canvas 2D para el plano del salón y no SVG**: Con 15+ mesas y elementos, el SVG con drag & drop se vuelve lento. Canvas 2D renderiza 100 elementos con sus indicadores de estado sin ningún problema de performance, incluso en celulares de gama media.

**Por qué el estado de las mesas no se almacena en el plano**: Las posiciones `{x, y}` se guardan en `EventLayout`. El estado (confirmados, check-ins) se calcula en tiempo real desde el módulo de invitados. Esto evita duplicación de datos y garantiza que el plano siempre refleje la realidad sin sincronización adicional.

**Por qué el QR se genera al confirmar y no al crear el invitado**: En el desktop, el QR se generaba al cargar el invitado (el organizador lo creaba y ya tenía QR). En Pro, el QR es la prueba de confirmación — solo quien completó el formulario y tiene datos verificados recibe su QR. Esto garantiza que todo QR válido corresponde a una persona real con datos completos.

**Por qué el link RSVP es por evento y no por invitado**: Simplifica enormemente la operación. El organizador entrega un solo link a su cliente. El cliente lo distribuye como quiere. El sistema controla la capacidad y la deduplicación por DNI, no por link individual.

---

## 8. Resumen de Funcionalidades

| Módulo | Del desktop | Rediseñados Pro | Nuevos | Total |
|--------|:-----------:|:---------------:|:------:|:-----:|
| M0 · Plataforma SaaS | 0 | 0 | 7 | **7** |
| M1 · Gestión de Eventos | 4 | 2 | 0 | **6** |
| M2 · Gestión de Invitados | 5 | 0 | 3 | **8** |
| M3 · RSVP y QR | 3 | 0 | 7 | **10** |
| M4 · Gestión de Mesas | 5 | 0 | 2 | **7** |
| M5 · Plano Visual del Salón | 0 | 0 | 6 | **6** |
| M6 · Timeline | 4 | 0 | 2 | **6** |
| M7 · Servicios y Proveedores | 5 | 1 | 1 | **7** |
| M8 · Checklist de Servicios | 0 | 0 | 5 | **5** |
| M9 · Comanda del Chef | 0 | 0 | 7 | **7** |
| M10 · Check-in | 4 | 2 | 2 | **8** |
| M11 · Reportes y Analytics | 1 | 5 | 3 | **9** |
| **TOTAL** | **31** | **10** | **45** | **86** |

### Diferencial competitivo de Planning Pro

Ninguna herramienta simple para organizadores de eventos tiene estas tres capacidades juntas:

1. **Plano del salón vivo** — el mapa del salón se actualiza en tiempo real según las confirmaciones y el check-in. Las mesas cambian de color solas.

2. **Comanda del chef generada automáticamente** — las restricciones dietarias de cada invitado se cruzan con el menú y generan la hoja de cocina sin trabajo manual. El chef marca el estado de cada plato en tiempo real.

3. **RSVP con auto-registro** — el organizador entrega un link, los invitados se registran solos, el QR se genera y envía automáticamente. El organizador no toca la lista de invitados hasta el día del evento.

---

*Documento generado en: Abril 2026*  
*Proyecto: Planning Pro — SaaS + PWA para organizadores de eventos*  
*Stack: React 18 + TypeScript + Hono.js + Supabase + Vercel*
