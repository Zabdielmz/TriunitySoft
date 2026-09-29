# Triunity

Página de presentación de Triunity, desarrollada con HTML, CSS y JavaScript sin dependencias de ejecución.

## Vista local

Desde la raíz del proyecto:

```powershell
python -m http.server 4173 --directory dist
```

Abre `http://localhost:4173/`.

El enlace de contacto usa `triunity.dev@gmail.com`.

La página incluye un explorador interactivo de servicios, preguntas desplegables, navegación móvil accesible y movimiento adaptado a `prefers-reduced-motion`. Los tres ejemplos visuales del explorador son representaciones conceptuales, no proyectos realizados.

## Subir a GitHub

El proyecto ya tiene historial Git en la rama `main`. El remoto `origin` pertenece al alojamiento actual de Sites. Crea un repositorio **vacío** en GitHub (sin README ni `.gitignore` nuevos) y añádelo como segundo remoto desde esta carpeta:

```powershell
git remote add github https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push github main
```

Para subir cambios posteriores: `git push github main`. El nombre `github` conserva la conexión existente con Sites. Si Git muestra un aviso de *dubious ownership* en esta copia local, marca esta carpeta como segura con `git config --global --add safe.directory (Get-Location).Path` y vuelve a ejecutar el comando.

## Publicar en Vercel

1. En Vercel, crea un proyecto nuevo e importa el repositorio de GitHub.
2. Deja **Root Directory** en la raíz del repositorio y usa **Framework Preset: Other**.
3. No configures un comando de compilación: el sitio ya está listo en `dist/`. El archivo `vercel.json` establece `dist` como directorio de salida.
4. Publica el proyecto. Las futuras actualizaciones de `main` en GitHub producirán nuevos despliegues de producción.

No hacen falta variables de entorno ni instalar paquetes. Los enlaces de contacto abren el correo del visitante mediante `mailto:`; no hay backend ni formulario que almacenar.

El archivo `.openai/hosting.json` pertenece al alojamiento actual de Sites; Vercel utiliza `vercel.json`.

## Recursos

- Imagen de portada: generada para este proyecto. Su descripción de generación está en `ASSETS.md`.
- Tipografía Archivo: [Google Fonts](https://github.com/google/fonts/tree/main/ofl/archivo), con licencia OFL incluida en `dist/assets/archivo-OFL.txt`.
