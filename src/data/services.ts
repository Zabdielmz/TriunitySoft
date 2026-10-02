import type { Category } from './types'

export const services = [
  {
    id: 'software' as Category,
    title: 'Desarrollo de software',
    description: 'Herramientas a medida para ordenar procesos, conectar información y reducir tareas manuales. Diseñamos la solución alrededor de quienes la usan para que pueda crecer con el equipo.',
    applications: ['Centralizar información', 'Automatizar tareas repetitivas', 'Conectar herramientas existentes'],
    technologies: ['TypeScript', 'Node.js', 'Python'],
  },
  {
    id: 'web' as Category,
    title: 'Desarrollo web',
    description: 'Sitios y plataformas que explican una idea con claridad y facilitan el siguiente paso. Cuidamos estructura, velocidad, accesibilidad y adaptación a cada pantalla.',
    applications: ['Presentar marcas y productos', 'Crear plataformas para usuarios', 'Cuidar la experiencia en móvil'],
    technologies: ['React', 'Vite', 'WebGL'],
  },
  {
    id: 'videojuego' as Category,
    title: 'Desarrollo de videojuegos',
    description: 'Prototipos y sistemas jugables donde cada mecánica tiene intención. Construimos interacciones y mundos que responden al jugador y hacen que explorar valga la pena.',
    applications: ['Probar mecánicas', 'Construir sistemas de juego', 'Crear mundos interactivos'],
    technologies: ['Unity', 'Unreal Engine', 'Godot'],
  },
]
