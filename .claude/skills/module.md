# /module — Scaffold de módulo Planning Pro

Genera la estructura completa de un módulo siguiendo Clean Architecture estricta del proyecto.

## Uso

```
/module M[número] [nombre-entidad]
```

Ejemplos:
- `/module M1 evento`
- `/module M2 invitado`
- `/module M4 mesa`
- `/module M10 checkin`

## Proceso obligatorio

1. **Leer `PLANNING_PRO_MASTER_DOC.md`** — sección del módulo M[N] para entender campos, reglas de negocio y casos de uso exactos.

2. **Mostrar el plan completo** antes de crear cualquier archivo:
   - Lista de archivos a crear con su path completo
   - Campos de la entidad derivados del Master Doc
   - Use cases que se van a generar

3. **Esperar confirmación** del usuario antes de escribir.

4. **Crear los archivos en orden** (respeta las dependencias):
   `domain → port → use cases → repository → store → page`

5. **Avisar al final** si la migración de base de datos del módulo aún no existe.

## Archivos a generar

Dado `/module M1 evento` — los paths se construyen así:

### 1. Entidad de dominio
`apps/web/src/core/domain/[nombre]/[Nombre].ts`

```typescript
export interface [Nombre] {
  id: string
  orgId: string
  // campos según PLANNING_PRO_MASTER_DOC.md sección M[N]
  createdAt: Date
  updatedAt: Date
}

// Value objects o enums del dominio si aplica
export type [Nombre]Status = 'planificacion' | 'activo' | 'finalizado'
```

### 2. Puerto (interfaz del repositorio)
`apps/web/src/core/ports/I[Nombre]Repository.ts`

```typescript
import type { [Nombre] } from '../domain/[nombre]/[Nombre]'

export interface I[Nombre]Repository {
  findById(id: string): Promise<[Nombre] | null>
  findAll(orgId: string): Promise<[Nombre][]>
  create(data: Omit<[Nombre], 'id' | 'createdAt' | 'updatedAt'>): Promise<[Nombre]>
  update(id: string, data: Partial<[Nombre]>): Promise<[Nombre]>
  delete(id: string): Promise<void>
}
```

### 3. Use cases (uno por operación)
`apps/web/src/core/application/[nombre]/`

Generar un use case por cada operación principal del módulo. Naming: `[Verbo][Nombre]UseCase.ts`

```typescript
import type { I[Nombre]Repository } from '../../ports/I[Nombre]Repository'
import type { [Nombre] } from '../../domain/[nombre]/[Nombre]'

export class Get[Nombre]ListUseCase {
  constructor(private readonly repo: I[Nombre]Repository) {}

  async execute(orgId: string): Promise<[Nombre][]> {
    return this.repo.findAll(orgId)
  }
}
```

**Regla dura:** los use cases NO importan nada de React, Supabase, IndexedDB ni ningún framework. Solo conocen el puerto.

### 4. Implementación del repositorio
`apps/web/src/infrastructure/supabase/Supabase[Nombre]Repository.ts`

