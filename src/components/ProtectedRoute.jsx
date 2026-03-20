import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#C9A96E', fontFamily: "'IBM Plex Sans Arabic',sans-serif" }}>
      جاري التحميل...
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  return children
}
