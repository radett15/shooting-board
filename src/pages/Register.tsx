import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signUp(name, email, password)
    setLoading(false)
    if (error) {
      setError(error)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-4">
        <div className="w-full max-w-sm bg-white rounded-card shadow-md p-6 text-center">
          <p className="text-lg font-semibold">Akun berhasil dibuat ✨</p>
          <p className="text-sm text-warmgray/70 mt-2">
            Cek email kamu untuk konfirmasi (kalau diminta), lalu silakan masuk.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 w-full bg-primary text-white font-semibold rounded-xl2 py-3"
          >
            Ke halaman Masuk
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm bg-white rounded-card shadow-md p-6">
        <h1 className="text-2xl font-bold text-center">🎬 Buat Akun</h1>
        <p className="text-center text-sm text-warmgray/70 mt-1 mb-6">
          Akun baru otomatis jadi Crew. Admin bisa mengubah role lewat halaman Crew.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            placeholder="Nama lengkap"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl2 border border-line px-4 py-3 outline-none focus:border-primary"
          />
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
            minLength={6}
            placeholder="Password (min. 6 karakter)"
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
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>
        <p className="text-center text-sm mt-4">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-primary font-semibold">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
