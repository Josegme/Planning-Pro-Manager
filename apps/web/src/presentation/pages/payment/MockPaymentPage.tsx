import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

type State = 'idle' | 'processing' | 'success' | 'error'

export function MockPaymentPage() {
  const navigate = useNavigate()
  const [state, setState] = useState<State>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const params = new URLSearchParams(window.location.search)
  const preferenceId = params.get('preference_id')
  const orgId = params.get('org_id')

  async function confirmPayment() {
    if (!preferenceId || !orgId) {
      setErrorMsg('Parámetros de pago inválidos')
      setState('error')
      return
    }
    setState('processing')
    try {
      const res = await fetch(`${API_URL}/payments/mock-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: orgId, preference_id: preferenceId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al confirmar pago')
      setState('success')
      setTimeout(() => navigate('/eventos', { replace: true }), 2500)
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Error al procesar pago')
      setState('error')
    }
  }

  // Auto-start on mount only in idle state
  useEffect(() => {
    if (state === 'idle') confirmPayment()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-lg p-8 text-center">

        {state === 'processing' && (
          <>
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <h1 className="text-lg font-semibold text-slate-900">Procesando pago…</h1>
            <p className="text-sm text-slate-500 mt-1">Esto es una simulación de Mercado Pago</p>
          </>
        )}

        {state === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-lg font-semibold text-slate-900">¡Pago confirmado!</h1>
            <p className="text-sm text-slate-500 mt-1">Tu suscripción está activa. Redirigiendo…</p>
          </>
        )}

        {state === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-lg font-semibold text-slate-900">Error en el pago</h1>
            <p className="text-sm text-slate-500 mt-1 mb-6">{errorMsg}</p>
            <button
              onClick={() => navigate('/eventos', { replace: true })}
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 text-sm font-medium transition-colors"
            >
              Volver a eventos
            </button>
          </>
        )}

        <div className="mt-6 rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
          <p className="text-xs text-amber-700">Entorno de prueba · Los datos no son reales</p>
        </div>
      </div>
    </div>
  )
}
