import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, CheckCircle2, Clock, AlertTriangle, ClipboardList } from 'lucide-react'
import { useChecklist } from '../../hooks/useChecklist'
import { useEventoStore } from '../../stores/eventoStore'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Dialog } from '../../components/ui/Dialog'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { cn } from '@/lib/utils'
import type { ChecklistEntry } from '../../hooks/useChecklist'

type ChecklistStatus = 'pendiente' | 'confirmado' | 'problema'

const STATUS_CONFIG: Record<ChecklistStatus, { label: string; activeClass: string; icon: typeof Clock }> = {
  pendiente:  { label: 'Pendiente',  activeClass: 'bg-slate-100 text-slate-700 border-slate-200',   icon: Clock },
  confirmado: { label: 'OK',         activeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  problema:   { label: 'Problema',   activeClass: 'bg-rose-50 text-rose-700 border-rose-200',        icon: AlertTriangle },
}

// ── ChecklistItem ──────────────────────────────────────────────────────────

function ChecklistItem({
  entry,
  onToggle,
  onStatusChange,
  onNoteChange,
}: {
  entry: ChecklistEntry
  onToggle: (entry: ChecklistEntry) => void
  onStatusChange: (svcId: string, status: ChecklistStatus) => void
  onNoteChange: (svcId: string, note: string) => void
}) {
  const { template, servicio } = entry
  const applied = servicio !== null
  const [noteEdit, setNoteEdit] = useState(servicio?.checklistNote ?? '')
  const [noteDirty, setNoteDirty] = useState(false)

  function handleNoteBlur() {
    if (noteDirty && servicio) {
      onNoteChange(servicio.id, noteEdit)
      setNoteDirty(false)
    }
  }

  return (
    <div className={cn('flex items-start gap-3 px-5 py-3 border-b last:border-0 transition-colors', !applied && 'opacity-60 bg-slate-50/30')}>
      {/* Checkbox */}
      <button
        onClick={() => onToggle(entry)}
        className={cn(
          'mt-0.5 h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center transition-colors',
          applied ? 'bg-primary border-primary' : 'border-input hover:border-primary/60',
        )}
        aria-checked={applied}
        role="checkbox"
      >
        {applied && <CheckCircle2 className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
      </button>

      {/* Name + required badge + note */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium flex items-center gap-2 flex-wrap">
          {template.name}
          {template.isRequired && (
            <span className="text-[10px] font-semibold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
              Requerido
            </span>
          )}
        </div>
        {template.description && (
          <div className="text-xs text-muted-foreground mt-0.5">{template.description}</div>
        )}
        {/* Note field — visible when status is problema or note exists */}
        {applied && (servicio?.checklistStatus === 'problema' || servicio?.checklistNote) && (
          <input
            value={noteEdit}
            onChange={(e) => { setNoteEdit(e.target.value); setNoteDirty(true) }}
            onBlur={handleNoteBlur}
            placeholder="Describir el problema…"
            className={cn(
              'mt-1.5 text-xs w-full max-w-sm rounded border px-2 py-1 outline-none focus:ring-1',
              servicio?.checklistStatus === 'problema'
                ? 'border-rose-200 text-rose-700 bg-rose-50 focus:ring-rose-300 placeholder:text-rose-300'
                : 'border-input bg-background focus:ring-ring',
            )}
          />
        )}
      </div>

      {/* Status buttons */}
      {applied && (
        <div className="flex items-center gap-1 shrink-0">
          {(Object.entries(STATUS_CONFIG) as [ChecklistStatus, typeof STATUS_CONFIG[ChecklistStatus]][]).map(
            ([value, cfg]) => {
              const Icon = cfg.icon
              const isActive = servicio?.checklistStatus === value
              return (
                <button
                  key={value}
                  onClick={() => onStatusChange(servicio!.id, value)}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors',
                    isActive
                      ? cfg.activeClass
                      : 'border-transparent text-muted-foreground hover:bg-slate-50',
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {cfg.label}
                </button>
              )
            },
          )}
        </div>
      )}
    </div>
  )
}

// ── AddItemDialog ──────────────────────────────────────────────────────────

function AddItemDialog({
  open,
  onClose,
  onSave,
  categories,
}: {
  open: boolean
  onClose: () => void
  onSave: (name: string, category: string) => Promise<void>
  categories: string[]
}) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [saving, setSaving] = useState(false)

  const effectiveCategory = category === '__new__' ? newCategory : category

  async function handleSave() {
    if (!name.trim() || !effectiveCategory.trim()) return
    setSaving(true)
    try {
      await onSave(name.trim(), effectiveCategory.trim())
      setName('')
      setCategory('')
      setNewCategory('')
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Nuevo ítem de checklist" maxWidth="sm">
      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Nombre del servicio *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Fotógrafo principal"
            autoFocus
          />
        </div>

        <div className="space-y-1">
          <Label>Categoría *</Label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Seleccionar categoría…</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="__new__">+ Nueva categoría</option>
          </select>
        </div>

        {category === '__new__' && (
          <div className="space-y-1">
            <Label>Nueva categoría *</Label>
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Ej: Catering, Audiovisual…"
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={handleSave}
            disabled={saving || !name.trim() || !effectiveCategory.trim()}
          >
            {saving ? 'Guardando…' : 'Crear y aplicar'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

// ── ChecklistPage ──────────────────────────────────────────────────────────

export function ChecklistPage() {
  const { eventoId = '' } = useParams<{ eventoId: string }>()
  const evento = useEventoStore((s) => s.eventos.find((e) => e.id === eventoId))
  const {
    byCategory, summary, templates, isLoading, error,
    applyTemplate, unapplyTemplate, updateStatus, updateNote,
    applyAllRequired, addTemplateAndApply,
  } = useChecklist(eventoId)

  const [showAdd, setShowAdd] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const categories = [...new Set(templates.map((t) => t.category))].sort()

  async function handleToggle(entry: ChecklistEntry) {
    if (entry.servicio) {
      await unapplyTemplate(entry.servicio.id)
    } else {
      await applyTemplate(entry.template)
    }
  }

  async function handleApplyRequired() {
    await applyAllRequired()
    showToast('Servicios requeridos aplicados')
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to={`/eventos/${eventoId}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Checklist de servicios</h1>
            {evento && <p className="text-sm text-muted-foreground mt-0.5">{evento.name}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleApplyRequired}>
            <ClipboardList className="h-4 w-4 mr-1.5" /> Aplicar requeridos
          </Button>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Nuevo ítem
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive mb-4">
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Aplicados</div>
            <div className="text-2xl font-semibold mt-1">
              {summary.applied}
              <span className="text-base text-muted-foreground font-normal">/{summary.total}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Confirmados</div>
            <div className="text-2xl font-semibold text-emerald-600 mt-1">{summary.confirmados}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Pendientes</div>
            <div className="text-2xl font-semibold text-amber-600 mt-1">{summary.pendientes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Problemas</div>
            <div className="text-2xl font-semibold text-rose-600 mt-1">{summary.problemas}</div>
          </CardContent>
        </Card>
      </div>

      {/* Empty state */}
      {templates.length === 0 && (
        <div className="rounded-xl border border-dashed p-12 text-center space-y-3">
          <ClipboardList className="h-10 w-10 text-muted-foreground/40 mx-auto" />
          <p className="text-muted-foreground text-sm">
            No hay ítems en la biblioteca. Creá el primer ítem de checklist.
          </p>
          <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4 mr-1" /> Crear primer ítem
          </Button>
        </div>
      )}

      {/* Groups by category */}
      <div className="space-y-4">
        {Object.entries(byCategory).map(([cat, entries]) => {
          const appliedInCat = entries.filter((e) => e.servicio !== null).length
          return (
            <Card key={cat}>
              <CardHeader className="py-3 px-5 border-b bg-slate-50/40">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">{cat}</CardTitle>
                  <Badge variant="secondary">
                    {appliedInCat} / {entries.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {entries.map((entry) => (
                  <ChecklistItem
                    key={entry.template.id}
                    entry={entry}
                    onToggle={handleToggle}
                    onStatusChange={updateStatus}
                    onNoteChange={updateNote}
                  />
                ))}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <AddItemDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={addTemplateAndApply}
        categories={categories}
      />

      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-slate-900 text-white text-sm px-4 py-2.5 shadow-lg">
          {toastMsg}
        </div>
      )}
    </div>
  )
}
