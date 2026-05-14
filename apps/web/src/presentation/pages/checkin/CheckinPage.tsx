import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { QrCode, Search, CheckCircle2, XCircle, AlertTriangle, Wifi, Users } from 'lucide-react'
import { useCheckin } from '../../hooks/useCheckin'
import type { CheckinStats } from '../../hooks/useCheckin'
import { useAuth } from '../../providers/AuthProvider'
import { useEventoStore } from '../../stores/eventoStore'
import { supabase } from '../../../infrastructure/supabase/client'
import { SupabaseMesaRepository } from '../../../infrastructure/supabase/SupabaseMesaRepository'
import { Badge } from '../../components/ui/Badge'
import { cn } from '@/lib/utils'
import type { Mesa } from '../../../core/domain/mesa/Mesa'
import type { Invitado } from '../../../core/domain/invitado/Invitado'
import { DIETARY_OPTIONS, INVITADO_STATUS_LABEL } from '../../../core/domain/invitado/Invitado'
import type {
  CheckInByTokenResult,
  CheckInByTokenFailure,
} from '../../../core/application/invitado/CheckInByTokenUseCase'
import type {
  CheckInManualResult,
  CheckInManualFailure,
} from '../../../core/application/invitado/CheckInManualUseCase'

const mesaRepo = new SupabaseMesaRepository()

type CheckinResult =
  | { kind: 'success'; invitado: Invitado; mesa: Mesa | null; time: string }
  | { kind: 'already'; invitado: Invitado; checkinTime: string }
  | { kind: 'error'; message: string }

// ── Sub-components ─────────────────────────────────────────────────────────

