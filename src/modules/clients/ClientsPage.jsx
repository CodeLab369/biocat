import { MapPin, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../../components/common/Button.jsx'
import { Card } from '../../components/common/Card.jsx'
import { EmptyState } from '../../components/common/EmptyState.jsx'
import { Input } from '../../components/common/Input.jsx'
import { Modal } from '../../components/common/Modal.jsx'
import { Pagination } from '../../components/common/Pagination.jsx'
import { Table } from '../../components/common/Table.jsx'
import { useAppStore } from '../../store/appStore.js'

const PAGE_SIZE_OPTIONS = [5, 10, 50]

const defaultForm = {
  name: '',
  phone: '',
  address: '',
}

export const ClientsPage = () => {
  const clients = useAppStore((state) => state.clients)
  const addClient = useAppStore((state) => state.addClient)
  const updateClient = useAppStore((state) => state.updateClient)
  const removeClient = useAppStore((state) => state.removeClient)
  const clearClients = useAppStore((state) => state.clearClients)

  const [modalType, setModalType] = useState(null)
  const [selectedClient, setSelectedClient] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [query, setQuery] = useState('')
  const [addressFilter, setAddressFilter] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const uniqueAddresses = useMemo(() => [...new Set(clients.map((client) => client.address))], [clients])

  const filtered = useMemo(() => {
    return clients.filter((client) => {
      const matchesQuery = client.name.toLowerCase().includes(query.toLowerCase())
      const matchesAddress = addressFilter ? client.address === addressFilter : true
      return matchesQuery && matchesAddress
    })
  }, [clients, query, addressFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const closeModal = () => {
    setModalType(null)
    setSelectedClient(null)
    setForm(defaultForm)
  }

  const openForm = (client) => {
    if (client) {
      setSelectedClient(client)
      setForm({ name: client.name, phone: client.phone, address: client.address })
      setModalType('edit')
    } else {
      setForm(defaultForm)
      setModalType('create')
    }
  }

  const handleSubmit = (event) => {
    event?.preventDefault()
    if (modalType === 'edit' && selectedClient) {
      updateClient(selectedClient.id, form)
      toast.success('Cliente actualizado')
    } else {
      addClient(form)
      toast.success('Cliente agregado')
    }
    closeModal()
  }

  const handleDelete = () => {
    if (selectedClient) {
      removeClient(selectedClient.id)
      toast.success('Cliente eliminado')
    }
    closeModal()
  }

  const handleClear = () => {
    clearClients()
    toast.success('Listado vaciado')
    closeModal()
  }

  return (
    <div className="space-y-6">
      <Card
        title="Clientes"
        subtitle="Contactos y lugares de envío"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" icon={Plus} onClick={() => openForm()}>
              Agregar cliente
            </Button>
            <Button size="sm" variant="danger" icon={Trash2} onClick={() => setModalType('clear')}>
              Eliminar todo
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="Buscar" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nombre" />
          <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200 md:col-span-2">
            Lugar de envío
            <select
              value={addressFilter}
              onChange={(event) => setAddressFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-base font-normal text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">Todos</option>
              {uniqueAddresses.map((address) => (
                <option key={address} value={address}>
                  {address}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6">
          {paginated.length ? (
            <>
              <Table
                columns={[
                  { key: 'name', label: 'Cliente' },
                  { key: 'phone', label: 'Celular' },
                  { key: 'address', label: 'Lugar de envío' },
                ]}
                data={paginated}
                renderRowActions={(client) => (
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="rounded-full bg-slate-100 p-2 text-slate-500 hover:text-brand"
                      onClick={() => {
                        setSelectedClient(client)
                        setModalType('view')
                      }}
                    >
                      <Users className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="rounded-full bg-slate-100 p-2 text-slate-500 hover:text-brand"
                      onClick={() => openForm(client)}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="rounded-full bg-red-50 p-2 text-red-500 hover:text-red-600"
                      onClick={() => {
                        setSelectedClient(client)
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
              icon={MapPin}
              title="Sin clientes registrados"
              description="Agrega tu primer cliente para comenzar"
              action={
                <Button size="sm" icon={Plus} onClick={() => openForm()}>
                  Nuevo cliente
                </Button>
              }
            />
          )}
        </div>
      </Card>

      <Modal
        open={modalType === 'create' || modalType === 'edit'}
        title={modalType === 'edit' ? 'Editar cliente' : 'Agregar cliente'}
        onClose={closeModal}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" form="client-form">
              Guardar
            </Button>
          </>
        }
      >
        <form id="client-form" className="grid gap-4" onSubmit={handleSubmit}>
          <Input label="Nombre" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} required />
          <Input label="Celular" value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} required />
          <Input
            label="Lugar de envío"
            value={form.address}
            onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
            required
          />
        </form>
      </Modal>

      <Modal
        open={modalType === 'view'}
        title={selectedClient?.name}
        description="Detalles del cliente"
        onClose={closeModal}
        footer={<Button onClick={closeModal}>Cerrar</Button>}
      >
        {selectedClient ? (
          <dl className="space-y-3">
            <div>
              <dt className="text-xs uppercase text-slate-500">Celular</dt>
              <dd className="text-lg font-semibold">{selectedClient.phone}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-slate-500">Lugar de envío</dt>
              <dd className="text-lg font-semibold">{selectedClient.address}</dd>
            </div>
          </dl>
        ) : null}
      </Modal>

      <Modal
        open={modalType === 'delete'}
        title="Eliminar cliente"
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
          ¿Deseas eliminar a <strong>{selectedClient?.name}</strong>?
        </p>
      </Modal>

      <Modal
        open={modalType === 'clear'}
        title="Eliminar todos los clientes"
        description="Se vaciará la lista completa"
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
        <p>Confirma que deseas eliminar todos los clientes almacenados.</p>
      </Modal>
    </div>
  )
}
