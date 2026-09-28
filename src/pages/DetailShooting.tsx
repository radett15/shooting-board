import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Shooting, ShootingCrewRow, ShootingEquipmentRow } from '../types'
import { useAuth } from '../context/AuthContext'
import { ShootingStatusBadge, AttendanceBadge } from '../components/StatusBadge'

export default function DetailShooting() {
  const { id } = useParams()
  const { profile, isAdmin } = useAuth()
  const navigate = useNavigate()

  const [shooting, setShooting] = useState<Shooting | null>(null)
  const [crew, setCrew] = useState<ShootingCrewRow[]>([])
  const [equipmentRows, setEquipmentRows] = useState<ShootingEquipmentRow[]>([])
  const [myRow, setMyRow] = useState<ShootingCrewRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function load() {
    setLoading(true)
    const { data: s } = await supabase.from('shootings').select('*').eq('id', id).single()
    setShooting(s as Shooting)

    const { data: c } = await supabase
      .from('shooting_crew')
      .select('*, profiles(*)')
      .eq('shooting_id', id)
    setCrew((c as ShootingCrewRow[]) || [])
    const mine = (c as ShootingCrewRow[])?.find((row) => row.user_id === profile?.id) || null
    setMyRow(mine)

    const { data: e } = await supabase
      .from('shooting_equipment')
      .select('*, equipment(*)')
      .eq('shooting_id', id)
    setEquipmentRows((e as ShootingEquipmentRow[]) || [])

    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, profile])

  async function setAttendance(status: 'confirmed' | 'declined') {
    if (!myRow) return
    await supabase.from('shooting_crew').update({ attendance_status: status }).eq('id', myRow.id)
    load()
  }

  async function handleDelete() {
    await supabase.from('shootings').delete().eq('id', id)
    navigate('/')
  }

  if (loading || !shooting) {
    return <div className="max-w-2xl mx-auto px-4 py-6 animate-pulse">Memuat...</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6 space-y-5">
      <div className="bg-white rounded-card shadow-sm p-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold">{shooting.title}</h1>
          <ShootingStatusBadge status={shooting.status} />
        </div>
        <div className="mt-3 text-sm text-warmgray/80 space-y-1">
          <p>
            📅{' '}
            {new Date(shooting.date + 'T00:00:00').toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          {shooting.call_time && <p>⏰ Call Time {shooting.call_time.slice(0, 5)}</p>}
          <p>
            🎬 {shooting.start_time.slice(0, 5)}–{shooting.end_time.slice(0, 5)}
          </p>
          {shooting.location && <p>📍 {shooting.location}</p>}
          {shooting.notes && <p className="pt-2 whitespace-pre-wrap">{shooting.notes}</p>}
        </div>
        {shooting.maps_url && (
          <a
            href={shooting.maps_url}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-4 bg-mint text-warmgray text-sm font-semibold px-4 py-2 rounded-xl2"
          >
            Buka Google Maps ↗
          </a>
        )}

        {isAdmin && (
          <div className="flex gap-2 mt-5">
            <Link
              to={`/shooting/${shooting.id}/edit`}
              className="flex-1 text-center bg-lavender text-warmgray text-sm font-semibold px-4 py-2 rounded-xl2"
            >
              Edit
            </Link>
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex-1 bg-pink text-warmgray text-sm font-semibold px-4 py-2 rounded-xl2"
            >
              Hapus
            </button>
          </div>
        )}
      </div>

      {/* Attendance untuk crew */}
      {!isAdmin && myRow && (
        <div className="bg-white rounded-card shadow-sm p-5">
          <p className="font-semibold mb-3">Kehadiran kamu</p>
          {myRow.attendance_status === 'pending' ? (
            <div className="flex gap-2">
              <button
                onClick={() => setAttendance('confirmed')}
                className="flex-1 bg-mint text-warmgray font-semibold py-2 rounded-xl2"
              >
                ✓ Saya Hadir
              </button>
              <button
                onClick={() => setAttendance('declined')}
                className="flex-1 bg-pink text-warmgray font-semibold py-2 rounded-xl2"
              >
                Saya Tidak Bisa Hadir
              </button>
            </div>
          ) : myRow.attendance_status === 'confirmed' ? (
            <p className="text-mint-dark font-semibold">✓ Kamu sudah mengonfirmasi hadir</p>
          ) : (
            <p className="text-pink-dark font-semibold">Kamu menandai tidak bisa hadir</p>
          )}
        </div>
      )}

      {/* Crew list */}
      <div className="bg-white rounded-card shadow-sm p-5">
        <p className="font-semibold mb-3">Crew</p>
        {crew.length === 0 && <p className="text-sm text-warmgray/60">Belum ada crew ditugaskan.</p>}
        <div className="space-y-2">
          {crew.map((c) => (
            <div key={c.id} className="flex items-center justify-between text-sm">
              <span>{c.profiles?.name || '—'}</span>
              <AttendanceBadge status={c.attendance_status} />
            </div>
          ))}
        </div>
      </div>

      {/* Equipment list */}
      <div className="bg-white rounded-card shadow-sm p-5">
        <p className="font-semibold mb-3">Equipment</p>
        {equipmentRows.length === 0 && <p className="text-sm text-warmgray/60">Belum ada equipment ditambahkan.</p>}
        <div className="space-y-2">
          {equipmentRows.map((e) => (
            <div key={e.id} className="flex items-center justify-between text-sm">
              <span>{e.equipment?.name || '—'}</span>
              <span className="text-warmgray/60">{e.quantity} unit</span>
            </div>
          ))}
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-20">
          <div className="bg-white rounded-card p-6 max-w-sm w-full text-center">
            <p className="font-semibold">Hapus shooting ini?</p>
            <p className="text-sm text-warmgray/70 mt-1">
              Data shooting dan penugasan crew akan dihapus.
            </p>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 bg-gray-100 font-semibold py-2 rounded-xl2"
              >
                Batal
              </button>
              <button onClick={handleDelete} className="flex-1 bg-pink-dark text-white font-semibold py-2 rounded-xl2">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
