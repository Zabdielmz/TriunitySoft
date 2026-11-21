import { useState } from 'react'
import type { FormEvent } from 'react'
import { api } from './api'
import type { SessionInfo } from './api'
import { PanelIcon } from './Icon'

export function PanelLogin({ onLogin }: { onLogin: (session: SessionInfo) => void }) {
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (sending) return
    const values = new FormData(event.currentTarget)
    setSending(true)
    setError('')
    try {
      const session = await api.login(String(values.get('username') || ''), String(values.get('password') || ''))
      onLogin({ username: session.username })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos iniciar sesión. Intenta de nuevo.')
    } finally { setSending(false) }
  }

  return (
    <main className="panel-login">
      <section className="panel-login-story" aria-label="Triunity administración">
        <a className="panel-wordmark" href="/" aria-label="Triunity, volver al sitio">TRIUNITY<span /></a>
        <div className="panel-login-intro">
          <h1>Detrás de cada<br />mensaje, una<br /><span>nueva posibilidad.</span></h1>
          <p>El espacio del equipo para conectar con quienes quieren construir algo con Triunity.</p>
          <div className="panel-login-capabilities"><PanelIcon name="inbox" /><span>Solicitudes en un solo lugar</span><PanelIcon name="mail" /><span>Tu equipo, al tanto</span></div>
        </div>
        <p className="panel-login-signature">Jugamos en serio. Creamos con pasión.</p>
      </section>
      <section className="panel-login-access" aria-labelledby="login-title">
        <div className="panel-login-form-wrap">
          <div className="panel-login-lock"><PanelIcon name="lock" /></div>
          <h2 id="login-title">Bienvenido al panel</h2>
          <p className="panel-login-description">Inicia sesión para revisar los mensajes y gestionar las notificaciones del equipo.</p>
          <form className="panel-login-form" onSubmit={onSubmit} aria-busy={sending}>
            <label htmlFor="username">Usuario</label>
            <input id="username" name="username" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} required minLength={3} placeholder="Tu usuario de administrador" disabled={sending} aria-describedby={error ? 'login-error' : undefined} />
            <label htmlFor="password">Contraseña</label>
            <div className="panel-password-field">
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required placeholder="Escribe tu contraseña" disabled={sending} aria-describedby={error ? 'login-error' : undefined} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPassword}><PanelIcon name={showPassword ? 'eyeOff' : 'eye'} /></button>
            </div>
            {error && <p className="panel-feedback is-error" id="login-error" role="alert"><PanelIcon name="info" />{error}</p>}
            <button className="panel-button panel-button-primary panel-login-submit" type="submit" disabled={sending}>{sending ? <><span className="panel-spinner" />Verificando acceso…</> : <><PanelIcon name="lock" />Iniciar sesión</>}</button>
          </form>
          <p className="panel-access-note"><PanelIcon name="lock" />Acceso exclusivo para administradores.<br />La sesión caduca después de 12 horas.</p>
          <a className="panel-back-site" href="/"><PanelIcon name="back" />Volver al sitio</a>
        </div>
      </section>
    </main>
  )
}
