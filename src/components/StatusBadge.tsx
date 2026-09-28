const dotColor: Record<string, string> = {
  planning: 'bg-yellow-dark',
  scheduled: 'bg-mint-dark',
  completed: 'bg-lavender-dark',
  cancelled: 'bg-gray-400',
  pending: 'bg-yellow-dark',
  confirmed: 'bg-mint-dark',
  declined: 'bg-pink-dark',
}

const shootingLabels: Record<string, string> = {
  planning: 'Planning',
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function ShootingStatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-warmgray/80">
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor[status] || 'bg-gray-400'}`} />
      {shootingLabels[status] || status}
    </span>
  )
}

const attendanceLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  declined: 'Declined',
}

export function AttendanceBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-warmgray/80">
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor[status] || 'bg-gray-400'}`} />
      {attendanceLabels[status] || status}
    </span>
  )
}
