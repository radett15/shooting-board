import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError('Email atau password salah.')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm bg-white rounded-card shadow-md p-6">
        <h1 className="text-2xl font-bold text-center">ShootFlow</h1>
        <p className="text-center text-sm text-warmgray/70 mt-1 mb-6">
          Plan it. Shoot it. Flow it.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl2 border border-line px-4 py-3 outline-none focus:border-primary"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl2 border border-line px-4 py-3 outline-none focus:border-primary"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-semibold rounded-xl2 py-3 disabled:opacity-60"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        <p className="text-center text-sm mt-4">
          Belum punya akun?{' '}
          <Link to="/register" className="text-primary font-semibold">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  )
}
