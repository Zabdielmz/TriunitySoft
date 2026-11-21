import { SignJWT, jwtVerify } from 'jose'
import type { VercelRequest } from '@vercel/node'
import { config } from './config.js'

const COOKIE_NAME = 'triunity_session'
const COOKIE_MAX_AGE = 43200

export interface SessionPayload {
  sub: string
  username: string
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ username: payload.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(config.sessionSecret)
}

export function sessionCookie(token: string): string {
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${COOKIE_MAX_AGE}`
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
}

export async function readSession(req: VercelRequest): Promise<SessionPayload | null> {
  const header = req.headers.cookie
  if (!header) return null
  const match = new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`).exec(header)
  if (!match || !match[1]) return null
  try {
    const { payload } = await jwtVerify(match[1], config.sessionSecret, { algorithms: ['HS256'] })
    if (typeof payload.sub !== 'string' || typeof payload.username !== 'string') return null
    return { sub: payload.sub, username: payload.username }
  } catch {
    return null
  }
}
