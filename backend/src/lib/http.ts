import type { VercelRequest, VercelResponse } from '@vercel/node'

export const MAX_BODY_BYTES = 32_768

export function json(res: VercelResponse, status: number, body: unknown): VercelResponse {
  return res.status(status).json(body)
}

export function methodNotAllowed(res: VercelResponse, method: string): VercelResponse {
  return json(res, 405, { error: `Método no permitido (usa ${method})` })
}

export function originAllowed(req: VercelRequest): boolean {
  const origin = req.headers.origin
  if (!origin) return true
  try {
    return new URL(origin).host === (req.headers.host ?? '')
  } catch {
    return false
  }
}

export function rejectIfBadOrigin(req: VercelRequest, res: VercelResponse): boolean {
  if (originAllowed(req)) return false
  json(res, 403, { error: 'Origen no permitido' })
  return true
}

export function rejectIfTooLarge(req: VercelRequest, res: VercelResponse): boolean {
  const raw = req.headers['content-length']
  const value = Array.isArray(raw) ? raw[0] : raw
  if (value && Number(value) > MAX_BODY_BYTES) {
    json(res, 413, { error: 'Cuerpo demasiado grande' })
    return true
  }
  return false
}

export function clientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded
  const candidate = first ?? req.socket?.remoteAddress ?? 'unknown'
  return candidate.split(',')[0]?.trim() || 'unknown'
}
