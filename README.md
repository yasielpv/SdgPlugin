(# Plugin SDG (Objetivos de Desarrollo Sostenible) — OJS

Este plugin añade una rueda visual que muestra la predicción de afinidad de un artículo a los 17 Objetivos de Desarrollo Sostenible (SDG). Utiliza un clasificador externo para obtener probabilidades por objetivo y muestra una leyenda interactiva con iconos localizados según el idioma.

## Características
- Inserta una visualización tipo "doughnut" con los 17 SDG para cada artículo.
- Muestra una etiqueta localizada y porcentaje en el hover de cada segmento.
- Carga iconos y logo central según el locale (español/inglés). Inglés por defecto.

## Requisitos
- OJS compatible con plugins genéricos.
- Conexión saliente para llamar al servicio de clasificación (`https://aurora-sdg.labs.vu.nl/classifier/...`).
- Chart.js disponible en el frontend (si no, el plugin puede cargarlo según se requiera).

## Instalación
1. Copia la carpeta del plugin en `plugins/generic/sdg`.
2. Activa el plugin desde la interfaz de administración de OJS.
3. Configura, si procede, el modelo de clasificación desde la pantalla de ajustes del plugin.

## Configuración
- `sdgClassifierModel`: nombre del modelo usado para clasificar (por defecto `aurora-sdg-multi`).
- `sdgLabels`: etiquetas localizadas para los 17 SDG (el plugin usa etiquetas por defecto si no se proporcionan).

## Localización y recursos de imagen
- El plugin detecta el locale actual y lo pasa al frontend. Si el locale empieza por `es` se usan las versiones en español de los iconos y del logo central; en caso contrario se usan las versiones en inglés.
- Si necesitas usar otras URLs para los iconos o alojarlos localmente, modifica `widget.js` en la función `getSDGIconUrl()` y la selección del logo en el bloque `afterDraw`.

## Uso
- El plugin inserta automáticamente el componente en la plantilla de artículo (hook `ArticleHandler::view`).
- Al pasar el ratón por los segmentos se muestra la leyenda con icono localizado y porcentaje.

## Desarrollo
- Archivo principal del plugin: `SDGPlugin.inc.php` (registra variables de plantilla y hooks).
- Lógica cliente: `widget.js` (Chart.js, selección de imágenes según locale).
- Plantilla del placeholder: `templates/display.tpl`.

## Contribuciones y soporte
Si encuentras errores o quieres proponer mejoras, abre un issue o un merge request en el repositorio del proyecto.

## Licencia
Distribuido bajo GNU GPL v3 (ver `LICENSE`).


