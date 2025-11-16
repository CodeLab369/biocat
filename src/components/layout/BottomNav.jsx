import { NavLink } from 'react-router-dom'
import { navItems } from './navConfig.js'

export const BottomNav = () => (
  <nav className="fixed bottom-3 left-1/2 z-40 w-[calc(100%-32px)] max-w-md -translate-x-1/2 rounded-3xl border border-slate-200 bg-white/90 px-4 py-2 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 md:hidden">
    <ul className="flex items-center justify-between gap-1 text-xs font-semibold">
      {navItems.slice(0, 4).map((item) => (
        <li key={item.path}>
          <NavLink
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-2xl px-3 py-2 transition ${
                isActive ? 'text-brand' : 'text-slate-500'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
)
