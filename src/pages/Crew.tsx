import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Profile, Role } from '../types'
import { useAuth } from '../context/AuthContext'

export default function Crew() {
  const { isAdmin } = useAuth()
  const [people, setPeople] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').order('name')
    setPeople((data as Profile[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function changeRole(id: string, role: Role) {
    await supabase.from('profiles').update({ role }).eq('id', id)
    load()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <h1 className="text-2xl font-bold mb-1">Crew</h1>
      <p className="text-sm text-warmgray/70 mb-6">
        {isAdmin ? 'Kelola role tim kamu di sini.' : 'Daftar tim produksi.'}
      </p>

      {loading && <p className="text-sm text-warmgray/60">Memuat...</p>}

      <div className="space-y-3">
        {people.map((p) => (
          <div key={p.id} className="bg-white rounded-xl2 shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">{p.name}</p>
              <p className="text-xs text-warmgray/60">{p.email}</p>
            </div>
            {isAdmin ? (
              <select
                value={p.role}
                onChange={(e) => changeRole(p.id, e.target.value as Role)}
                className="text-sm rounded-xl2 border border-pink px-2 py-1"
              >
                <option value="crew">Crew</option>
                <option value="admin">Admin</option>
              </select>
            ) : (
              <span className="text-xs font-semibold bg-lavender px-3 py-1 rounded-full">
                {p.role === 'admin' ? 'Admin' : 'Crew'}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
