import type { IInvitadoRepository, CreateInvitadoData, ImportResult } from '../../ports/IInvitadoRepository'

export interface ImportRow {
  nombre: string
  apellido: string
  dni?: string
  email?: string
  whatsapp?: string
  grupo?: string
  acompanantesEsperados?: number
  dietaryRestrictions?: string[]
}

export class ImportInvitadosUseCase {
  constructor(private readonly repo: IInvitadoRepository) {}

  async execute(eventoId: string, rows: ImportRow[]): Promise<ImportResult> {
    if (rows.length === 0) return { created: 0, errors: [] }
    if (rows.length > 500) throw new Error('El archivo no puede tener más de 500 filas por importación')

    const validRows: CreateInvitadoData[] = []
    const errors: ImportResult['errors'] = []
    const dnisSeen = new Set<string>()

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2 // Excel row 1 = headers

      if (!row.nombre?.trim()) {
        errors.push({ row: rowNum, message: 'Nombre obligatorio' })
        continue
      }
      if (!row.apellido?.trim()) {
        errors.push({ row: rowNum, message: 'Apellido obligatorio' })
        continue
      }

      const dni = row.dni?.trim() || undefined
      if (dni) {
        if (dnisSeen.has(dni)) {
          errors.push({ row: rowNum, message: `DNI ${dni} duplicado en el archivo` })
          continue
        }
        dnisSeen.add(dni)
      }

      validRows.push({
        eventoId,
        nombre: row.nombre.trim(),
        apellido: row.apellido.trim(),
        dni,
        email: row.email?.trim() || undefined,
        whatsapp: row.whatsapp?.trim() || undefined,
        grupo: row.grupo?.trim() || undefined,
        acompanantesEsperados: row.acompanantesEsperados ?? 0,
        dietaryRestrictions: row.dietaryRestrictions ?? [],
      })
    }

    if (validRows.length === 0) return { created: 0, errors }

    const result = await this.repo.importBatch(validRows)
    return { created: result.created, errors: [...errors, ...result.errors] }
  }
}
