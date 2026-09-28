import { ReactNode } from 'react'
import { X } from 'lucide-react'
import { ProjectStatus, ShootType, ShootingStatus } from '../types'

export const TYPES: Record<ShootType, { label: string; soft: string; bar: string; text: string; dot: string }> = {
  photo: { label: 'Photo', soft: 'bg-mint', bar: 'border-mint-dark', text: 'text-[#23734F]', dot: 'bg-mint-dark' },
  video: { label: 'Video', soft: 'bg-lavender', bar: 'border-primary', text: 'text-[#5B4FD6]', dot: 'bg-primary' },
  event: { label: 'Event', soft: 'bg-yellow', bar: 'border-yellow-dark', text: 'text-[#9A5B00]', dot: 'bg-yellow-dark' },
  other: { label: 'Other', soft: 'bg-pink', bar: 'border-pink-dark', text: 'text-[#B4324A]', dot: 'bg-pink-dark' },
}
export const typeOf = (t?: string | null) => TYPES[(t as ShootType) in TYPES ? (t as ShootType) : 'video']

export const PROJECT_STATUS: Record<ProjectStatus, { label: string; cls: string }> = {
  planning: { label: 'Planning', cls: 'bg-yellow text-[#9A5B00]' },
  pre_production: { label: 'Pre-production', cls: 'bg-pink text-[#B4324A]' },
  in_production: { label: 'In Production', cls: 'bg-lavender text-[#5B4FD6]' },
  editing: { label: 'Editing', cls: 'bg-mint text-[#23734F]' },
  completed: { label: 'Completed', cls: 'bg-mint text-[#23734F]' },
  on_hold: { label: 'On Hold', cls: 'bg-gray-100 text-muted' },
}

export const SHOOT_STATUS: Record<ShootingStatus, { label: string; cls: string }> = {
  planning: { label: 'Planning', cls: 'bg-yellow text-[#9A5B00]' },
  scheduled: { label: 'Scheduled', cls: 'bg-mint text-[#23734F]' },
  completed: { label: 'Completed', cls: 'bg-lavender text-[#5B4FD6]' },
  cancelled: { label: 'Cancelled', cls: 'bg-gray-100 text-muted' },
}

const AV = ['bg-primary', 'bg-[#2F9468]', 'bg-[#D9822B]', 'bg-[#DB4B66]']
type P = { id: string; name: string }

export function initials(name?: string) {
  return (name || '?').split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

export function Avatar({ p, size = 28 }: { p: P; size?: number }) {
  let h = 0
  for (const c of p.id) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return (
    <span
      title={p.name}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className={`inline-flex items-center justify-center rounded-full text-white font-bold ring-2 ring-white shrink-0 ${AV[h % AV.length]}`}
    >
      {initials(p.name)}
    </span>
  )
}

export function AvatarGroup({ people, max = 3, size = 28 }: { people: P[]; max?: number; size?: number }) {
  const shown = people.slice(0, max)
  const extra = people.length - shown.length
  if (people.length === 0) return <span className="text-xs text-muted">No team yet</span>
  return (
    <div className="flex -space-x-2">
      {shown.map((p) => (
        <Avatar key={p.id} p={p} size={size} />
      ))}
      {extra > 0 && (
        <span
          style={{ width: size, height: size, fontSize: size * 0.36 }}
          className="inline-flex items-center justify-center rounded-full bg-primary-soft text-primary font-bold ring-2 ring-white"
        >
          +{extra}
        </span>
      )}
    </div>
  )
}

export function ProgressBar({ value }: { value: number }) {
  const v = Math.min(100, Math.max(0, value))
  return (
    <div
      className="h-2 rounded-full bg-primary-soft overflow-hidden"
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-full rounded-full bg-primary" style={{ width: `${v}%` }} />
    </div>
  )
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-30 bg-warmgray/40 flex items-end md:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white w-full md:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-card md:rounded-card p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-muted p-1">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