```typescript
import type { SupabaseClient } from '@supabase/supabase-js'
import type { I[Nombre]Repository } from '../../core/ports/I[Nombre]Repository'
import type { [Nombre] } from '../../core/domain/[nombre]/[Nombre]'

export class Supabase[Nombre]Repository implements I[Nombre]Repository {
  constructor(private readonly client: SupabaseClient) {}

  async findById(id: string): Promise<[Nombre] | null> {
    const { data, error } = await this.client
      .from('[tabla_nombre]')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return this.mapToEntity(data)
  }

  async findAll(orgId: string): Promise<[Nombre][]> {
    // org_id filtrado automáticamente por RLS — no filtrar manualmente
    const { data, error } = await this.client
      .from('[tabla_nombre]')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []).map(this.mapToEntity)
  }

  async create(data: Omit<[Nombre], 'id' | 'createdAt' | 'updatedAt'>): Promise<[Nombre]> {
    const { data: created, error } = await this.client
      .from('[tabla_nombre]')
      .insert(this.mapToRow(data))
      .select()
      .single()

    if (error) throw error
    return this.mapToEntity(created)
  }

  async update(id: string, data: Partial<[Nombre]>): Promise<[Nombre]> {
    const { data: updated, error } = await this.client
      .from('[tabla_nombre]')
      .update(this.mapToRow(data))
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return this.mapToEntity(updated)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from('[tabla_nombre]')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  private mapToEntity(row: Record<string, unknown>): [Nombre] {
    return {
      id: row.id as string,
      orgId: row.org_id as string,
      // mapear campos específicos
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    }
  }

  private mapToRow(entity: Partial<[Nombre]>): Record<string, unknown> {
    return {
      // mapear campos específicos (snake_case para DB)
      org_id: entity.orgId,
    }
  }
}
```

### 5. Zustand store
`apps/web/src/presentation/stores/[nombre]Store.ts`

```typescript
import { create } from 'zustand'
import type { [Nombre] } from '../../core/domain/[nombre]/[Nombre]'

interface [Nombre]State {
  items: [Nombre][]
  selected: [Nombre] | null
  isLoading: boolean
  error: string | null
}

interface [Nombre]Actions {
  setItems: (items: [Nombre][]) => void
  setSelected: (item: [Nombre] | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState: [Nombre]State = {
  items: [],
  selected: null,
  isLoading: false,
  error: null,
}

export const use[Nombre]Store = create<[Nombre]State & [Nombre]Actions>((set) => ({
  ...initialState,
  setItems: (items) => set({ items }),
  setSelected: (selected) => set({ selected }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}))
```

### 6. Hook de conexión
`apps/web/src/presentation/hooks/use[Nombre].ts`

```typescript
import { useEffect } from 'react'
import { use[Nombre]Store } from '../stores/[nombre]Store'
import { Get[Nombre]ListUseCase } from '../../core/application/[nombre]/Get[Nombre]ListUseCase'
import { Supabase[Nombre]Repository } from '../../infrastructure/supabase/Supabase[Nombre]Repository'
import { supabase } from '../../infrastructure/supabase/client'

const repo = new Supabase[Nombre]Repository(supabase)
const getListUseCase = new Get[Nombre]ListUseCase(repo)

export function use[Nombre]List(orgId: string) {
  const { items, isLoading, error, setItems, setLoading, setError } = use[Nombre]Store()

  useEffect(() => {
    setLoading(true)
    getListUseCase.execute(orgId)
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [orgId])

  return { items, isLoading, error }
}
```

### 7. Page shell
`apps/web/src/presentation/pages/[nombre]/[Nombre]Page.tsx`

```tsx
import { use[Nombre]List } from '../../hooks/use[Nombre]'

export function [Nombre]Page() {
  // TODO: obtener orgId del auth context
  const { items, isLoading, error } = use[Nombre]List('')

  if (isLoading) return <div>Cargando...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <main>
      <h1>M[N] — [Nombre]</h1>
      {/* Implementar en Fase correspondiente */}
    </main>
  )
}
```

## Reglas que no se negocian

- Use cases: cero imports de React, Supabase o cualquier framework
- Repository: implementa el puerto, nada más
- Store: solo estado + setters simples, sin lógica de negocio
- Hook: punto de conexión entre store y use case, sin lógica de negocio
- Page: solo llama hooks, sin lógica directa
- Nombres: seguir convenciones de `CLAUDE.md` (PascalCase, prefijo `use`, etc.)

## Aviso de migración

Al terminar el scaffold, agregar siempre:

> "⚠️ Este módulo necesita su migración SQL. Ejecutá `/migration` para crear `YYYYMMDD_NNN_create_[tabla]_table.sql` antes de implementar el repositorio."
