import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import { process, services, site, technologies } from '../data/site'
import { submitContactMock } from '../lib/contact'

function Hero() {
  return <section className="hero" id="inicio" aria-labelledby="hero-title">
    <div className="container hero-content">
      <p className="hero-comment">{site.hero.comment}</p>
      <h1 id="hero-title">{site.hero.headline}</h1>
      <p className="hero-subtitle">{site.hero.subtitle}</p>
      <div className="hero-actions"><a className="button button-primary" href="#proyectos">{site.hero.primary}<span aria-hidden="true">↗</span></a><a className="button button-outline" href="#contacto">{site.hero.secondary}</a></div>
    </div>
    <div className="hero-visual">
      <img className="hero-brand-image" src="/hero-triunity-v3.png" alt="" aria-hidden="true" width="2172" height="724" />
      <span className="hero-light-sweep" aria-hidden="true" />
      <img className="hero-brand-lockup" src="/hero-triunity-v3.png" alt="Triunity Software. Jugamos en serio, creamos con pasión." width="2172" height="724" fetchPriority="high" />
    </div>
    <a href="#tridente" className="scroll-cue" aria-label="Desplazarse a El tridente"><span />scroll para explorar</a>
  </section>
}

function CodeWindow() {
  return <div className="code-window" aria-label="Ejemplo de código de Triunity">
    <div className="code-window-top"><div className="window-dots"><i /><i /><i /></div><Link className="code-easter-egg" to="/jugar" aria-label="Abrir el minijuego secreto de Triunity" title="Hay algo más en este archivo">triunity.ts<span aria-hidden="true">↗</span></Link><span className="code-tab-close">×</span></div>
    <div className="code-body">
      <div><span className="line-number">01</span><code><span className="syntax-purple">type</span> Pilar = <span className="syntax-cyan">'software'</span> | <span className="syntax-cyan">'web'</span> | <span className="syntax-cyan">'juego'</span></code></div>
      <div><span className="line-number">02</span><code><span className="syntax-purple">type</span> Estudio = {'{'} fundadores: number; pilares: Pilar[]; objetivo: string {'}'}</code></div>
      <div><span className="line-number">03</span><code><span className="syntax-purple">const</span> triunity = {'{'}</code></div>
      <div><span className="line-number">04</span><code>&nbsp;&nbsp;fundadores: <span className="syntax-pink">3</span>,</code></div>
      <div><span className="line-number">05</span><code>&nbsp;&nbsp;pilares: [<span className="syntax-cyan">'software'</span>, <span className="syntax-cyan">'web'</span>, <span className="syntax-cyan">'juego'</span>],</code></div>
      <div><span className="line-number">06</span><code>&nbsp;&nbsp;objetivo: <span className="syntax-cyan">'crear algo que importe'</span></code></div>
      <div><span className="line-number">07</span><code>{'}'} <span className="syntax-purple">satisfies</span> Estudio</code></div>
    </div>
    <div className="code-window-status"><span>TypeScript</span><span>UTF-8</span><span>✓ 0 errores</span></div>
  </div>
}

function About() {
  return <section className="section about-section" id="tridente" aria-labelledby="about-title">
    <div className="container about-layout">
      <div className="about-copy"><h2 id="about-title">{site.about.title}<span className="period">.</span></h2><p className="lead">{site.about.intro}</p><p>{site.about.manifesto}</p><div className="about-statement"><span>01</span><span>02</span><span>03</span><strong>Una sola dirección.</strong></div></div>
      <CodeWindow />
    </div>
  </section>
}

function Services() {
  const reduced = useReducedMotion()
  return <section className="section services-section" id="servicios" aria-labelledby="services-title"><div className="container"><div className="section-intro"><h2 id="services-title">{site.services.title}</h2><p>{site.services.intro}</p></div><div className="services-grid">{services.map((service, index) => <motion.article className={`service service-${service.id}`} key={service.id} initial={reduced ? false : { opacity: 0, transform: 'translateY(28px)' }} whileInView={{ opacity: 1, transform: 'translateY(0px)' }} viewport={{ once: true, amount: .15 }} transition={{ duration: .55, delay: index * .1, ease: [.23, 1, .32, 1] }}><span className="service-number">0{index + 1} / 03</span><div className="service-glyph" aria-hidden="true"><span /><span /><span /></div><h3>{service.title}</h3><p>{service.description}</p><div className="service-tech">{service.technologies.map((tech) => <span key={tech}>{tech}</span>)}</div><code>{service.code}</code></motion.article>)}</div></div></section>
}

function Projects() {
  return <section className="section projects-section" id="proyectos" aria-labelledby="projects-title">
    <div className="container">
      <div className="projects-header"><div><h2 id="projects-title">{site.projects.title}</h2><p>{site.projects.intro}</p></div></div>
      <div className="projects-pending">
        <span className="projects-pending-label">// ESTADO DEL PORTAFOLIO</span>
        <h3>En proceso<span className="period">.</span></h3>
        <p>Pronto mostraremos aquí lo que estamos creando.</p>
      </div>
    </div>
  </section>
}

