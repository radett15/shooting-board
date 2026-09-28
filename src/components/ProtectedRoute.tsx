import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Nav from './Nav'

export function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode
  adminOnly?: boolean
}) {
  const { session, profile, loading, isAdmin } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-warmgray/60">Memuat...</div>
  }
  if (!session) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />
  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center text-warmgray/60">Memuat profil...</div>
  }

  return (
    <div className="min-h-screen bg-cream">
      <Nav />
      <main className="md:pl-60">{children}</main>
    </div>
  )
}
