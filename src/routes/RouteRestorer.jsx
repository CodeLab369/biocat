import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const STORAGE_KEY = 'biocat-redirect-path'

export const RouteRestorer = () => {
  const navigate = useNavigate()

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const pendingPath = window.sessionStorage.getItem(STORAGE_KEY)
      if (pendingPath) {
        window.sessionStorage.removeItem(STORAGE_KEY)
        navigate(pendingPath, { replace: true })
      }
    } catch (error) {
      console.warn('No se pudo restaurar la ruta previa:', error)
    }
  }, [navigate])

  return null
}