function ResultCard({ result, onDismiss }: { result: CheckinResult; onDismiss: () => void }) {
  useEffect(() => {
    if (result.kind === 'success') {
      const t = setTimeout(onDismiss, 8000)
      return () => clearTimeout(t)
    }
  }, [result, onDismiss])

  if (result.kind === 'success') {
    const inv = result.invitado
    const dietaryLabels = DIETARY_OPTIONS.filter((o) =>
      inv.dietaryRestrictions.includes(o.id),
    )
    return (
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-5 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-11 w-11 rounded-full bg-white/20 flex items-center justify-center">
            <CheckCircle2 size={26} strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-xs text-emerald-100 font-medium uppercase tracking-wide">
              Check-in exitoso · {result.time}
            </div>
            <div className="text-2xl font-semibold">
              {inv.nombre} {inv.apellido}
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="ml-auto text-emerald-100 hover:text-white"
            aria-label="Cerrar"
          >
            <XCircle size={18} />
          </button>
        </div>
        <div className="bg-white/10 rounded-md p-4 space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-xs text-emerald-100">Mesa asignada</div>
              {result.mesa ? (
                <div className="text-2xl font-semibold">
                  Mesa {result.mesa.number}
                  {result.mesa.name && (
                    <span className="text-base text-emerald-100 ml-1">· {result.mesa.name}</span>
                  )}
                </div>
              ) : (
                <div className="text-base text-emerald-100">Sin mesa asignada</div>
              )}
            </div>
            {inv.acompanantesEsperados > 0 && (
              <div className="flex items-center gap-1.5 bg-white/20 rounded-md px-3 py-1.5 text-sm">
                <Users size={14} />
                <span>+{inv.acompanantesEsperados} acompañantes</span>
              </div>
            )}
          </div>
          {dietaryLabels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {dietaryLabels.map((o) => (
                <span
                  key={o.id}
                  className="bg-amber-400 text-amber-900 text-xs font-semibold px-2 py-0.5 rounded-full"
                >
                  {o.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (result.kind === 'already') {
    const inv = result.invitado
    return (
      <div className="bg-amber-500/20 border border-amber-500/40 rounded-lg p-5 flex items-start gap-3">
        <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-medium text-amber-200">Ya realizó check-in</div>
          <div className="text-sm text-amber-300 mt-0.5">
            {inv.nombre} {inv.apellido} ingresó a las {result.checkinTime}
          </div>
        </div>
        <button onClick={onDismiss} className="text-amber-400 hover:text-amber-200">
          <XCircle size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="bg-rose-500/20 border border-rose-500/40 rounded-lg p-5 flex items-start gap-3">
      <XCircle size={20} className="text-rose-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="font-medium text-rose-200">Check-in fallido</div>
        <div className="text-sm text-rose-300 mt-0.5">{result.message}</div>
      </div>
      <button onClick={onDismiss} className="text-rose-400 hover:text-rose-200">
        <XCircle size={16} />
      </button>
    </div>
  )
}

function LiveStats({ stats }: { stats: CheckinStats }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
      <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">
        Check-in en tiempo real
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-5xl font-semibold tabular-nums">{stats.checkinCount}</span>
        <span className="text-slate-400">/ {stats.confirmados}</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-700 overflow-hidden">
        <div
          className="h-full bg-blue-400 transition-all duration-500"
          style={{ width: `${stats.pct}%` }}
        />
      </div>
      <div className="text-xs text-slate-400 mt-2">
        {stats.pct}% de los confirmados ya ingresó
      </div>
    </div>
  )
}

function ActivityFeed({
  recentCheckins,
  mesasMap,
}: {
  recentCheckins: Invitado[]
  mesasMap: Record<string, Mesa>
}) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="text-sm font-semibold">Últimos ingresos</div>
        <span className="text-xs text-slate-400">{recentCheckins.length} recientes</span>
      </div>
      <div className="divide-y divide-slate-700 max-h-[400px] overflow-y-auto">
        {recentCheckins.length === 0 && (
          <div className="p-6 text-center text-slate-400 text-sm">
            Aún no hay check-ins
          </div>
        )}
        {recentCheckins.map((inv) => {
          const mesa = inv.mesaId ? mesasMap[inv.mesaId] : undefined
          const time = inv.checkinAt
            ? new Date(inv.checkinAt).toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : ''
          return (
            <div key={inv.id} className="flex items-center gap-3 p-3">
              <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-semibold shrink-0">
                {inv.nombre[0]}
                {inv.apellido[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {inv.nombre} {inv.apellido}
                </div>
                <div className="text-xs text-slate-400">
                  {mesa ? `Mesa ${mesa.number}` : 'sin mesa'}
                  {inv.grupo ? ` · ${inv.grupo}` : ''}
                </div>
              </div>
              <div className="text-xs font-mono text-slate-400 shrink-0">{time}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

export function CheckinPage() {
  const { eventoId: paramId } = useParams<{ eventoId?: string }>()
  const { user } = useAuth()
  const eventoFromStore = useEventoStore((s) =>
    paramId ? s.eventos.find((e) => e.id === paramId) : undefined,
  )

  const [resolvedId, setResolvedId] = useState(paramId ?? '')
  const [eventoNombre, setEventoNombre] = useState(eventoFromStore?.name ?? null)
  const [mesasMap, setMesasMap] = useState<Record<string, Mesa>>({})

  // Recepción: resolve their assigned event from event_users
  useEffect(() => {
    if (paramId || !user) return
    supabase
      .from('event_users')
      .select('evento_id, eventos(name)')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return
        setResolvedId(data.evento_id as string)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setEventoNombre((data.eventos as any)?.name ?? null)
      })
  }, [paramId, user])

  // Sync evento name from store (for organizador)
  useEffect(() => {
    if (eventoFromStore?.name) setEventoNombre(eventoFromStore.name)
  }, [eventoFromStore])

  // Load mesas once eventoId is known
  useEffect(() => {
    if (!resolvedId) return
    mesaRepo.findByEvento(resolvedId).then((list) => {
      const map: Record<string, Mesa> = {}
      list.forEach((m) => { map[m.id] = m })
      setMesasMap(map)
    })
  }, [resolvedId])

  const { stats, recentCheckins, isLoading, checkInByToken, checkInManual, searchInvitados } =
    useCheckin(resolvedId)

  const [mode, setMode] = useState<'scan' | 'search'>('scan')
  const [search, setSearch] = useState('')
  const [result, setResult] = useState<CheckinResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  // QR scanner lifecycle
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const cooldownRef = useRef(false)

  useEffect(() => {
    if (mode !== 'scan' || !resolvedId) return

    setCameraError(null)
    const scanner = new Html5Qrcode('qr-reader-container')
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText) => {
          if (cooldownRef.current) return
          cooldownRef.current = true
          await handleTokenScan(decodedText)
          setTimeout(() => { cooldownRef.current = false }, 3000)
        },
        () => { /* per-frame decode errors — ignored */ },
      )
      .catch((err: Error) => {
        setCameraError(err.message ?? 'No se pudo acceder a la cámara')
      })

    return () => {
      scanner.stop().catch(() => {}).finally(() => scanner.clear())
      scannerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, resolvedId])

  async function processResult(
    res: CheckInByTokenResult | CheckInByTokenFailure | CheckInManualResult | CheckInManualFailure,
  ) {
    if (res.success) {
      const inv = res.invitado
      const mesa = inv.mesaId ? mesasMap[inv.mesaId] ?? null : null
      setResult({
        kind: 'success',
        invitado: inv,
        mesa,
        time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      })
      return
    }
    if (res.error === 'ALREADY_CHECKED_IN' && res.invitado) {
      const checkinTime = res.invitado.checkinAt
        ? new Date(res.invitado.checkinAt).toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '--:--'
      setResult({ kind: 'already', invitado: res.invitado, checkinTime })
      return
    }
    const errorMessages: Record<string, string> = {
      TOKEN_NOT_FOUND: 'QR inválido — no se encontró ningún invitado con este código',
      NOT_CONFIRMED: `El invitado no confirmó asistencia (${res.invitado ? INVITADO_STATUS_LABEL[res.invitado.status] : ''})`,
      NOT_FOUND: 'Invitado no encontrado',
    }
    setResult({
      kind: 'error',
      message: errorMessages[res.error] ?? 'Error al procesar el check-in',
    })
  }

  async function handleTokenScan(token: string) {
    setIsProcessing(true)
    const res = await checkInByToken(token)
    setIsProcessing(false)
    await processResult(res)
  }

  async function handleManualCheckin(invId: string) {
    setIsProcessing(true)
    const res = await checkInManual(invId)
    setIsProcessing(false)
    setSearch('')
    await processResult(res)
  }

  const searchResults = searchInvitados(search)

  if (!resolvedId && !isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400 text-sm">No hay ningún evento asignado a este usuario.</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center gap-3 text-sm">
        <QrCode size={16} />
        <span className="font-semibold">Recepción</span>
        {eventoNombre && (
          <Badge className="bg-slate-700 text-slate-200 border border-slate-600 rounded-full">
            {eventoNombre}
          </Badge>
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
          <Wifi size={14} />
          <span>Online</span>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-12 gap-6 p-6 max-w-[1400px] mx-auto">
        {/* Left: scanner / search + result */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          {/* Mode toggle */}
          <div className="inline-flex bg-slate-800 rounded-md p-1">
            <button
              onClick={() => setMode('scan')}
              className={cn(
                'px-4 py-1.5 text-sm rounded font-medium flex items-center gap-1.5 transition-colors',
                mode === 'scan' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white',
              )}
            >
              <QrCode size={14} /> Escanear QR
            </button>
            <button
              onClick={() => setMode('search')}
              className={cn(
                'px-4 py-1.5 text-sm rounded font-medium flex items-center gap-1.5 transition-colors',
                mode === 'search' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white',
              )}
            >
              <Search size={14} /> Buscar manual
            </button>
          </div>

          {/* QR Scanner panel */}
          {mode === 'scan' && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
              {cameraError ? (
                <div className="p-8 text-center space-y-2">
                  <XCircle size={36} className="text-rose-400 mx-auto" />
                  <p className="text-sm text-slate-300 font-medium">No se pudo acceder a la cámara</p>
                  <p className="text-xs text-slate-400">{cameraError}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Verificá los permisos del navegador y recargá la página.
                  </p>
                </div>
              ) : (
                <div className="relative">
                  {/* html5-qrcode mounts the video into this div */}
                  <div id="qr-reader-container" className="w-full" />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-10">
                      <div className="text-sm text-slate-300">Procesando...</div>
                    </div>
                  )}
                </div>
              )}
              <div className="px-4 py-3 border-t border-slate-700 text-center text-xs text-slate-400">
                Apuntá la cámara al código QR del invitado para hacer el check-in automáticamente
              </div>
            </div>
          )}

          {/* Manual search panel */}
          {mode === 'search' && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre o DNI..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-md pl-10 pr-3 py-3 text-lg focus:outline-none focus:border-blue-400 text-white placeholder:text-slate-500"
                  autoFocus
                />
              </div>

              {search.trim() && searchResults.length === 0 && (
                <div className="text-center text-slate-400 py-4 text-sm">
                  No se encontró ningún invitado
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-1">
                  {searchResults.map((inv) => (
                    <button
                      key={inv.id}
                      onClick={() => handleManualCheckin(inv.id)}
                      disabled={isProcessing || inv.status === 'checkin'}
                      className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-slate-700/60 text-left disabled:opacity-50 transition-colors"
                    >
                      <div className="h-9 w-9 rounded-full bg-slate-600 flex items-center justify-center text-xs font-semibold shrink-0 uppercase">
                        {inv.nombre[0]}
                        {inv.apellido[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {inv.nombre} {inv.apellido}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {inv.dni ? `DNI ${inv.dni}` : 'Sin DNI'}
                          {inv.acompanantesEsperados > 0 && ` · +${inv.acompanantesEsperados} acomp.`}
                        </div>
                      </div>
                      {inv.status === 'checkin' ? (
                        <Badge variant="success">Ya ingresó</Badge>
                      ) : inv.status === 'confirmado' ? (
                        <span className="text-xs text-blue-400 shrink-0">Check-in →</span>
                      ) : (
                        <Badge variant="warning">{INVITADO_STATUS_LABEL[inv.status]}</Badge>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Result card */}
          {result && <ResultCard result={result} onDismiss={() => setResult(null)} />}
        </div>

        {/* Right: stats + activity feed */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <LiveStats stats={stats} />
          <ActivityFeed recentCheckins={recentCheckins} mesasMap={mesasMap} />
        </div>
      </div>
    </div>
  )
}
