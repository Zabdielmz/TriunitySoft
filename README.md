# Triunity

Sitio corporativo de Triunity, creado con React, TypeScript, Vite, Tailwind CSS y Motion. El hero integra a pantalla completa una versión refinada del banner proporcionado por la empresa, con el wordmark blanco y el lema **«Jugamos en serio. Creamos con pasión.»**

## Requisitos y comandos

Necesitas Node.js 20.19+ o 22.12+ y npm.

```bash
npm install
npm run dev
```

Abre la URL local que muestre Vite. Para verificar la entrega:

```bash
npm run lint
npm run build
npm run preview
```

Vite genera el sitio en `build/`. El antiguo sitio está conservado en `dist/`; sus notas anteriores están en `README.legacy.md`.

## Contenido editable

- **Textos generales:** `src/data/content.ts`.
- **Proyectos:** `src/data/projects.ts`.
- **Fundadores:** `src/data/founders.ts`.
- **Servicios y proceso:** `src/data/services.ts` y `src/data/process.ts`.
- **Tecnologías:** `src/data/technologies.ts`.
- **Tipos de datos:** `src/data/types.ts`.
- **Colores, espacios y tipografías:** tokens al comienzo de `src/styles/global.css`; Tailwind CSS está integrado para utilidades de composición.
- **Logotipo provisional:** `src/components/Logo.tsx` y `public/favicon.svg`.
- **Arte de portadas:** `public/projects/`. La imagen de Aether ya existía en este proyecto y se reutiliza en la nueva versión.

### Añadir un proyecto

Añade un objeto al array `projects` de `src/data/projects.ts`. Debe incluir `slug`, `title`, `category`, `summary`, `description`, `technologies`, `cover`, `gallery`, `year` y `status`. Coloca sus imágenes en `public/projects/`. El filtro y la ruta `/proyectos/:slug` se actualizan automáticamente. Usa `demoUrl` y `repositoryUrl` cuando existan enlaces reales; los conceptos actuales no los incluyen.

Los seis proyectos incluidos son **conceptos demostrativos**, no trabajos para clientes. Las fotos, nombres, cargos y frases de los fundadores son placeholders explícitos. Los enlaces sociales también están pendientes.

## Formulario de contacto

El formulario valida campos y muestra estados de carga, éxito y error, pero **no envía datos**. Al preparar un mensaje, conserva los campos y ofrece un enlace para abrir un borrador de correo ya rellenado. Su función está en `src/lib/contact.ts`. Sustituye `submitContactMock` por un `fetch` a tu backend o por el proveedor que elijas. Guarda las claves privadas solo en el servidor. Para probar el estado de error del mock, usa `demo-error@example.com`.

Mientras tanto, el sitio ofrece un enlace directo a `triunity.dev@gmail.com`.

## Despliegue

`npm run build` produce archivos estáticos en `build/`.

- **Vercel:** importa el repositorio. `vercel.json` configura `build/` y la reescritura para las rutas de React.
- **Netlify:** comando `npm run build`, directorio `build`. Añade la regla `/* /index.html 200` para las rutas.
- **GitHub Pages:** configura `base` en `vite.config.ts` con el nombre del repositorio y usa `HashRouter` o una redirección 404 para las rutas internas.

Actualiza `public/sitemap.xml`, `public/robots.txt` y la URL de `og:image` en `index.html` con el dominio real antes de publicar. `example.com` es un marcador explícito en los archivos de rastreo; no se proporcionó un dominio público. El sitemap incluye las seis rutas de proyecto actuales. La imagen Open Graph es el banner de marca proporcionado por la empresa.

## Rendimiento y accesibilidad

El fondo del hero usa una animación CSS suave y permanece estático con `prefers-reduced-motion`. Una capa oscura mantiene legibles el titular y las acciones; en pantallas estrechas, el texto de marca se coloca debajo del contenido. No necesita WebGL. La navegación, filtros, rutas y formulario se pueden usar con teclado.

La puntuación Lighthouse debe medirse en el dominio final y un dispositivo representativo; este repositorio verifica build y lint.
