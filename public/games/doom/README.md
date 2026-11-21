# Doom shareware en Triunity

Este directorio contiene la edición **shareware 1.9, episodio 1**, sin contenido de la edición registrada. Los ejecutables y datos originales no se han modificado.

- Distribución original: https://youfailit.net/pub/idgames/idstuff/doom/doom19s.zip
- El instalador original contiene las partes `DOOMS_19.1` y `DOOMS_19.2`. Al concatenarlas se obtiene un ZIP autoextraíble; se conservaron todos sus archivos en `doom-shareware.jsdos`.
- SHA-1 de `DOOM1.WAD`: `5b2e249b9c5133ec987b3ea77596381dc0d6bc1d` (4 196 020 bytes).
- Se añadieron `.jsdos/dosbox.conf`, `.jsdos/jsdos.json` y el aviso de licencia. La configuración inicia `DOOM.EXE` en DOSBox y desactiva redes.
- Licencia y aclaración histórica del contenido shareware: `DOOM-SHAREWARE-LICENSE.txt`, conservada desde https://github.com/redox-os/freedoom/blob/master/LICENSE-DOOM1.

## Emulador

Los archivos de `vendor/` proceden del paquete oficial npm **js-dos 8.5.4**, que incluye **emulators 8.5.3**. Solo se distribuyen los archivos necesarios para DOSBox y la extracción ZIP; no se usan servicios externos durante la partida.

- Paquete: https://registry.npmjs.org/js-dos/-/js-dos-8.5.4.tgz
- Código fuente del reproductor y etiquetas de versión: https://github.com/caiiiycuk/js-dos/tree/v8.5.4
- Código fuente del emulador y compilación: https://github.com/caiiiycuk/emulators
- Licencia: GNU GPL v2, incluida en `vendor/GPL-2.0.txt`. Se conservan los mapas de fuentes del reproductor y del cargador.
- API documentada: https://js-dos.com/player-api.html

`index.html` aísla los estilos y el ciclo de vida del emulador. `player.js` intercambia únicamente acciones de juego con la ventana padre, validando su origen y su identidad. No persiste partidas entre sesiones ni conecta servicios de nube. Al abandonar el easter egg se destruye el iframe y se detiene la emulación.

DOSBox usa `aspect=false`; el reproductor ajusta por separado la presentación a 4:3. Esto evita líneas duplicadas en el HUD. El paquete usa una URL y una raíz de caché versionadas (`v=1`, `triunity-doom-shareware-v1`): deben incrementarse si cambia la configuración o el contenido del bundle para no reutilizar una copia antigua de OPFS.

DOOM es una marca de id Software. Esta integración no implica afiliación con id Software.
