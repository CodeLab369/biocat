import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAppStore } from '../store/appStore.js'

const ThemeContext = createContext({ mode: 'system', resolved: 'light', setThemeMode: () => undefined })

export const ThemeProvider = ({ children }) => {
  const mode = useAppStore((state) => state.theme.mode ?? 'system')
  const setThemeMode = useAppStore((state) => state.setThemeMode)
  const [systemMode, setSystemMode] = useState('light')

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event) => {
      setSystemMode(event.matches ? 'dark' : 'light')
    }
    setSystemMode(media.matches ? 'dark' : 'light')
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.classList.toggle('dark', (mode === 'system' ? systemMode : mode) === 'dark')
  }, [mode, systemMode])

  const value = useMemo(
    () => ({
      mode,
      resolved: mode === 'system' ? systemMode : mode,
      setThemeMode,
    }),
    [mode, setThemeMode, systemMode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
