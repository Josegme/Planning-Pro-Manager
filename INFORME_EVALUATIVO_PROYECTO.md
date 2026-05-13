# Informe Evaluativo — Planning Pro Manager

> Fecha: Abril 2026  
> Base analizada: `README.md`, `CLAUDE.md`, `PLANNING_PRO_MASTER_DOC.md`, `package.json`, `turbo.json`  
> Alcance de esta evaluación: análisis documental y estratégico. No se ejecutó código.

---

## 1. Resumen ejecutivo

**Planning Pro** es una propuesta de software **SaaS + PWA** orientada a organizadores profesionales de eventos. El producto busca centralizar la operativa completa de un evento en un solo sistema: gestión del evento, invitados, RSVP, QR, mesas, plano visual, timeline, check-in, servicios, comanda y reportes.

La iniciativa está **bien pensada desde producto y arquitectura**, y tiene un punto especialmente valioso: **no parte de cero a nivel dominio**, porque se apoya en la experiencia previa de una versión desktop ya validada (`Planning Manager Desktop`).

La conclusión general es la siguiente:

- **La idea es viable técnicamente**.
- **La propuesta es comercialmente vendible** si se ejecuta con foco.
- **La arquitectura propuesta es sólida**, moderna y razonable para un SaaS B2B de nicho.
- **El mayor riesgo no es técnico sino de alcance**: el proyecto define 86 funcionalidades distribuidas en 12 módulos, lo cual puede retrasar mucho la salida al mercado si se intenta construir todo al mismo tiempo.

Mi recomendación principal es tratar este producto como un sistema modular con una estrategia de desarrollo por etapas, priorizando un **MVP comercial fuerte** antes que una cobertura funcional completa.

---

## 2. Evaluación de la propuesta del producto

### 2.1 Problema que resuelve

El proyecto ataca un problema real y muy concreto: la organización profesional de eventos suele apoyarse en herramientas fragmentadas:

- Excel para invitados
- WhatsApp para coordinación
- papel o dibujos improvisados para el salón
- mensajes manuales para RSVP
- planillas separadas para catering y proveedores

Planning Pro propone unificar todo esto en un solo flujo operativo.

### 2.2 Claridad del usuario objetivo

Este punto está muy bien resuelto en la documentación:

- El usuario principal es el **organizador profesional**
- Los roles secundarios son **recepción** y **chef**
- El cliente final del organizador **no usa el sistema**

Eso es importante porque evita uno de los problemas más comunes en productos SaaS tempranos: querer servir a demasiados perfiles a la vez.

### 2.3 Diferencial competitivo

El producto no se vende solamente como "agenda de eventos" o "lista de invitados", sino como una plataforma operativa integral. El diferencial más fuerte está en la combinación de:

1. **RSVP con auto-registro y QR**
2. **Plano visual del salón vivo**
3. **Comanda del chef generada a partir de invitados reales y restricciones**
4. **Check-in en tiempo real y con modo offline**

Esa combinación sí construye una propuesta con identidad propia.

### 2.4 Potencial comercial

La idea tiene buen potencial comercial porque:

- resuelve dolor operativo real
- ahorra tiempo en tareas manuales
- reduce errores el día del evento
- profesionaliza el servicio del organizador ante su cliente final
- permite cobrar por valor, no solo por "uso de software"

Es especialmente fuerte como SaaS B2B de nicho, donde un cliente paga si la herramienta evita caos operativo.

---

## 3. Evaluación de la estructura actual del proyecto

### 3.1 Estado del repositorio

El repositorio actual está en una etapa temprana pero ordenada. Hay una base documental fuerte y un esqueleto técnico inicial:

- `README.md`
- `CLAUDE.md`
- `PLANNING_PRO_MASTER_DOC.md`
- `package.json`
- `turbo.json`

Todavía **no hay implementación real de aplicaciones o paquetes** (`apps/web`, `apps/api`, `packages`, `supabase` figuran en la documentación, pero aún no están desarrollados en el repositorio).

### 3.2 Lectura profesional del estado actual

Esto significa que el proyecto hoy está en fase de:

- definición de producto
- validación conceptual
- diseño arquitectónico
- preparación de estándares

No está aún en fase de construcción funcional.

Lejos de ser algo negativo, esto tiene una ventaja: todavía estás a tiempo de construir bien desde el principio, sin arrastrar deuda técnica vieja.

### 3.3 Calidad documental

La documentación es uno de los puntos más fuertes del proyecto.

#### Fortalezas:

