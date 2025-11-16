import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  sampleClients,
  sampleOrders,
  sampleProducts,
  defaultCredentials,
} from '../data/demoData.js'
import { applyOrderCompletion, canCompleteOrder } from '../utils/orderUtils.js'

const createFallbackStorage = () => ({
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
})

const safeLocalStorage = () => {
  if (typeof window === 'undefined') return undefined
  return window.localStorage
}

const safeSessionStorage = () => {
  if (typeof window === 'undefined') return undefined
  return window.sessionStorage
}

const uid = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const sanitizeNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isNaN(parsed) ? fallback : parsed
}

const DEFAULT_LOW_STOCK_THRESHOLD = 20

const buildOrderItems = (items, products) =>
  items
    .map((entry) => {
      const product = products.find((prod) => prod.id === entry.productId)
      if (!product) return null
      const quantity = Math.max(0, sanitizeNumber(entry.quantity))
      if (!quantity) return null
      return {
        productId: product.id,
        quantity,
        price: product.price,
        name: product.name,
        location: product.location,
      }
    })
    .filter(Boolean)

const initialState = {
  auth: {
    credentials: defaultCredentials,
    session: null,
  },
  theme: {
    mode: 'system',
  },
  settings: {
    lowStockThreshold: DEFAULT_LOW_STOCK_THRESHOLD,
  },
  inventory: sampleProducts,
  clients: sampleClients,
  orders: sampleOrders,
}

