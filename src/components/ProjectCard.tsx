import type { PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { categoryLabels } from '../data/site'
import type { Project } from '../data/types'

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const onMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const card = event.currentTarget
    const rect = card.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - .5
    const y = (event.clientY - rect.top) / rect.height - .5
    card.style.setProperty('--tilt-x', `${-y * 3}deg`)
    card.style.setProperty('--tilt-y', `${x * 3}deg`)
  }
  const onLeave = (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty('--tilt-x', '0deg')
    event.currentTarget.style.setProperty('--tilt-y', '0deg')
  }
  return <article className={`project-card project-card-${project.category}`} onPointerMove={onMove} onPointerLeave={onLeave} style={{ animationDelay: `${index * 70}ms` }}>
    <Link to={`/proyectos/${project.slug}`} aria-label={`Ver detalles de ${project.title}`}>
      <div className="project-image"><img src={project.cover} alt={`Arte conceptual de ${project.title}`} loading="lazy" /><span className="project-open" aria-hidden="true">↗</span></div>
      <div className="project-meta"><span>{categoryLabels[project.category]}</span><span>CONCEPTO / DEMO</span></div>
      <h3>{project.title}</h3>
      <p>{project.summary}</p>
      <div className="project-tech">{project.technologies.slice(0, 3).map((tech) => <span key={tech}>{tech}</span>)}</div>
    </Link>
  </article>
}