- visión del producto bien definida
- stack tecnológico coherente
- modelo de datos pensado con anticipación
- módulos separados con bastante detalle
- flujo RSVP/QR explicado con claridad
- reglas arquitectónicas fuertes en `CLAUDE.md`

#### Debilidades:

- falta transformar esa claridad documental en un roadmap ejecutable más corto
- hay mucho detalle funcional, pero todavía falta una traducción práctica a MVP y releases reales

---

## 4. Evaluación de la arquitectura propuesta

## 4.1 Monorepo

La estructura propuesta con monorepo es correcta:

- `apps/web`
- `apps/api`
- `packages/shared-types`
- `packages/qr-generator`
- `supabase`

Esto es apropiado porque:

- permite compartir tipos entre frontend y backend
- centraliza tooling
- favorece consistencia
- simplifica CI/CD

**Evaluación:** correcta y recomendable.

## 4.2 Clean Architecture

La propuesta de capas:

`Presentation -> Application -> Domain <- Infrastructure`

es sólida y profesional.

### Puntos fuertes

- protege la lógica de negocio del framework
- facilita tests de casos de uso
- hace que Supabase no contamine todo el proyecto
- permite evolucionar el producto con menor acoplamiento

### Riesgos

- si se aplica de forma demasiado rígida, puede volver el proyecto más lento de desarrollar
- para módulos muy CRUD, una separación excesiva puede generar sobreingeniería

### Recomendación

Aplicar Clean Architecture con criterio:

- fuerte en flujos complejos y críticos
- liviana en CRUD simples

Es decir, mantener la disciplina arquitectónica, pero sin burocratizar el código.

## 4.3 Supabase como núcleo de backend

Elegir Supabase es una buena decisión para este proyecto porque resuelve rápido:

- autenticación
- base PostgreSQL
- Row Level Security
- realtime
- storage

Para una startup o producto en validación, acelera muchísimo.

### Ventajas

- reduce tiempo de construcción
- simplifica seguridad multi-tenant
- acelera MVP
- evita montar demasiada infraestructura propia

### Riesgos

- dependencia fuerte del proveedor
- tentación de mezclar lógica de negocio en queries o servicios dispersos
- uso incorrecto del service role puede romper garantías de aislamiento

### Conclusión

Es una decisión correcta para las primeras etapas, siempre que se mantenga la lógica de negocio central fuera del frontend y se preserve una buena capa de repositorios/puertos.

## 4.4 Offline-first

Este es uno de los rasgos más valiosos del proyecto, porque está alineado con la realidad del uso:

- eventos con conectividad inestable
- uso desde móvil
- momentos críticos donde no se puede depender de internet

### Valor estratégico

No es un "nice to have". En este producto, el offline es parte del valor real.

### Riesgo técnico

También es uno de los componentes más costosos de construir bien. Requiere:

- caché local consistente
- cola de escritura
- sincronización confiable
- manejo de conflictos

### Recomendación

No intentar que toda la plataforma sea offline desde el día uno. Concentrar primero el offline en los flujos críticos:

- check-in
- lectura del evento activo
- operaciones mínimas de recepción

## 4.5 Tiempo real

La apuesta por Supabase Realtime/WebSocket es coherente.

Tiene sentido especialmente para:

- check-in simultáneo
- dashboard del organizador
- cambios de estado en mesas
- seguimiento del timeline

### Recomendación

Usar tiempo real donde realmente aporta valor operativo. No hace falta convertir cada pantalla del producto en una experiencia streaming si no mejora la operación.

## 4.6 Modelo de datos

El modelo de datos propuesto está bien orientado. Las entidades son lógicas y reflejan correctamente el dominio:

- organización
- usuarios
- eventos
- invitados
- mesas
- layout del salón
- timeline
- servicios
- proveedores
- cursos de menú
- requerimientos culinarios

### Punto fuerte clave

El desacople entre:

- estructura visual del salón
- estado operativo de mesas e invitados

es una muy buena decisión. Evita duplicación de datos y simplifica la consistencia.

### Mejora sugerida

A futuro conviene pensar auditoría para operaciones sensibles:

- cambios de invitados
- cambios de check-in
- pagos y servicios
- invitaciones de usuarios

---

## 5. Puntos fuertes del proyecto

### 5.1 Hay una visión de producto clara

No parece un conjunto de features sueltas. Hay una narrativa clara:

- organizar
- confirmar
- asignar
- operar
- controlar
- cerrar y reportar

### 5.2 El dominio ya fue explorado antes

