import { FormEvent, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Equipment as EquipmentType, EquipmentStatus } from '../types'
import { useAuth } from '../context/AuthContext'

const statusLabel: Record<EquipmentStatus, string> = {
  available: 'Available',
  in_use: 'In Use',
  maintenance: 'Maintenance',
}

export default function Equipment() {
  const { isAdmin } = useAuth()
  const [items, setItems] = useState<EquipmentType[]>([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)

  async function load() {
    const { data } = await supabase.from('equipment').select('*').order('name')
    setItems((data as EquipmentType[]) || [])
  }

  useEffect(() => {
    load()
  }, [])

  async function addEquipment(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await supabase.from('equipment').insert({ name, quantity, status: 'available' })
    setName('')
    setQuantity(1)
    setShowForm(false)
    load()
  }

  async function changeStatus(id: string, status: EquipmentStatus) {
    await supabase.from('equipment').update({ status }).eq('id', id)
    load()
  }

  async function remove(id: string) {
    await supabase.from('equipment').delete().eq('id', id)
    load()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Equipment</h1>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl2"
          >
            + Tambah
          </button>
        )}
      </div>
      <p className="text-sm text-warmgray/70 mb-6">Alat produksi tim kamu.</p>

      {showForm && (
        <form onSubmit={addEquipment} className="bg-white rounded-card shadow-sm p-4 mb-4 flex gap-2">
          <input
            placeholder="Nama alat"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input flex-1"
          />
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="input w-20"
          />
          <button type="submit" className="bg-mint-dark text-white font-semibold px-4 rounded-xl2">
            Simpan
          </button>
        </form>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-card shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-xs text-warmgray/60">
                {statusLabel[item.status]} · {item.quantity} unit
              </p>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <select
                  value={item.status}
                  onChange={(e) => changeStatus(item.id, e.target.value as EquipmentStatus)}
                  className="text-sm rounded-xl2 border border-line px-2 py-1"
                >
                  <option value="available">Available</option>
                  <option value="in_use">In Use</option>
                  <option value="maintenance">Maintenance</option>
                </select>
                <button onClick={() => remove(item.id)} className="text-pink-dark text-sm font-semibold">
                  Hapus
                </button>
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-warmgray/60">Belum ada equipment.</p>}
      </div>
    </div>
  )
}
