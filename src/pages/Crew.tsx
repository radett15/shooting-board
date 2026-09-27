import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Profile, Role } from '../types'
import { useAuth } from '../context/AuthContext'

export default function Crew() {
  const { isAdmin } = useAuth()
  const [people, setPeople] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

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

  function startEdit(p: Profile) {
    setEditingId(p.id)
    setEditingName(p.name)
  }

  async function saveName(id: string) {
    if (editingName.trim()) {
      await supabase.from('profiles').update({ name: editingName.trim() }).eq('id', id)
    }
    setEditingId(null)
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
          <div key={p.id} className="bg-white rounded-xl2 shadow-sm p-4 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              {isAdmin && editingId === p.id ? (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveName(p.id)}
                    className="text-sm rounded-xl2 border border-pink px-2 py-1 flex-1 min-w-0"
                  />
                  <button
                    onClick={() => saveName(p.id)}
                    className="text-xs font-semibold bg-mint-dark text-white px-3 py-1 rounded-xl2"
                  >
                    Simpan
                  </button>
                </div>
              ) : (
                <p
                  className={`font-semibold truncate ${isAdmin ? 'cursor-pointer hover:text-pink-dark' : ''}`}
                  onClick={() => isAdmin && startEdit(p)}
                  title={isAdmin ? 'Klik untuk ubah nama' : undefined}
                >
                  {p.name} {isAdmin && '✏️'}
                </p>
              )}
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
