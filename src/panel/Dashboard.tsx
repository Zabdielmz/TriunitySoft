import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from './api'
import type { NotifyEmail, SessionInfo, Submission } from './api'
import { PanelIcon } from './Icon'

const categoryLabels: Record<string, string> = { software: 'Software', web: 'Web', videojuego: 'Videojuego', otro: 'Otro' }
function formatDate(value: string, compact = false): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('es-MX', { dateStyle: compact ? 'short' : 'long', timeStyle: compact ? undefined : 'short', timeZone: 'America/Mexico_City' })
}
function initials(name: string) { return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?' }
type Tab = 'solicitudes' | 'correos'
type Filter = 'all' | 'unread' | 'read'

export function PanelDashboard({ session, onLogout }: { session: SessionInfo; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('solicitudes')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [emails, setEmails] = useState<NotifyEmail[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const noticeTimer = useRef<number | undefined>(undefined)
  const detailRef = useRef<HTMLElement>(null)
  const lastMessageButton = useRef<HTMLButtonElement | null>(null)
  const filterGroupRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [subs, mails] = await Promise.all([api.submissions(), api.notifyEmails()])
      setSubmissions(subs.submissions)
      setEmails(mails.emails)
      setError('')
      setLoaded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos cargar el panel. Intenta actualizar.')
    } finally { setLoading(false) }
  }, [])
  useEffect(() => { void load(); return () => window.clearTimeout(noticeTimer.current) }, [load])

  const flash = (message: string) => {
    window.clearTimeout(noticeTimer.current)
    setNotice(message)
    noticeTimer.current = window.setTimeout(() => setNotice(''), 4500)
  }
  const toggleRead = async (submission: Submission) => {
    if (busy) return
    setBusy(submission.id)
    setNotice('')
    try {
      await api.markRead(submission.id, !submission.read)
      setSubmissions((rows) => rows.map((row) => row.id === submission.id ? { ...row, read: !submission.read } : row))
      setError('')
      flash(submission.read ? 'Solicitud marcada como pendiente de lectura.' : 'Solicitud marcada como leída.')
      if ((filter === 'unread' && !submission.read) || (filter === 'read' && submission.read)) {
        setSelectedId(null)
        requestAnimationFrame(() => filterGroupRef.current?.focus({ preventScroll: true }))
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'No pudimos actualizar la solicitud.') }
    finally { setBusy(null) }
  }
  const onAddEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    const form = event.currentTarget
    const email = String(new FormData(form).get('email') || '').trim()
    if (!email) return
    setBusy('add')
    setNotice('')
    try {
      await api.addNotifyEmail(email)
      form.reset()
      flash('Destinatario agregado. Recibirá las nuevas solicitudes.')
      await load()
    } catch (err) { setError(err instanceof Error ? err.message : 'No pudimos agregar el correo.') }
    finally { setBusy(null) }
  }
  const onRemoveEmail = async (id: string) => {
    if (busy) return
    setBusy(id)
    setNotice('')
    try {
      await api.removeNotifyEmail(id)
      flash('Destinatario eliminado de las notificaciones.')
      await load()
    } catch (err) { setError(err instanceof Error ? err.message : 'No pudimos eliminar el correo.') }
    finally { setBusy(null) }
  }
  const handleLogout = async () => {
    if (busy) return
    setBusy('logout')
    try { await api.logout(); onLogout() }
    catch (err) { setError(err instanceof Error ? err.message : 'No pudimos cerrar la sesión. Intenta de nuevo.'); setBusy(null) }
  }

  const unread = submissions.filter((row) => !row.read).length
  const query = search.trim().toLocaleLowerCase('es-MX')
  const visible = submissions.filter((row) =>
    (filter === 'all' || (filter === 'read' ? row.read : !row.read)) &&
    (category === 'all' || row.category === category) &&
    (!query || `${row.name} ${row.email} ${row.message}`.toLocaleLowerCase('es-MX').includes(query)),
  )
  const selected = visible.find((row) => row.id === selectedId)
  const hasFilters = Boolean(query || category !== 'all' || filter !== 'all')
  const resetFilters = () => { setSearch(''); setFilter('all'); setCategory('all') }
  const closeMessage = () => {
    setSelectedId(null)
    requestAnimationFrame(() => lastMessageButton.current?.focus({ preventScroll: true }))
  }

  return (
    <div className="panel-dashboard">
      <a className="skip-link" href="#panel-main">Ir al contenido</a>
      <aside className="panel-sidebar">
        <a className="panel-wordmark" href="/" aria-label="Triunity, volver al sitio">TRIUNITY<span /></a>
        <div className="panel-workspace-label">Espacio de administración</div>
        <nav className="panel-navigation" aria-label="Secciones del panel">
          <button type="button" aria-current={tab === 'solicitudes' ? 'page' : undefined} onClick={() => setTab('solicitudes')}><PanelIcon name="inbox" /><span>Bandeja<span className="panel-nav-extra"> de entrada</span></span>{loaded && <span className="panel-nav-count">{unread}</span>}</button>
          <button type="button" aria-current={tab === 'correos' ? 'page' : undefined} onClick={() => setTab('correos')}><PanelIcon name="mail" />Notificaciones</button>
        </nav>
        <div className="panel-sidebar-bottom"><a href="/"><PanelIcon name="back" />Ver sitio web</a><div className="panel-account"><span className="panel-avatar">{initials(session.username)}</span><div><strong>{session.username}</strong><small>Administrador</small></div><button type="button" onClick={() => void handleLogout()} disabled={Boolean(busy)} aria-label="Cerrar sesión" title="Cerrar sesión">{busy === 'logout' ? <span className="panel-spinner" /> : <PanelIcon name="logout" />}</button></div></div>
      </aside>

      <main className="panel-main" id="panel-main">
        <header className="panel-page-header">
          <div><h1>{tab === 'solicitudes' ? 'Bandeja de entrada' : 'Notificaciones'}</h1><p>{tab === 'solicitudes' ? 'Las próximas conversaciones de Triunity empiezan aquí.' : 'Las nuevas oportunidades también llegan a tu correo.'}</p></div>
          <button className="panel-button panel-button-secondary" type="button" onClick={() => void load()} disabled={loading || Boolean(busy)}><PanelIcon name="refresh" className={loading ? 'is-spinning' : ''} />{loading ? 'Actualizando…' : 'Actualizar'}</button>
        </header>

        <div className="panel-announcements" aria-live="polite" role="status">{notice && <p className="panel-feedback is-ok"><PanelIcon name="check" />{notice}</p>}</div>
        {error && <div className="panel-feedback is-error" role="alert"><PanelIcon name="info" /><span>{error}</span><button type="button" onClick={() => void load()} disabled={loading || Boolean(busy)}>Actualizar datos</button></div>}

        {tab === 'solicitudes' ? <section className="panel-inbox" aria-label="Solicitudes de contacto" aria-busy={loading}>
          <div className="panel-inbox-toolbar">
            <div className="panel-filters" ref={filterGroupRef} tabIndex={-1} role="group" aria-label="Filtrar por lectura">{([['all', 'Todas', submissions.length], ['unread', 'Pendientes', unread], ['read', 'Leídas', submissions.length - unread]] as const).map(([value, label, count]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}{loaded && <span>{count}</span>}</button>)}</div>
            <div className="panel-search-row"><div className="panel-search"><PanelIcon name="search" /><input type="search" aria-label="Buscar solicitudes" placeholder="Buscar nombre, correo o mensaje…" value={search} onChange={(event) => setSearch(event.target.value)} /></div><select aria-label="Filtrar por tipo de proyecto" value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">Todos los proyectos</option>{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
          </div>
          <div className={`panel-inbox-content${selected ? ' has-selection' : ''}`}>
            <div className="panel-message-list">
              <div className="panel-list-caption"><span>{filter === 'unread' ? 'Pendientes de lectura' : filter === 'read' ? 'Solicitudes leídas' : 'Solicitudes de contacto'}</span><span>{loaded ? `${visible.length} ${visible.length === 1 ? 'mensaje' : 'mensajes'}` : 'Cargando…'}</span></div>
              {loading && !loaded ? <div className="panel-skeleton-list" role="status"><span className="panel-sr-only">Cargando solicitudes</span>{[0, 1, 2, 3].map((key) => <div className="panel-skeleton" key={key}><i /><i /><i /></div>)}</div> : !loaded ? <div className="panel-empty"><PanelIcon name="info" /><h2>No pudimos cargar la bandeja</h2><p>Actualiza el panel para volver a intentarlo.</p></div> : visible.length === 0 ? <div className="panel-empty"><PanelIcon name={hasFilters ? 'search' : 'inbox'} /><h2>{hasFilters ? 'Sin coincidencias' : 'Todo listo para recibir ideas'}</h2><p>{hasFilters ? 'Prueba con otra búsqueda o cambia los filtros.' : 'Cuando alguien envíe el formulario del sitio, su solicitud aparecerá aquí.'}</p>{hasFilters && <button className="panel-button panel-button-secondary" type="button" onClick={resetFilters}>Limpiar filtros</button>}</div> : <ul className="panel-messages">{visible.map((row) => <li key={row.id}><button type="button" className={`panel-message-row${row.read ? ' is-read' : ''}${selected?.id === row.id ? ' is-selected' : ''}`} aria-pressed={selected?.id === row.id} onClick={(event) => { lastMessageButton.current = event.currentTarget; setSelectedId(row.id); requestAnimationFrame(() => detailRef.current?.focus({ preventScroll: !window.matchMedia("(max-width: 760px)").matches })) }}>
                <span className="panel-avatar">{initials(row.name)}</span><span className="panel-message-summary"><span className="panel-message-title"><strong>{row.name}</strong><time dateTime={row.createdAt}>{formatDate(row.createdAt, true)}</time></span><span className="panel-message-preview">{row.message}</span><span className="panel-message-tags"><span className={`panel-category category-${row.category}`}>{categoryLabels[row.category] ?? row.category}</span><span className={`panel-read-label${row.read ? '' : ' is-unread'}`}>{row.read ? 'Leída' : 'Pendiente'}</span></span></span><PanelIcon name="chevron" />
              </button></li>)}</ul>}
            </div>
            <section className="panel-message-detail" ref={detailRef} tabIndex={-1} aria-label={selected ? `Mensaje de ${selected.name}` : 'Vista del mensaje'}>
              {selected ? <>
                <div className="panel-detail-toolbar"><button className="panel-mobile-back panel-button panel-button-secondary" type="button" onClick={closeMessage}><PanelIcon name="back" />Bandeja</button><span className={`panel-read-label${selected.read ? '' : ' is-unread'}`}>{selected.read ? 'Solicitud leída' : 'Pendiente de lectura'}</span><button className="panel-text-button" type="button" onClick={() => void toggleRead(selected)} disabled={Boolean(busy) || loading}>{busy === selected.id ? <span className="panel-spinner" /> : <PanelIcon name={selected.read ? 'inbox' : 'check'} />}{selected.read ? 'Marcar pendiente' : 'Marcar leída'}</button></div>
                <div className="panel-detail-body"><span className={`panel-category category-${selected.category}`}>{categoryLabels[selected.category] ?? selected.category}</span><h2>{selected.name}</h2><a className="panel-sender-email" href={`mailto:${selected.email}`}>{selected.email}</a><time className="panel-detail-date" dateTime={selected.createdAt}>{formatDate(selected.createdAt)} · Ciudad de México</time><div className="panel-message-text">{selected.message}</div></div>
                <div className="panel-detail-footer"><a className="panel-button panel-button-primary" href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: tu solicitud — ${selected.name}`)}`}><PanelIcon name="mail" />Responder por correo</a><p>Se abrirá tu aplicación de correo.</p></div>
              </> : <div className="panel-empty panel-detail-empty"><PanelIcon name="mail" /><h2>Una conversación a la vez</h2><p>Selecciona una solicitud para leer el mensaje completo y responder por correo.</p></div>}
            </section>
          </div>
          <p className="panel-inbox-footnote">Se muestran hasta 200 solicitudes recientes. “Leída” indica que se revisó el mensaje, sin confirmar que se haya respondido.</p>
        </section> : <section className="panel-notifications" aria-label="Destinatarios de notificaciones" aria-busy={loading}>
          <div className="panel-recipients"><div className="panel-section-header"><div><h2>Destinatarios del equipo</h2><p>Cada nueva solicitud se enviará a estos correos.</p></div><span className="panel-capacity">{loaded ? `${emails.length} / 10` : '… / 10'}</span></div>
            {loading && !loaded ? <div className="panel-skeleton-list" role="status"><span className="panel-sr-only">Cargando destinatarios</span><div className="panel-skeleton"><i /><i /></div></div> : !loaded ? <div className="panel-empty"><h3>No pudimos cargar los destinatarios</h3><p>Actualiza el panel para volver a intentarlo.</p></div> : <ul className="panel-email-list">{emails.map((row) => <li key={row.id}><span className="panel-email-icon"><PanelIcon name="mail" /></span><div><strong>{row.email}</strong><span>Recibe nuevas solicitudes</span></div><button className="panel-icon-button" type="button" onClick={() => void onRemoveEmail(row.id)} disabled={Boolean(busy) || loading || emails.length <= 1} aria-label={`Eliminar ${row.email}`} title={emails.length <= 1 ? 'Debe quedar al menos un destinatario' : 'Eliminar destinatario'}>{busy === row.id ? <span className="panel-spinner" /> : <PanelIcon name="trash" />}</button></li>)}{emails.length === 0 && <li className="panel-no-recipients"><PanelIcon name="mail" /><div><strong>Aún no hay destinatarios</strong><span>Agrega un correo para recibir los avisos de nuevas solicitudes.</span></div></li>}</ul>}
            <form className="panel-email-form" onSubmit={onAddEmail}><label htmlFor="notify-email">Agregar destinatario</label><div><input id="notify-email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="nombre@correo.com" disabled={Boolean(busy) || loading || !loaded || emails.length >= 10} /><button className="panel-button panel-button-primary" type="submit" disabled={Boolean(busy) || loading || !loaded || emails.length >= 10}>{busy === 'add' ? <span className="panel-spinner" /> : <PanelIcon name="plus" />}{busy === 'add' ? 'Agregando…' : 'Agregar correo'}</button></div><p>{emails.length >= 10 ? 'Alcanzaste el límite de 10 destinatarios. Elimina uno para agregar otro.' : 'Puedes agregar hasta 10 correos. Debe permanecer al menos un destinatario.'}</p></form>
          </div>
          <aside className="panel-notification-guide"><div className="panel-guide-icon"><PanelIcon name="info" /></div><h2>Del formulario a tu equipo</h2><p>El aviso incluye los datos de contacto, el tipo de proyecto y el mensaje completo.</p><p>La solicitud también queda en la bandeja del panel para que puedas revisarla cuando lo necesites.</p><div><PanelIcon name="inbox" /><span>Agregar o eliminar un correo solo cambia quién recibe las próximas notificaciones.</span></div></aside>
        </section>}
      </main>
    </div>
  )
}
