import { ReactNode, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarDays, CalendarRange, ChevronLeft, ChevronRight, Folder, MapPin, Plus, Users } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { Profile, Project, Shooting } from '../types'
import { useAuth } from '../context/AuthContext'
import { addDays, hm, iso, weekStart } from '../lib/dates'
import { AvatarGroup, PROJECT_STATUS, ProgressBar, typeOf } from '../lib/ui'
import { ShootingStatusBadge } from '../components/StatusBadge'

function greeting() {
  const h = new Date().getHours()
  return h < 11 ? 'Good morning' : h < 15 ? 'Good afternoon' : 'Good evening'
}

function Stat(props: { icon: ReactNode; label: string; value: number; sub: string; tone: string; iconTone: string }) {
  return (
    <div className={`rounded-card p-4 ${props.tone}`}>
      <div className={`w-9 h-9 rounded-xl2 bg-white/70 flex items-center justify-center ${props.iconTone}`}>{props.icon}</div>
      <p className="text-xs font-medium text-muted mt-3">{props.label}</p>
      <p className="text-3xl font-extrabold leading-tight">{props.value}</p>
      <p className="text-[11px] text-muted mt-0.5">{props.sub}</p>
    </div>
  )
}

function MiniCalendar({ shootDates, onPick }: { shootDates: Set<string>; onPick: (d: string) => void }) {
  const [month, setMonth] = useState(new Date())
  const y = month.getFullYear()
  const m = month.getMonth()
  const offset = (new Date(y, m, 1).getDay() + 6) % 7
  const dim = new Date(y, m + 1, 0).getDate()
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)]
  const todayISO = iso(new Date())
  return (
    <section className="bg-white rounded-card shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold">{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
        <div className="flex gap-1">
          <button aria-label="Previous month" onClick={() => setMonth(new Date(y, m - 1, 1))} className="p-1.5 rounded-lg border border-line">
            <ChevronLeft size={14} />
          </button>
          <button aria-label="Next month" onClick={() => setMonth(new Date(y, m + 1, 1))} className="p-1.5 rounded-lg border border-line">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center text-[10px] text-muted mb-1">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />
          const key = iso(new Date(y, m, d))
          const isToday = key === todayISO
          return (
            <button key={i} onClick={() => onPick(key)} className="flex flex-col items-center py-0.5">
              <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold ${isToday ? 'bg-primary text-white' : ''}`}>
                {d}
              </span>
              <span className={`w-1 h-1 rounded-full mt-0.5 ${shootDates.has(key) ? 'bg-primary' : 'bg-transparent'}`} />
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default function Dashboard() {
  const { profile, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [shoots, setShoots] = useState<Shooting[] | null>(null)
  const [people, setPeople] = useState<Profile[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [error, setError] = useState(false)

  async function load() {
    setError(false)
    const [s, p, pr] = await Promise.all([
      supabase.from('shootings').select('*, shooting_crew(user_id)').order('date').order('start_time'),
      supabase.from('profiles').select('*'),
      supabase.from('projects').select('*').order('deadline'),
    ])
    if (s.error || p.error) {
      setError(true)
      return
    }
    setShoots(s.data as Shooting[])
    setPeople(p.data as Profile[])
    setProjects((pr.data as Project[]) || [])
  }

  useEffect(() => {
    load()
  }, [])

  const now = new Date()
  const todayISO = iso(now)
  const ws = weekStart(now)
  const active = (shoots || []).filter((s) => s.status !== 'cancelled')
  const today = active.filter((s) => s.date === todayISO)
  const week = active.filter((s) => s.date >= iso(ws) && s.date <= iso(addDays(ws, 6)))
  const upcoming = active.filter((s) => s.date > todayISO && s.status !== 'completed')
  const byId = new Map<string, Profile>(people.map((p) => [p.id, p] as [string, Profile]))
  const crewOf = (s: Shooting) =>
    (s.shooting_crew || []).map((c) => byId.get(c.user_id)).filter((p): p is Profile => !!p)
  const openProjects = projects.filter((p) => p.status !== 'completed')

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-8">
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">
            {greeting()}, {profile?.name?.split(' ')[0] || ''} 👋
          </h1>
          <p className="text-sm text-muted mt-1">Ready to make something great today?</p>
        </div>
        {isAdmin && (
          <Link to="/shooting/baru" className="shrink-0 flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl2">
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

      {!error && shoots === null && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-card bg-line/60 animate-pulse" />
            ))}
          </div>
          <div className="h-56 rounded-card bg-line/60 animate-pulse" />
        </div>
      )}

      {!error && shoots !== null && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <Stat icon={<CalendarDays size={18} />} label="Today's Shoots" value={today.length} sub={`${today.filter((s) => s.status === 'completed').length} completed`} tone="bg-lavender" iconTone="text-primary" />
            <Stat icon={<CalendarRange size={18} />} label="This Week" value={week.length} sub={`${upcoming.length} upcoming`} tone="bg-mint" iconTone="text-[#23734F]" />
            <Stat icon={<Users size={18} />} label="Team Members" value={people.length} sub={`${people.filter((p) => p.availability === 'on_shoot').length} on shoot`} tone="bg-yellow" iconTone="text-[#9A5B00]" />
            <Stat icon={<Folder size={18} />} label="Projects" value={projects.length} sub={`${projects.filter((p) => p.status === 'in_production').length} in production`} tone="bg-pink" iconTone="text-[#B4324A]" />
          </div>

          <div className="grid lg:grid-cols-3 gap-4 mb-4">
            <section className="bg-white rounded-card shadow-sm p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold">Today's Schedule</h2>
                <Link to="/schedule" className="text-xs font-semibold text-primary">
                  View all →
                </Link>
              </div>
              {today.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="font-semibold">Nothing scheduled today</p>
                  <p className="text-sm text-muted mt-1">Enjoy the breathing room, or plan the next shoot.</p>
                </div>
              ) : (
                <div className="divide-y divide-line">
                  {today.map((s) => (
                    <Link key={s.id} to={`/shooting/${s.id}`} className="flex items-center gap-3 py-3">
                      <span className="w-12 shrink-0 text-xs font-bold">{hm(s.start_time)}</span>
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${typeOf(s.shoot_type).dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{s.title}</p>
                        {s.location && (
                          <p className="text-xs text-muted truncate flex items-center gap-1">
                            <MapPin size={12} />
                            {s.location}
                          </p>
                        )}
                      </div>
                      <div className="hidden sm:block">
                        <AvatarGroup people={crewOf(s)} size={26} />
                      </div>
                      <ShootingStatusBadge status={s.status} />
                    </Link>
                  ))}
                </div>
              )}
            </section>
            <MiniCalendar shootDates={new Set(active.map((s) => s.date))} onPick={(d) => navigate(`/schedule?d=${d}`)} />
          </div>

          <section className="bg-white rounded-card shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold">Upcoming Projects</h2>
              <Link to="/projects" className="text-xs font-semibold text-primary">
                View all →
              </Link>
            </div>
            {openProjects.length === 0 ? (
              <p className="text-sm text-muted py-4">No active projects yet.</p>
            ) : (
              <div className="grid md:grid-cols-3 gap-3">
                {openProjects.slice(0, 3).map((p) => {
                  const st = PROJECT_STATUS[p.status]
                  return (
                    <Link key={p.id} to="/projects" className="border border-line rounded-card p-4 block">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold truncate">{p.name}</p>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${st.cls}`}>{st.label}</span>
                      </div>
                      <p className="text-xs text-muted mt-0.5">{p.type || 'Project'}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex-1">
                          <ProgressBar value={p.progress} />
                        </div>
                        <span className="text-xs font-bold">{p.progress}%</span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <AvatarGroup people={p.team.map((id) => byId.get(id)).filter((x): x is Profile => !!x)} size={24} />
                        {p.deadline && (
                          <span className="text-[11px] text-muted">
                            Due {new Date(p.deadline + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
