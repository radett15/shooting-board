import { SHOOT_STATUS } from '../lib/ui'
import { ShootingStatus } from '../types'

export function ShootingStatusBadge({ status }: { status: string }) {
  const s = SHOOT_STATUS[status as ShootingStatus]
  return (
    <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${s ? s.cls : 'bg-gray-100 text-muted'}`}>
      {s ? s.label : status}
    </span>
  )
}

const dot: Record<string, string> = { pending: 'bg-yellow-dark', confirmed: 'bg-mint-dark', declined: 'bg-pink-dark' }
const label: Record<string, string> = { pending: 'Pending', confirmed: 'Confirmed', declined: 'Declined' }

export function AttendanceBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-warmgray/80">
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status] || 'bg-gray-400'}`} />
      {label[status] || status}
    </span>
  )
}
