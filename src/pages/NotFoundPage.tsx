import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  useEffect(() => { document.title = '404 — Triunity' }, [])
  return <main className="not-found" id="main"><div className="container not-found-inner"><span className="error-code">ERROR 404</span><h1>Ruta no encontrada<span className="period">.</span></h1><div className="stacktrace"><p>Uncaught RouteNotFoundError: esta página salió a explorar otro universo.</p><p>at /triunity/router.ts:404:3</p><p>at encontrarCamino (/home, /proyectos, /contacto)</p></div><Link className="button button-primary" to="/">Volver al inicio <span aria-hidden="true">↗</span></Link></div></main>
}