Tener una versión desktop previa es una fortaleza importante. Eso significa que muchas decisiones de negocio no nacen desde hipótesis puras.

### 5.3 La arquitectura está pensada antes de construir

Esto reduce mucho la probabilidad de terminar con una aplicación improvisada.

### 5.4 El nicho está bien definido

No intenta abarcar a todo el mercado de eventos. Se enfoca en organizadores profesionales, lo cual mejora:

- mensaje comercial
- roadmap
- pricing
- soporte

### 5.5 Hay una oportunidad real de diferenciación

No muchas herramientas combinan:

- RSVP
- QR
- check-in
- plano del salón
- cocina
- proveedores
- reportes

en un solo producto con enfoque operativo.

---

## 6. Puntos débiles y riesgos principales

## 6.1 Riesgo de sobrealcance

El proyecto define **86 funcionalidades**. Eso es demasiado para un lanzamiento inicial si se quiere salir al mercado con velocidad.

### Riesgo concreto

- retrasar el MVP
- agotarse desarrollando módulos secundarios
- no validar precio ni adopción a tiempo

## 6.2 Complejidad técnica acumulada

El proyecto combina varias complejidades simultáneas:

- multitenancy
- realtime
- offline
- PWA
- roles
- PDFs
- QR
- integraciones externas

Cada una por separado es manejable. Juntas requieren mucha disciplina.

## 6.3 Dependencia de integraciones

Hay partes del producto que dependen de terceros:

- Supabase
- Resend
- WhatsApp API
- Vercel
- Render

Eso acelera mucho, pero también crea dependencia operativa y de costos.

## 6.4 Riesgo de soporte en producción

Este no es un software que falla "sin consecuencias". Si falla el check-in de un evento real, el impacto es directo y visible.

Por eso este producto necesita pensar soporte y observabilidad antes que otros SaaS más simples.

## 6.5 Riesgo de sobreingeniería

Una arquitectura muy buena en papel puede volverse lenta si cada módulo requiere demasiada estructura antes de entregar valor.

La arquitectura debe proteger el sistema, no frenar el negocio.

---

## 7. Viabilidad general

## 7.1 Viabilidad técnica

**Sí, es viable.**

No hay ningún requerimiento que esté fuera del alcance del stack elegido. Todo puede construirse con tecnologías actuales y maduras.

## 7.2 Viabilidad de producto

**Sí, es viable como producto.**

Resuelve una necesidad concreta, con dolor operativo claro y una propuesta integradora.

## 7.3 Viabilidad comercial

**Sí, es potencialmente vendible.**

Pero la venta dependerá de dos cosas:

1. lanzar una primera versión útil lo antes posible
2. demostrar beneficio claro frente a la forma actual de trabajar del organizador

En este tipo de nicho, la venta no depende solo de "tener muchas features", sino de demostrar:

- ahorro de tiempo
- menos errores
- mejor imagen profesional
- más control el día del evento

## 7.4 Viabilidad operativa

Es viable, pero necesita una estrategia de despliegue gradual. No conviene salir directamente con todos los módulos y alta promesa operacional si no hay pruebas reales.

---

## 8. Propuesta recomendada de desarrollo por etapas

La mejor estrategia no es construir por volumen, sino por valor de negocio.

### Etapa 0 — Base técnica y de plataforma

**Objetivo:** dejar listo el proyecto para crecer sin caos.

Incluir:

- estructura real del monorepo
- configuración base de TypeScript
- linting y formateo
- CI/CD
- Supabase local y primeras migraciones
- autenticación básica
- organización y roles iniciales
- shell de la PWA

**Resultado esperado:** entorno listo para desarrollar módulos reales con seguridad y consistencia.

### Etapa 1 — MVP comercial mínimo

**Objetivo:** salir rápido con el núcleo que ya genera valor real.

Módulos prioritarios:

- M1 Gestión de eventos
- M2 Gestión de invitados
- M3 RSVP + QR
- parte esencial de M10 Check-in

Funcionalidades clave:

- crear evento
- cargar/importar invitados
- configurar RSVP
- generar QR
- check-in por QR y búsqueda manual
- vista de mesa asignada en recepción

**Resultado esperado:** producto que ya puede usarse en un evento real pequeño o mediano.

### Etapa 2 — Operación del evento

**Objetivo:** mejorar la ejecución del día del evento.

Módulos prioritarios:

- M4 Mesas
- M5 Plano del salón
- M6 Timeline
- ampliación de M10 con realtime y multi-dispositivo

