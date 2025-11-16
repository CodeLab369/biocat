import { Navigate, Outlet } from 'react-router-dom'
import { useAppStore } from '../store/appStore.js'

export const ProtectedRoute = () => {
  const session = useAppStore((state) => state.auth.session)
  if (!session) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
