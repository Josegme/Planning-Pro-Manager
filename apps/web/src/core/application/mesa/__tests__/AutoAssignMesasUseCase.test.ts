import { describe, it, expect } from 'vitest'
import { AutoAssignMesasUseCase } from '../AutoAssignMesasUseCase'

const uc = new AutoAssignMesasUseCase()

describe('AutoAssignMesasUseCase', () => {
  it('asigna invitados simples a mesas con capacidad disponible', () => {
    const unassigned = [
      { id: 'inv-1', acompanantesEsperados: 0 },
      { id: 'inv-2', acompanantesEsperados: 0 },
    ]
    const mesas = [{ id: 'mesa-1', capacity: 10 }]

    const { assignments, unplaced } = uc.execute(unassigned, mesas, {})

    expect(assignments).toHaveLength(2)
    expect(assignments.every((a) => a.mesaId === 'mesa-1')).toBe(true)
    expect(unplaced).toHaveLength(0)
  })

  it('respeta acompanantes al calcular espacio necesario', () => {
    const unassigned = [{ id: 'inv-1', acompanantesEsperados: 3 }]
    const mesas = [{ id: 'mesa-1', capacity: 3 }]

    const { assignments, unplaced } = uc.execute(unassigned, mesas, {})

    expect(assignments).toHaveLength(0)
    expect(unplaced).toEqual(['inv-1'])
  })

  it('distribuye entre múltiples mesas cuando la primera se llena', () => {
    const unassigned = [
      { id: 'inv-1', acompanantesEsperados: 0 },
      { id: 'inv-2', acompanantesEsperados: 0 },
      { id: 'inv-3', acompanantesEsperados: 0 },
    ]
    const mesas = [
      { id: 'mesa-1', capacity: 2 },
      { id: 'mesa-2', capacity: 2 },
    ]

    const { assignments, unplaced } = uc.execute(unassigned, mesas, {})

    expect(assignments).toHaveLength(3)
    const byMesa1 = assignments.filter((a) => a.mesaId === 'mesa-1').length
    const byMesa2 = assignments.filter((a) => a.mesaId === 'mesa-2').length
    expect(byMesa1).toBe(2)
    expect(byMesa2).toBe(1)
    expect(unplaced).toHaveLength(0)
  })

  it('respeta la ocupación existente al calcular espacio libre', () => {
    const unassigned = [{ id: 'inv-3', acompanantesEsperados: 0 }]
    const mesas = [{ id: 'mesa-1', capacity: 2 }]
    const occupied = { 'mesa-1': 2 }

    const { assignments, unplaced } = uc.execute(unassigned, mesas, occupied)

    expect(assignments).toHaveLength(0)
    expect(unplaced).toEqual(['inv-3'])
  })

  it('devuelve vacío cuando no hay invitados sin asignar', () => {
    const { assignments, unplaced } = uc.execute([], [{ id: 'mesa-1', capacity: 10 }], {})
    expect(assignments).toHaveLength(0)
    expect(unplaced).toHaveLength(0)
  })

  it('marca como no-colocados los invitados que no caben en ninguna mesa', () => {
    const unassigned = [
      { id: 'inv-1', acompanantesEsperados: 0 },
      { id: 'inv-2', acompanantesEsperados: 0 },
    ]
    const mesas = [{ id: 'mesa-1', capacity: 1 }]

    const { assignments, unplaced } = uc.execute(unassigned, mesas, {})

    expect(assignments).toHaveLength(1)
    expect(unplaced).toHaveLength(1)
  })
})
