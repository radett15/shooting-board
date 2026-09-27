const shootingStyles: Record<string, string> = {
  planning: 'bg-yellow text-warmgray',
  scheduled: 'bg-mint text-warmgray',
  completed: 'bg-lavender text-warmgray',
  cancelled: 'bg-gray-200 text-gray-500',
}

const shootingLabels: Record<string, string> = {
  planning: 'Planning',
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function ShootingStatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${shootingStyles[status] || ''}`}>
      {shootingLabels[status] || status}
    </span>
  )
}

const attendanceStyles: Record<string, string> = {
  pending: 'bg-yellow text-warmgray',
  confirmed: 'bg-mint text-warmgray',
  declined: 'bg-pink text-warmgray',
}

const attendanceLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  declined: 'Declined',
}

export function AttendanceBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${attendanceStyles[status] || ''}`}>
      {attendanceLabels[status] || status}
    </span>
  )
}
