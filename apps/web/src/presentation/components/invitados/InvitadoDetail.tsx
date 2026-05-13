import { useState } from 'react'
import { QrCode, Download, Mail, Phone, Users, Utensils, RefreshCw } from 'lucide-react'
import QRCode from 'react-qr-code'
import { InvitadoStatusBadge } from './InvitadoStatusBadge'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { DIETARY_OPTIONS, nombreCompleto } from '../../../core/domain/invitado/Invitado'
import type { Invitado, InvitadoStatus } from '../../../core/domain/invitado/Invitado'
import type { UpdateInvitadoData } from '../../../core/ports/IInvitadoRepository'

const ALL_STATUSES: InvitadoStatus[] = [
  'pendiente', 'invitado', 'visto', 'confirmado', 'checkin', 'rechazo',
]

interface InvitadoDetailProps {
  invitado: Invitado
  onEdit: () => void
  onGenerateQr: () => Promise<void>
  onRegenerateQr: () => Promise<void>
  onStatusChange: (data: UpdateInvitadoData) => Promise<void>
}

export function InvitadoDetail({ invitado, onEdit, onGenerateQr, onRegenerateQr, onStatusChange }: InvitadoDetailProps) {
  const [generatingQr, setGeneratingQr] = useState(false)
  const [regeneratingQr, setRegeneratingQr] = useState(false)
  const [changingStatus, setChangingStatus] = useState(false)

  const qrValue = invitado.qrToken
    ? `EVT-${invitado.eventoId}:INV-${invitado.id}:TOKEN-${invitado.qrToken}`
    : null

  const handleGenerateQr = async () => {
    try {
      setGeneratingQr(true)
      await onGenerateQr()
    } finally {
      setGeneratingQr(false)
    }
  }

  const handleRegenerateQr = async () => {
    if (!confirm('¿Regenerar el QR? El código anterior quedará inválido.')) return
    try {
      setRegeneratingQr(true)
      await onRegenerateQr()
    } finally {
      setRegeneratingQr(false)
    }
  }

  const handleStatusChange = async (status: InvitadoStatus) => {
    try {
      setChangingStatus(true)
      await onStatusChange({ status })
    } finally {
      setChangingStatus(false)
    }
  }

  const downloadQr = () => {
    const svg = document.getElementById('invitado-qr')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qr-${invitado.apellido}-${invitado.nombre}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const dietaryLabels = invitado.dietaryRestrictions
    .map((id) => DIETARY_OPTIONS.find((o) => o.id === id)?.label ?? id)
    .filter(Boolean)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{nombreCompleto(invitado)}</h3>
          {invitado.grupo && <p className="text-sm text-muted-foreground">{invitado.grupo}</p>}
        </div>
        <Button variant="outline" size="sm" onClick={onEdit}>
          Editar
        </Button>
      </div>

      {/* Status selector */}
      <div className="flex items-center gap-3">
        <InvitadoStatusBadge status={invitado.status} />
        <Select
          className="h-8 w-40 text-xs"
          value={invitado.status}
          onChange={(e) => handleStatusChange(e.target.value as InvitadoStatus)}
          disabled={changingStatus}
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </Select>
      </div>

      {/* Contact info */}
      <dl className="space-y-2 text-sm">
        {invitado.dni && (
          <div className="flex gap-2">
            <dt className="text-muted-foreground w-24 shrink-0">DNI</dt>
            <dd>{invitado.dni}</dd>
          </div>
        )}
        {invitado.email && (
          <div className="flex gap-2 items-center">
            <dt className="text-muted-foreground w-24 shrink-0 flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" /> Email
            </dt>
            <dd><a href={`mailto:${invitado.email}`} className="hover:underline text-primary">{invitado.email}</a></dd>
          </div>
        )}
        {invitado.whatsapp && (
          <div className="flex gap-2 items-center">
            <dt className="text-muted-foreground w-24 shrink-0 flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" /> WhatsApp
            </dt>
            <dd>{invitado.whatsapp}</dd>
          </div>
        )}
        {invitado.acompanantesEsperados > 0 && (
          <div className="flex gap-2 items-center">
            <dt className="text-muted-foreground w-24 shrink-0 flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> Acomp.
            </dt>
            <dd>
              {invitado.acompanantesPresentes !== null
                ? `${invitado.acompanantesPresentes} / ${invitado.acompanantesEsperados} presentes`
                : `${invitado.acompanantesEsperados} esperados`}
            </dd>
          </div>
        )}
        {dietaryLabels.length > 0 && (
          <div className="flex gap-2">
            <dt className="text-muted-foreground w-24 shrink-0 flex items-center gap-1 pt-0.5">
              <Utensils className="h-3.5 w-3.5" /> Dieta
            </dt>
            <dd className="flex flex-wrap gap-1">
              {dietaryLabels.map((l) => (
                <span key={l} className="rounded bg-muted px-1.5 py-0.5 text-xs">{l}</span>
              ))}
            </dd>
          </div>
        )}
        {invitado.checkinAt && (
          <div className="flex gap-2">
            <dt className="text-muted-foreground w-24 shrink-0">Check-in</dt>
            <dd>{new Date(invitado.checkinAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</dd>
          </div>
        )}
      </dl>

      {/* QR Section */}
      <div className="border rounded-lg p-4">
        <p className="text-sm font-medium mb-3 flex items-center gap-1.5">
          <QrCode className="h-4 w-4" /> Código QR
        </p>
        {qrValue ? (
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-white rounded-lg border">
              <QRCode id="invitado-qr" value={qrValue} size={160} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={downloadQr}>
                <Download className="h-3.5 w-3.5 mr-1.5" /> Descargar QR
              </Button>
              <Button variant="outline" size="sm" onClick={handleRegenerateQr} disabled={regeneratingQr}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                {regeneratingQr ? 'Regenerando...' : 'Regenerar QR'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Este invitado no tiene QR. Podés generarlo manualmente si no puede completar el formulario RSVP.
            </p>
            <Button size="sm" onClick={handleGenerateQr} disabled={generatingQr}>
              {generatingQr ? 'Generando...' : 'Generar QR manual'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
