import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Jadwal', icon: '📋', end: true },
  { to: '/calendar', label: 'Kalender', icon: '📅' },
  { to: '/crew', label: 'Crew', icon: '👥' },
  { to: '/equipment', label: 'Gear', icon: '🎒' },
]

export default function Nav() {
  const { profile, signOut } = useAuth()

  return (
    <>
      {/* Desktop top nav */}
      <header className="hidden md:flex items-center justify-between px-6 py-4 bg-white shadow-sm sticky top-0 z-10">
        <span className="font-bold text-lg">🎬 Shooting Board</span>
        <nav className="flex gap-2">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl2 text-sm font-medium ${
                  isActive ? 'bg-pink text-warmgray' : 'text-warmgray/70 hover:bg-pink/50'
                }`
              }
            >
              {l.icon} {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-warmgray/70">
            {profile?.name} · {profile?.role === 'admin' ? 'Admin' : 'Crew'}
          </span>
          <button onClick={signOut} className="text-pink-dark font-semibold">
            Keluar
          </button>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-pink/50 flex justify-around py-2 z-10">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `flex flex-col items-center text-xs px-3 py-1 rounded-xl2 ${
                isActive ? 'text-pink-dark font-semibold' : 'text-warmgray/60'
              }`
            }
          >
            <span className="text-lg">{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
