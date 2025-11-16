import { Activity, BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '../../components/common/Card.jsx'
import { StatCard } from '../../components/common/StatCard.jsx'
import { useAppStore } from '../../store/appStore.js'
import { formatCurrency, formatInteger } from '../../utils/numberFormat.js'
import { countOrderStatuses, getOrderTimeline } from '../../utils/orderUtils.js'

const PIE_COLORS = ['#fbbf24', '#34d399']

export const StatsPage = () => {
  const inventory = useAppStore((state) => state.inventory)
  const orders = useAppStore((state) => state.orders)

  const totalUnits = inventory.reduce((acc, product) => acc + product.quantity, 0)
  const inventoryValue = inventory.reduce((acc, product) => acc + product.quantity * product.cost, 0)
  const potentialIncome = inventory.reduce((acc, product) => acc + product.quantity * product.price, 0)

  const statuses = countOrderStatuses(orders)
  const pieData = [
    { name: 'Pendiente', value: statuses.Pendiente },
    { name: 'Completada', value: statuses.Completada },
  ]

  const topProducts = inventory
    .slice()
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map((product) => ({ name: product.name, unidades: product.quantity }))

  const timeline = getOrderTimeline(orders)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Activity} label="Órdenes registradas" value={formatInteger(orders.length)} helper="Total histórico" />
        <StatCard icon={BarChart3} label="Inventario (unidades)" value={formatInteger(totalUnits)} helper="Suma actual" />
        <StatCard icon={TrendingUp} label="Valor inventario" value={formatCurrency(inventoryValue)} helper="Basado en costo" />
        <StatCard icon={PieChartIcon} label="Ingresos potenciales" value={formatCurrency(potentialIncome)} helper="Precios de venta" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Órdenes por estado" subtitle="Pendientes vs completadas">
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Top 5 productos" subtitle="Según unidades disponibles">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={topProducts}>
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip formatter={(value) => formatInteger(value)} />
                <Bar dataKey="unidades" fill="#1A936F" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {topProducts.map((product) => (
              <li key={product.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                <span className="font-semibold">{product.name}</span>
                <span>{formatInteger(product.unidades)} unidades</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Línea temporal de órdenes" subtitle="Totales por fecha">
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart data={timeline} margin={{ left: 0, bottom: 30 }}>
              <XAxis dataKey="date" angle={-30} textAnchor="end" height={60} />
              <YAxis tickFormatter={(value) => formatCurrency(value)} width={90} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Line type="monotone" dataKey="total" stroke="#1A936F" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
