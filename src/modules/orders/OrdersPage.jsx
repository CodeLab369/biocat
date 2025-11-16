import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  BadgeCheck,
  ClipboardList,
  Edit3,
  ListPlus,
  Plus,
  Trash2,
  UserRound,
} from 'lucide-react'
import { Button } from '../../components/common/Button.jsx'
import { Card } from '../../components/common/Card.jsx'
import { EmptyState } from '../../components/common/EmptyState.jsx'
import { Input } from '../../components/common/Input.jsx'
import { Modal } from '../../components/common/Modal.jsx'
import { Pagination } from '../../components/common/Pagination.jsx'
import { Select } from '../../components/common/Select.jsx'
import { Table } from '../../components/common/Table.jsx'
import { Badge } from '../../components/common/Badge.jsx'
import { useAppStore } from '../../store/appStore.js'
import {
  formatCurrency,
  formatDecimal,
  formatInteger,
  parseLocaleNumber,
} from '../../utils/numberFormat.js'

const PAGE_SIZE_OPTIONS = [5, 10, 50]

const PAYMENT_METHODS = ['Efectivo', 'QR', 'Transferencia', 'Otro']

const normalizePaymentMethod = (method = PAYMENT_METHODS[0]) =>
  PAYMENT_METHODS.includes(method) ? method : PAYMENT_METHODS[0]

const createEmptyForm = () => ({
  clientId: '',
  items: [{ productId: '', quantity: 1 }],
  discount: '0',
  paymentMethod: normalizePaymentMethod(),
})

