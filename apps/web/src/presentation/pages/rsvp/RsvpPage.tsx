import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import QRCode from 'react-qr-code'
import { Calendar, MapPin, CheckCircle2, Send } from 'lucide-react'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { DietaryRestrictionsSelect } from '../../components/invitados/DietaryRestrictionsSelect'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

interface RsvpEventoData {
  slug: string
  name: string
  date: string
  time: string | null
  venueName: string | null
  location: string | null
  welcomeMessage: string | null
  bannerUrl: string | null
  fields: Array<{ key: string; shown: boolean; required: boolean }>
  isFull: boolean
}

interface SuccessData {
  invitadoId: string
  nombre: string
  apellido: string
  qrValue: string
}

type PageState = 'loading' | 'form' | 'success' | 'full' | 'closed' | 'resend' | 'error'

const buildSchema = (fields: RsvpEventoData['fields']) => {
  const shape: Record<string, z.ZodTypeAny> = {
    nombre:   z.string().min(1, 'Obligatorio'),
    apellido: z.string().min(1, 'Obligatorio'),
  }
  const f = (key: string) => fields.find((f) => f.key === key)
  const req = (key: string) => f(key)?.required ?? false
  const shown = (key: string) => f(key)?.shown !== false

  if (shown('dni'))
    shape.dni = req('dni') ? z.string().min(1, 'Obligatorio') : z.string().optional()
  if (shown('email'))
    shape.email = req('email')
      ? z.string().email('Email inválido')
      : z.string().email('Email inválido').or(z.literal('')).optional()
  if (shown('whatsapp'))
    shape.whatsapp = req('whatsapp') ? z.string().min(1, 'Obligatorio') : z.string().optional()
  if (shown('acompanantes'))
    shape.acompanantesEsperados = z.coerce.number().min(0).max(20).default(0)
  if (shown('dietary'))
    shape.dietaryRestrictions = z.array(z.string()).default([])

  return z.object(shape)
}

type FormData = Record<string, unknown>

