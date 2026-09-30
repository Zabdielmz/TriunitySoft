import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProjectPage } from './pages/ProjectPage'

function RouteEffects() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1)
      window.setTimeout(() => document.getElementById(id)?.scrollIntoView(), 70)
    } else {
      window.scrollTo(0, 0)
    }
  }, [location.pathname, location.hash])

  useEffect(() => {
    console.log('%c  /\\  /\\  /\\\n /__\\/__\\/__\\  TRIUNITY\n\nJugamos en serio. Creamos con pasión.', 'color:#71e6ff;font-family:monospace')
    const sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
    let cursor = 0
    let timer: number | undefined
    const onKeyDown = (event: KeyboardEvent) => {
      cursor = event.key === sequence[cursor] ? cursor + 1 : event.key === sequence[0] ? 1 : 0
      if (cursor === sequence.length) {
        document.body.classList.add('konami-on')
        window.clearTimeout(timer)
        timer = window.setTimeout(() => document.body.classList.remove('konami-on'), 5500)
        cursor = 0
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => { window.removeEventListener('keydown', onKeyDown); window.clearTimeout(timer) }
  }, [])
  return null
}

export default function App() {
  return <>
    <RouteEffects />
    <a className="skip-link" href="#main">Saltar al contenido</a>
    <SiteHeader />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/proyectos/:slug" element={<ProjectPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    <SiteFooter />
  </>
}
