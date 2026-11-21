import { Link } from 'react-router-dom'
import { siGithub, siInstagram, siX } from 'simple-icons'
import { site } from '../data/site'

const socialIcons: Record<string, string> = {
  Instagram: siInstagram.path,
  X: siX.path,
  GitHub: siGithub.path,
}

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="container footer-main">
      <div><span className="footer-brand">TRIUNITY</span><p>Jugamos en serio.<br />Creamos con pasión.</p></div>
      <div className="footer-links"><Link to="/#servicios">Servicios</Link><Link to="/#proyectos">Proyectos</Link><Link to="/#tridente">Nuestra identidad</Link><Link to="/#contacto">Contacto</Link></div>
      <div className="footer-contact">
        <a className="footer-mail" href={`mailto:${site.email}`}>{site.email}</a>
        <div className="footer-social">
          {site.socialLinks.map((social) => <a key={social.label} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.label}><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={socialIcons[social.label]} /></svg></a>)}
        </div>
      </div>
    </div>
    <div className="statusbar"><div className="container statusbar-inner"><span>⎇ main</span><span>✓ build passing</span><span>© {new Date().getFullYear()} Triunity</span></div></div>
  </footer>
}