**Resultado esperado:** la herramienta deja de ser solo administrativa y pasa a ser una consola operativa real.

### Etapa 3 — Gestión extendida del organizador

**Objetivo:** cubrir la operación económica y logística.

Módulos prioritarios:

- M7 Servicios y proveedores
- M8 Checklist de servicios

**Resultado esperado:** el organizador concentra contratación, control y verificación en el mismo sistema.

### Etapa 4 — Cocina y coordinación avanzada

**Objetivo:** capturar uno de los diferenciales más fuertes del producto.

Módulo prioritario:

- M9 Comanda del chef

**Resultado esperado:** la cocina trabaja con información real, actualizada y conectada al evento.

### Etapa 5 — Cierre, reportes y optimización

**Objetivo:** transformar datos operativos en valor posterior al evento.

Módulo prioritario:

- M11 Reportes y analytics

**Resultado esperado:** el organizador recibe material útil para control interno, mejora continua y presentación profesional.

---

## 9. MVP recomendado

Si el objetivo es validar mercado cuanto antes, el MVP no debería intentar cubrir los 12 módulos.

### MVP sugerido

- autenticación
- organizaciones y roles básicos
- creación de eventos
- invitados
- RSVP configurable básico
- generación y envío de QR por email
- check-in por QR
- búsqueda manual en recepción
- asignación simple de mesas

### Qué dejar fuera del MVP

- plano visual avanzado del salón
- checklist de servicios completo
- comanda del chef
- reportes sofisticados
- automatizaciones complejas
- WhatsApp si introduce fricción inicial alta

### Motivo

Ese recorte ya permite validar:

- si el organizador quiere usar el producto
- si el flujo RSVP + QR + check-in genera valor real
- si está dispuesto a pagar

---

## 10. Recomendaciones estratégicas

### 10.1 Priorizar flujo vertical, no módulos aislados

En vez de desarrollar todo un módulo entero por vez, conviene asegurar primero un flujo completo:

`crear evento -> invitar / registrar -> generar QR -> hacer check-in`

Ese flujo vende más que tener muchas pantallas parciales.

### 10.2 Validar con usuarios reales temprano

Antes de completar módulos secundarios, conviene probar con organizadores reales:

- flujo de alta
- comprensión del RSVP
- uso de QR
- problemas en recepción

### 10.3 Reservar lo complejo para después de validar el núcleo

Las piezas más complejas deben entrar cuando el proyecto ya tenga señales reales de uso:

- plano visual vivo
- comanda automática
- analytics avanzados
- Agency plan

### 10.4 Diseñar pensando en observabilidad

Este tipo de plataforma necesita:

- logs claros
- trazabilidad
- monitoreo de errores
- alertas

porque el contexto de uso es sensible: el día del evento.

### 10.5 Tener una estrategia clara de pricing

La documentación menciona Starter / Pro / Agency, lo cual está bien. Recomiendo que el pricing esté asociado a valor operativo:

- cantidad de eventos activos
- cantidad de invitados
- acceso a módulos avanzados
- multiusuario / agency

---

## 11. Conclusión final

Planning Pro tiene muy buenas bases.

No es una idea improvisada: tiene visión, foco de usuario, diferenciación, una arquitectura pensada y una estructura documental fuerte. También tiene una ventaja clave: el dominio ya pasó por una etapa previa de validación en desktop.

Desde una mirada senior, mi evaluación es:

- **Arquitectura propuesta:** buena y profesional
- **Estructura conceptual del software:** sólida
- **Viabilidad técnica:** alta
- **Viabilidad comercial:** buena, si se lanza por etapas
- **Riesgo principal:** querer construir demasiado antes de validar mercado y facturación

La recomendación más importante es esta:

> **No construir el sistema completo primero. Construir primero el núcleo que resuelve el mayor dolor operativo y usar eso para validar mercado, aprender y financiar la siguiente etapa.**

Si esa disciplina se mantiene, el proyecto tiene potencial real para convertirse en una herramienta diferencial dentro de su nicho.

---

## 12. Próximo uso sugerido de este informe

Este documento sirve como base para cualquiera de estas siguientes tareas:

- definir un MVP formal
- bajar el roadmap a hitos concretos
- ordenar un backlog por prioridad
- decidir qué módulos pasan a fase 1, fase 2 y fase 3
- comparar alcance deseado vs capacidad real de desarrollo

---

*Documento elaborado como evaluación estratégica y arquitectónica del proyecto Planning Pro.*
