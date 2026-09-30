import type { Category } from './types'

export const site = {
  name: 'Triunity',
  email: 'triunity.dev@gmail.com',
  tagline: 'Jugamos en serio. Creamos con pasión.',
  hero: {
    comment: '// tres mentes. un solo equipo.',
    headline: 'Tres fuerzas. Un solo impulso.',
    subtitle: 'Desarrollamos software a medida, experiencias web y videojuegos para ideas que merecen existir.',
    primary: 'Ver proyectos',
    secondary: 'Hablemos',
  },
  about: {
    title: 'El tridente',
    intro: 'Tres personas. Tres perspectivas. Un mismo compromiso con hacer que las ideas funcionen.',
    manifesto: 'En Triunity combinamos ingeniería, diseño e imaginación. Pensamos en el producto completo: cómo se construye, cómo se usa y cómo se siente.',
  },
  services: {
    title: 'Tres disciplinas. Un equipo.',
    intro: 'Elegimos la herramienta adecuada para cada problema y construimos con atención al detalle.',
  },
  projects: {
    title: 'Ideas en ejecución',
    intro: 'Estamos preparando este espacio para compartir proyectos reales del equipo.',
  },
  process: {
    title: 'De idea a lanzamiento',
    intro: 'Trabajamos en ciclos claros, con decisiones visibles y espacio para iterar.',
  },
  contact: {
    title: 'Iniciemos algo juntos.',
    intro: 'Cuéntanos qué quieres construir. Este formulario es una demostración: prepara la información, pero aún no envía mensajes reales.',
    success: 'Mensaje preparado. Abre el borrador de correo y envíalo desde tu aplicación de email.',
    error: 'No pudimos preparar el mensaje. Intenta de nuevo o escríbenos directamente.',
  },
  social: [
    { label: 'GitHub', url: '' },
    { label: 'LinkedIn', url: '' },
    { label: 'Instagram', url: '' },
  ],
} as const

export const categoryLabels: Record<Category, string> = {
  software: 'Software',
  web: 'Web',
  videojuego: 'Videojuegos',
}
