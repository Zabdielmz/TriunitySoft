import type { Category } from './types'

export const services = [
  { id: 'software' as Category, title: 'Desarrollo de software', description: 'Herramientas a medida que resuelven procesos reales y pueden crecer contigo.', technologies: ['TypeScript', 'Node.js', 'Python', 'APIs'], code: 'const idea = await build({ problema, personas })' },
  { id: 'web' as Category, title: 'Desarrollo web', description: 'Experiencias rápidas, accesibles y claras, desde una página hasta una plataforma.', technologies: ['React', 'TypeScript', 'Vite', 'WebGL'], code: '<Experiencia impacto="real" />' },
  { id: 'videojuego' as Category, title: 'Desarrollo de videojuegos', description: 'Sistemas interactivos y mundos jugables con intención en cada detalle.', technologies: ['Unity', 'Unreal', 'Godot', 'C#'], code: 'world.spawn({ mecánica, emoción })' },
]
