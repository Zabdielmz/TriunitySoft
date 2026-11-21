import { Resend } from 'resend'
import { config } from './config'
import { getDb, schema } from './db'

let client: Resend | null = null

function resendClient(): Resend {
  if (!client) client = new Resend(config.resendApiKey)
  return client
}

export interface SubmissionNotification {
  name: string
  email: string
  category: string
  message: string
  createdAt: Date
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function buildText(payload: SubmissionNotification): string {
  return [
    'Nueva solicitud de contacto desde el sitio',
    '',
    `Nombre: ${payload.name}`,
    `Correo: ${payload.email}`,
    `Tipo de proyecto: ${payload.category}`,
    `Fecha: ${payload.createdAt.toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}`,
    '',
    'Mensaje:',
    payload.message,
  ].join('\n')
}

function buildHtml(payload: SubmissionNotification): string {
  const date = payload.createdAt.toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })
  return `<!doctype html>
<html lang="es">
<body style="margin:0;background:#080a10;font-family:ui-monospace,'JetBrains Mono',monospace;color:#eef2fa;padding:24px">
  <div style="max-width:560px;margin:0 auto;border:1px solid #273243;background:#0b1017">
    <div style="padding:14px 20px;border-bottom:1px solid #273243;color:#71e6ff;font-size:12px;letter-spacing:.12em">TRIUNITY — NUEVA SOLICITUD</div>
    <div style="padding:20px;font-size:13px;line-height:1.7">
      <p style="margin:0 0 14px;color:#adb8ca">// llega desde el formulario del sitio</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="color:#8190a6;padding:4px 0;width:130px">Nombre</td><td>${escapeHtml(payload.name)}</td></tr>
        <tr><td style="color:#8190a6;padding:4px 0">Correo</td><td>${escapeHtml(payload.email)}</td></tr>
        <tr><td style="color:#8190a6;padding:4px 0">Tipo</td><td>${escapeHtml(payload.category)}</td></tr>
        <tr><td style="color:#8190a6;padding:4px 0">Fecha</td><td>${date}</td></tr>
      </table>
      <div style="margin-top:16px;padding:14px;border:1px solid #273243;background:#080a10;color:#c3d1e7;font-size:13px;white-space:pre-wrap">${escapeHtml(payload.message)}</div>
    </div>
  </div>
</body>
</html>`
}

export async function sendSubmissionNotification(payload: SubmissionNotification): Promise<void> {
  const db = getDb()
  const recipients = await db.select({ email: schema.notifyEmails.email }).from(schema.notifyEmails)
  if (recipients.length === 0) {
    console.log('[notify] notify_emails vacío; solicitud guardada sin notificación')
    return
  }
  const { error } = await resendClient().emails.send({
    from: config.resendFrom,
    to: recipients.map((row) => row.email),
    subject: `Nueva solicitud — ${payload.category} — ${payload.name}`,
    text: buildText(payload),
    html: buildHtml(payload),
  })
  if (error) throw new Error(`Resend: ${error.message}`)
}