export const useAppStore = create(
  persist(
    (set, get) => ({
      ...initialState,
      login: ({ username, password }) => {
        const creds = get().auth.credentials
        if (
          username?.trim().toLowerCase() === creds.username.toLowerCase() &&
          password === creds.password
        ) {
          const session = { username: creds.username, loggedAt: new Date().toISOString() }
          set({ auth: { ...get().auth, session } })
          const sessionStorage = safeSessionStorage()
          sessionStorage?.setItem('biocat-session', JSON.stringify(session))
          return { ok: true }
        }
        return { ok: false, message: 'Credenciales incorrectas' }
      },
      logout: () => {
        set({ auth: { ...get().auth, session: null } })
        const sessionStorage = safeSessionStorage()
        sessionStorage?.removeItem('biocat-session')
      },
      updateCredentials: ({ username, password, currentPassword }) => {
        const creds = get().auth.credentials
        if (currentPassword !== creds.password) {
          return { ok: false, message: 'La contraseña actual no coincide' }
        }
        set({
          auth: {
            ...get().auth,
            credentials: {
              username: username?.trim() || creds.username,
              password: password || creds.password,
            },
          },
        })
        return { ok: true }
      },
      setThemeMode: (mode) => {
        set((state) => ({ theme: { ...state.theme, mode } }))
      },
      setLowStockThreshold: (value) => {
        const sanitized = Math.max(0, Math.floor(sanitizeNumber(value, DEFAULT_LOW_STOCK_THRESHOLD)))
        set((state) => ({
          settings: {
            ...state.settings,
            lowStockThreshold: sanitized,
          },
        }))
        return sanitized
      },
      addProduct: (payload) => {
        const product = {
          id: uid(),
          name: payload.name?.trim() || 'Producto sin nombre',
          quantity: Math.max(0, sanitizeNumber(payload.quantity)),
          cost: Math.max(0, sanitizeNumber(payload.cost)),
          price: Math.max(0, sanitizeNumber(payload.price)),
          location: payload.location?.trim() || 'Sin ubicación',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({ inventory: [product, ...state.inventory] }))
        return product
      },
      updateProduct: (id, updates) => {
        set((state) => ({
          inventory: state.inventory.map((item) =>
            item.id === id
              ? {
                  ...item,
                  ...updates,
                  quantity: Math.max(0, sanitizeNumber(updates.quantity ?? item.quantity)),
                  cost: Math.max(0, sanitizeNumber(updates.cost ?? item.cost)),
                  price: Math.max(0, sanitizeNumber(updates.price ?? item.price)),
                  updatedAt: new Date().toISOString(),
                }
              : item,
          ),
        }))
      },
      removeProduct: (id) => {
        set((state) => ({ inventory: state.inventory.filter((item) => item.id !== id) }))
      },
      clearInventory: () => {
        set({ inventory: [] })
      },
      importProducts: (products = []) => {
        if (!products.length) return 0
        const normalized = products.map((item) => ({
          id: uid(),
          name: item.name?.trim() || item.Nombre || 'Producto sin nombre',
          quantity: Math.max(0, sanitizeNumber(item.quantity ?? item.Cantidad ?? 0)),
          cost: Math.max(0, sanitizeNumber(item.cost ?? item.Costo ?? 0)),
          price: Math.max(0, sanitizeNumber(item.price ?? item['Precio de Venta'] ?? 0)),
          location: item.location?.trim() || item.Ubicacion || item.Ubicación || 'Sin ubicación',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }))
        set((state) => ({ inventory: [...normalized, ...state.inventory] }))
        return normalized.length
      },
      addClient: (payload) => {
        const client = {
          id: uid(),
          name: payload.name?.trim() || 'Cliente sin nombre',
          phone: payload.phone?.trim() || 'Sin teléfono',
          address: payload.address?.trim() || 'Sin dirección',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({ clients: [client, ...state.clients] }))
        return client
      },
      updateClient: (id, updates) => {
        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === id
              ? {
                  ...client,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : client,
          ),
        }))
      },
      removeClient: (id) => {
        set((state) => ({ clients: state.clients.filter((client) => client.id !== id) }))
      },
      clearClients: () => {
        set({ clients: [] })
      },
      addOrder: ({ clientId, items, discount = 0, paymentMethod = 'Efectivo' }) => {
        const products = get().inventory
        const orderItems = buildOrderItems(items, products)
        const subtotal = orderItems.reduce((acc, item) => acc + item.quantity * item.price, 0)
        const normalizedDiscount = Math.max(
          0,
          Math.min(subtotal, sanitizeNumber(discount)),
        )
        const order = {
          id: uid(),
          clientId,
          items: orderItems,
          status: 'Pendiente',
          subtotal,
          discount: normalizedDiscount,
          paymentMethod: paymentMethod?.trim() || 'Efectivo',
          total: Math.max(0, subtotal - normalizedDiscount),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({ orders: [order, ...state.orders] }))
        return order
      },
      updateOrder: (orderId, payload = {}) => {
        const products = get().inventory
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id !== orderId) return order
            const items = payload.items ? buildOrderItems(payload.items, products) : order.items
            const subtotal = items.reduce((acc, item) => acc + item.quantity * item.price, 0)
            const discountInput =
              payload.discount ?? order.discount ?? 0
            const normalizedDiscount = Math.max(
              0,
              Math.min(subtotal, sanitizeNumber(discountInput)),
            )
            const nextPaymentMethod = payload.paymentMethod?.trim()
              || order.paymentMethod
              || 'Efectivo'
            return {
              ...order,
              ...payload,
              items,
              paymentMethod: nextPaymentMethod,
              subtotal,
              discount: normalizedDiscount,
              total: Math.max(0, subtotal - normalizedDiscount),
              updatedAt: new Date().toISOString(),
            }
          }),
        }))
      },
      removeOrder: (orderId) => {
        set((state) => ({ orders: state.orders.filter((order) => order.id !== orderId) }))
      },
      clearOrders: () => {
        set({ orders: [] })
      },
      completeOrder: (orderId) => {
        const state = get()
        const order = state.orders.find((o) => o.id === orderId)
        if (!order) return { ok: false, message: 'Orden no encontrada' }
        if (order.status === 'Completada') {
          return { ok: true, message: 'La orden ya estaba completada' }
        }
        const evaluation = canCompleteOrder(order, state.inventory)
        if (!evaluation.ok) {
          return { ok: false, message: evaluation.message }
        }
        const { updatedInventory } = applyOrderCompletion(order, state.inventory)
        set({
          inventory: updatedInventory,
          orders: state.orders.map((item) =>
            item.id === orderId
              ? {
                  ...item,
                  status: 'Completada',
                  completedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : item,
          ),
        })
        return { ok: true }
      },
      loadDemoData: () => {
        set({
          inventory: sampleProducts,
          clients: sampleClients,
          orders: sampleOrders,
        })
      },
      exportAllData: () => {
        const state = get()
        return {
          exportedAt: new Date().toISOString(),
          inventory: state.inventory,
          clients: state.clients,
          orders: state.orders,
          auth: { credentials: state.auth.credentials },
          settings: state.settings,
        }
      },
      restoreAllData: (payload) => {
        if (!payload) return { ok: false, message: 'Archivo inválido' }
        set({
          inventory: Array.isArray(payload.inventory) ? payload.inventory : [],
          clients: Array.isArray(payload.clients) ? payload.clients : [],
          orders: Array.isArray(payload.orders) ? payload.orders : [],
          auth: {
            credentials: payload.auth?.credentials || get().auth.credentials,
            session: null,
          },
          settings: {
            lowStockThreshold: Math.max(
              0,
              Math.floor(
                sanitizeNumber(
                  payload.settings?.lowStockThreshold ?? get().settings.lowStockThreshold,
                  DEFAULT_LOW_STOCK_THRESHOLD,
                ),
              ),
            ),
          },
        })
        const sessionStorage = safeSessionStorage()
        sessionStorage?.removeItem('biocat-session')
        return { ok: true }
      },
    }),
    {
      name: 'biocat-app',
      storage: createJSONStorage(() => safeLocalStorage() ?? createFallbackStorage()),
      partialize: (state) => ({
        inventory: state.inventory,
        clients: state.clients,
        orders: state.orders,
        auth: state.auth,
        theme: state.theme,
        settings: state.settings,
      }),
    },
  ),
)
