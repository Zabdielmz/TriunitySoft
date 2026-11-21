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

## Administración y avisos de contacto

El panel conserva el fondo oscuro y el acento cian, con Space Grotesk en controles, IBM Plex Sans en títulos y monoespaciada solo para datos puntuales. La navegación lateral da acceso a la bandeja y a los destinatarios; en móvil se convierte en navegación superior. La bandeja usa búsqueda, filtros de lectura y proyecto, una lista con vista previa y un área de lectura. En pantallas pequeñas, el mensaje ocupa el lugar del listado y permite volver con el foco en la solicitud seleccionada. Marcar como leída no equivale a responder.

Los formularios usan etiquetas visibles, controles de al menos 44 px, estados de envío y errores explícitos. Las solicitudes y los destinatarios tienen estados de carga y vacío. Los colores por categoría mantienen la relación software/cian, web/violeta y videojuegos/magenta.

Instagram, X y GitHub se muestran con sus enlaces reales en contacto, en lugar de los espacios de «próximamente». El footer conserva el correo y la navegación.

Los avisos de correo usan tablas y estilos en línea, tipografía del sistema, cabecera de marca oscura y contenido claro con adaptación al modo oscuro en clientes compatibles. Separan el remitente, los datos de la solicitud y el mensaje; incluyen respuesta por correo y una alternativa de texto plano. Las fechas se muestran en la zona horaria de Ciudad de México.

## Easter egg de Doom

El enlace oculto del archivo `triunity.ts` conserva la ruta `/jugar`. Allí, una consola con el primer episodio shareware de Doom 1.9 sustituye a Protocolo 03. Mantiene la base oscura y los controles cian de Triunity; el juego conserva su imagen original a proporción 4:3 y píxeles nítidos. El emulador y el juego se alojan localmente y solo se cargan al pulsar «Iniciar Doom».

La barra de la consola permite pausar, silenciar y ampliar la partida. En móvil añade controles táctiles de dirección, disparo, uso y menú. Tab permite salir del teclado del juego hacia los controles del sitio. Cambiar de pestaña pausa la emulación; salir de la ruta destruye el reproductor. Créditos y licencias se consultan desde un enlace al pie de la consola.
