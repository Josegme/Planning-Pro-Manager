import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, CalendarDays, Users, QrCode, BarChart3, ArrowRight, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OnboardingWizardProps {
  open: boolean
  onDismiss: () => void
}

const STEPS = [
  {
    id: 'welcome',
    content: Welcome,
  },
  {
    id: 'features',
    content: Features,
  },
  {
    id: 'cta',
    content: CallToAction,
  },
]

export function OnboardingWizard({ open, onDismiss }: OnboardingWizardProps) {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()

  if (!open) return null

  const isLast = step === STEPS.length - 1
  const StepContent = STEPS[step].content

  function goNext() {
    if (isLast) {
      onDismiss()
      navigate('/eventos/nuevo')
    } else {
      setStep((s) => s + 1)
    }
  }

  function goPrev() {
    setStep((s) => s - 1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">

        {/* Header bar with step dots */}
        <div className="flex items-center justify-between px-6 pt-5 pb-1">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === step ? 'w-6 bg-primary' : 'w-1.5 bg-slate-200',
                )}
              />
            ))}
          </div>
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step content */}
        <div className="px-8 pt-6 pb-4 min-h-[360px]">
          <StepContent />
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between px-8 pb-7 pt-2">
          {step > 0 ? (
            <button
              onClick={goPrev}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Atrás
            </button>
          ) : (
            <button
              onClick={onDismiss}
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              Saltar
            </button>
          )}

          <button
            onClick={goNext}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {isLast ? (
              <>Crear mi primer evento <ArrowRight className="h-4 w-4" /></>
            ) : (
              <>Siguiente <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Step components ───────────────────────────────────────────────────────────

function Welcome() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 mb-6">
        <CalendarDays className="h-10 w-10 text-primary" />
      </div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-3">
        Bienvenido a Planning Pro
      </h1>
      <p className="text-slate-500 leading-relaxed max-w-sm">
        La plataforma para organizadores profesionales de eventos. Desde el RSVP hasta el check-in, todo en un solo lugar.
      </p>
      <div className="mt-8 grid grid-cols-3 gap-4 w-full">
        {[
          { icon: Users, label: 'Invitados y QR' },
          { icon: QrCode, label: 'Check-in en vivo' },
          { icon: BarChart3, label: 'Reportes' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5 rounded-lg bg-slate-50 py-3 px-2">
            <Icon className="h-5 w-5 text-primary" />
            <span className="text-xs text-slate-600 font-medium text-center">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Features() {
  const steps = [
    {
      icon: CalendarDays,
      title: 'Creá el evento',
      desc: 'Configurá fecha, lugar, mesas y timeline. El link RSVP se genera automáticamente.',
    },
    {
      icon: Users,
      title: 'Invitados se registran solos',
      desc: 'Compartís el link y cada invitado recibe su QR por email. Sin carga manual.',
    },
    {
      icon: QrCode,
      title: 'Check-in el día del evento',
      desc: 'Tu equipo escanea QRs desde el celular. Vés el ingreso en tiempo real.',
    },
    {
      icon: BarChart3,
      title: 'Reportes automáticos',
      desc: 'Al terminar, descargás el informe de asistencia y estadísticas del evento.',
    },
  ]

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900 mb-1">Así funciona</h2>
      <p className="text-sm text-slate-500 mb-6">Cuatro pasos, todo automatizado</p>
      <div className="space-y-4">
        {steps.map(({ icon: Icon, title, desc }, i) => (
          <div key={title} className="flex gap-4 items-start">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 relative">
              <Icon className="h-4 w-4 text-primary" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                {i + 1}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">{title}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CallToAction() {
  const highlights = [
    '2 eventos gratis para empezar',
    'Sin necesidad de instalar nada',
    'Check-in desde cualquier celular',
    'Reportes listos para imprimir',
  ]

  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 mb-5">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900 mb-2">
        Listo para arrancar
      </h2>
      <p className="text-sm text-slate-500 mb-6 max-w-xs">
        Creá tu primer evento en 2 minutos. Podés editar todo luego.
      </p>
      <ul className="space-y-2 text-left w-full max-w-xs">
        {highlights.map((h) => (
          <li key={h} className="flex items-center gap-2 text-sm text-slate-700">
            <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
            {h}
          </li>
        ))}
      </ul>
    </div>
  )
}
