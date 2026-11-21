import type { VercelRequest, VercelResponse } from '@vercel/node'
import { readSession } from '../lib/auth.js'
import { json, methodNotAllowed } from '../lib/http.js'

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  if (req.method !== 'GET') return methodNotAllowed(res, 'GET')
  const session = await readSession(req)
  if (!session) return json(res, 401, { error: 'No autenticado' })
  return json(res, 200, { username: session.username })
}
