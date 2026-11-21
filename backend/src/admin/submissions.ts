import type { VercelRequest, VercelResponse } from '@vercel/node'
import { desc, eq } from 'drizzle-orm'
import { readSession } from '../lib/auth'
import { decryptField } from '../lib/crypto'
import { getDb, schema } from '../lib/db'
import {
  json,
  methodNotAllowed,
  rejectIfBadOrigin,
  rejectIfTooLarge,
} from '../lib/http'
import { markReadSchema } from '../lib/validation'

const { contactSubmissions } = schema

const LIST_LIMIT = 200

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  try {
    const session = await readSession(req)
    if (!session) return json(res, 401, { error: 'No autenticado' })

    const db = getDb()

    if (req.method === 'GET') {
      const rows = await db
        .select()
        .from(contactSubmissions)
        .orderBy(desc(contactSubmissions.createdAt))
        .limit(LIST_LIMIT)
      const submissions = rows.map((row) => ({
        id: row.id,
        name: decryptField(row.nameEnc),
        email: decryptField(row.emailEnc),
        message: decryptField(row.messageEnc),
        category: row.category,
        read: row.read,
        createdAt: row.createdAt,
      }))
      return json(res, 200, { submissions })
    }

    if (req.method === 'PATCH') {
      if (rejectIfBadOrigin(req, res)) return res
      if (rejectIfTooLarge(req, res)) return res
      const parsed = markReadSchema.safeParse(req.body)
      if (!parsed.success) return json(res, 400, { error: 'Datos inválidos' })
      const updated = await db
        .update(contactSubmissions)
        .set({ read: parsed.data.read })
        .where(eq(contactSubmissions.id, parsed.data.id))
        .returning({ id: contactSubmissions.id })
      if (updated.length === 0) return json(res, 404, { error: 'Solicitud no encontrada' })
      return json(res, 200, { ok: true })
    }

    return methodNotAllowed(res, 'GET o PATCH')
  } catch (error) {
    console.error('[admin/submissions] error inesperado:', error)
    return json(res, 500, { error: 'Error interno' })
  }
}
