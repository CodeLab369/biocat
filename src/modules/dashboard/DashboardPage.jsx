import { ArrowRightCircle, Boxes, ShoppingCart, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/common/Card.jsx'
import { StatCard } from '../../components/common/StatCard.jsx'
import { Badge } from '../../components/common/Badge.jsx'
import { Button } from '../../components/common/Button.jsx'
import { Table } from '../../components/common/Table.jsx'
import { useAppStore } from '../../store/appStore.js'
import { formatCurrency, formatDecimal, formatInteger } from '../../utils/numberFormat.js'

export const DashboardPage = () => {
  const inventory = useAppStore((state) => state.inventory)
  const orders = useAppStore((state) => state.orders)
  const clients = useAppStore((state) => state.clients)
  const lowStockThreshold = useAppStore((state) => state.settings?.lowStockThreshold ?? 20)

  const totalUnits = inventory.reduce((acc, product) => acc + product.quantity, 0)
  const inventoryValue = inventory.reduce((acc, product) => acc + product.quantity * product.cost, 0)
  const potentialIncome = inventory.reduce((acc, product) => acc + product.quantity * product.price, 0)
  const pendingOrders = orders.filter((order) => order.status === 'Pendiente').length

  const recentOrders = orders.slice(0, 5)
  const lowStock = inventory
    .filter((product) => product.quantity < lowStockThreshold)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Boxes} label="Unidades en inventario" value={formatInteger(totalUnits)} helper="Suma total disponible" />
        <StatCard icon={ShoppingCart} label="Órdenes pendientes" value={pendingOrders} helper="Esperando confirmación" />
        <StatCard icon={Users} label="Clientes activos" value={clients.length} helper="Registros totales" />
        <StatCard icon={ArrowRightCircle} label="Valor inventario" value={formatCurrency(inventoryValue)} helper="Costo total" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        <Card
          title="Órdenes recientes"
          subtitle="Últimas actividades"
          actions={
            <Button as={Link} to="/ordenes" size="sm" variant="secondary">
              Ver todas
            </Button>
          }
        >
          <Table
            columns={[
              { key: 'id', label: 'ID' },
              {
                key: 'clientId',
                label: 'Cliente',
                render: (value) => clients.find((client) => client.id === value)?.name || 'N/A',
              },
              {
                key: 'total',
                label: 'Total',
                render: (value) => formatCurrency(value),
              },
              {
                key: 'status',
                label: 'Estado',
                render: (value) => (
                  <Badge variant={value === 'Completada' ? 'success' : 'warning'}>{value}</Badge>
                ),
              },
            ]}
            data={recentOrders}
            emptyMessage="Aún no hay órdenes registradas"
          />
        </Card>

        <Card
          title="Alertas de stock"
          subtitle={`Productos con menos de ${lowStockThreshold} unidades`}
          actions={
            <Button as={Link} to="/inventario" size="sm" variant="secondary">
              Administrar
            </Button>
          }
        >
          <Table
            columns={[
              { key: 'name', label: 'Producto' },
              { key: 'location', label: 'Ubicación' },
              {
                key: 'quantity',
                label: 'Cantidad',
                render: (value) => formatInteger(value),
              },
              {
                key: 'price',
                label: 'Precio venta',
                render: (value) => formatDecimal(value),
              },
            ]}
            data={lowStock}
            emptyMessage="No hay alertas por el momento"
          />
        </Card>
      </div>

      <Card title="Resumen financiero" subtitle="Valores estimados basados en inventario actual">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Valor total del inventario</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(inventoryValue)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Ingresos potenciales</p>
            <p className="text-3xl font-bold text-brand">{formatCurrency(potentialIncome)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Margen proyectado</p>
            <p className="text-3xl font-bold text-emerald-500">
              {formatCurrency(potentialIncome - inventoryValue)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
