import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell.jsx'
import { LoginPage } from '../modules/auth/LoginPage.jsx'
import { DashboardPage } from '../modules/dashboard/DashboardPage.jsx'
import { InventoryPage } from '../modules/inventory/InventoryPage.jsx'
import { ClientsPage } from '../modules/clients/ClientsPage.jsx'
import { OrdersPage } from '../modules/orders/OrdersPage.jsx'
import { StatsPage } from '../modules/stats/StatsPage.jsx'
import { SettingsPage } from '../modules/settings/SettingsPage.jsx'
import { ProtectedRoute } from './ProtectedRoute.jsx'

export const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="inventario" element={<InventoryPage />} />
        <Route path="clientes" element={<ClientsPage />} />
        <Route path="ordenes" element={<OrdersPage />} />
        <Route path="estadisticas" element={<StatsPage />} />
        <Route path="configuracion" element={<SettingsPage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)
