import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Logo } from './Logo'

const links = [
  { to: '/#inicio', label: '<Inicio />' },
  { to: '/#servicios', label: '/servicios' },
  { to: '/#proyectos', label: './proyectos' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const progressRef = useRef<HTMLSpanElement>(null)

  useEffect(() => { setOpen(false) }, [location.pathname, location.hash])
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('scroll', onScroll) }
  }, [])

  return <header className="site-header">
    <div className="scroll-progress"><span ref={progressRef} /></div>
    <div className="nav-shell container">
      <Logo />
      <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="main-nav" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setOpen(!open)}>
        <span /><span />
      </button>
      <nav id="main-nav" className={open ? 'main-nav is-open' : 'main-nav'} aria-label="Navegación principal">
        {links.map((link) => <Link key={link.to} to={link.to} onClick={() => setOpen(false)}>{link.label}</Link>)}
        <Link className="nav-contact" to="/#contacto" onClick={() => setOpen(false)}>contacto()</Link>
      </nav>
    </div>
  </header>
}
