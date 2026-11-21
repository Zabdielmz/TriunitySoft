import type { VercelRequest, VercelResponse } from '@vercel/node'
import { and, count, eq, gt } from 'drizzle-orm'
import { hashEmail, hashIp, encryptField } from './lib/crypto.js'
import { getDb, schema } from './lib/db.js'
import { sendSubmissionNotification } from './lib/email.js'
import {
  clientIp,
  json,
  methodNotAllowed,
  rejectIfBadOrigin,
  rejectIfTooLarge,
} from './lib/http.js'
import { contactSchema } from './lib/validation.js'

const { contactSubmissions } = schema

const EMAIL_COOLDOWN_MS = 60_000
const IP_COOLDOWN_MS = 15_000
const IP_HOURLY_LIMIT = 5
const MIN_FILL_MS = 3_000
const MAX_FILL_MS = 7 * 24 * 60 * 60 * 1000

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  try {
    if (req.method !== 'POST') return methodNotAllowed(res, 'POST')
    if (rejectIfBadOrigin(req, res)) return res
    if (rejectIfTooLarge(req, res)) return res

    const body: unknown = req.body
    if (!body || typeof body !== 'object') return json(res, 400, { error: 'Cuerpo inválido' })

    const draft = body as Record<string, unknown>
    if (typeof draft.website === 'string' && draft.website.trim() !== '') {
      return json(res, 200, { ok: true })
    }

    const parsed = contactSchema.safeParse(body)
    if (!parsed.success) return json(res, 400, { error: 'Datos inválidos' })
    const data = parsed.data

    const now = Date.now()
    const fillTime = now - data.startedAt
    if (!Number.isFinite(fillTime) || fillTime < MIN_FILL_MS || fillTime > MAX_FILL_MS) {
      return json(res, 200, { ok: true })
    }

    const urlCount = data.message.match(/https?:\/\//gi)?.length ?? 0
    if (urlCount > 3) return json(res, 200, { ok: true })

    const ipHash = hashIp(clientIp(req))
    const emailHash = hashEmail(data.email)
    const db = getDb()

    const sinceEmail = new Date(now - EMAIL_COOLDOWN_MS)
    const sinceIp = new Date(now - IP_COOLDOWN_MS)
    const sinceHour = new Date(now - 60 * 60 * 1000)

    const [recentEmail, recentIp, hourly] = await Promise.all([
      db
        .select({ id: contactSubmissions.id })
        .from(contactSubmissions)
        .where(and(eq(contactSubmissions.emailHash, emailHash), gt(contactSubmissions.createdAt, sinceEmail)))
        .limit(1),
      db
        .select({ id: contactSubmissions.id })
        .from(contactSubmissions)
        .where(and(eq(contactSubmissions.ipHash, ipHash), gt(contactSubmissions.createdAt, sinceIp)))
        .limit(1),
      db
        .select({ value: count() })
        .from(contactSubmissions)
        .where(and(eq(contactSubmissions.ipHash, ipHash), gt(contactSubmissions.createdAt, sinceHour))),
    ])

    if (recentEmail.length > 0) {
      return json(res, 429, { error: 'Ya enviaste un mensaje hace poco. Espera un minuto.' })
    }
    if (recentIp.length > 0) {
      return json(res, 429, { error: 'Espera unos segundos antes de enviar otro mensaje.' })
    }
    if ((hourly[0]?.value ?? 0) >= IP_HOURLY_LIMIT) {
      return json(res, 429, { error: 'Demasiados mensajes desde tu red. Intenta más tarde.' })
    }

    await db.insert(contactSubmissions).values({
      category: data.category,
      nameEnc: encryptField(data.name),
      emailEnc: encryptField(data.email),
      messageEnc: encryptField(data.message),
      emailHash,
      ipHash,
    })

    try {
      await sendSubmissionNotification({
        name: data.name,
        email: data.email,
        category: data.category,
        message: data.message,
        createdAt: new Date(),
      })
    } catch (notifyError) {
      console.error('[notify] fallo al enviar la notificación:', notifyError)
    }

    return json(res, 200, { ok: true })
  } catch (error) {
    console.error('[contact] error inesperado:', error)
    return json(res, 500, { error: 'Error interno' })
  }
}
