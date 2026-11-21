import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { categoryLabels, projects } from '../data/site'
import type { Project } from '../data/types'
import { NotFoundPage } from './NotFoundPage'
import '../styles/project.css'

function ProjectIcon({ name }: { name: 'back' | 'next' | 'expand' | 'info' }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {name === 'back' && <path d="m14 6-6 6 6 6" />}
    {name === 'next' && <path d="m10 6 6 6-6 6" />}
    {name === 'expand' && <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />}
    {name === 'info' && <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7v1" /></>}
  </svg>
}

function ProjectArtwork({ project }: { project: Project }) {
  const images = [...new Set([project.cover, ...project.gallery])]
  const [selected, setSelected] = useState(0)
  const [failed, setFailed] = useState<string | null>(null)
  const source = images[selected] ?? project.cover
  const caption = selected === 0 ? 'Dirección visual' : 'Vista complementaria'

  return <div className="project-artwork">
    <figure className="project-visual">
      <div className="project-visual-frame">
        {failed === source ? <div className="project-image-error" role="status"><ProjectIcon name="info" /><p>No se pudo cargar esta imagen.</p><button type="button" onClick={() => setFailed(null)}>Reintentar</button></div> : <img
          key={source}
          src={source}
          alt={selected === 0 ? `Arte conceptual de ${project.title}` : `Vista conceptual complementaria de ${project.title}`}
          width="1200"
          height="800"
          decoding="async"
          fetchPriority={selected === 0 ? 'high' : 'auto'}
          onError={() => setFailed(source)}
        />}
      </div>
      <figcaption className="project-visual-caption">
        <span aria-live="polite">{caption}</span>
        {failed !== source && <a href={source} target="_blank" rel="noopener noreferrer" aria-label={`Ver imagen original de ${project.title} (abre en una pestaña nueva)`}><ProjectIcon name="expand" />Ver original</a>}
      </figcaption>
    </figure>
    {images.length > 1 && <div className="project-thumbnail-row">
      <div className="project-thumbnails" role="group" aria-label={`Galería conceptual de ${project.title}`}>
        {images.map((image, index) => <button
          key={image}
          type="button"
          aria-pressed={selected === index}
          aria-label={index === 0 ? `Ver dirección visual de ${project.title}` : `Ver vista complementaria ${index} de ${project.title}`}
          onClick={() => setSelected(index)}
        ><img src={image} alt="" width="72" height="48" loading="lazy" /></button>)}
      </div>
      <span className="project-gallery-count">{selected + 1} de {images.length} vistas</span>
    </div>}
  </div>
}

export function ProjectPage() {
  const { slug } = useParams()
  const projectIndex = projects.findIndex((item) => item.slug === slug)
  const project = projects[projectIndex]

  useEffect(() => {
    const previousTitle = document.title
    document.title = project ? `${project.title} — concepto de Triunity` : 'Proyecto no encontrado — Triunity'
    return () => { document.title = previousTitle }
  }, [project])

  if (!project) return <NotFoundPage />
  const nextProject = projects[(projectIndex + 1) % projects.length]

  return <main className={`project-page project-category-${project.category}`} id="main">
    <div className="project-shell">
      <nav className="project-breadcrumb" aria-label="Ruta del proyecto">
        <Link to="/#proyectos"><ProjectIcon name="back" />Volver a proyectos</Link>
        <span aria-current="page">{project.title}</span>
      </nav>

      <section className="project-overview" aria-labelledby="project-title">
        <div className="project-introduction">
          <h1 id="project-title">{project.title}<span aria-hidden="true">.</span></h1>
          <p className="project-summary">{project.summary}</p>
          <div className="project-classification"><span className="project-discipline">{categoryLabels[project.category]}</span><span className="project-concept-label">Concepto demostrativo</span></div>
          <div className="project-idea">
            <h2>La idea</h2>
            <p>{project.description}</p>
          </div>
        </div>
        <ProjectArtwork project={project} key={project.slug} />
      </section>

      <div className="project-details">
        <section className="project-stack" aria-labelledby="project-stack-title">
          <h2 id="project-stack-title">Stack propuesto</h2>
          <ul className="project-technology-list">{project.technologies.map((tech) => <li key={tech}>{tech}</li>)}</ul>
        </section>
        <section className="project-availability" aria-labelledby="project-links-title">
          <h2 id="project-links-title">Enlaces del proyecto</h2>
          {project.demoUrl || project.repositoryUrl ? <div className="project-resource-links">
            {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">Abrir demo<ProjectIcon name="next" /></a>}
            {project.repositoryUrl && <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">Ver repositorio<ProjectIcon name="next" /></a>}
          </div> : <p>Demo y repositorio disponibles cuando este concepto se convierta en un proyecto real.</p>}
        </section>
      </div>

      <aside className="project-concept-note"><ProjectIcon name="info" /><p>Este proyecto es un concepto de muestra. No representa un encargo o producto lanzado.</p></aside>

      <section className="project-contact" aria-labelledby="project-contact-title">
        <div><h2 id="project-contact-title">¿Tienes una idea similar?</h2><p>Cuéntanos qué quieres construir.</p></div>
        <Link className="button button-primary" to="/#contacto">Hablemos de tu proyecto</Link>
      </section>

      <nav className="project-pagination" aria-label="Navegación entre proyectos">
        <Link className="project-all-link" to="/#proyectos"><ProjectIcon name="back" />Todos los proyectos</Link>
        {nextProject && <Link className="project-next-link" to={`/proyectos/${nextProject.slug}`} aria-label={`Siguiente concepto: ${nextProject.title}`}><span><small>Siguiente concepto</small><strong>{nextProject.title}</strong></span><ProjectIcon name="next" /></Link>}
      </nav>
    </div>
  </main>
}
