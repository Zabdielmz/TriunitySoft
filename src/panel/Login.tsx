import { useState } from 'react'
import type { FormEvent } from 'react'
import { api } from './api'
import type { SessionInfo } from './api'

export function PanelLogin({ onLogin }: { onLogin: (session: SessionInfo) => void }) {
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (sending) return
    const values = new FormData(event.currentTarget)
    const username = String(values.get('username') || '')
    const password = String(values.get('password') || '')
    setSending(true)
    setError('')
    try {
      const session = await api.login(username, password)
      onLogin({ username: session.username })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="panel-login">
      <form className="panel-card" onSubmit={onSubmit}>
        <div className="panel-card-caption"><span>triunity — acceso</span><span>● ● ●</span></div>
        <div className="panel-card-body">
          <h1>Panel de administración</h1>
          <label>Usuario<input name="username" type="text" autoComplete="username" required minLength={3} placeholder="admin" /></label>
          <label>Contraseña<input name="password" type="password" autoComplete="current-password" required placeholder="••••••••" /></label>
          <button className="button button-primary" type="submit" disabled={sending}>
            {sending ? <><span className="button-spinner" aria-hidden="true" /> Verificando…</> : <>Entrar<span aria-hidden="true">↗</span></>}
          </button>
          <p className={`panel-form-message${error ? ' is-error' : ''}`} role="status" aria-live="polite">
            {error || '// sesión protegida · caduca en 12 h'}
          </p>
        </div>
      </form>
    </main>
  )
}
