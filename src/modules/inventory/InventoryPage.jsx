import { Download, Eye, Filter, Pencil, Plus, Trash2, Upload } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'
import { Button } from '../../components/common/Button.jsx'
import { Card } from '../../components/common/Card.jsx'
import { EmptyState } from '../../components/common/EmptyState.jsx'
import { Input } from '../../components/common/Input.jsx'
import { Modal } from '../../components/common/Modal.jsx'
import { Pagination } from '../../components/common/Pagination.jsx'
import { Select } from '../../components/common/Select.jsx'
import { Table } from '../../components/common/Table.jsx'
import { useAppStore } from '../../store/appStore.js'
import { formatCurrency, formatDecimal, formatInteger, parseLocaleNumber } from '../../utils/numberFormat.js'

const PAGE_SIZE_OPTIONS = [5, 10, 50]

const defaultForm = {
  name: '',
  quantity: '0',
  cost: '0',
  price: '0',
  location: '',
}

export const InventoryPage = () => {
  const inventory = useAppStore((state) => state.inventory)
  const addProduct = useAppStore((state) => state.addProduct)
  const updateProduct = useAppStore((state) => state.updateProduct)
  const removeProduct = useAppStore((state) => state.removeProduct)
  const importProducts = useAppStore((state) => state.importProducts)
  const clearInventory = useAppStore((state) => state.clearInventory)

  const [modalType, setModalType] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [query, setQuery] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [quantityRange, setQuantityRange] = useState({ min: '', max: '' })
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const fileInputRef = useRef(null)

  const uniqueLocations = useMemo(() => [...new Set(inventory.map((product) => product.location))], [inventory])

  const filteredProducts = useMemo(() => {
    return inventory.filter((product) => {
      const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase())
      const matchesLocation = locationFilter ? product.location === locationFilter : true
      const minOk = quantityRange.min ? product.quantity >= Number(quantityRange.min) : true
      const maxOk = quantityRange.max ? product.quantity <= Number(quantityRange.max) : true
      return matchesQuery && matchesLocation && minOk && maxOk
    })
  }, [inventory, query, locationFilter, quantityRange])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / rowsPerPage))
  const paginated = filteredProducts.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const closeModal = () => {
    setModalType(null)
    setSelectedProduct(null)
    setForm(defaultForm)
  }

  const openForm = (product) => {
    if (product) {
      setForm({
        name: product.name,
        quantity: product.quantity.toString(),
        cost: formatDecimal(product.cost),
        price: formatDecimal(product.price),
        location: product.location,
      })
      setSelectedProduct(product)
      setModalType('edit')
    } else {
      setForm(defaultForm)
      setModalType('create')
    }
  }

  const handleSubmit = (event) => {
    event?.preventDefault()
    const payload = {
      name: form.name,
      quantity: parseLocaleNumber(form.quantity),
      cost: parseLocaleNumber(form.cost),
      price: parseLocaleNumber(form.price),
      location: form.location,
    }
    if (modalType === 'edit' && selectedProduct) {
      updateProduct(selectedProduct.id, payload)
      toast.success('Producto actualizado')
    } else {
      addProduct(payload)
      toast.success('Producto agregado')
    }
    closeModal()
  }

  const handleDelete = (product) => {
    setSelectedProduct(product)
    setModalType('delete')
  }

  const confirmDelete = () => {
    if (selectedProduct) {
      removeProduct(selectedProduct.id)
      toast.success('Producto eliminado')
    }
    closeModal()
  }

  const confirmClear = () => {
    clearInventory()
    toast.success('Inventario vaciado')
    closeModal()
  }

  const handleImport = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])
    const inserted = importProducts(data)
    toast.success(`${inserted} productos importados`)
    event.target.value = ''
  }

  const handleExport = () => {
    if (!inventory.length) {
      toast.info('No hay productos para exportar')
      return
    }
    const data = inventory.map((product) => ({
      Nombre: product.name,
      Cantidad: product.quantity,
      Costo: product.cost,
      'Precio de Venta': product.price,
      Ubicación: product.location,
    }))
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario')
    XLSX.writeFile(workbook, 'inventario-biocat.xlsx')
    toast.success('Inventario exportado')
  }

  const handleTemplate = () => {
    const headers = [['Nombre', 'Cantidad', 'Costo', 'Precio de Venta', 'Ubicación']]
    const worksheet = XLSX.utils.aoa_to_sheet(headers)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla')
    XLSX.writeFile(workbook, 'plantilla-biocat.xlsx')
    toast.success('Plantilla descargada')
  }

  const handleNumberBlur = (field) => {
    setForm((prev) => ({
      ...prev,
      [field]: formatDecimal(parseLocaleNumber(prev[field])),
    }))
  }

  return (
    <div className="space-y-6">
      <Card
        title="Inventario"
        subtitle="Control completo de productos"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" icon={Plus} onClick={() => openForm()}>
              Agregar producto
            </Button>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
            <Button size="sm" variant="secondary" icon={Upload} onClick={() => fileInputRef.current?.click()}>
              Importar
            </Button>
            <Button size="sm" variant="secondary" icon={Download} onClick={handleExport}>
              Exportar
            </Button>
            <Button size="sm" variant="secondary" icon={Download} onClick={handleTemplate}>
              Descargar formato
            </Button>
            <Button size="sm" variant="danger" icon={Trash2} onClick={() => setModalType('clear')}>
              Vaciar inventario
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-4">
          <Input label="Buscar" placeholder="Nombre del producto" value={query} onChange={(event) => setQuery(event.target.value)} />
          <Select label="Ubicación" value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
            <option value="">Todas</option>
            {uniqueLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </Select>
          <Input
            label="Cantidad mínima"
            type="number"
            value={quantityRange.min}
            onChange={(event) => setQuantityRange((prev) => ({ ...prev, min: event.target.value }))}
          />
          <Input
            label="Cantidad máxima"
            type="number"
            value={quantityRange.max}
            onChange={(event) => setQuantityRange((prev) => ({ ...prev, max: event.target.value }))}
          />
        </div>
        <div className="mt-6">
          {paginated.length ? (
            <>
              <Table
                columns={[
                  { key: 'name', label: 'Producto' },
                  {
                    key: 'quantity',
                    label: 'Cantidad',
                    render: (value) => formatInteger(value),
                  },
                  {
                    key: 'cost',
                    label: 'Costo',
                    render: (value) => formatCurrency(value),
                  },
                  {
                    key: 'price',
                    label: 'Precio venta',
                    render: (value) => formatCurrency(value),
                  },
                  { key: 'location', label: 'Ubicación' },
                ]}
                data={paginated}
                renderRowActions={(product) => (
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      aria-label="Ver"
                      className="rounded-full bg-slate-100 p-2 text-slate-500 hover:text-brand"
                      onClick={() => {
                        setSelectedProduct(product)
                        setModalType('view')
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Editar"
                      className="rounded-full bg-slate-100 p-2 text-slate-500 hover:text-brand"
                      onClick={() => openForm(product)}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Eliminar"
                      className="rounded-full bg-red-50 p-2 text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(product)}
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
              icon={Filter}
              title="No se encontraron productos"
              description="Ajusta los filtros o agrega un nuevo producto"
              action={
                <Button size="sm" icon={Plus} onClick={() => openForm()}>
                  Nuevo producto
                </Button>
              }
            />
          )}
        </div>
      </Card>

      <Modal
        open={modalType === 'create' || modalType === 'edit'}
        title={modalType === 'edit' ? 'Editar producto' : 'Agregar producto'}
        onClose={closeModal}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" form="product-form">
              Guardar
            </Button>
          </>
        }
      >
        <form id="product-form" className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Input label="Nombre" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} required />
          <Input
            label="Ubicación"
            value={form.location}
            onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
            required
          />
          <Input
            label="Cantidad"
            type="number"
            min="0"
            value={form.quantity}
            onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))}
            required
          />
          <Input
            label="Costo"
            value={form.cost}
            onChange={(event) => setForm((prev) => ({ ...prev, cost: event.target.value }))}
            onBlur={() => handleNumberBlur('cost')}
            required
          />
          <Input
            label="Precio de venta"
            value={form.price}
            onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
            onBlur={() => handleNumberBlur('price')}
            required
          />
        </form>
      </Modal>

      <Modal
        open={modalType === 'view'}
        title={selectedProduct?.name}
        description="Detalle del producto"
        onClose={closeModal}
        footer={<Button onClick={closeModal}>Cerrar</Button>}
      >
        {selectedProduct ? (
          <dl className="grid gap-4 md:grid-cols-2">
            <div>
              <dt className="text-sm text-slate-500">Cantidad</dt>
              <dd className="text-lg font-semibold">{formatInteger(selectedProduct.quantity)}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Ubicación</dt>
              <dd className="text-lg font-semibold">{selectedProduct.location}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Costo</dt>
              <dd className="text-lg font-semibold">{formatCurrency(selectedProduct.cost)}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Precio venta</dt>
              <dd className="text-lg font-semibold">{formatCurrency(selectedProduct.price)}</dd>
            </div>
          </dl>
        ) : null}
      </Modal>

      <Modal
        open={modalType === 'delete'}
        title="Eliminar producto"
        description="Esta acción no se puede deshacer"
        onClose={closeModal}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Eliminar
            </Button>
          </>
        }
      >
        <p>
          ¿Seguro que deseas eliminar <strong>{selectedProduct?.name}</strong>?
        </p>
      </Modal>

      <Modal
        open={modalType === 'clear'}
        title="Vaciar inventario"
        description="Eliminará todos los productos registrados"
        onClose={closeModal}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmClear}>
              Vaciar
            </Button>
          </>
        }
      >
        <p>Confirma que deseas vaciar por completo el inventario.</p>
      </Modal>
    </div>
  )
}
