export interface ContactRequest {
  name: string
  email: string
  category: string
  message: string
  website?: string
}

export class ContactError extends Error {
  readonly code: 'rate-limited' | 'invalid' | 'network' | 'server'

  constructor(code: ContactError['code'], message: string) {
    super(message)
    this.name = 'ContactError'
    this.code = code
  }
}

export async function submitContact(request: ContactRequest, startedAt: number): Promise<void> {
  let response: Response
  try {
    response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...request, startedAt }),
    })
  } catch {
    throw new ContactError('network', 'Sin conexión. Intenta de nuevo.')
  }

  if (response.ok) return

  const body = (await response.json().catch(() => null)) as { error?: string } | null
  if (response.status === 429) {
    throw new ContactError('rate-limited', body?.error ?? 'Espera unos segundos antes de enviar otro mensaje.')
  }
  if (response.status === 413) {
    throw new ContactError('invalid', 'El mensaje es demasiado largo.')
  }
  if (response.status >= 400 && response.status < 500) {
    throw new ContactError('invalid', body?.error ?? 'Revisa los datos del formulario.')
  }
  throw new ContactError('server', body?.error ?? 'Error interno. Intenta más tarde.')
}
