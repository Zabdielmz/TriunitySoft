# Identidad visual de Triunity

## Principio

La identidad gira alrededor del wordmark de Triunity y del lema «Jugamos en serio. Creamos con pasión». El concepto de los tres fundadores permanece en servicios y equipo. El código se usa como lenguaje de contenido, no como adorno constante.

## Color

Los tokens editables están en `src/styles/global.css` y se reflejan en `.impeccable/design.json`.

- Fondo `#080a10`; superficie `#111722`; texto `#eef2fa`.
- Software: cian `#71e6ff`.
- Web: violeta `#ae8bff`.
- Videojuegos: magenta `#f784c3`.
- Los colores de acento se reservan para enlaces, nodos, estados y detalles. La foto de marca del usuario inspira el resplandor suave cian/violeta.

## Tipografía

Space Grotesk vuelve al cuerpo, controles y acciones. IBM Plex Sans queda en títulos y wordmark del encabezado para darles firmeza; JetBrains Mono se reserva para navegación, código, estados y datos. Las tres fuentes se alojan mediante `@fontsource`.

## Composición

Hero con una capa atmosférica del banner que cubre toda la sección; el texto de marca se mezcla con ella a la derecha sin bordes visibles. Una reserva oscura protege la propuesta y los botones a la izquierda. En móvil, el cian y el violeta de la misma imagen llenan la zona superior, con un barrido de luz discreto; el contenido queda sobre un fondo oscuro continuo. La página alterna manifiesto/editor, tres servicios, portafolio de conceptos en dos carriles horizontales, proceso en forma de git log, franja de tecnologías y contacto terminal. En el encabezado se muestra solo el wordmark.

## Interacción

- El fondo de marca tiene una deriva suave mediante CSS; con movimiento reducido queda estático.
- La barra de progreso usa un gradiente monocromático gris claro.
- El portafolio avanza automáticamente solo cuando está visible; se pausa con hover o foco. En móvil se recorre deslizando; con movimiento reducido queda estático. Cada concepto abre su página de detalle.
- Entradas al scroll solo en servicios y proceso; terminal y marquee quedan estáticos con movimiento reducido.
- Foco visible, navegación por teclado y menú móvil con Escape.

## Pendientes de marca

Completar retratos, nombres/cargos del equipo, proyectos reales, enlaces sociales y dominio del sitemap. El favicon sigue siendo provisional hasta recibir el recurso oficial.
