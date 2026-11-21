function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Falta la variable de entorno: ${name}`)
  return value
}

function hexKey(name: string): Buffer {
  const hex = required(name)
  const buf = Buffer.from(hex, 'hex')
  if (buf.length !== 32 || buf.toString('hex') !== hex.toLowerCase()) {
    throw new Error(`${name} debe ser un clave hexadecimal de 32 bytes (64 caracteres)`)
  }
  return buf
}

export const config = {
  get databaseUrl(): string {
    return required('DATABASE_URL')
  },
  get resendApiKey(): string {
    return required('RESEND_API_KEY')
  },
  get resendFrom(): string {
    return required('RESEND_FROM')
  },
  get sessionSecret(): Buffer {
    return hexKey('PANEL_SESSION_SECRET')
  },
  get encryptionKey(): Buffer {
    return hexKey('CONTACT_ENCRYPTION_KEY')
  },
  get hmacSecret(): Buffer {
    return hexKey('CONTACT_HMAC_SECRET')
  },
}
