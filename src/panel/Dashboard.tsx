import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from './api'
import type { NotifyEmail, SessionInfo, Submission } from './api'

const categoryLabels: Record<string, string> = {
  software: 'Software',
  web: 'Web',
  videojuego: 'Videojuego',
  otro: 'Otro',
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Mexico_City' })
}

type Tab = 'solicitudes' | 'correos'

export function PanelDashboard({ session, onLogout }: { session: SessionInfo; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('solicitudes')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [emails, setEmails] = useState<NotifyEmail[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [subs, mails] = await Promise.all([api.submissions(), api.notifyEmails()])
      setSubmissions(subs.submissions)
      setEmails(mails.emails)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const flash = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice((current) => (current === message ? '' : current)), 3500)
  }

  const toggleRead = async (submission: Submission) => {
    try {
      await api.markRead(submission.id, !submission.read)
      setSubmissions((rows) => rows.map((row) => (row.id === submission.id ? { ...row, read: !submission.read } : row)))
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar')
    }
  }

  const onAddEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const email = String(values.get('email') || '').trim()
    if (!email) return
    try {
      await api.addNotifyEmail(email)
      event.currentTarget.reset()
      flash('Correo agregado a las notificaciones')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar')
    }
  }

  const onRemoveEmail = async (id: string) => {
    try {
      await api.removeNotifyEmail(id)
      flash('Correo eliminado')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  const handleLogout = async () => {
    try { await api.logout() } catch { /* la cookie se limpia igual en el servidor */ }
    onLogout()
  }

  const unread = submissions.filter((row) => !row.read).length

  return (
    <main className="panel-dashboard">
      <header className="panel-topbar">
        <div className="panel-topbar-brand"><span className="panel-logo">TRIUNITY</span><span className="panel-topbar-path">/ panel</span></div>
        <div className="panel-topbar-actions">
          <span className="panel-user">{session.username}</span>
          <button className="button button-outline" type="button" onClick={() => void load()} disabled={loading}>Actualizar</button>
          <button className="button button-outline" type="button" onClick={() => void handleLogout()}>Salir</button>
        </div>
      </header>

      <nav className="panel-tabs" aria-label="Secciones del panel">
        <button type="button" className={tab === 'solicitudes' ? 'active' : ''} onClick={() => setTab('solicitudes')}>
          Solicitudes{unread > 0 && <em>{unread}</em>}
        </button>
        <button type="button" className={tab === 'correos' ? 'active' : ''} onClick={() => setTab('correos')}>
          Notificaciones{emails.length > 0 && <em>{emails.length}</em>}
        </button>
      </nav>

      <div className="panel-notice" role="status" aria-live="polite">
        {notice && <span className="is-ok">{notice}</span>}
        {error && <span className="is-error">{error}</span>}
      </div>

      {tab === 'solicitudes' ? (
        <section className="panel-list" aria-label="Solicitudes de contacto">
          {loading && submissions.length === 0 && <p className="panel-empty">Cargando solicitudes…</p>}
          {!loading && submissions.length === 0 && <p className="panel-empty">// sin solicitudes por ahora</p>}
          {submissions.map((row) => (
            <article className={`panel-submission${row.read ? ' is-read' : ''}`} key={row.id}>
              <button className="panel-submission-head" type="button" onClick={() => setExpanded(expanded === row.id ? null : row.id)} aria-expanded={expanded === row.id}>
                <span className={`panel-dot${row.read ? '' : ' is-unread'}`} aria-hidden="true" />
                <strong>{row.name}</strong>
                <span className="panel-category">{categoryLabels[row.category] ?? row.category}</span>
                <time dateTime={row.createdAt}>{formatDate(row.createdAt)}</time>
                <span className="panel-chevron" aria-hidden="true">{expanded === row.id ? '−' : '+'}</span>
              </button>
              {expanded === row.id && (
                <div className="panel-submission-body">
                  <p className="panel-submission-meta"><a href={`mailto:${row.email}`}>{row.email}</a></p>
                  <p className="panel-submission-message">{row.message}</p>
                  <div className="panel-submission-actions">
                    <button className="button button-outline" type="button" onClick={() => void toggleRead(row)}>
                      {row.read ? 'Marcar como no leído' : 'Marcar como leído'}
                    </button>
                    <a className="button button-outline" href={`mailto:${row.email}?subject=${encodeURIComponent(`Re: tu solicitud — ${row.name}`)}`}>Responder<span aria-hidden="true">↗</span></a>
                  </div>
                </div>
              )}
            </article>
          ))}
        </section>
      ) : (
        <section className="panel-list" aria-label="Correos de notificación">
          <p className="panel-hint">A estos correos llega el resumen de cada nueva solicitud. Máximo 10.</p>
          <ul className="panel-email-list">
            {emails.map((row) => (
              <li key={row.id}>
                <span>{row.email}</span>
                <button type="button" onClick={() => void onRemoveEmail(row.id)} aria-label={`Eliminar ${row.email}`}>eliminar</button>
              </li>
            ))}
            {emails.length === 0 && <li className="panel-empty">// sin correos configurados: las solicitudes se guardan sin notificar</li>}
          </ul>
          <form className="panel-email-form" onSubmit={onAddEmail}>
            <label>Correo nuevo<input name="email" type="email" required placeholder="alguien@correo.com" /></label>
            <button className="button button-primary" type="submit">Agregar<span aria-hidden="true">+</span></button>
          </form>
        </section>
      )}
    </main>
  )
}
