import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Plus, Download, Upload, Search, Users, CheckCircle, Clock, X } from 'lucide-react'
import { utils, writeFileXLSX } from 'xlsx'
import { useInvitados } from '../../hooks/useInvitados'
import { useEventoStore } from '../../stores/eventoStore'
import { InvitadoRow } from '../../components/invitados/InvitadoRow'
import { InvitadoDetail } from '../../components/invitados/InvitadoDetail'
import { InvitadoForm } from '../../components/invitados/InvitadoForm'
import { ImportDialog } from '../../components/invitados/ImportDialog'
import { Dialog } from '../../components/ui/Dialog'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { INVITADO_STATUS_LABEL } from '../../../core/domain/invitado/Invitado'
import type { Invitado, InvitadoStatus } from '../../../core/domain/invitado/Invitado'
import type { CreateInvitadoData, UpdateInvitadoData } from '../../../core/ports/IInvitadoRepository'

type FormPayload = Omit<CreateInvitadoData, 'eventoId'> | UpdateInvitadoData

const ALL_STATUSES: InvitadoStatus[] = [
  'pendiente', 'invitado', 'visto', 'confirmado', 'checkin', 'rechazo',
]

export function InvitadosPage() {
  const { eventoId = '' } = useParams<{ eventoId: string }>()
  const { invitados, isLoading, error, create, update, remove, importRows, generateQr, regenerateQr } = useInvitados(eventoId)
  const evento = useEventoStore((s) => s.eventos.find((e) => e.id === eventoId))

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<InvitadoStatus | 'all'>('all')
  const [viewing, setViewing] = useState<Invitado | null>(null)
  const [editing, setEditing] = useState<Invitado | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showImport, setShowImport] = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return invitados.filter((inv) => {
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false
      if (!q) return true
      return (
        inv.nombre.toLowerCase().includes(q) ||
        inv.apellido.toLowerCase().includes(q) ||
        (inv.dni ?? '').includes(q) ||
        (inv.grupo ?? '').toLowerCase().includes(q)
      )
    })
  }, [invitados, search, statusFilter])

  const stats = useMemo(() => ({
    total:      invitados.length,
    confirmados: invitados.filter((i) => i.status === 'confirmado' || i.status === 'checkin').length,
    checkins:   invitados.filter((i) => i.status === 'checkin').length,
    pendientes: invitados.filter((i) => i.status === 'pendiente').length,
  }), [invitados])

  const exportToExcel = () => {
    const data = invitados.map((inv) => ({
      Nombre: inv.nombre,
      Apellido: inv.apellido,
      DNI: inv.dni ?? '',
      Email: inv.email ?? '',
      WhatsApp: inv.whatsapp ?? '',
      Grupo: inv.grupo ?? '',
      Estado: INVITADO_STATUS_LABEL[inv.status],
      Acompañantes: inv.acompanantesEsperados,
      'Acomp. presentes': inv.acompanantesPresentes ?? '',
      'Hora de check-in': inv.checkinAt ?? '',
      'Restricciones dietarias': inv.dietaryRestrictions.join(', '),
    }))
    const wb = utils.book_new()
    const ws = utils.json_to_sheet(data)
    utils.book_append_sheet(wb, ws, 'Invitados')
    writeFileXLSX(wb, `invitados-${evento?.name ?? eventoId}.xlsx`)
  }

  const handleDelete = async (inv: Invitado) => {
    if (!confirm(`¿Eliminar a ${inv.nombre} ${inv.apellido}? Esta acción no se puede deshacer.`)) return
    await remove(inv.id)
    if (viewing?.id === inv.id) setViewing(null)
  }

  const handleCreate = async (data: FormPayload) => {
    await create(data as Omit<CreateInvitadoData, 'eventoId'>)
    setShowCreate(false)
  }

  const handleEdit = async (data: FormPayload) => {
    if (!editing) return
    const updated = await update(editing.id, data as UpdateInvitadoData)
    setEditing(null)
    if (viewing?.id === editing.id) setViewing(updated)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-4 flex items-center gap-1.5">
        <Link to="/eventos" className="hover:text-foreground">Mis eventos</Link>
        <span>/</span>
        {evento
          ? <Link to={`/eventos/${eventoId}`} className="hover:text-foreground">{evento.name}</Link>
          : <span>{eventoId}</span>
        }
        <span>/</span>
        <span className="text-foreground font-medium">Invitados</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invitados</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {invitados.length} invitados en total
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowImport(true)}>
            <Upload className="h-3.5 w-3.5 mr-1.5" /> Importar
          </Button>
          <Button variant="outline" size="sm" onClick={exportToExcel} disabled={invitados.length === 0}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> Exportar
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Nuevo invitado
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, icon: Users },
          { label: 'Confirmados', value: stats.confirmados, icon: CheckCircle },
          { label: 'Check-in', value: stats.checkins, icon: CheckCircle },
          { label: 'Pendientes', value: stats.pendientes, icon: Clock },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Icon className="h-4 w-4" />
              <span className="text-xs">{label}</span>
            </div>
            <p className="text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive mb-4">
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, apellido o DNI..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setSearch('')}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <Select
          className="w-44"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as InvitadoStatus | 'all')}
        >
          <option value="all">Todos los estados</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{INVITADO_STATUS_LABEL[s]}</option>
          ))}
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <h2 className="font-medium">
            {invitados.length === 0 ? 'Aún no hay invitados' : 'Sin resultados para este filtro'}
          </h2>
          {invitados.length === 0 && (
            <Button className="mt-4" size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Agregar primer invitado
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {['Nombre', 'DNI', 'Estado', 'Acomp.', 'Dieta', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <InvitadoRow
                  key={inv.id}
                  invitado={inv}
                  onView={setViewing}
                  onEdit={setEditing}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
          <div className="border-t px-4 py-2 text-xs text-muted-foreground">
            {filtered.length} de {invitados.length} invitados
          </div>
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo invitado" maxWidth="lg">
        <InvitadoForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
        />
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editing} onClose={() => setEditing(null)} title="Editar invitado" maxWidth="lg">
        {editing && (
          <InvitadoForm
            invitado={editing}
            onSubmit={handleEdit}
            onCancel={() => setEditing(null)}
          />
        )}
      </Dialog>

      {/* Detail dialog */}
      <Dialog
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing ? `${viewing.nombre} ${viewing.apellido}` : ''}
        maxWidth="md"
      >
        {viewing && (
          <InvitadoDetail
            invitado={viewing}
            onEdit={() => { setEditing(viewing); setViewing(null) }}
            onGenerateQr={async () => {
              const updated = await generateQr(viewing.id)
              setViewing(updated)
            }}
            onRegenerateQr={async () => {
              const updated = await regenerateQr(viewing.id)
              setViewing(updated)
            }}
            onStatusChange={async (data) => {
              const updated = await update(viewing.id, data)
              setViewing(updated)
            }}
          />
        )}
      </Dialog>

      {/* Import dialog */}
      <ImportDialog
        open={showImport}
        onClose={() => setShowImport(false)}
        onImport={(rows) => importRows(rows)}
      />
    </div>
  )
}
