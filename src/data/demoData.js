const timestamp = new Date().toISOString()

export const sampleProducts = [
  {
    id: 'prod-1',
    name: 'Arena Premium Lavanda 6kg',
    quantity: 160,
    cost: 7.5,
    price: 13.9,
    location: 'Depósito Centro',
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'prod-2',
    name: 'Arena Carbón Activo 3kg',
    quantity: 95,
    cost: 4.2,
    price: 8.7,
    location: 'Depósito Norte',
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'prod-3',
    name: 'Arena Sensitive Kitten 5kg',
    quantity: 60,
    cost: 6.1,
    price: 11.4,
    location: 'Depósito Sur',
    createdAt: timestamp,
    updatedAt: timestamp,
  },
]

export const sampleClients = [
  {
    id: 'client-1',
    name: 'Veterinaria Patitas',
    phone: '+54 9 351 555-0112',
    address: 'Córdoba Capital',
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'client-2',
    name: 'Pet Shop Felinus',
    phone: '+54 9 11 4001-2200',
    address: 'Buenos Aires',
    createdAt: timestamp,
    updatedAt: timestamp,
  },
]

export const sampleOrders = [
  {
    id: 'order-1',
    clientId: 'client-1',
    status: 'Pendiente',
    items: [
      { productId: 'prod-1', quantity: 20 },
      { productId: 'prod-2', quantity: 10 },
    ],
    discount: 0,
    paymentMethod: 'Efectivo',
    subtotal: 20 * 13.9 + 10 * 8.7,
    total: 20 * 13.9 + 10 * 8.7,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'order-2',
    clientId: 'client-2',
    status: 'Completada',
    items: [{ productId: 'prod-3', quantity: 5 }],
    discount: 20,
    paymentMethod: 'Transferencia',
    subtotal: 5 * 11.4,
    total: 5 * 11.4 - 20,
    createdAt: timestamp,
    updatedAt: timestamp,
    completedAt: timestamp,
  },
]

export const defaultCredentials = {
  username: 'Anahi',
  password: '2025',
}
