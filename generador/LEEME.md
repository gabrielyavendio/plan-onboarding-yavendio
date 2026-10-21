# Generador de planes de onboarding

Genera la página de cada merchant (`/<merchant>/index.html`).

- `gen-client.js`: genera el HTML a partir de una configuración.
- `phases.js`: etapas y pasos del plan (orden del curso Fundamentos de yavendió!).
- `clientes/*.json`: configuración de cada merchant (fecha de inicio, días, logos, videos, calendario).
- `logos/`: logos de los merchants.

Uso, desde esta carpeta:

    node gen-client.js clientes/<merchant>.json

Crea `<out>-standalone.html`; se copia a `../<merchant>/index.html` y se publica.

Los JSON de los merchants publicados antes del 21/10/2026 se perdieron al limpiarse la carpeta temporal donde se generaban. Sus páginas publicadas siguen intactas; para cambiarlas hay que rearmar su JSON.
