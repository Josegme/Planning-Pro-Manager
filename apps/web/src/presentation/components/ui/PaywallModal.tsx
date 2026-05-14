import { useState } from 'react'
import { X, Zap, CheckCircle } from 'lucide-react'
import { useAuth } from '../../providers/AuthProvider'

interface PaywallModalProps {
  open: boolean
  onClose: () => void
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export function PaywallModal({ open, onClose }: PaywallModalProps) {
  const { orgId } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  if (!open) return null

  async function handleSubscribe() {
    if (!orgId) return
    setIsRedirecting(true)
    setCheckoutError(null)
    try {
      const res = await fetch(`${API_URL}/payments/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: orgId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al iniciar pago')
      window.location.href = data.checkout_url
    } catch (e) {
      setCheckoutError(e instanceof Error ? e.message : 'Error al iniciar pago')
      setIsRedirecting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Zap className="h-7 w-7 text-primary" />
            </div>
          </div>

          <h2 className="text-center text-xl font-semibold text-slate-900 mb-1">
            Período de prueba completo
          </h2>
          <p className="text-center text-sm text-slate-500 mb-6">
            Usaste tus 2 eventos gratuitos. Suscribite para seguir creando eventos sin límite.
          </p>

          <ul className="space-y-2 mb-6">
            {[
              'Eventos ilimitados',
              'Check-in QR en tiempo real',
              'Reportes y analytics',
              'Comanda del chef',
              'Soporte prioritario',
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          {checkoutError && (
            <p className="text-sm text-destructive mb-3 text-center">{checkoutError}</p>
          )}

          <button
            onClick={handleSubscribe}
            disabled={isRedirecting}
            className="w-full inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 text-sm font-medium transition-colors disabled:opacity-60"
          >
            {isRedirecting ? 'Redirigiendo...' : 'Suscribirme — $XX / mes'}
          </button>

          <p className="text-center text-xs text-slate-400 mt-3">
            Pago seguro vía Mercado Pago · Cancelá cuando quieras
          </p>
        </div>
      </div>
    </div>
  )
}
