import { useState, useRef } from 'react'
import { read, utils, writeFileXLSX } from 'xlsx'
import { Upload, Download, AlertCircle } from 'lucide-react'
import { Dialog } from '../ui/Dialog'
import { Button } from '../ui/Button'
import type { ImportRow } from '../../../core/application/invitado/ImportInvitadosUseCase'
import type { ImportResult } from '../../../core/ports/IInvitadoRepository'

const TEMPLATE_HEADERS = [
  'Nombre', 'Apellido', 'DNI', 'Email', 'WhatsApp', 'Grupo', 'Acompañantes',
]

interface ImportDialogProps {
  open: boolean
  onClose: () => void
  onImport: (rows: ImportRow[]) => Promise<ImportResult>
}

export function ImportDialog({ open, onClose, onImport }: ImportDialogProps) {
  const [rows, setRows] = useState<ImportRow[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setRows([])
    setParseError(null)
    setResult(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleClose = () => { reset(); onClose() }

  const downloadTemplate = () => {
    const wb = utils.book_new()
    const ws = utils.aoa_to_sheet([TEMPLATE_HEADERS])
    utils.book_append_sheet(wb, ws, 'Invitados')
    writeFileXLSX(wb, 'template-invitados.xlsx')
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setParseError(null)
    setResult(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer)
        const wb = read(data, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const raw: string[][] = utils.sheet_to_json(ws, { header: 1, defval: '' })
        if (raw.length < 2) { setParseError('El archivo está vacío'); return }

        const parsed: ImportRow[] = raw.slice(1).filter((r) => r.some((c) => c)).map((r) => ({
          nombre:               String(r[0] ?? ''),
          apellido:             String(r[1] ?? ''),
          dni:                  r[2] ? String(r[2]) : undefined,
          email:                r[3] ? String(r[3]) : undefined,
          whatsapp:             r[4] ? String(r[4]) : undefined,
          grupo:                r[5] ? String(r[5]) : undefined,
          acompanantesEsperados: r[6] ? Number(r[6]) : 0,
        }))
        setRows(parsed)
      } catch {
        setParseError('No se pudo leer el archivo. Asegurate de que sea un .xlsx válido.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleImport = async () => {
    try {
      setIsImporting(true)
      const res = await onImport(rows)
      setResult(res)
      setRows([])
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'Error al importar')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Importar invitados desde Excel" maxWidth="lg">
      <div className="space-y-4">
        {/* Download template */}
        <div className="flex items-center justify-between rounded-lg border border-dashed p-4">
          <div>
            <p className="text-sm font-medium">Template de importación</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Descargá el archivo y completalo con los datos de tus invitados.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> Descargar
          </Button>
        </div>

        {/* File input */}
        {!result && (
          <div>
            <label className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer hover:bg-accent/50 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium">Seleccioná el archivo .xlsx</span>
              <span className="text-xs text-muted-foreground">Máximo 500 invitados por importación</span>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFile}
              />
            </label>
          </div>
        )}

        {parseError && (
          <div className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            {parseError}
          </div>
        )}

        {/* Preview */}
        {rows.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">
              Vista previa — {rows.length} invitados encontrados
            </p>
            <div className="overflow-auto max-h-48 rounded-lg border">
              <table className="w-full text-xs">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    {['Nombre', 'Apellido', 'DNI', 'Grupo', 'Acomp.'].map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 20).map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-1.5">{r.nombre}</td>
                      <td className="px-3 py-1.5">{r.apellido}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{r.dni ?? '—'}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{r.grupo ?? '—'}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{r.acompanantesEsperados ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 20 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  ...y {rows.length - 20} más
                </p>
              )}
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="rounded-lg border p-4 space-y-2">
            <p className="text-sm font-medium text-emerald-700">
              {result.created} invitado{result.created !== 1 ? 's' : ''} importado{result.created !== 1 ? 's' : ''} correctamente
            </p>
            {result.errors.length > 0 && (
              <div>
                <p className="text-xs font-medium text-destructive mb-1">
                  {result.errors.length} error{result.errors.length !== 1 ? 'es' : ''}:
                </p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {result.errors.slice(0, 5).map((e, i) => (
                    <li key={i}>Fila {e.row}: {e.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" onClick={handleClose}>
            {result ? 'Cerrar' : 'Cancelar'}
          </Button>
          {rows.length > 0 && !result && (
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting ? 'Importando...' : `Importar ${rows.length} invitados`}
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  )
}
