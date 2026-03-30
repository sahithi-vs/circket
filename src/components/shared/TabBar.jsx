import { NavLink } from 'react-router-dom'
import { Home, Users, Activity, Trophy, Clock } from 'lucide-react'

const tabs = [
  { to: '/',            icon: Home,     label: 'Home'        },
  { to: '/teams',       icon: Users,    label: 'Teams'       },
  { to: '/matches',     icon: Activity, label: 'Matches'     },
  { to: '/tournaments', icon: Trophy,   label: 'Tournaments' },
  { to: '/history',     icon: Clock,    label: 'History'     },
]

export default function TabBar() {
  return (
    <nav className="tab-bar z-50">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) =>
          `tab-item ${isActive ? 'text-pitch-400' : 'text-gray-500'}`
        }>
          <Icon size={20} strokeWidth={isActive => isActive ? 2.5 : 1.8} />
          <span className="text-[10px] font-medium">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
