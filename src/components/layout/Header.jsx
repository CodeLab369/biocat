import { LogOut } from 'lucide-react'
import { useAppStore } from '../../store/appStore.js'
import { Button } from '../common/Button.jsx'
import { ThemeToggle } from './ThemeToggle.jsx'

export const Header = () => {
  const session = useAppStore((state) => state.auth.session)
  const logout = useAppStore((state) => state.logout)

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Bienvenida</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          {session?.username || 'BIO - CAT'}
        </h1>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <ThemeToggle />
        <Button variant="secondary" size="sm" icon={LogOut} onClick={logout}>
          Salir
        </Button>
      </div>
    </header>
  )
}
