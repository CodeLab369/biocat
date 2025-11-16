export const canCompleteOrder = (order, inventory) => {
  if (!order?.items?.length) {
    return { ok: false, message: 'La orden no tiene productos' }
  }
  const missing = order.items
    .map((item) => {
      const product = inventory.find((prod) => prod.id === item.productId)
      if (!product) {
        return `${item.name || 'Producto desconocido'} no existe en inventario`
      }
      if (product.quantity < item.quantity) {
        const deficit = item.quantity - product.quantity
        return `${product.name} falta ${deficit} unidad(es)`
      }
      return null
    })
    .filter(Boolean)

  if (missing.length) {
    return { ok: false, message: missing.join(' | ') }
  }
  return { ok: true }
}

export const applyOrderCompletion = (order, inventory) => {
  const updatedInventory = inventory.map((product) => {
    const line = order.items.find((item) => item.productId === product.id)
    if (!line) return product
    return {
      ...product,
      quantity: product.quantity - line.quantity,
      updatedAt: new Date().toISOString(),
    }
  })
  return { updatedInventory }
}

export const countOrderStatuses = (orders = []) => {
  return orders.reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    },
    { Pendiente: 0, Completada: 0 },
  )
}

export const getOrderTimeline = (orders = []) =>
  orders
    .slice()
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((order) => ({
      date: new Date(order.createdAt).toISOString().slice(0, 10),
      total: order.total,
    }))
