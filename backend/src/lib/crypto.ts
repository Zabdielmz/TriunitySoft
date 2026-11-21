import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'node:crypto'
import { config } from './config'

export function encryptField(plain: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', config.encryptionKey, iv)
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('base64')}.${tag.toString('base64')}.${encrypted.toString('base64')}`
}

export function decryptField(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split('.')
  if (!ivB64 || !tagB64 || !dataB64) throw new Error('Formato de campo cifrado inválido')
  const decipher = createDecipheriv('aes-256-gcm', config.encryptionKey, Buffer.from(ivB64, 'base64'))
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()]).toString('utf8')
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function hmacValue(value: string): string {
  return createHmac('sha256', config.hmacSecret).update(value).digest('hex')
}

export function hashIp(ip: string): string {
  return hmacValue(`ip:${ip}`)
}

export function hashEmail(email: string): string {
  return hmacValue(`email:${normalizeEmail(email)}`)
}
