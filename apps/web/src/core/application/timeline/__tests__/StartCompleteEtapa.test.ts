import { describe, it, expect, vi } from 'vitest'
import { StartEtapaUseCase } from '../StartEtapaUseCase'
import { CompleteEtapaUseCase } from '../CompleteEtapaUseCase'
import type { ITimelineRepository } from '../../../ports/ITimelineRepository'
import type { TimelineEtapa } from '../../../domain/timeline/TimelineEtapa'

function makeEtapa(overrides: Partial<TimelineEtapa> = {}): TimelineEtapa {
  return {
    id: 'e1', eventoId: 'ev1', nombre: 'Bienvenida',
    horaPlanificada: '20:00', duracionEstimada: 30,
    horaInicioReal: null, horaFinReal: null,
    status: 'pendiente', displayOrder: 0, menuCourseId: null,
    createdAt: '', updatedAt: '', ...overrides,
  }
}

function makeRepo(etapa: TimelineEtapa): ITimelineRepository {
  return {
    findByEvento: vi.fn(),
    findById: vi.fn().mockResolvedValue(etapa),
    create: vi.fn(),
    update: vi.fn().mockImplementation((_id, data) => Promise.resolve({ ...etapa, ...data })),
    delete: vi.fn(),
    reorder: vi.fn(),
  }
}

// ── StartEtapaUseCase ──────────────────────────────────────────────────────

describe('StartEtapaUseCase', () => {
  it('cambia status a en_curso y registra horaInicioReal', async () => {
    const etapa = makeEtapa({ status: 'pendiente' })
    const repo  = makeRepo(etapa)
    const uc    = new StartEtapaUseCase(repo)

    const result = await uc.execute('e1')

    expect(repo.update).toHaveBeenCalledWith('e1', expect.objectContaining({ status: 'en_curso' }))
    expect(result.status).toBe('en_curso')
    expect(result.horaInicioReal).toBeTruthy()
  })

  it('lanza error si la etapa ya está en curso', async () => {
    const etapa = makeEtapa({ status: 'en_curso' })
    const uc    = new StartEtapaUseCase(makeRepo(etapa))
    await expect(uc.execute('e1')).rejects.toThrow('ya está en curso')
  })

  it('lanza error si la etapa ya fue completada', async () => {
    const etapa = makeEtapa({ status: 'completada' })
    const uc    = new StartEtapaUseCase(makeRepo(etapa))
    await expect(uc.execute('e1')).rejects.toThrow('ya fue completada')
  })

  it('lanza error si la etapa no existe', async () => {
    const repo: ITimelineRepository = { ...makeRepo(makeEtapa()), findById: vi.fn().mockResolvedValue(null) }
    const uc = new StartEtapaUseCase(repo)
    await expect(uc.execute('no-existe')).rejects.toThrow('no encontrada')
  })
})

// ── CompleteEtapaUseCase ───────────────────────────────────────────────────

describe('CompleteEtapaUseCase', () => {
  it('cambia status a completada y registra horaFinReal', async () => {
    const etapa = makeEtapa({ status: 'en_curso', horaInicioReal: new Date().toISOString() })
    const repo  = makeRepo(etapa)
    const uc    = new CompleteEtapaUseCase(repo)

    const result = await uc.execute('e1')

    expect(repo.update).toHaveBeenCalledWith('e1', expect.objectContaining({ status: 'completada' }))
    expect(result.status).toBe('completada')
    expect(result.horaFinReal).toBeTruthy()
  })

  it('lanza error si la etapa está pendiente', async () => {
    const uc = new CompleteEtapaUseCase(makeRepo(makeEtapa({ status: 'pendiente' })))
    await expect(uc.execute('e1')).rejects.toThrow('en curso')
  })

  it('lanza error si la etapa ya estaba completada', async () => {
    const uc = new CompleteEtapaUseCase(makeRepo(makeEtapa({ status: 'completada' })))
    await expect(uc.execute('e1')).rejects.toThrow('en curso')
  })

  it('lanza error si la etapa no existe', async () => {
    const repo: ITimelineRepository = { ...makeRepo(makeEtapa()), findById: vi.fn().mockResolvedValue(null) }
    const uc = new CompleteEtapaUseCase(repo)
    await expect(uc.execute('no-existe')).rejects.toThrow('no encontrada')
  })
})

// ── getDesvioMinutos ───────────────────────────────────────────────────────

describe('getDesvioMinutos (domain helper)', async () => {
  const { getDesvioMinutos, getSemaphore } = await import('../../../domain/timeline/TimelineEtapa')

  it('devuelve null si no hay horaInicioReal', () => {
    expect(getDesvioMinutos(makeEtapa())).toBeNull()
  })

  it('calcula desvío positivo (tarde)', () => {
    const d = new Date()
    d.setHours(20, 15, 0, 0)
    const etapa = makeEtapa({ horaPlanificada: '20:00', horaInicioReal: d.toISOString() })
    const desvio = getDesvioMinutos(etapa)
    expect(desvio).toBe(15)
  })

  it('calcula desvío negativo (adelantado)', () => {
    const d = new Date()
    d.setHours(19, 55, 0, 0)
    const etapa = makeEtapa({ horaPlanificada: '20:00', horaInicioReal: d.toISOString() })
    const desvio = getDesvioMinutos(etapa)
    expect(desvio).toBe(-5)
  })

  it('getSemaphore: verde < 5 min', () => expect(getSemaphore(3)).toBe('verde'))
  it('getSemaphore: amarillo 5-14 min', () => expect(getSemaphore(10)).toBe('amarillo'))
  it('getSemaphore: rojo >= 15 min', () => expect(getSemaphore(20)).toBe('rojo'))
})
