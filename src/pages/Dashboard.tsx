import { ReactNode, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, CalendarRange, Clock, MapPin, Plus, Users } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { Shooting } from '../types'
import { useAuth } from '../context/AuthContext'
import { ShootingStatusBadge } from '../components/StatusBadge'

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function greeting() {
  const h = new Date().getHours()
  if (h < 11) return 'Good morning'
  if (h < 15) return 'Good afternoon'
  return 'Good evening'
}

function Stat({ icon, label, value, tone }: { icon: ReactNode; label: string; value: number; tone: string }) {
  return (
    <div className={`rounded-card p-4 ${tone}`}>
      <div className="flex items-center gap-2 text-xs font-medium text-warmgray/70">
        {icon}
        {label}
      </div>
      <p className="text-3xl font-extrabold mt-2">{value}</p>
    </div>
  )
}

function ShootRow({ s, showDate }: { s: Shooting; showDate?: boolean }) {
  const label = showDate
    ? new Date(s.date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
    : s.start_time.slice(0, 5)
  return (
    <Link to={`/shooting/${s.id}`} className="flex items-center gap-3 py-3">
      <div className="w-20 shrink-0 text-xs font-semibold text-primary">{label}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{s.title}</p>
        {s.location && (
          <p className="text-xs text-muted truncate flex items-center gap-1">
            <MapPin size={12} />
            {s.location}
          </p>
        )}
      </div>
      <ShootingStatusBadge status={s.status} />
    </Link>
  )
}

export default function Dashboard() {
  const { profile, isAdmin } = useAuth()
  const [shootings, setShootings] = useState<Shooting[] | null>(null)
  const [members, setMembers] = useState(0)
  const [error, setError] = useState(false)

  async function load() {
    setError(false)
    const [s, p] = await Promise.all([
      supabase.from('shootings').select('*').order('date').order('start_time'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
    ])
    if (s.error) {
      setError(true)
      return
    }
    setShootings(s.data as Shooting[])
    setMembers(p.count ?? 0)
  }

  useEffect(() => {
    load()
  }, [])

  const now = new Date()
  const todayISO = iso(now)
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const active = (shootings || []).filter((s) => s.status !== 'cancelled')
  const today = active.filter((s) => s.date === todayISO)
  const week = active.filter((s) => s.date >= iso(monday) && s.date <= iso(sunday))
  const upcomingAll = active.filter((s) => s.date > todayISO && s.status !== 'completed')
  const upcoming = upcomingAll.slice(0, 5)
  const firstName = profile?.name?.split(' ')[0] || ''

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-8">
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">
            {greeting()}, {firstName} 👋
          </h1>
          <p className="text-sm text-muted mt-1">Ready to make something great today?</p>
        </div>
        {isAdmin && (
          <Link
            to="/shooting/baru"
            className="shrink-0 flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl2"
          >
            <Plus size={16} /> Add Shoot
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-white rounded-card shadow-sm p-8 text-center">
          <p className="font-semibold">Something went wrong</p>
          <p className="text-sm text-muted mt-1">We couldn't load your production schedule.</p>
          <button onClick={load} className="mt-4 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl2">
            Try Again
          </button>
        </div>
      )}

      {!error && shootings === null && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-card bg-line/60 animate-pulse" />
            ))}
          </div>
          <div className="h-56 rounded-card bg-line/60 animate-pulse" />
        </div>
      )}

      {!error && shootings !== null && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <Stat icon={<CalendarDays size={14} />} label="Today's Shoots" value={today.length} tone="bg-lavender" />
            <Stat icon={<CalendarRange size={14} />} label="This Week" value={week.length} tone="bg-mint" />
            <Stat icon={<Users size={14} />} label="Team Members" value={members} tone="bg-yellow" />
            <Stat icon={<Clock size={14} />} label="Upcoming" value={upcomingAll.length} tone="bg-pink" />
          </div>

          {shootings.length === 0 ? (
            <div className="bg-white rounded-card shadow-sm p-8 text-center">
              <p className="font-semibold">No shoots scheduled yet</p>
              <p className="text-sm text-muted mt-1">Your production calendar is waiting for its first shoot.</p>
              {isAdmin && (
                <Link
                  to="/shooting/baru"
                  className="inline-block mt-4 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl2"
                >
                  + Create First Shoot
                </Link>
              )}
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-4">
              <section className="bg-white rounded-card shadow-sm p-5">
                <h2 className="font-bold mb-1">Today's Schedule</h2>
                {today.length === 0 ? (
                  <p className="text-sm text-muted py-4">Nothing scheduled today.</p>
                ) : (
                  <div className="divide-y divide-line">
                    {today.map((s) => (
                      <ShootRow key={s.id} s={s} />
                    ))}
                  </div>
                )}
              </section>

              <section className="bg-white rounded-card shadow-sm p-5">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-bold">Upcoming Shoots</h2>
                  <Link to="/schedule" className="text-xs font-semibold text-primary">
                    View all
                  </Link>
                </div>
                {upcoming.length === 0 ? (
                  <p className="text-sm text-muted py-4">No upcoming shoots.</p>
                ) : (
                  <div className="divide-y divide-line">
                    {upcoming.map((s) => (
                      <ShootRow key={s.id} s={s} showDate />
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </>
      )}
    </div>
  )
}
