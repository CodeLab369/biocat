import { describe, expect, it } from 'vitest'
import { applyOrderCompletion, canCompleteOrder } from '../orderUtils.js'

const inventory = [
  { id: 'p1', name: 'Arena 1', quantity: 10 },
  { id: 'p2', name: 'Arena 2', quantity: 5 },
]

const order = {
  id: 'o1',
  items: [
    { productId: 'p1', quantity: 3, name: 'Arena 1' },
    { productId: 'p2', quantity: 2, name: 'Arena 2' },
  ],
}

describe('orderUtils', () => {
  it('valida stock suficiente', () => {
    const result = canCompleteOrder(order, inventory)
    expect(result.ok).toBe(true)
  })

  it('detecta stock insuficiente', () => {
    const insufficient = canCompleteOrder(
      { ...order, items: [{ productId: 'p1', quantity: 50, name: 'Arena 1' }] },
      inventory,
    )
    expect(insufficient.ok).toBe(false)
  })

  it('descuenta inventario al completar', () => {
    const { updatedInventory } = applyOrderCompletion(order, inventory)
    const updated = updatedInventory.find((item) => item.id === 'p1')
    expect(updated.quantity).toBe(7)
  })
})
