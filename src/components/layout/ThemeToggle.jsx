import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeProvider.jsx'

export const ThemeToggle = () => {
  const { mode, resolved, setThemeMode } = useTheme()
  const nextModes = ['light', 'dark', 'system']
  const handleClick = () => {
    const currentIndex = nextModes.indexOf(mode)
    const nextMode = nextModes[(currentIndex + 1) % nextModes.length]
    setThemeMode(nextMode)
  }

  return (
    <button
      type="button"
      aria-label="Cambiar tema"
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    >
      {resolved === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      {mode === 'system' ? 'Sistema' : mode === 'dark' ? 'Oscuro' : 'Claro'}
    </button>
  )
}
