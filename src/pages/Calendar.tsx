import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Shooting } from '../types'

const namaBulan = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]
const namaHari = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

export default function Calendar() {
  const [shootings, setShootings] = useState<Shooting[]>([])
  const [cursor, setCursor] = useState(new Date())

  useEffect(() => {
    supabase
      .from('shootings')
      .select('*')
      .then(({ data }) => setShootings((data as Shooting[]) || []))
  }, [])

  const year = cursor.getFullYear()
  const month = cursor.getMonth()

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const startOffset = firstDay.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: (number | null)[] = Array(startOffset).fill(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    return cells
  }, [year, month])

  function shootingsOn(day: number) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return shootings.filter((s) => s.date === iso)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <h1 className="text-2xl font-bold mb-4">Kalender</h1>

      <div className="bg-white rounded-card shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="px-3 py-1 rounded-xl2 bg-gray-100"
          >
            ‹
          </button>
          <p className="font-semibold">
            {namaBulan[month]} {year}
          </p>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="px-3 py-1 rounded-xl2 bg-gray-100"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-warmgray/60 mb-1">
          {namaHari.map((h) => (
            <div key={h}>{h}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            const eventsToday = day ? shootingsOn(day) : []
            return (
              <div key={i} className="aspect-square">
                {day && (
                  <div
                    className={`w-full h-full rounded-xl2 flex flex-col items-center justify-center text-xs ${
                      eventsToday.length > 0 ? 'bg-lavender font-semibold' : ''
                    }`}
                  >
                    <span>{day}</span>
                    {eventsToday.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5" />}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {shootings
          .filter((s) => {
            const d = new Date(s.date + 'T00:00:00')
            return d.getFullYear() === year && d.getMonth() === month
          })
          .map((s) => (
            <Link
              key={s.id}
              to={`/shooting/${s.id}`}
              className="block bg-white rounded-card shadow-sm p-3 text-sm"
            >
              <span className="font-semibold">
                {new Date(s.date + 'T00:00:00').getDate()} {namaBulan[month].slice(0, 3)}
              </span>{' '}
              — {s.title}
            </Link>
          ))}
      </div>
    </div>
  )
}
