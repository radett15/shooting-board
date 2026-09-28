import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Shooting } from '../types'
import { useAuth } from '../context/AuthContext'
import ShootingCard from '../components/ShootingCard'

export default function Jadwal() {
  const { isAdmin } = useAuth()
  const [shootings, setShootings] = useState<Shooting[] | null>(null)
  const [error, setError] = useState(false)

  async function load() {
    setError(false)
    const { data, error } = await supabase
      .from('shootings')
      .select('*')
      .order('date', { ascending: true })
    if (error) {
      setError(true)
    } else {
      setShootings(data as Shooting[])
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Schedule</h1>
        {isAdmin && (
          <Link
            to="/shooting/baru"
            className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl2"
          >
            + Tambah Shooting
          </Link>
        )}
      </div>
      <p className="text-sm text-warmgray/70 mb-6">Plan every shoot without the chaos.</p>

      {error && (
        <div className="bg-white rounded-card p-6 text-center">
          <p className="font-semibold">Jadwal belum dapat dimuat.</p>
          <p className="text-sm text-warmgray/70">Coba lagi dalam beberapa saat.</p>
          <button onClick={load} className="mt-3 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl2">
            Coba Lagi
          </button>
        </div>
      )}

      {!error && shootings === null && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white/60 rounded-xl2 animate-pulse" />
          ))}
        </div>
      )}

      {!error && shootings !== null && shootings.length === 0 && (
        <div className="bg-white rounded-card p-8 text-center">
          <p className="font-semibold">Belum ada jadwal shooting</p>
          <p className="text-sm text-warmgray/70 mt-1">
            {isAdmin ? 'Tambahkan jadwal produksi pertama kamu ✨' : 'Belum ada jadwal tersedia.'}
          </p>
          {isAdmin && (
            <Link
              to="/shooting/baru"
              className="inline-block mt-4 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl2"
            >
              + Tambah Shooting
            </Link>
          )}
        </div>
      )}

      {!error && shootings && shootings.length > 0 && (
        <div className="space-y-3">
          {shootings.map((s) => (
            <ShootingCard key={s.id} shooting={s} />
          ))}
        </div>
      )}
    </div>
  )
}
