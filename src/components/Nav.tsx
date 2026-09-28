import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, CalendarRange, Users, Camera, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Dashboard', short: 'Home', icon: LayoutDashboard, end: true },
  { to: '/schedule', label: 'Schedule', short: 'Schedule', icon: CalendarDays },
  { to: '/calendar', label: 'Calendar', short: 'Calendar', icon: CalendarRange },
  { to: '/crew', label: 'Team', short: 'Team', icon: Users },
  { to: '/equipment', label: 'Gear', short: 'Gear', icon: Camera },
]

function initials(name?: string) {
  return (name || '?').split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-10 h-10 rounded-xl2 bg-primary text-white flex items-center justify-center">
        <Camera size={20} />
      </div>
      <div className="leading-tight">
        <p className="font-bold text-base">ShootFlow</p>
        <p className="text-[11px] text-muted">Production Planner</p>
      </div>
    </div>
  )
}

export default function Nav() {
  const { profile, signOut } = useAuth()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col bg-white border-r border-line p-4 z-10">
        <div className="px-2 py-2 mb-6">
          <Logo />
        </div>
        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-cream'
                }`
              }
            >
              <l.icon size={18} />
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-3 border-t border-line pt-4">
          <div className="w-9 h-9 rounded-full bg-primary-soft text-primary text-xs font-bold flex items-center justify-center">
            {initials(profile?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{profile?.name}</p>
            <p className="text-[11px] text-muted">{profile?.role === 'admin' ? 'ADMIN' : 'CREW'}</p>
          </div>
          <button onClick={signOut} aria-label="Sign out" className="text-muted hover:text-primary">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-line sticky top-0 z-10">
        <Logo />
        <button onClick={signOut} aria-label="Sign out" className="text-muted p-2">
          <LogOut size={20} />
        </button>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-line flex justify-around py-2 z-10">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-[11px] px-2 py-1 min-w-[56px] ${
                isActive ? 'text-primary font-semibold' : 'text-muted'
              }`
            }
          >
            <l.icon size={20} />
            {l.short}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
