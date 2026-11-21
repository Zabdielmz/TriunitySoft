import type { VercelRequest, VercelResponse } from '@vercel/node'
import { count, eq } from 'drizzle-orm'
import { readSession } from '../lib/auth'
import { getDb, schema } from '../lib/db'
import {
  json,
  methodNotAllowed,
  rejectIfBadOrigin,
  rejectIfTooLarge,
} from '../lib/http'
import { notifyEmailSchema, removeNotifySchema } from '../lib/validation'

const { notifyEmails } = schema

const MAX_NOTIFY_EMAILS = 10

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  try {
    const session = await readSession(req)
    if (!session) return json(res, 401, { error: 'No autenticado' })

    const db = getDb()

    if (req.method === 'GET') {
      const rows = await db
        .select({ id: notifyEmails.id, email: notifyEmails.email })
        .from(notifyEmails)
        .orderBy(notifyEmails.email)
      return json(res, 200, { emails: rows })
    }

    if (rejectIfBadOrigin(req, res)) return res
    if (rejectIfTooLarge(req, res)) return res

    if (req.method === 'POST') {
      const parsed = notifyEmailSchema.safeParse(req.body)
      if (!parsed.success) return json(res, 400, { error: 'Email inválido' })

      const [total] = await db.select({ value: count() }).from(notifyEmails)
      if ((total?.value ?? 0) >= MAX_NOTIFY_EMAILS) {
        return json(res, 400, { error: `Máximo ${MAX_NOTIFY_EMAILS} correos` })
      }

      const inserted = await db
        .insert(notifyEmails)
        .values({ email: parsed.data.email.toLowerCase() })
        .onConflictDoNothing()
        .returning({ id: notifyEmails.id })
      if (inserted.length === 0) return json(res, 409, { error: 'Ese correo ya está en la lista' })
      return json(res, 201, { ok: true })
    }

    if (req.method === 'DELETE') {
      const idRaw = req.query.id
      const id = typeof idRaw === 'string' ? idRaw : ''
      const parsed = removeNotifySchema.safeParse({ id })
      if (!parsed.success) return json(res, 400, { error: 'Datos inválidos' })

      const [total] = await db.select({ value: count() }).from(notifyEmails)
      if ((total?.value ?? 1) <= 1) {
        return json(res, 400, { error: 'Debe quedar al menos un correo en la lista' })
      }

      const deleted = await db
        .delete(notifyEmails)
        .where(eq(notifyEmails.id, parsed.data.id))
        .returning({ id: notifyEmails.id })
      if (deleted.length === 0) return json(res, 404, { error: 'Correo no encontrado' })
      return json(res, 200, { ok: true })
    }

    return methodNotAllowed(res, 'GET, POST o DELETE')
  } catch (error) {
    console.error('[admin/notify] error inesperado:', error)
    return json(res, 500, { error: 'Error interno' })
  }
}
