import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Camera, CalendarDays, Users, Folder } from 'lucide-react'
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
    if (error) setError('Wrong email or password.')
    else navigate('/')
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-cream">
      <div className="hidden md:flex flex-col justify-center px-14 bg-primary-soft">
        <div className="w-14 h-14 rounded-card bg-primary text-white flex items-center justify-center">
          <Camera size={28} />
        </div>
        <h1 className="text-4xl font-extrabold mt-6">ShootFlow</h1>
        <p className="text-lg text-muted mt-2">Plan it. Shoot it. Flow it.</p>
        <div className="mt-10 space-y-4 text-sm">
          <p className="flex items-center gap-3"><span className="w-9 h-9 rounded-xl2 bg-white flex items-center justify-center text-primary"><CalendarDays size={18} /></span>Every shoot, one calendar</p>
          <p className="flex items-center gap-3"><span className="w-9 h-9 rounded-xl2 bg-white flex items-center justify-center text-primary"><Folder size={18} /></span>Projects and progress at a glance</p>
          <p className="flex items-center gap-3"><span className="w-9 h-9 rounded-xl2 bg-white flex items-center justify-center text-primary"><Users size={18} /></span>Everyone knows where to be</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="md:hidden flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl2 bg-primary text-white flex items-center justify-center"><Camera size={20} /></div>
            <div className="leading-tight">
              <p className="font-bold">ShootFlow</p>
              <p className="text-[11px] text-muted">Production Planner</p>
            </div>
          </div>
          <h2 className="text-2xl font-extrabold">Welcome back 👋</h2>
          <p className="text-sm text-muted mt-1 mb-6">Let's get your next shoot moving.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium mb-1 block">Email</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
            </label>
            <label className="block">
              <span className="text-sm font-medium mb-1 block">Password</span>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
            </label>
            {error && <p className="text-sm text-pink-dark">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-primary text-white font-semibold rounded-xl2 py-3 disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm mt-5 text-muted">
            No account yet? <Link to="/register" className="text-primary font-semibold">Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
