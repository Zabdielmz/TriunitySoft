import type { VercelRequest, VercelResponse } from '@vercel/node'
import { compare } from 'bcryptjs'
import { and, eq, gt, lt } from 'drizzle-orm'
import { createSessionToken, sessionCookie } from '../lib/auth.js'
import { hashIp } from '../lib/crypto.js'
import { getDb, schema } from '../lib/db.js'
import {
  clientIp,
  json,
  methodNotAllowed,
  rejectIfBadOrigin,
  rejectIfTooLarge,
} from '../lib/http.js'
import { loginSchema } from '../lib/validation.js'

const { adminUsers, loginAttempts } = schema

const ATTEMPT_WINDOW_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 5
const CLEANUP_AFTER_MS = 24 * 60 * 60 * 1000

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  try {
    if (req.method !== 'POST') return methodNotAllowed(res, 'POST')
    if (rejectIfBadOrigin(req, res)) return res
    if (rejectIfTooLarge(req, res)) return res

    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) return json(res, 400, { error: 'Datos inválidos' })
    const { username, password } = parsed.data

    const ipHash = hashIp(clientIp(req))
    const db = getDb()

    await db.delete(loginAttempts).where(lt(loginAttempts.attemptedAt, new Date(Date.now() - CLEANUP_AFTER_MS)))

    const recent = await db
      .select({ at: loginAttempts.attemptedAt })
      .from(loginAttempts)
      .where(and(eq(loginAttempts.ipHash, ipHash), gt(loginAttempts.attemptedAt, new Date(Date.now() - ATTEMPT_WINDOW_MS))))
      .limit(MAX_ATTEMPTS)
    if (recent.length >= MAX_ATTEMPTS) {
      return json(res, 429, { error: 'Demasiados intentos. Espera unos minutos.' })
    }

    const users = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1)
    const user = users[0]
    const valid = user ? await compare(password, user.passwordHash) : false

    if (!user || !valid) {
      await db.insert(loginAttempts).values({ ipHash })
      return json(res, 401, { error: 'Usuario o contraseña incorrectos' })
    }

    const token = await createSessionToken({ sub: user.id, username: user.username })
    res.setHeader('Set-Cookie', sessionCookie(token))
    return json(res, 200, { ok: true, username: user.username })
  } catch (error) {
    console.error('[auth/login] error inesperado:', error)
    return json(res, 500, { error: 'Error interno' })
  }
}
