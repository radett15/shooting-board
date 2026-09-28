import { Link } from 'react-router-dom'
import { Shooting } from '../types'
import { ShootingStatusBadge } from './StatusBadge'

const bulanIndo = [
  'JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES',
]

export default function ShootingCard({ shooting }: { shooting: Shooting }) {
  const d = new Date(shooting.date + 'T00:00:00')
  const tanggal = d.getDate()
  const bulan = bulanIndo[d.getMonth()]

  return (
    <Link
      to={`/shooting/${shooting.id}`}
      className="flex bg-white rounded-card shadow-sm hover:shadow-md transition p-4 gap-4 items-center"
    >
      <div className="flex flex-col items-center justify-center border border-line rounded-xl2 w-14 h-14 shrink-0">
        <span className="text-lg font-display font-semibold leading-none">{tanggal}</span>
        <span className="text-[10px] font-medium text-warmgray/60 mt-0.5">{bulan}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold truncate">{shooting.title}</p>
        {shooting.call_time && (
          <p className="text-xs text-warmgray/70">⏰ {shooting.call_time.slice(0, 5)} Call Time</p>
        )}
        <p className="text-xs text-warmgray/70">
          {shooting.start_time.slice(0, 5)}–{shooting.end_time.slice(0, 5)}
        </p>
        {shooting.location && (
          <p className="text-xs text-warmgray/70 truncate">📍 {shooting.location}</p>
        )}
      </div>
      <ShootingStatusBadge status={shooting.status} />
    </Link>
  )
}
