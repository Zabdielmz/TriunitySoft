export type Category = 'software' | 'web' | 'videojuego'

export interface Project {
  slug: string
  title: string
  category: Category
  summary: string
  description: string
  technologies: string[]
  cover: string
  gallery: string[]
  demoUrl?: string
  repositoryUrl?: string
  year: string
  status: 'concepto'
}

export interface Founder {
  id: string
  name: string
  photo: string
}
