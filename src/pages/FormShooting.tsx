import { FormEvent, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { Equipment, Profile, ShootingStatus } from '../types'

const emptyForm = {
  title: '',
  date: '',
  call_time: '',
  start_time: '',
  end_time: '',
  location: '',
  maps_url: '',
  notes: '',
  status: 'planning' as ShootingStatus,
}

export default function FormShooting() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [form, setForm] = useState(emptyForm)
  const [allCrew, setAllCrew] = useState<Profile[]>([])
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([])
  const [selectedCrew, setSelectedCrew] = useState<string[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    async function loadOptions() {
      const { data: crewData } = await supabase.from('profiles').select('*').order('name')
      setAllCrew((crewData as Profile[]) || [])
      const { data: eqData } = await supabase.from('equipment').select('*').order('name')
      setAllEquipment((eqData as Equipment[]) || [])

      if (isEdit) {
        const { data: s } = await supabase.from('shootings').select('*').eq('id', id).single()
        if (s) {
          setForm({
            title: s.title,
            date: s.date,
            call_time: s.call_time?.slice(0, 5) || '',
            start_time: s.start_time?.slice(0, 5) || '',
            end_time: s.end_time?.slice(0, 5) || '',
            location: s.location || '',
            maps_url: s.maps_url || '',
            notes: s.notes || '',
            status: s.status,
          })
        }
        const { data: crewRows } = await supabase
          .from('shooting_crew')
          .select('user_id')
          .eq('shooting_id', id)
        setSelectedCrew((crewRows || []).map((r) => r.user_id))

        const { data: eqRows } = await supabase
          .from('shooting_equipment')
          .select('equipment_id')
          .eq('shooting_id', id)
        setSelectedEquipment((eqRows || []).map((r) => r.equipment_id))
      }
    }
    loadOptions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  function toggle(list: string[], value: string, setList: (v: string[]) => void) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)

    const payload = {
      title: form.title,
      date: form.date,
      call_time: form.call_time || null,
      start_time: form.start_time,
      end_time: form.end_time,
      location: form.location || null,
      maps_url: form.maps_url || null,
      notes: form.notes || null,
      status: form.status,
    }

    let shootingId = id

    if (isEdit) {
      await supabase.from('shootings').update(payload).eq('id', id)
    } else {
      const { data, error } = await supabase
        .from('shootings')
        .insert({ ...payload, created_by: profile?.id })
        .select()
        .single()
      if (error || !data) {
        setSaving(false)
        return
      }
      shootingId = data.id
    }

    // Sinkronkan crew: hapus semua, insert ulang yang dipilih
    await supabase.from('shooting_crew').delete().eq('shooting_id', shootingId)
    if (selectedCrew.length > 0) {
      await supabase.from('shooting_crew').insert(
        selectedCrew.map((userId) => ({ shooting_id: shootingId, user_id: userId })),
      )
    }

    // Sinkronkan equipment
    await supabase.from('shooting_equipment').delete().eq('shooting_id', shootingId)
    if (selectedEquipment.length > 0) {
      await supabase.from('shooting_equipment').insert(
        selectedEquipment.map((eqId) => ({ shooting_id: shootingId, equipment_id: eqId, quantity: 1 })),
      )
    }

    setSaving(false)
    setToast(isEdit ? 'Jadwal berhasil diperbarui ✨' : 'Shooting berhasil ditambahkan ✨')
    setTimeout(() => navigate(`/shooting/${shootingId}`), 900)
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <h1 className="text-2xl font-bold mb-5">{isEdit ? 'Edit Shooting' : 'Tambah Shooting'}</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-card shadow-sm p-5">
        <Field label="Judul Shooting">
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Tanggal">
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ShootingStatus })}
              className="input"
            >
              <option value="planning">Planning</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Call Time">
            <input
              type="time"
              value={form.call_time}
              onChange={(e) => setForm({ ...form, call_time: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Jam Mulai">
            <input
              type="time"
              required
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Jam Selesai">
            <input
              type="time"
              required
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              className="input"
            />
          </Field>
        </div>

        <Field label="Lokasi">
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="input"
          />
        </Field>

        <Field label="Google Maps URL (opsional)">
          <input
            value={form.maps_url}
            onChange={(e) => setForm({ ...form, maps_url: e.target.value })}
            className="input"
            placeholder="https://maps.google.com/..."
          />
        </Field>

        <Field label="Notes">
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="input min-h-20"
          />
        </Field>

        <Field label="Crew">
          <div className="flex flex-wrap gap-2">
            {allCrew.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => toggle(selectedCrew, c.id, setSelectedCrew)}
                className={`px-3 py-2 rounded-xl2 text-sm ${
                  selectedCrew.includes(c.id) ? 'bg-lavender-dark text-white' : 'bg-gray-100 text-warmgray'
                }`}
              >
                {c.name}
              </button>
            ))}
            {allCrew.length === 0 && <p className="text-sm text-warmgray/60">Belum ada crew terdaftar.</p>}
          </div>
        </Field>

        <Field label="Equipment">
          <div className="flex flex-wrap gap-2">
            {allEquipment.map((eq) => (
              <button
                type="button"
                key={eq.id}
                onClick={() => toggle(selectedEquipment, eq.id, setSelectedEquipment)}
                className={`px-3 py-2 rounded-xl2 text-sm ${
                  selectedEquipment.includes(eq.id) ? 'bg-mint-dark text-white' : 'bg-gray-100 text-warmgray'
                }`}
              >
                {eq.name}
              </button>
            ))}
            {allEquipment.length === 0 && <p className="text-sm text-warmgray/60">Belum ada equipment terdaftar.</p>}
          </div>
        </Field>

        {toast && <p className="text-mint-dark font-semibold text-sm">{toast}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary text-white font-semibold rounded-xl2 py-3 disabled:opacity-60"
        >
          {saving ? 'Menyimpan...' : 'Simpan Shooting'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-warmgray/80 mb-1 block">{label}</span>
      {children}
    </label>
  )
}
