import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header.jsx'
import { navItems } from './navConfig.js'
import { BottomNav } from './BottomNav.jsx'

export const AppShell = () => {
  const location = useLocation()

  return (
    <div className="grid min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 md:grid-cols-[230px_1fr]">
      <aside className="hidden h-screen flex-col border-r border-slate-100 bg-white/90 px-6 py-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 md:flex">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-brand">BIO - CAT</p>
          <p className="text-sm text-slate-500">Arena biodegradable</p>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive ? 'bg-brand/10 text-brand' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="relative flex min-h-screen flex-col gap-6 px-4 pb-24 pt-6 md:px-10 md:pb-10">
        <Header key={location.pathname} />
        <section className="flex-1 space-y-6">
          <Outlet />
        </section>
        <BottomNav />
      </main>
    </div>
  )
}