export const OrdersPage = () => {
  const inventory = useAppStore((state) => state.inventory)
  const clients = useAppStore((state) => state.clients)
  const orders = useAppStore((state) => state.orders)
  const addOrder = useAppStore((state) => state.addOrder)
  const updateOrder = useAppStore((state) => state.updateOrder)
  const removeOrder = useAppStore((state) => state.removeOrder)
  const clearOrders = useAppStore((state) => state.clearOrders)
  const completeOrder = useAppStore((state) => state.completeOrder)

  const [modalType, setModalType] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [form, setForm] = useState(() => createEmptyForm())
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const clientName = clients.find((client) => client.id === order.clientId)?.name || ''
      return clientName.toLowerCase().includes(search.toLowerCase())
    })
  }, [orders, clients, search])

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / rowsPerPage))
  const paginated = filteredOrders.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const detailedItems = (items) =>
    items.map((item) => {
      const product = inventory.find((prod) => prod.id === item.productId)
      const price = product?.price ?? item.price ?? 0
      const quantity = Math.max(0, Number(item.quantity) || 0)
      return {
        ...item,
        product,
        location: product?.location || item.location || 'Sin ubicación',
        price,
        subtotal: quantity * price,
      }
    })

  const currentItems = detailedItems(form.items)
  const subtotal = currentItems.reduce((acc, item) => acc + item.subtotal, 0)
  const discountValue = Math.max(0, Math.min(subtotal, parseLocaleNumber(form.discount)))
  const formTotal = Math.max(0, subtotal - discountValue)

  const selectedOrderDetails = selectedOrder ? detailedItems(selectedOrder.items) : []
  const selectedOrderSubtotal =
    selectedOrder?.subtotal ??
    (selectedOrderDetails.length
      ? selectedOrderDetails.reduce((acc, item) => acc + item.subtotal, 0)
      : 0)

  const resetForm = () => {
    setForm(createEmptyForm())
    setSelectedOrder(null)
  }

  const closeModal = () => {
    setModalType(null)
    resetForm()
  }

  const openForm = (order) => {
    if (order) {
      setSelectedOrder(order)
      setForm({
        clientId: order.clientId,
        items: order.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        discount: formatDecimal(order.discount || 0),
        paymentMethod: normalizePaymentMethod(order.paymentMethod),
      })
      setModalType('edit')
    } else {
      resetForm()
      setModalType('create')
    }
  }

  const handleFormSubmit = (event) => {
    event?.preventDefault()
    if (!form.clientId) {
      toast.error('Selecciona un cliente')
      return
    }
    const validItems = form.items.filter((item) => item.productId && item.quantity > 0)
    if (!validItems.length) {
      toast.error('Agrega al menos un producto')
      return
    }
    if (modalType === 'edit' && selectedOrder) {
      updateOrder(selectedOrder.id, {
        clientId: form.clientId,
        items: validItems,
        discount: discountValue,
        paymentMethod: normalizePaymentMethod(form.paymentMethod),
      })
      toast.success('Orden actualizada')
    } else {
      addOrder({
        clientId: form.clientId,
        items: validItems,
        discount: discountValue,
        paymentMethod: normalizePaymentMethod(form.paymentMethod),
      })
      toast.success('Orden creada')
    }
    closeModal()
  }

  const handleComplete = (order) => {
    const result = completeOrder(order.id)
    if (result.ok) {
      toast.success('Orden completada e inventario actualizado')
    } else {
      toast.error(result.message)
    }
  }

  const handleDelete = () => {
    if (selectedOrder) {
      removeOrder(selectedOrder.id)
      toast.success('Orden eliminada')
    }
    closeModal()
  }

  const handleClear = () => {
    clearOrders()
    toast.success('Lista de órdenes vaciada')
    closeModal()
  }

  const handleItemChange = (index, field, value) => {
    setForm((prev) => {
      const nextItems = prev.items.map((item, idx) => {
        if (idx !== index) return item
        if (field === 'quantity') {
          const raw = Number(value)
          const requested = Number.isFinite(raw) ? raw : 1
          if (!item.productId) {
            return { ...item, quantity: Math.max(1, requested) }
          }
          const product = inventory.find((prod) => prod.id === item.productId)
          if (!product) {
            return { ...item, quantity: Math.max(1, requested) }
          }
          if (product.quantity <= 0) {
            toast.warning('Sin stock disponible para este producto')
            return { ...item, quantity: 0 }
          }
          const limited = Math.min(Math.max(1, requested), product.quantity)
          if (requested > product.quantity) {
            toast.warning(`Solo hay ${product.quantity} unidades en inventario`)
          }
          return { ...item, quantity: limited }
        }
        if (field === 'productId') {
          const nextProduct = inventory.find((prod) => prod.id === value)
          if (!nextProduct) {
            return { ...item, productId: value }
          }
          if (nextProduct.quantity <= 0) {
            toast.warning('Este producto no tiene stock disponible')
            return { ...item, productId: value, quantity: 0 }
          }
          const adjustedQuantity = Math.min(Math.max(1, item.quantity || 1), nextProduct.quantity)
          if ((item.quantity || 1) > nextProduct.quantity) {
            toast.warning(`Solo hay ${nextProduct.quantity} unidades en inventario`)
          }
          return { ...item, productId: value, quantity: adjustedQuantity }
        }
        return { ...item, [field]: value }
      })
      return { ...prev, items: nextItems }
    })
  }

  const addLine = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, { productId: '', quantity: 1 }] }))
  }

  const removeLine = (index) => {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, idx) => idx !== index) }))
  }

  return (
    <div className="space-y-6">
      <Card
        title="Órdenes de venta"
        subtitle="Controla el flujo de pedidos"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" icon={ListPlus} onClick={() => openForm()}>
              Crear orden
            </Button>
            <Button size="sm" variant="danger" icon={Trash2} onClick={() => setModalType('clear')}>
              Vaciar lista
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input label="Buscar por cliente" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <div className="mt-6">
          {paginated.length ? (
            <>
              <Table
                columns={[
                  {
                    key: 'clientId',
                    label: 'Cliente',
                    render: (value) => clients.find((client) => client.id === value)?.name || 'N/A',
                  },
                  {
                    key: 'items',
                    label: 'Productos',
                    render: (value) => `${value.length} ítem(s)`,
                  },
                  {
                    key: 'paymentMethod',
                    label: 'Pago',
                    render: (value) => value || 'Efectivo',
                  },
                  {
                    key: 'total',
                    label: 'Total',
                    render: (value) => formatCurrency(value),
                  },
                  {
                    key: 'discount',
                    label: 'Descuento',
                    render: (value) => (value ? formatCurrency(value) : '—'),
                  },
                  {
                    key: 'status',
                    label: 'Estado',
                    render: (value) => (
                      <Badge variant={value === 'Completada' ? 'success' : 'warning'}>{value}</Badge>
                    ),
                  },
                ]}
                data={paginated}
                renderRowActions={(order) => (
                  <div className="flex justify-end gap-2">
                    {order.status === 'Pendiente' ? (
                      <button
                        type="button"
                        className="rounded-full bg-emerald-50 p-2 text-emerald-600 hover:text-emerald-700"
                        onClick={() => handleComplete(order)}
                        title="Cambiar a completada"
                      >
                        <BadgeCheck className="h-4 w-4" />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="rounded-full bg-slate-100 p-2 text-slate-500 hover:text-brand"
                      onClick={() => {
                        setSelectedOrder(order)
                        setModalType('view')
                      }}
                    >
                      <ClipboardList className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="rounded-full bg-slate-100 p-2 text-slate-500 hover:text-brand"
                      onClick={() => openForm(order)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="rounded-full bg-red-50 p-2 text-red-500 hover:text-red-600"
                      onClick={() => {
                        setSelectedOrder(order)
                        setModalType('delete')
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              />
              <Pagination
                page={page}
                totalPages={totalPages}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(value) => {
                  setRowsPerPage(value)
                  setPage(1)
                }}
                onPageChange={setPage}
                rowsPerPageOptions={PAGE_SIZE_OPTIONS}
              />
            </>
          ) : (
            <EmptyState
              icon={ClipboardList}
              title="Aún no hay órdenes"
              description="Crea tu primer orden de venta"
              action={
                <Button size="sm" icon={Plus} onClick={() => openForm()}>
                  Nueva orden
                </Button>
              }
            />
          )}
        </div>
      </Card>

      <Modal
        open={modalType === 'create' || modalType === 'edit'}
        title={modalType === 'edit' ? 'Editar orden' : 'Nueva orden'}
        onClose={closeModal}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" form="order-form">
              Guardar orden
            </Button>
          </>
        }
      >
        <form id="order-form" className="space-y-4" onSubmit={handleFormSubmit}>
          <Select
            label="Cliente"
            value={form.clientId}
            onChange={(event) => setForm((prev) => ({ ...prev, clientId: event.target.value }))}
            className="w-full"
            required
          >
            <option value="">Selecciona un cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </Select>
          <div className="space-y-3">
            {currentItems.map((item, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-2xl border border-slate-100 p-3 dark:border-slate-800 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto]"
              >
                <Select
                  label="Producto"
                  value={item.productId}
                  onChange={(event) => handleItemChange(index, 'productId', event.target.value)}
                  className="w-full"
                  required
                >
                  <option value="">Selecciona producto</option>
                  {inventory.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.location || 'Sin ubicación'}) — stock {product.quantity}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Cantidad"
                  type="number"
                  min={item.product?.quantity > 0 ? 1 : 0}
                  max={item.product?.quantity > 0 ? item.product.quantity : undefined}
                  value={item.quantity}
                  onChange={(event) => handleItemChange(index, 'quantity', event.target.value)}
                  className="w-full"
                  required
                />
                <div className="flex flex-col justify-between">
                  <p className="text-xs font-semibold text-slate-500">Subtotal</p>
                  {item.productId ? (
                    <p className="text-xs text-slate-500">{item.location}</p>
                  ) : null}
                  <p className="text-base font-bold text-brand">{formatCurrency(item.subtotal)}</p>
                  {form.items.length > 1 ? (
                    <button
                      type="button"
                      className="text-xs text-red-500"
                      onClick={() => removeLine(index)}
                    >
                      Eliminar
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" icon={Plus} onClick={addLine}>
              Agregar producto
            </Button>
            <div className="grid gap-3 lg:grid-cols-2">
              <Input
                label="Descuento"
                value={form.discount}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    discount: event.target.value,
                  }))
                }
                onBlur={() =>
                  setForm((prev) => ({
                    ...prev,
                    discount: formatDecimal(parseLocaleNumber(prev.discount)),
                  }))
                }
                placeholder="0,00"
                inputMode="decimal"
              />
              <Select
                label="Método de pago"
                value={form.paymentMethod}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    paymentMethod: event.target.value,
                  }))
                }
                className="w-full"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1 rounded-2xl bg-slate-50 p-4 text-sm font-semibold dark:bg-slate-900/40">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-red-500">
                <span>Descuento</span>
                <span>- {formatCurrency(discountValue)}</span>
              </div>
              <div className="flex items-center justify-between text-base text-brand">
                <span>Total estimado</span>
                <span>{formatCurrency(formTotal)}</span>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        open={modalType === 'view'}
        title={`Orden ${selectedOrder?.id?.slice(-6) || ''}`}
        description={`Estado: ${selectedOrder?.status || ''}`}
        onClose={closeModal}
        footer={<Button onClick={closeModal}>Cerrar</Button>}
      >
        {selectedOrder ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Cliente: <strong>{clients.find((client) => client.id === selectedOrder.clientId)?.name}</strong>
            </p>
            <p className="text-sm text-slate-500">
              Método de pago: <strong>{selectedOrder.paymentMethod || 'Efectivo'}</strong>
            </p>
            <ul className="space-y-2">
              {selectedOrderDetails.map((item) => (
                <li
                  key={item.productId}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60"
                >
                  <div>
                    <p className="font-semibold">{item.product?.name || 'Producto'}</p>
                    <p className="text-xs text-slate-500">
                      {item.location} · Cantidad: {formatInteger(item.quantity)}
                    </p>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                </li>
              ))}
            </ul>
            <div className="space-y-1 rounded-2xl bg-slate-50 p-4 text-sm font-semibold dark:bg-slate-900/40">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(selectedOrderSubtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-red-500">
                <span>Descuento</span>
                <span>- {formatCurrency(selectedOrder.discount || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-lg text-brand">
                <span>Total</span>
                <span>{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={modalType === 'delete'}
        title="Eliminar orden"
        description="Esta acción no se puede deshacer"
        onClose={closeModal}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Eliminar
            </Button>
          </>
        }
      >
        <p>
          ¿Deseas eliminar esta orden?
        </p>
      </Modal>

      <Modal
        open={modalType === 'clear'}
        title="Vaciar lista de órdenes"
        description="Eliminará todas las órdenes registradas"
        onClose={closeModal}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleClear}>
              Vaciar lista
            </Button>
          </>
        }
      >
        <p>Confirma que deseas vaciar el historial completo de órdenes.</p>
      </Modal>
    </div>
  )
}