export function RsvpPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const [state, setState]     = useState<PageState>('loading')
  const [evento, setEvento]   = useState<RsvpEventoData | null>(null)
  const [success, setSuccess] = useState<SuccessData | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [resendSent, setResendSent] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/rsvp/${slug}`)
      .then((r) => {
        if (r.status === 404)  return setState('error')
        if (r.status === 410)  return setState('closed')
        if (!r.ok)             return setState('error')
        return r.json().then((data: RsvpEventoData) => {
          setEvento(data)
          setState(data.isFull ? 'full' : 'form')
        })
      })
      .catch(() => setState('error'))
  }, [slug])

  const schema  = evento ? buildSchema(evento.fields) : z.object({})
  const methods = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { acompanantesEsperados: 0, dietaryRestrictions: [] } })

  const onSubmit = async (data: FormData) => {
    setApiError(null)
    try {
      const res = await fetch(`${API_URL}/rsvp/${slug}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      })
      const json = await res.json()
      if (res.status === 409 && json.code === 'FULL') return setState('full')
      if (res.status === 409 && json.code === 'DUPLICATE_DNI') {
        methods.setError('dni' as never, { message: 'Ya existe una confirmación con ese DNI' })
        return
      }
      if (!res.ok) { setApiError(json.error ?? 'Error al procesar tu confirmación'); return }
      setSuccess(json as SuccessData)
      setState('success')
    } catch {
      setApiError('No se pudo conectar. Intentá de nuevo.')
    }
  }

  // ── Resend form ─────────────────────────────────────────────────────────────
  const resendMethods = useForm<{ dni: string; email: string }>()
  const onResend = async (data: { dni: string; email: string }) => {
    const res = await fetch(`${API_URL}/rsvp/${slug}/resend`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    })
    if (res.ok) setResendSent(true)
    else resendMethods.setError('root', { message: 'No se encontró una confirmación con esos datos' })
  }

  // ── Date formatting ──────────────────────────────────────────────────────────
  const dateLabel = evento?.date ? (() => {
    try { return format(parseISO(evento.date), "EEEE d 'de' MMMM yyyy", { locale: es }) }
    catch { return evento.date }
  })() : ''

  const shown = (key: string) => evento?.fields.find((f) => f.key === key)?.shown !== false
  const req   = (key: string) => evento?.fields.find((f) => f.key === key)?.required ?? false

  // ── Layout wrapper ───────────────────────────────────────────────────────────
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-slate-50">
      {evento?.bannerUrl && (
        <div className="h-48 bg-slate-300 overflow-hidden">
          <img src={evento.bannerUrl} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="max-w-lg mx-auto px-4 py-8">
        {evento && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">{evento.name}</h1>
            <div className="mt-2 space-y-1 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span className="capitalize">{dateLabel}{evento.time ? ` · ${evento.time}` : ''}</span>
              </div>
              {(evento.venueName || evento.location) && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>{evento.venueName ?? evento.location}</span>
                </div>
              )}
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  )

  // ── States ───────────────────────────────────────────────────────────────────

  if (state === 'loading') return (
    <Wrapper>
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    </Wrapper>
  )

  if (state === 'error') return (
    <Wrapper>
      <div className="text-center py-12">
        <p className="text-slate-500">El formulario RSVP no está disponible.</p>
      </div>
    </Wrapper>
  )

  if (state === 'closed') return (
    <Wrapper>
      <div className="text-center py-12">
        <p className="font-medium text-slate-800">El formulario RSVP no está activo en este momento.</p>
        <p className="text-sm text-slate-500 mt-1">Consultá con el organizador del evento.</p>
      </div>
    </Wrapper>
  )

  if (state === 'full') return (
    <Wrapper>
      <div className="text-center py-12">
        <p className="font-medium text-slate-800 text-lg">El evento ya alcanzó su capacidad.</p>
        <p className="text-sm text-slate-500 mt-1">No se aceptan más confirmaciones.</p>
      </div>
    </Wrapper>
  )

  if (state === 'success' && success) return (
    <Wrapper>
      <div className="text-center space-y-5">
        <div className="flex flex-col items-center gap-2">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          <h2 className="text-xl font-semibold">¡Confirmación recibida!</h2>
          <p className="text-slate-500 text-sm">
            Hola <strong>{success.nombre}</strong>, tu asistencia fue registrada.
            {' '}Presentá este QR al ingresar al evento.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-xl border shadow-sm">
            <QRCode value={success.qrValue} size={200} />
          </div>
        </div>
        <p className="text-xs text-slate-400">
          También te enviamos el QR por email. Guardalo para el día del evento.
        </p>
      </div>
    </Wrapper>
  )

  // ── RSVP Form ────────────────────────────────────────────────────────────────

  return (
    <Wrapper>
      <div className="bg-white rounded-xl border shadow-sm p-6">
        {evento?.welcomeMessage && (
          <p className="text-slate-600 text-sm mb-5 pb-5 border-b">{evento.welcomeMessage}</p>
        )}
        <h2 className="text-base font-semibold mb-4">Confirmá tu asistencia</h2>

        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input id="nombre" {...methods.register('nombre')} />
              {methods.formState.errors.nombre && (
                <p className="text-xs text-red-500">{String(methods.formState.errors.nombre.message)}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apellido">Apellido *</Label>
              <Input id="apellido" {...methods.register('apellido')} />
              {methods.formState.errors.apellido && (
                <p className="text-xs text-red-500">{String(methods.formState.errors.apellido.message)}</p>
              )}
            </div>
          </div>

          {shown('dni') && (
            <div className="space-y-1.5">
              <Label htmlFor="dni">DNI {req('dni') ? '*' : ''}</Label>
              <Input id="dni" placeholder="ej. 30123456" {...methods.register('dni')} />
              {methods.formState.errors.dni && (
                <p className="text-xs text-red-500">{String(methods.formState.errors.dni.message)}</p>
              )}
            </div>
          )}

          {shown('email') && (
            <div className="space-y-1.5">
              <Label htmlFor="email">Email {req('email') ? '*' : ''}</Label>
              <Input id="email" type="email" placeholder="tu@email.com" {...methods.register('email')} />
              {methods.formState.errors.email && (
                <p className="text-xs text-red-500">{String(methods.formState.errors.email.message)}</p>
              )}
              <p className="text-xs text-slate-400">Te enviaremos el QR a este email.</p>
            </div>
          )}

          {shown('whatsapp') && (
            <div className="space-y-1.5">
              <Label htmlFor="whatsapp">WhatsApp {req('whatsapp') ? '*' : ''}</Label>
              <Input id="whatsapp" placeholder="+5491112345678" {...methods.register('whatsapp')} />
            </div>
          )}

          {shown('acompanantes') && (
            <div className="space-y-1.5">
              <Label htmlFor="acomp">¿Cuántos acompañantes traés? {req('acompanantes') ? '*' : ''}</Label>
              <Select id="acomp" {...methods.register('acompanantesEsperados')}>
                {[0,1,2,3,4,5].map((n) => <option key={n} value={n}>{n}</option>)}
              </Select>
            </div>
          )}

          {shown('dietary') && (
            <div className="space-y-2">
              <Label>Restricciones dietarias {req('dietary') ? '*' : ''}</Label>
              <Controller
                name={'dietaryRestrictions' as never}
                control={methods.control}
                defaultValue={[] as never}
                render={({ field }) => (
                  <DietaryRestrictionsSelect
                    value={(field.value as string[]) ?? []}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          )}

          {apiError && <p className="text-sm text-red-500">{apiError}</p>}

          <Button type="submit" className="w-full" disabled={methods.formState.isSubmitting}>
            {methods.formState.isSubmitting ? 'Confirmando...' : 'Confirmar asistencia'}
          </Button>
        </form>

        {/* Resend link */}
        <div className="mt-4 pt-4 border-t text-center">
          {state !== 'resend' ? (
            <button
              className="text-xs text-slate-400 hover:text-slate-600 underline"
              onClick={() => setState('resend')}
            >
              ¿Ya confirmaste y perdiste tu QR? Reenviar
            </button>
          ) : resendSent ? (
            <p className="text-xs text-emerald-600 flex items-center justify-center gap-1">
              <Send className="h-3.5 w-3.5" /> QR reenviado a tu email
            </p>
          ) : (
            <form onSubmit={resendMethods.handleSubmit(onResend)} className="space-y-3 text-left">
              <p className="text-xs font-medium text-slate-600 text-center">Reenviar QR</p>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="DNI" {...resendMethods.register('dni', { required: true })} className="text-sm" />
                <Input placeholder="Email" type="email" {...resendMethods.register('email', { required: true })} className="text-sm" />
              </div>
              {resendMethods.formState.errors.root && (
                <p className="text-xs text-red-500 text-center">{resendMethods.formState.errors.root.message}</p>
              )}
              <Button type="submit" size="sm" variant="outline" className="w-full">
                Reenviar QR
              </Button>
            </form>
          )}
        </div>
      </div>
    </Wrapper>
  )
}
