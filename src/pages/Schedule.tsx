import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { Profile, Shooting, ShootType } from '../types'
import { useAuth } from '../context/AuthContext'
import { addDays, hm, iso, mins, parse, weekStart } from '../lib/dates'
import { AvatarGroup, TYPES, typeOf } from '../lib/ui'
import { ShootingStatusBadge } from '../components/StatusBadge'

type View = 'month' | 'week' | 'day'
const START_H = 7
const END_H = 21
const ROW = 52
const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleDateString('en-US', o)

function DayList({ items, crewOf }: { items: Shooting[]; crewOf: (s: Shooting) => Profile[] }) {
  if (items.length === 0) {
    return (
      <div className="bg-white border border-line rounded-card p-8 text-center">
        <p className="font-semibold">No shoots this day</p>
        <p className="text-sm text-muted mt-1">Your production calendar has some breathing room.</p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {items.map((s) => {
        const t = typeOf(s.shoot_type)
        return (
          <Link key={s.id} to={`/shooting/${s.id}`} className="flex gap-3">
            <div className="w-12 shrink-0 pt-3 text-xs font-semibold text-muted">{hm(s.start_time)}</div>
            <div className={`flex-1 min-w-0 rounded-card border-l-4 p-3 ${t.soft} ${t.bar} ${s.status === 'cancelled' ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <p className={`font-bold truncate ${t.text}`}>{s.title}</p>
                <ShootingStatusBadge status={s.status} />
              </div>
              <p className="text-xs text-muted mt-0.5">
                {hm(s.start_time)}–{hm(s.end_time)}
                {s.location ? ` · ${s.location}` : ''}
              </p>
              <div className="mt-2">
                <AvatarGroup people={crewOf(s)} size={24} />
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

export default function Schedule() {
  const { isAdmin } = useAuth()
  const [sp] = useSearchParams()
  const initial = sp.get('d')
  const [view, setView] = useState<View>(initial ? 'day' : 'week')
  const [cursor, setCursor] = useState<Date>(initial ? parse(initial) : new Date())
  const [filter, setFilter] = useState<'all' | ShootType>('all')
  const [shoots, setShoots] = useState<Shooting[] | null>(null)
  const [people, setPeople] = useState<Profile[]>([])
  const [error, setError] = useState(false)

  async function load() {
    setError(false)
    const [s, p] = await Promise.all([
      supabase.from('shootings').select('*, shooting_crew(user_id)').order('start_time'),
      supabase.from('profiles').select('*'),
    ])
    if (s.error) {
      setError(true)
      return
    }
    setShoots(s.data as Shooting[])
    setPeople((p.data as Profile[]) || [])
  }

  useEffect(() => {
    load()
  }, [])

  const byId = new Map<string, Profile>(people.map((p) => [p.id, p] as [string, Profile]))
  const crewOf = (s: Shooting) =>
    (s.shooting_crew || []).map((c) => byId.get(c.user_id)).filter((p): p is Profile => !!p)
  const list = (shoots || []).filter((s) => filter === 'all' || (s.shoot_type || 'video') === filter)
  const dayShoots = (d: string) => list.filter((s) => s.date === d)
  const todayISO = iso(new Date())
  const ws = weekStart(cursor)
  const days = Array.from({ length: 7 }, (_, i) => addDays(ws, i))

  function shift(dir: number) {
    if (view === 'month') setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + dir, 1))
    else setCursor(addDays(cursor, dir * (view === 'week' ? 7 : 1)))
  }

  const label =
    view === 'month'
      ? fmt(cursor, { month: 'long', year: 'numeric' })
      : view === 'week'
        ? `${fmt(days[0], { month: 'short', day: 'numeric' })} – ${fmt(days[6], { month: 'short', day: 'numeric', year: 'numeric' })}`
        : fmt(cursor, { weekday: 'long', month: 'short', day: 'numeric' })

  const hours = Array.from({ length: END_H - START_H }, (_, i) => START_H + i)

  // month grid
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const offset = (first.getDay() + 6) % 7
  const dim = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
  const monthCells = Array.from({ length: Math.ceil((offset + dim) / 7) * 7 }, (_, i) => addDays(weekStart(first), i))

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-8">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-extrabold">Schedule</h1>
          <p className="text-sm text-muted mt-1">Plan every shoot without the chaos.</p>
        </div>
        {isAdmin && (
          <Link to="/shooting/baru" className="shrink-0 flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl2">
            <Plus size={16} /> Add Shoot
          </Link>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="flex bg-white border border-line rounded-xl2 p-1">
          {(['month', 'week', 'day'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize ${view === v ? 'bg-primary text-white' : 'text-muted'}`}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button aria-label="Previous" onClick={() => shift(-1)} className="p-2 rounded-xl2 border border-line bg-white">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold px-2 min-w-[150px] text-center">{label}</span>
          <button aria-label="Next" onClick={() => shift(1)} className="p-2 rounded-xl2 border border-line bg-white">
            <ChevronRight size={16} />
          </button>
          <button onClick={() => setCursor(new Date())} className="ml-1 text-xs font-semibold text-primary px-2">
            Today
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {(['all', 'photo', 'video', 'event', 'other'] as const).map((f) => {
          const on = filter === f
          const t = f === 'all' ? null : TYPES[f]
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
                on ? (t ? `${t.soft} ${t.text} border-transparent` : 'bg-primary text-white border-primary') : 'bg-white text-muted border-line'
              }`}
            >
              {t && <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${t.dot}`} />}
              {t ? t.label : 'All'}
            </button>
          )
        })}
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

      {!error && shoots === null && <div className="h-80 rounded-card bg-line/60 animate-pulse" />}

      {!error && shoots !== null && shoots.length === 0 && (
        <div className="bg-white rounded-card shadow-sm p-8 text-center mb-4">
          <p className="font-semibold">No shoots scheduled yet</p>
          <p className="text-sm text-muted mt-1">Your production calendar is waiting for its first shoot.</p>
          {isAdmin && (
            <Link to="/shooting/baru" className="inline-block mt-4 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl2">
              + Create First Shoot
            </Link>
          )}
        </div>
      )}

      {!error && shoots !== null && view === 'week' && (
        <>
          <div className="hidden md:block bg-white border border-line rounded-card overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-line">
                <div />
                {days.map((d) => {
                  const isT = iso(d) === todayISO
                  return (
                    <button key={iso(d)} onClick={() => { setCursor(d); setView('day') }} className={`py-2 text-center ${isT ? 'bg-primary-soft' : ''}`}>
                      <p className="text-[11px] text-muted">{fmt(d, { weekday: 'short' })}</p>
                      <p className={`text-sm font-bold ${isT ? 'text-primary' : ''}`}>{d.getDate()}</p>
                    </button>
                  )
                })}
              </div>
              <div className="grid grid-cols-[56px_repeat(7,1fr)]">
                <div>
                  {hours.map((h) => (
                    <div key={h} style={{ height: ROW }} className="text-[11px] text-muted text-right pr-2">
                      {String(h).padStart(2, '0')}:00
                    </div>
                  ))}
                </div>
                {days.map((d) => (
                  <div key={iso(d)} className={`relative border-l border-line ${iso(d) === todayISO ? 'bg-primary-soft/40' : ''}`} style={{ height: hours.length * ROW }}>
                    {hours.map((h, i) => (
                      <div key={h} className="absolute left-0 right-0 border-t border-line/70" style={{ top: i * ROW }} />
                    ))}
                    {dayShoots(iso(d)).map((s) => {
                      const t = typeOf(s.shoot_type)
                      const top = Math.max(0, ((mins(s.start_time) - START_H * 60) / 60) * ROW)
                      const height = Math.max(36, ((mins(s.end_time) - mins(s.start_time)) / 60) * ROW)
                      return (
                        <Link
                          key={s.id}
                          to={`/shooting/${s.id}`}
                          style={{ top, height }}
                          className={`absolute left-1 right-1 rounded-lg border-l-4 px-1.5 py-1 overflow-hidden ${t.soft} ${t.bar} ${s.status === 'cancelled' ? 'opacity-50' : ''}`}
                        >
                          <p className={`text-[11px] font-bold leading-tight truncate ${t.text}`}>{s.title}</p>
                          <p className="text-[10px] text-muted truncate">
                            {hm(s.start_time)}–{hm(s.end_time)}
                          </p>
                          {s.location && height > 56 && <p className="text-[10px] text-muted truncate">{s.location}</p>}
                        </Link>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:hidden">
            <div className="grid grid-cols-7 gap-1 mb-4">
              {days.map((d) => {
                const on = iso(d) === iso(cursor)
                const has = dayShoots(iso(d)).length > 0
                return (
                  <button key={iso(d)} onClick={() => setCursor(d)} className={`py-2 rounded-xl2 text-center border ${on ? 'bg-primary text-white border-primary' : 'bg-white border-line'}`}>
                    <p className={`text-[10px] ${on ? 'text-white/80' : 'text-muted'}`}>{fmt(d, { weekday: 'short' })}</p>
                    <p className="text-sm font-bold">{d.getDate()}</p>
                    <span className={`block mx-auto mt-0.5 w-1 h-1 rounded-full ${has ? (on ? 'bg-white' : 'bg-primary') : 'bg-transparent'}`} />
                  </button>
                )
              })}
            </div>
            <DayList items={dayShoots(iso(cursor))} crewOf={crewOf} />
          </div>
        </>
      )}

      {!error && shoots !== null && view === 'day' && <DayList items={dayShoots(iso(cursor))} crewOf={crewOf} />}

      {!error && shoots !== null && view === 'month' && (
        <div className="grid grid-cols-7 border-r border-b border-line rounded-card overflow-hidden bg-white">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="border-t border-l border-line py-2 text-center text-[11px] font-semibold text-muted">
              {d}
            </div>
          ))}
          {monthCells.map((d) => {
            const items = dayShoots(iso(d))
            const inMonth = d.getMonth() === cursor.getMonth()
            return (
              <button
                key={iso(d)}
                onClick={() => { setCursor(d); setView('day') }}
                className={`min-h-[64px] md:min-h-[96px] border-t border-l border-line p-1.5 text-left align-top ${inMonth ? 'bg-white' : 'bg-cream'}`}
              >
                <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-semibold ${iso(d) === todayISO ? 'bg-primary text-white' : inMonth ? '' : 'text-muted/50'}`}>
                  {d.getDate()}
                </span>
                <div className="hidden md:block mt-1 space-y-0.5">
                  {items.slice(0, 2).map((s) => {
                    const t = typeOf(s.shoot_type)
                    return (
                      <div key={s.id} className={`text-[10px] font-semibold truncate rounded px-1 py-0.5 ${t.soft} ${t.text}`}>
                        {s.title}
                      </div>
                    )
                  })}
                  {items.length > 2 && <p className="text-[10px] text-muted">+{items.length - 2} more</p>}
                </div>
                <div className="md:hidden flex gap-0.5 mt-1 flex-wrap">
                  {items.slice(0, 3).map((s) => (
                    <span key={s.id} className={`w-1.5 h-1.5 rounded-full ${typeOf(s.shoot_type).dot}`} />
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-4 mt-5 text-xs text-muted">
        {(Object.keys(TYPES) as ShootType[]).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${TYPES[k].dot}`} />
            {TYPES[k].label}
          </span>
        ))}
      </div>
    </div>
  )
}
