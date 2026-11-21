import { Resend } from 'resend'
import { config } from './config.js'
import { getDb, schema } from './db.js'
import { buildNotificationHtml, buildNotificationText } from './email-template.js'
import type { SubmissionNotification } from './email-template.js'

let client: Resend | null = null
function resendClient(): Resend {
  if (!client) client = new Resend(config.resendApiKey)
  return client
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
    replyTo: payload.email,
    subject: `Nueva solicitud — ${payload.category} — ${payload.name}`,
    text: buildNotificationText(payload),
    html: buildNotificationHtml(payload),
  })
  if (error) throw new Error(`Resend: ${error.message}`)
}
