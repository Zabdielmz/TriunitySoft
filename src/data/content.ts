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
    title: 'Nuestra identidad',
    intro: 'Tres personas. Tres perspectivas. Un mismo compromiso con hacer que las ideas funcionen.',
    manifesto: 'En Triunity combinamos ingeniería, diseño e imaginación. Pensamos en el producto completo: cómo se construye, cómo se usa y cómo se siente.',
  },
  services: {
    title: 'Tres disciplinas. Un equipo.',
    intro: 'De una operación que necesita orden a una experiencia que invita a explorar: cada disciplina aporta una forma distinta de convertir una idea en algo útil.',
  },
  projects: {
    title: 'Portafolio',
    intro: 'Una colección de conceptos de muestra en software, web y videojuegos. Explora cada propuesta para conocer la idea detrás de ella.',
  },
  process: {
    title: 'De idea a lanzamiento',
    intro: 'Trabajamos en ciclos claros, con decisiones visibles y espacio para iterar.',
  },
  contact: {
    title: 'Iniciemos algo juntos.',
    intro: 'Cuéntanos qué quieres construir. Respondemos por correo apenas revisemos tu mensaje.',
    success: 'Gracias por enviar tu formulario. Nos pondremos en contacto contigo pronto.',
    error: 'No pudimos enviar tu mensaje. Intenta de nuevo o escríbenos directamente.',
  },
  socialLinks: [
    { label: 'Instagram', url: 'https://www.instagram.com/triunity.software/' },
    { label: 'X', url: 'https://x.com/TriunityDev' },
    { label: 'GitHub', url: 'https://github.com/triunitydev' },
  ],
} as const

export const categoryLabels: Record<Category, string> = {
  software: 'Software',
  web: 'Web',
  videojuego: 'Videojuegos',
}
