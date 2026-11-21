import { useEffect, useState } from 'react'
import { api } from './api'
import type { SessionInfo } from './api'
import { PanelLogin } from './Login'
import { PanelDashboard } from './Dashboard'

type SessionState = SessionInfo | null | 'loading'

export function PanelApp() {
  const [session, setSession] = useState<SessionState>('loading')

  useEffect(() => {
    let cancelled = false
    api
      .session()
      .then((info) => { if (!cancelled) setSession(info) })
      .catch(() => { if (!cancelled) setSession(null) })
    return () => { cancelled = true }
  }, [])

  if (session === 'loading') {
    return <div className="panel-boot" role="status">Cargando panel…</div>
  }
  if (!session) {
    return <PanelLogin onLogin={setSession} />
  }
  return <PanelDashboard session={session} onLogout={() => setSession(null)} />
}
