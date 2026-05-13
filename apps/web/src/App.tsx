import { AuthProvider } from './presentation/providers/AuthProvider'
import { AppRouter } from './presentation/router'

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
