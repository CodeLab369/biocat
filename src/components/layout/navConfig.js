import {
  Activity,
  Boxes,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  Users,
} from 'lucide-react'

export const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Inventario', path: '/inventario', icon: Boxes },
  { label: 'Clientes', path: '/clientes', icon: Users },
  { label: 'Órdenes', path: '/ordenes', icon: ShoppingCart },
  { label: 'Estadísticas', path: '/estadisticas', icon: Activity },
  { label: 'Configuración', path: '/configuracion', icon: Settings },
]
