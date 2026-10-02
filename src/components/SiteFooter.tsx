import { Link } from 'react-router-dom'
import { site } from '../data/site'

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="container footer-main">
      <div><span className="footer-brand">TRIUNITY</span><p>Jugamos en serio.<br />Creamos con pasión.</p></div>
      <div className="footer-links"><Link to="/#servicios">Servicios</Link><Link to="/#proyectos">Proyectos</Link><Link to="/#tridente">Nuestra identidad</Link><Link to="/#contacto">Contacto</Link></div>
      <a className="footer-mail" href={`mailto:${site.email}`}>{site.email}</a>
    </div>
    <div className="statusbar"><div className="container statusbar-inner"><span>⎇ main</span><span>✓ build passing</span><span>© {new Date().getFullYear()} Triunity</span></div></div>
  </footer>
}
