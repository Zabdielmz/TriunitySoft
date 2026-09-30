import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { categoryLabels, projects } from '../data/site'
import { NotFoundPage } from './NotFoundPage'

export function ProjectPage() {
  const { slug } = useParams()
  const project = projects.find((item) => item.slug === slug)

  useEffect(() => {
    document.title = project ? `${project.title} — concepto de Triunity` : 'Proyecto no encontrado — Triunity'
  }, [project])

  if (!project) return <NotFoundPage />

  return <main className="project-page" id="main">
    <div className="container">
      <Link className="back-link" to="/#proyectos">← Volver a proyectos</Link>
      <div className="project-page-header">
        <div>
          <span className="concept-tag">CONCEPTO DEMOSTRATIVO / {categoryLabels[project.category]}</span>
          <h1>{project.title}</h1>
          <p>{project.summary}</p>
        </div>
        <span className="project-year">{project.year}</span>
      </div>
      <div className={`project-hero-image project-card-${project.category}`}><img src={project.cover} alt={`Arte conceptual de ${project.title}`} /></div>
      <div className="project-page-body">
        <div>
          <h2>La idea</h2>
          <p>{project.description}</p>
          <p className="disclaimer">Este proyecto es un concepto de muestra. No representa un encargo o producto lanzado.</p>
        </div>
        <aside>
          <h3>Stack propuesto</h3>
          <ul>{project.technologies.map((tech) => <li key={tech}>{tech}</li>)}</ul>
          <h3>Enlaces</h3>
          {project.demoUrl || project.repositoryUrl ? <div className="project-links">
            {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">Abrir demo ↗</a>}
            {project.repositoryUrl && <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">Ver repositorio ↗</a>}
          </div> : <p>Demo y repositorio disponibles cuando este concepto se convierta en un proyecto real.</p>}
        </aside>
      </div>
      <div className="project-gallery">
        <h2>Galería conceptual</h2>
        {project.gallery.map((image, index) => <img src={image} alt={`Vista conceptual ${index + 1} de ${project.title}`} loading="lazy" key={image} />)}
      </div>
      <div className="project-next"><span>¿Tienes una idea similar?</span><Link className="button button-primary" to="/#contacto">Hablemos <span aria-hidden="true">↗</span></Link></div>
    </div>
  </main>
}
