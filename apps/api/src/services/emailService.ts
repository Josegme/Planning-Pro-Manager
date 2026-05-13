import { Resend } from 'resend'
import QRCode from 'qrcode'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.EMAIL_FROM ?? 'Planning Pro <noreply@planningpro.app>'

interface SendQrEmailParams {
  to: string
  invitadoNombre: string
  eventoName: string
  eventoDate: string
  eventoTime: string | null
  eventoVenueName: string | null
  eventoLocation: string | null
  eventoWelcomeMessage: string | null
  qrValue: string
}

export async function sendQrEmail(params: SendQrEmailParams): Promise<void> {
  const {
    to, invitadoNombre, eventoName, eventoDate, eventoTime,
    eventoVenueName, eventoLocation, eventoWelcomeMessage, qrValue,
  } = params

  const qrDataUrl = await QRCode.toDataURL(qrValue, { width: 250, margin: 2 })

  const dateLabel = (() => {
    try {
      return format(parseISO(eventoDate), "EEEE d 'de' MMMM yyyy", { locale: es })
    } catch {
      return eventoDate
    }
  })()

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:sans-serif;">
  <div style="max-width:520px;margin:32px auto;background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
    <div style="background:#0f172a;padding:28px 32px;">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">${eventoName}</h1>
      <p style="margin:6px 0 0;color:#94a3b8;font-size:14px;">Tu confirmación de asistencia</p>
    </div>
    <div style="padding:32px;">
      ${eventoWelcomeMessage ? `<p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.6;">${eventoWelcomeMessage}</p>` : ''}
      <p style="margin:0 0 8px;color:#475569;font-size:14px;">Hola <strong>${invitadoNombre}</strong>,</p>
      <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.6;">
        Tu asistencia fue confirmada. Presentá este QR al ingresar al evento.
      </p>
      <div style="text-align:center;margin:0 0 28px;">
        <img src="${qrDataUrl}" alt="Tu código QR" style="width:200px;height:200px;border-radius:8px;" />
      </div>
      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="color:#64748b;padding:4px 0;width:80px;">Fecha</td>
            <td style="color:#1e293b;font-weight:500;padding:4px 0;text-transform:capitalize;">${dateLabel}</td>
          </tr>
          ${eventoTime ? `<tr>
            <td style="color:#64748b;padding:4px 0;">Hora</td>
            <td style="color:#1e293b;font-weight:500;padding:4px 0;">${eventoTime}</td>
          </tr>` : ''}
          ${eventoVenueName ? `<tr>
            <td style="color:#64748b;padding:4px 0;">Lugar</td>
            <td style="color:#1e293b;font-weight:500;padding:4px 0;">${eventoVenueName}</td>
          </tr>` : ''}
          ${eventoLocation ? `<tr>
            <td style="color:#64748b;padding:4px 0;">Dirección</td>
            <td style="color:#1e293b;padding:4px 0;">${eventoLocation}</td>
          </tr>` : ''}
        </table>
      </div>
      <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;">
        Guardá este email. Necesitás el QR para ingresar al evento.
      </p>
    </div>
  </div>
</body>
</html>`

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Tu confirmación para ${eventoName}`,
    html,
  })
}
