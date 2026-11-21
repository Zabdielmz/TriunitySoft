import type { VercelRequest, VercelResponse } from '@vercel/node'
import { clearSessionCookie } from '../lib/auth'
import { json, methodNotAllowed, rejectIfBadOrigin } from '../lib/http'

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST')
  if (rejectIfBadOrigin(req, res)) return res
  res.setHeader('Set-Cookie', clearSessionCookie())
  return json(res, 200, { ok: true })
}