function Process() {
  const reduced = useReducedMotion()
  return <section className="section process-section" id="proceso" aria-labelledby="process-title"><div className="container process-layout"><div className="process-heading"><h2 id="process-title">{site.process.title}</h2><p>{site.process.intro}</p><span className="git-label">$ git log --oneline --reverse</span></div><ol className="git-log">{process.map((step, index) => <motion.li key={step.title} initial={reduced ? false : { opacity: 0, transform: 'translateY(20px)' }} whileInView={{ opacity: 1, transform: 'translateY(0px)' }} viewport={{ once: true, amount: .6 }} transition={{ duration: .4, ease: [.23, 1, .32, 1] }}><span className="git-node" aria-hidden="true" /><span className="git-hash">{['a1f9c0', 'b2e8d1', 'c3d7e2', 'd4c6f3', 'e5b5a4', 'f6a4b5'][index]}</span><div><h3>{step.title}</h3><p>{step.detail}</p></div></motion.li>)}</ol></div></section>
}

function Tech() {
  return <section className="tech-section" aria-label="Tecnologías que utilizamos"><div className="container tech-heading"><h2>Herramientas para cada universo.</h2><p>El stack cambia. La intención de hacerlo bien, no.</p></div><div className="tech-marquee"><div className="tech-track">{[...technologies, ...technologies].map((tech, index) => <span aria-hidden={index >= technologies.length} key={`${tech}-${index}`}>{tech}<i aria-hidden="true" /></span>)}</div></div></section>
}

const terminalCommands = ['npx create-triunity-project', 'git commit -m "launch"', 'npm run build']

function Terminal() {
  const reduced = useReducedMotion()
  const [line, setLine] = useState(reduced ? terminalCommands.length : 1)
  useEffect(() => {
    if (reduced) return
    const timer = window.setInterval(() => setLine((current) => current >= terminalCommands.length ? 1 : current + 1), 1250)
    return () => window.clearInterval(timer)
  }, [reduced])
  return <div className="terminal" aria-hidden="true"><div className="terminal-top"><span>triunity — zsh</span><span>● ● ●</span></div><div className="terminal-body">{terminalCommands.slice(0, line).map((command) => <p key={command}><span>❯</span> {command}</p>)}<p className="terminal-cursor">▌</p></div></div>
}

function Contact() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [draftHref, setDraftHref] = useState('')
  const onEdit = () => {
    if (draftHref) setDraftHref('')
    if (status === 'success' || status === 'error') setStatus('idle')
  }
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status === 'sending') return
    const values = new FormData(event.currentTarget)
    const contact = {
      name: String(values.get('name') || ''),
      email: String(values.get('email') || ''),
      category: String(values.get('category') || ''),
      message: String(values.get('message') || ''),
    }
    setDraftHref('')
    setStatus('sending')
    try {
      await submitContactMock(contact)
      const subject = `Proyecto ${contact.category} — ${contact.name}`
      const body = `Nombre: ${contact.name}\nCorreo: ${contact.email}\nTipo de proyecto: ${contact.category}\n\n${contact.message}`
      setDraftHref(`mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
      setStatus('success')
    } catch { setStatus('error') }
  }
  return <section className="section contact-section" id="contacto" aria-labelledby="contact-title"><div className="container contact-layout"><div className="contact-copy"><h2 id="contact-title">{site.contact.title}</h2><p>{site.contact.intro}</p><a className="email-link" href={`mailto:${site.email}`}>{site.email}<span aria-hidden="true">↗</span></a><div className="social-list" aria-label="Redes sociales pendientes">{site.social.map((social) => <span key={social.label} title="Enlace por añadir">{social.label} <small>próximamente</small></span>)}</div><Terminal /></div><form className="contact-form" onSubmit={onSubmit} onChange={onEdit}><div className="form-caption"><span>nuevo_mensaje.ts</span><span>● ● ●</span></div><div className="form-fields"><label>Nombre<input name="name" type="text" autoComplete="name" minLength={2} required placeholder="Tu nombre" /></label><label>Email<input name="email" type="email" autoComplete="email" required placeholder="tu@empresa.com" /></label><label>Tipo de proyecto<select name="category" required defaultValue=""><option value="" disabled>Selecciona una opción</option><option value="software">Software</option><option value="web">Web</option><option value="videojuego">Videojuego</option><option value="otro">Otro</option></select></label><label>Mensaje<textarea name="message" rows={5} minLength={10} required placeholder="Cuéntanos tu idea..." /></label><button className="button button-primary" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Procesando...' : 'Preparar mensaje'}<span aria-hidden="true">↗</span></button><p className={`form-message form-message-${status}`} role="status" aria-live="polite">{status === 'success' ? site.contact.success : status === 'error' ? site.contact.error : status === 'sending' ? '> preparando solicitud...' : '// servicio de envío pendiente de conectar'}</p>{draftHref && <a className="draft-link" href={draftHref}>Abrir correo con borrador <span aria-hidden="true">↗</span></a>}</div></form></div></section>
}

export function HomePage() {
  useEffect(() => { document.title = 'Triunity — software, web y videojuegos' }, [])
  return <main id="main" className="min-w-0"><Hero /><About /><Services /><Projects /><Process /><Tech /><Contact /></main>
}
