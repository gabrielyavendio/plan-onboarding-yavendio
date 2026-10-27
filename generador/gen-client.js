// Genera el plan para el cliente como HTML estático y autocontenido.
// Uso: node gen-client.js [config.json]
//   config: { start, merchant, merchantId, logoBlack, logoWhite, shopify, out }
const fs = require("fs");
const CFG = process.argv[2] ? JSON.parse(fs.readFileSync(process.argv[2], "utf8")) : {};
const START = CFG.start || "2026-09-29";
const MERCHANT = CFG.merchant || "";
const OUT = CFG.out || "plan";
const SLUG = CFG.slug || (MERCHANT ? MERCHANT.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-") : "plan");
const A = "C:/Users/LENOVO/.claude/plugins/cache/yavendio-magic/magic/980482cde6a3/skills/yavendio-brand/assets/web/";
const PHASES = new Function(fs.readFileSync("phases.js", "utf8") + "; return PHASES;")();
const CLIENT = {
  k1: { check: "Conoces el plan y tu fecha de salida en vivo." },
  k2: { check: "Llegas a la pantalla de inicio con Yago y guardas tu merchant ID arriba en este plan." },
  k3: { check: "Ubicas cada sección del panel." },
  c1: { check: "Elegiste el método según el tamaño de tu catálogo." },
  p2: { check: "Puedes crear y actualizar un pedido desde un chat." },
  g1: { desc: "Le escribes a tu propio número y ves cómo responde tu vendedor con todo lo configurado. No tiene que estar perfecto para vender: va aprendiendo." },
  g2: { where: "Lo revisamos juntos en la sesión de dudas." },
  g3: { check: "Sabes leer tus métricas principales." },
};
if (["woocommerce", "none"].includes(CFG.platform)) Object.assign(CLIENT, {
  c1: { name: "Carga tus productos en la plataforma", desc: "Cargas tu catálogo directamente en yavendió!: uno por uno con «Nuevo producto», con un Excel/CSV o desde un PDF de tu catálogo.", where: "<code>/dashboard/products</code>", check: "Todos tus productos están en el panel." },
  c2: { name: "Revisar nombres y descripciones", desc: "Cada producto con nombre y descripción claros: el vendedor IA los usa para responder a tus clientes.", where: "<code>/dashboard/products</code>", check: "Ningún producto con descripción vacía o poco clara." },
});
if (CFG.shopify) Object.assign(CLIENT, {
  c1: { name: "Conectar tu tienda Shopify", desc: "Como ya vendes en Shopify, conectas tu tienda y el catálogo se sincroniza solo, en un sentido: de Shopify a yavendió!.", where: "Integraciones del panel → Shopify.", check: "La integración con Shopify aparece conectada." },
  c2: { name: "Revisar el catálogo sincronizado", desc: "Confirma que llegaron todos tus productos. Precio, stock, fotos y descripción se siguen editando siempre en Shopify.", check: "Todos tus productos están en el panel." },
  c3: { desc: "Cada producto con precio, fotos, tallas y colores correctos. Si algo falta, corrígelo en Shopify y se actualiza aquí." },
});
// ajustes de texto propios de un merchant (p. ej. medios de pago de otro país)
if (CFG.overrides) for (const [id, o] of Object.entries(CFG.overrides)) CLIENT[id] = { ...(CLIENT[id] || {}), ...o };
PHASES.forEach(p => p.tasks.forEach(t => Object.assign(t, CLIENT[t.id] || {})));
// planes más cortos (p. ej. 1 semana) traen su propio calendario: { id: [día, duración] }
if (CFG.schedule) PHASES.forEach(p => p.tasks.forEach(t => { const x = CFG.schedule[t.id]; if (x) { t.d = x[0]; t.len = x[1]; } }));
const N = CFG.dates ? CFG.dates.length : (CFG.days || 10);
// hora de las sesiones en la zona del merchant (las sesiones son 8:00 am hora de Lima)
const TIME = CFG.sessionTime || "8:00 am", TIMES = TIME.replace(/ ?am$/, ""), TZ = CFG.sessionTz ? " " + CFG.sessionTz : "";
const PERIOD = CFG.periodLabel || (CFG.calendarDays ? "10 días" : "2 semanas");
const img = f => "data:image/png;base64," + fs.readFileSync(f).toString("base64");
const b64 = f => "data:image/png;base64," + fs.readFileSync(A + f).toString("base64");

const DAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const DS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const MS = MONTHS.map(m => m.slice(0, 3));
const [y, m, d] = START.split("-").map(Number);
const days = []; const cur = new Date(y, m - 1, d);
// calendarDays: cuenta sábados y domingos; si no, solo lunes a viernes
if (CFG.dates) CFG.dates.forEach(s => { const [a, b, c] = s.split("-").map(Number); days.push(new Date(a, b - 1, c)); });
else while (days.length < N) { if (CFG.calendarDays || cur.getDay() % 6) days.push(new Date(cur)); cur.setDate(cur.getDate() + 1); }
// GAP: primer día después de una pausa en el calendario (solo con fechas explícitas)
const GAP = CFG.dates ? days.findIndex((x, i) => i > 0 && (x - days[i - 1]) > 86400000 * 1.5) : -1;
const W2 = GAP > 0 ? GAP : N < 10 ? -1 : CFG.calendarDays ? days.findIndex((x, i) => i > 0 && x.getDay() === 1) : 5;
const we = x => (x.getDay() % 6 ? "" : " we");
const short = x => `${DS[x.getDay()]} ${x.getDate()} ${MS[x.getMonth()]}`;
const long = x => `${DAYS[x.getDay()]} ${x.getDate()} de ${MONTHS[x.getMonth()]}`;
const sess = days.map((x, i) => [1, 3, 5].includes(x.getDay()) ? i : -1).filter(i => i >= 0);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const range = t => t.len > 1 ? `${short(days[t.d])} → ${short(days[t.d + t.len - 1])}` : short(days[t.d]);
// client wording: "Revisión con yavendió! en la sesión de dudas." etc. stay as-is; strip the internal-only milestone row text
const ph = PHASES.map((p, n) => ({ ...p, n: n + 1, first: Math.min(...p.tasks.map(t => t.d)), last: Math.max(...p.tasks.map(t => t.d + t.len - 1)) }));

// ---- Gantt ----
let g = `<div class="corner">Etapa</div>`;
days.forEach((x, i) => g += `<div class="hc${i === W2 ? " w2" : ""}${i === GAP ? " gap" : ""}${we(x)}">${i === GAP && CFG.gapLabel ? `<span class="gapk">${esc(CFG.gapLabel)}</span>` : ""}<b>Día ${i + 1}</b>${short(x)}</div>`);
const cols = (extra = "") => days.map((x, i) => `<i class="c${i === W2 ? " w2" : ""}${i === GAP ? " gap" : ""}${we(x)}" style="grid-column:${i + 1}"></i>`).join("") + extra;
g += `<div class="rn sess"><span>Sesiones de dudas</span><small>lun, mié y vie · ${TIME}${TZ}</small></div><div class="tr">${cols(sess.map(i => `<span class="dot" style="grid-column:${i + 1}">${TIMES}</span>`).join(""))}</div>`;
ph.forEach(p => {
  const final = p.id === "g";
  g += `<div class="rn" data-rn="${p.id}"><span>${esc(p.name)}</span><small>${p.tasks.filter(t => !t.milestone).length} pasos</small></div>`;
  g += `<div class="tr">${cols(`<span data-bar="${p.id}" class="bar p${p.n}${final ? " final" : ""}" style="grid-column:${p.first + 1} / span ${p.last - p.first + 1}">${final ? "¡A vender!" : esc(p.name)}</span>`)}</div>`;
});

// ---- Steps ----
let steps = "";
ph.forEach(p => {
  steps += `<section class="phase" id="${p.id}">
    <header><span class="num p${p.n}">${p.n}</span><div><h3>${esc(p.name)}</h3><p>${range({ d: p.first, len: p.last - p.first + 1 })}</p></div><span class="pc" data-pc="${p.id}"></span></header>${(() => { const vs = p.tasks.flatMap(t => CFG.videos?.[t.id] || []); return vs.length ? `
    <div class="pvids"><span class="pvk">Videos de esta etapa</span>${vs.map(v => `<a class="vid" href="${v.drive ? "https://drive.google.com/file/d/" + v.drive + "/view" : "https://www.youtube.com/watch?v=" + v.id}" target="_blank" rel="noopener"><img src="${v.drive ? "https://drive.google.com/thumbnail?id=" + v.drive + "&amp;sz=w320" : "https://i.ytimg.com/vi/" + v.id + "/mqdefault.jpg"}" alt="" width="112" height="63" loading="lazy"><span><small>Video tutorial</small>${esc(v.title)}</span><b aria-hidden="true">▶</b></a>`).join("")}</div>` : ""; })()}
    <ol class="tasks">`;
  p.tasks.forEach(t => {
    if (t.milestone) return;
    steps += `<li data-task="${t.id}"><div class="th"><h4>${esc(t.name)}</h4><span class="when">${range(t)}</span></div>
      <p>${esc(t.desc)}</p>
      <dl><div><dt>Dónde</dt><dd>${t.where}</dd></div><div><dt>Listo cuando</dt><dd>${esc(t.check)}</dd></div></dl>
      <label class="mark" for="t-${t.id}"><input type="checkbox" id="t-${t.id}" data-phase="${p.id}"><span>Lo completé</span></label></li>`;
  });
  steps += `</ol></section>`;
});

const checklist = ["Catálogo cargado y revisado", "Negocio y personalidad del vendedor", "Mensajes de bienvenida, despedida y horarios", "Envíos y métodos de pago", "Preguntas frecuentes", "Flujos de venta publicados", "WhatsApp e Instagram conectados y probados"];

const html = `<title>${MERCHANT ? esc(MERCHANT) + " × yavendió!" : "Tu plan con yavendió!"}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Raleway:wght@400;500;600;700${CFG.logoText ? "&family=Montserrat:wght@700" : ""}&display=swap">
<style>
/* Layout: documento claro de lectura; resumen de fechas, Gantt por etapas, paso a paso y checklist. */
:root {
  --bg: #F5F5F4; --surface: #FFFFFF; --fg: #1C1917; --dim: #57534E; --line: #E7E5E4;
  --brand: #31162F; --brand-2: #6A2F65; --tint: #F3EEF7; --hl: #F4EC7A; --hl-ink: #31162F;
  --p1: #E5DCEF; --p2: #D5C3E6; --p3: #B6C0E2; --p4: #AB84C8; --p5: #8D3F87; --p6: #6D81C5; --p7: #3A4E92; --p8: #2A396B; --p9: #6A2F65;
  --on-dark: #FFFFFF; --on-light: #31162F;
  --font-head: 'Bricolage Grotesque', system-ui, sans-serif;
  --font-body: 'Raleway', system-ui, sans-serif;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #140B13; --surface: #1F141E; --fg: #F5F5F4; --dim: #C4C4C4; --line: rgba(255,255,255,.1);
  --brand: #F5F5F4; --brand-2: #C9A8E0; --tint: rgba(171,132,200,.14); color-scheme: dark; } }
:root[data-theme="dark"] {
  --bg: #140B13; --surface: #1F141E; --fg: #F5F5F4; --dim: #C4C4C4; --line: rgba(255,255,255,.1);
  --brand: #F5F5F4; --brand-2: #C9A8E0; --tint: rgba(171,132,200,.14); color-scheme: dark; }
* { box-sizing: border-box; }
body { background: var(--bg); color: var(--fg); font-family: var(--font-body); font-size: 16px; line-height: 1.55; word-spacing: .02em; margin: 0; }
.wrap { max-width: 1080px; margin: 0 auto; padding: 28px 20px 56px; display: flex; flex-direction: column; gap: 44px; }
h1, h2, h3, h4 { font-family: var(--font-head); margin: 0; text-wrap: balance; color: var(--brand); }
h2 { font-size: clamp(26px, 3.6vw, 34px); font-weight: 600; letter-spacing: -.04em; line-height: 1.1; }
.kicker { font-size: 12px; font-weight: 700; letter-spacing: .3em; text-transform: uppercase; color: var(--brand-2); }
.logo { height: 26px; width: auto; display: block; }
.logo.white { display: none; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .logo.black { display: none; } :root:not([data-theme="light"]) .logo.white { display: block; } }
:root[data-theme="dark"] .logo.black { display: none; } :root[data-theme="dark"] .logo.white { display: block; }
code { font-family: ui-monospace, Consolas, monospace; font-size: .84em; background: var(--tint); color: var(--brand-2); padding: 1px 6px; border-radius: 4px; overflow-wrap: anywhere; }
.sec { display: flex; flex-direction: column; gap: 18px; }
.sec > p { margin: 0; color: var(--dim); max-width: 64ch; }

.hero { display: flex; flex-direction: column; gap: 14px; }
.hero h1 { font-size: clamp(34px, 6vw, 60px); font-weight: 600; letter-spacing: -.05em; line-height: 1.02; max-width: 16ch; }
.hero .lead { margin: 0; font-size: 18px; color: var(--dim); max-width: 60ch; }
.keys { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border: 1px solid var(--line); border-radius: 14px; background: var(--surface); margin-top: 10px; }
.keys div { padding: 16px 20px; border-left: 1px solid var(--line); display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.keys div:first-child { border-left: 0; }
.keys span { font-size: 13px; color: var(--dim); }
.keys small { font-size: 12px; color: var(--dim); }
.keys b { font-family: var(--font-head); font-size: 22px; font-weight: 600; letter-spacing: -.02em; color: var(--brand); }
.keys .go b { background: var(--hl); color: var(--hl-ink); padding: 0 6px; border-radius: 4px; justify-self: start; align-self: flex-start; }
@media (max-width: 680px) { .keys { grid-template-columns: 1fr; } .keys div { border-left: 0; border-top: 1px solid var(--line); } .keys div:first-child { border-top: 0; } }

.ms { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 0; padding: 0; list-style: none; }
.ms li { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 14px 16px; font-size: 15px; }
.ms b { display: block; font-family: var(--font-head); color: var(--brand); font-size: 16px; margin-bottom: 2px; }
@media (max-width: 680px) { .ms { grid-template-columns: 1fr; } }

.gs { overflow-x: auto; border: 1px solid var(--line); border-radius: 14px; background: var(--surface); }
.gantt { display: grid; grid-template-columns: minmax(200px, 240px) repeat(${N}, minmax(58px, 1fr)); min-width: ${N < 10 ? 720 : 860}px; }
.corner, .hc { padding: 10px 8px; border-bottom: 1px solid var(--line); font-size: 12px; color: var(--dim); }
.corner { position: sticky; left: 0; background: var(--surface); z-index: 2; padding-left: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; display: flex; align-items: flex-end; }
.hc { text-align: center; border-left: 1px solid var(--line); }
.hc b { display: block; font-family: var(--font-head); color: var(--fg); font-size: 14px; font-weight: 600; }
.hc.w2, .c.w2 { border-left: 2px solid var(--brand-2); }
.hc.w2.gap, .c.w2.gap { border-left: 6px double var(--brand-2); }
.hc .gapk { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--brand-2); }
.hc.we, .c.we { background: var(--tint); }
.rn { position: sticky; left: 0; z-index: 2; background: var(--surface); padding: 8px 12px 8px 18px; border-right: 1px solid var(--line); display: flex; flex-direction: column; justify-content: center; min-height: 48px; }
.rn span { font-weight: 700; font-size: 14px; line-height: 1.25; }
.rn small { font-size: 12px; color: var(--dim); }
.rn.sess span { color: var(--brand-2); }
.tr { grid-column: 2 / -1; display: grid; grid-template-columns: repeat(${N}, minmax(0, 1fr)); align-items: center; border-top: 1px solid var(--line); }
.rn { border-top: 1px solid var(--line); }
.c { grid-row: 1; height: 100%; border-left: 1px solid var(--line); }
.bar { grid-row: 1; height: 28px; margin: 0 4px; border-radius: 7px; font-size: 12px; font-weight: 700; padding: 0 10px; display: flex; align-items: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.p1 { background: var(--p1); color: var(--on-light); } .p2 { background: var(--p2); color: var(--on-light); } .p3 { background: var(--p3); color: var(--on-light); }
.p4 { background: var(--p4); color: var(--on-dark); } .p5 { background: var(--p5); color: var(--on-dark); } .p6 { background: var(--p6); color: var(--on-dark); }
.p7 { background: var(--p7); color: var(--on-dark); } .p8 { background: var(--p8); color: var(--on-dark); } .p9 { background: var(--p9); color: var(--on-dark); }
.bar.final { background: var(--hl); color: var(--hl-ink); justify-content: center; }
.dot { grid-row: 1; justify-self: center; font-size: 11px; font-weight: 700; color: var(--brand-2); border: 1.5px solid var(--brand-2); border-radius: 999px; padding: 2px 8px; background: var(--surface); }
.note { font-size: 13px; color: var(--dim); margin: 0; }

.phase { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 22px 22px 8px; }
.phase header { display: flex; gap: 14px; align-items: center; margin-bottom: 6px; }
.num { width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center; font-family: var(--font-head); font-weight: 700; font-size: 18px; flex: none; }
.phase h3 { font-size: 22px; font-weight: 600; letter-spacing: -.03em; }
.phase header p { margin: 0; font-size: 14px; color: var(--dim); }
.tasks { list-style: none; margin: 0; padding: 0; }
.tasks li { padding: 16px 0; border-top: 1px solid var(--line); display: flex; flex-direction: column; gap: 8px; }
.tasks li:first-child { border-top: 0; }
.th { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; align-items: baseline; }
.tasks h4 { font-size: 17px; font-weight: 600; letter-spacing: -.01em; color: var(--fg); }
.when { font-size: 13px; font-weight: 600; color: var(--brand-2); font-variant-numeric: tabular-nums; }
.tasks p { margin: 0; color: var(--dim); font-size: 15px; max-width: 70ch; }
dl { margin: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
dl div { background: var(--tint); border-radius: 8px; padding: 10px 12px; min-width: 0; }
dt { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--brand-2); }
dd { margin: 2px 0 0; font-size: 14px; }
@media (max-width: 680px) { dl { grid-template-columns: 1fr; } .phase { padding: 18px 16px 4px; } }
.steps { display: flex; flex-direction: column; gap: 16px; }

.sessions { display: grid; grid-template-columns: auto 1fr; gap: 24px; align-items: start; background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 22px; }
.sessions img { width: 96px; height: 96px; border-radius: 50%; background: var(--tint); }
.sessions ul { margin: 8px 0 0; padding-left: 20px; color: var(--dim); }
.dates { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.dates span { border: 1.5px solid var(--brand-2); color: var(--brand-2); border-radius: 999px; padding: 4px 12px; font-size: 14px; font-weight: 600; }
@media (max-width: 680px) { .sessions { grid-template-columns: 1fr; } }

.check { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.check label { display: flex; gap: 12px; align-items: center; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; cursor: pointer; font-weight: 600; }
.check input { width: 20px; height: 20px; accent-color: #6A2F65; flex: none; }
.check input:checked + span { color: var(--dim); text-decoration: line-through; }
@media (max-width: 680px) { .check { grid-template-columns: 1fr; } }
:focus-visible { outline: 2px solid var(--brand-2); outline-offset: 2px; }
.pvids { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 6px 0 14px; }
.pvk { grid-column: 1 / -1; font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--brand-2); }
.pvids .vid { max-width: none; }
@media (max-width: 680px) { .pvids { grid-template-columns: 1fr; } }
.vid { display: flex; align-items: center; gap: 12px; text-decoration: none; color: var(--fg); border: 1px solid var(--line); border-radius: 10px; padding: 8px 14px 8px 8px; max-width: 520px; background: var(--surface); }
.vid:hover { border-color: var(--brand-2); }
.vid img { width: 112px; height: 63px; object-fit: cover; border-radius: 6px; background: var(--tint); flex: none; }
.vid span { display: flex; flex-direction: column; font-weight: 700; font-size: 14px; line-height: 1.3; min-width: 0; }
.vid small { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--brand-2); }
.vid b { margin-left: auto; width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; background: #6A2F65; color: #fff; font-size: 12px; flex: none; }
@media (max-width: 420px) { .vid img { width: 84px; height: 47px; } }
.vlist { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.vlist a { display: flex; align-items: center; gap: 12px; text-decoration: none; color: var(--fg); background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 10px 14px 10px 10px; height: 100%; }
.vlist a:hover { border-color: var(--brand-2); }
.vn { font-family: var(--font-head); font-weight: 800; font-size: 20px; color: var(--brand-2); width: 26px; text-align: center; flex: none; font-variant-numeric: tabular-nums; }
.vlist img { width: 96px; height: 54px; object-fit: cover; border-radius: 6px; background: var(--tint); flex: none; }
.vt { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.vt b { font-size: 14px; line-height: 1.3; }
.vt small { font-size: 12px; color: var(--dim); }
.vlist i { margin-left: auto; font-style: normal; width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; background: #6A2F65; color: #fff; font-size: 11px; flex: none; }
@media (max-width: 680px) { .vlist { grid-template-columns: 1fr; } }
@media (max-width: 420px) { .vlist img { display: none; } }
.mark { display: inline-flex; align-self: flex-start; gap: 10px; align-items: center; border: 1.5px solid var(--line); border-radius: 999px; padding: 7px 14px 7px 10px; font-weight: 700; font-size: 14px; cursor: pointer; }
.mark:hover { border-color: var(--brand-2); }
.mark input { width: 18px; height: 18px; accent-color: #6A2F65; margin: 0; }
.tasks li.is-done h4 { color: var(--dim); text-decoration: line-through; }
.tasks li.is-done .mark { background: var(--tint); border-color: var(--brand-2); color: var(--brand-2); }
.pc { margin-left: auto; font-size: 13px; font-weight: 700; color: var(--brand-2); font-variant-numeric: tabular-nums; white-space: nowrap; }
.pc.full { background: var(--hl); color: var(--hl-ink); padding: 2px 10px; border-radius: 999px; }
.bar.is-done { text-decoration: line-through; text-decoration-thickness: 2px; opacity: .55; }
.bar.is-done::after { content: " ✓"; text-decoration: none; display: inline-block; margin-left: 4px; }
.rn.is-done span { text-decoration: line-through; text-decoration-thickness: 2px; color: var(--dim); }
.rn.is-done small::before { content: "✓ Lista · "; color: var(--brand-2); font-weight: 700; }
.prog { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 18px 22px; display: flex; flex-direction: column; gap: 10px; }
.prog-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; }
.prog-head b { font-family: var(--font-head); font-size: 20px; font-weight: 600; color: var(--brand); letter-spacing: -.02em; }
#progPct { font-family: var(--font-head); font-size: 34px; font-weight: 800; color: var(--brand-2); letter-spacing: -.03em; font-variant-numeric: tabular-nums; line-height: 1; }
.prog .track { height: 10px; border-radius: 5px; background: var(--tint); overflow: hidden; }
.prog .track i { display: block; height: 100%; width: 0; background: #6A2F65; transition: width .3s ease; }
@media (prefers-reduced-motion: reduce) { .prog .track i { transition: none; } }
.brand { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.ptext { font-family: "Montserrat", system-ui, sans-serif; font-weight: 700; font-size: 17px; letter-spacing: .02em; color: #FFFFFF; padding: 8px 14px; border-radius: 6px; line-height: 1; }
.brand .x { font-size: 22px; color: var(--dim); line-height: 1; }
.plogo { height: 44px; width: auto; display: block; }
.plogo.white { display: none; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .plogo.black { display: none; } :root:not([data-theme="light"]) .plogo.white { display: block; } }
:root[data-theme="dark"] .plogo.black { display: none; } :root[data-theme="dark"] .plogo.white { display: block; }
.mid { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; border: 1.5px dashed var(--brand-2); border-radius: 14px; padding: 14px 18px; background: var(--surface); }
.mid-l { display: flex; flex-direction: column; gap: 2px; flex: 1 1 260px; min-width: 0; }
.mid-k { font-size: 11px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--brand-2); }
#midVal { font-family: ui-monospace, Consolas, monospace; font-size: 20px; color: var(--brand); overflow-wrap: anywhere; }
.mid-l small { font-size: 13px; color: var(--dim); }
.mid-f { display: flex; gap: 8px; flex: 1 1 280px; min-width: 0; }
.mid-f input { flex: 1; min-width: 0; font: inherit; font-family: ui-monospace, Consolas, monospace; padding: 10px 12px; border: 1px solid var(--line); border-radius: 8px; background: var(--bg); color: var(--fg); }
.mid-f button, .mid-c { font: inherit; font-weight: 700; border: 0; border-radius: 8px; padding: 10px 16px; background: #6A2F65; color: #fff; cursor: pointer; }
.mid-c { background: transparent; color: var(--brand-2); border: 1.5px solid var(--brand-2); }
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
.sync { margin: 0; font-size: 13px; font-weight: 600; color: var(--dim); }
.sync:empty { display: none; }
.sync.ok { color: #15803D; }
.sync.warn { color: #C2410C; }
.footer-bar { background: var(--hl); color: var(--hl-ink); font-weight: 700; font-size: 13px; letter-spacing: .04em; min-height: 34px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0 20px; flex-wrap: wrap; }
</style>

<div class="wrap">
  <header class="brand">
    <img class="logo black" alt="yavendió!" src="${b64("wordmark-black.png")}">
    <img class="logo white" alt="yavendió!" src="${b64("wordmark-white.png")}">
    ${CFG.logoText ? `<span class="x" aria-hidden="true">×</span>
    <span class="ptext" style="background:${CFG.logoTextBg || "#2F3A5A"}">${esc(CFG.logoText)}</span>` : ""}
    ${CFG.logoBlack ? `<span class="x" aria-hidden="true">×</span>
    <img class="plogo black" alt="${esc(MERCHANT)}" src="${img(CFG.logoBlack)}"${CFG.logoHeight ? ` style="height:${CFG.logoHeight}px"` : ""}>
    <img class="plogo white" alt="${esc(MERCHANT)}" src="${img(CFG.logoWhite || CFG.logoBlack)}"${CFG.logoHeight ? ` style="height:${CFG.logoHeight}px"` : ""}>` : ""}
  </header>

  <section class="hero">
    <div class="kicker">${MERCHANT ? esc(MERCHANT) + " · " : ""}${CFG.kicker ? esc(CFG.kicker) : "Tu plan de arranque"}</div>
    <h1>${CFG.h1 ? esc(CFG.h1) : MERCHANT ? "El vendedor IA de " + esc(MERCHANT) + ", listo en " + (CFG.periodLabelTitle || PERIOD) : "Tu vendedor IA, listo para vender en 2 semanas"}</h1>
    <p class="lead">Este es tu camino paso a paso. Tú completas cada etapa desde tu panel de yavendió!, y nosotros te acompañamos en cada sesión de dudas. WhatsApp e Instagram se conectan al final, cuando tu vendedor ya está listo, para que ningún cliente real hable con un vendedor a medio configurar.</p>
    <div class="keys">
      <div><span>Kickoff</span><b>${short(days[0])}</b></div>
      <div><span>Sesiones de dudas</span><b>lun · mié · vie, ${TIME}</b>${TZ ? `<small>${TZ.trim()}</small>` : ""}</div>
      <div class="go"><span>Salida en vivo</span><b>${short(days[N - 1])}</b></div>
    </div>
    <div class="mid">
      <div class="mid-l"><span class="mid-k">Merchant ID</span>
        <b id="midVal">${CFG.merchantId ? esc(CFG.merchantId) : "Pendiente"}</b>
        <small id="midHint">${CFG.merchantId ? "Tu identificador en yavendió!. Tenlo a mano para las sesiones de dudas." : "Se crea con tu cuenta el " + long(days[0]) + ". Cuando lo tengas, pégalo aquí para tenerlo siempre a mano."}</small>
      </div>
      <form class="mid-f" id="midForm"${CFG.merchantId ? " hidden" : ""}>
        <label for="midIn" class="sr">Merchant ID</label>
        <input id="midIn" type="text" autocomplete="off" spellcheck="false" placeholder="Pega tu merchant ID">
        <button type="submit">Guardar</button>
      </form>
      <button type="button" class="mid-c" id="midCopy"${CFG.merchantId ? "" : " hidden"}>Copiar</button>
    </div>
  </section>

  <section class="prog" aria-live="polite">
    <div class="prog-head"><div><div class="kicker">Tu avance</div><b id="progTxt">0 de 0 pasos completados</b></div><span id="progPct">0%</span></div>
    <div class="track"><i id="progBar"></i></div>
    <p class="note">${CFG.syncUrl ? "Marca cada paso con «Lo completé» a medida que avanzas. Tu avance se guarda en línea: lo ve cualquiera que abra este link, incluido nuestro equipo." : "Marca cada paso con «Lo completé» a medida que avanzas. Tu avance se guarda en este navegador; cuéntanos en la sesión de dudas cómo vas."}</p>
    <p class="sync" id="syncState" aria-live="polite"></p>
  </section>

  <section class="sec">
    <div class="kicker">Cómo funciona</div>
    <ul class="ms">
      <li><b>Tú lo configuras</b>Cada paso se hace en tu panel. Te decimos exactamente dónde.</li>
      <li><b>Nosotros te acompañamos</b>Revisamos tu avance y te ayudamos a mejorar tu configuración.</li>
      <li><b>Resuelves dudas 3 veces por semana</b>Sesión grupal lunes, miércoles y viernes a las ${TIME}${TZ}.</li>
    </ul>
  </section>

  <section class="sec">
    <div class="kicker">Calendario</div>
    <h2>${CFG.glanceTitle ? esc(CFG.glanceTitle) : CFG.periodLabel ? "Tu " + esc(CFG.periodLabel) + " de un vistazo" : "Las 2 semanas de un vistazo"}</h2>
    <div class="gs"><div class="gantt">${g}</div></div>
    <p class="note">Cuando completas todos los pasos de una etapa, aparece tachada en el calendario. ${CFG.datesNote ? esc(CFG.datesNote) : (CFG.calendarDays ? N + " días seguidos, contando sábado y domingo," : N + " días hábiles,") + " de " + long(days[0]) + " a " + long(days[N - 1]) + "."}${CFG.calendarDays ? " Los fines de semana van sombreados." : ""}${GAP > 0 ? " La doble línea morada marca la pausa: " + esc(CFG.gapNote || "") : W2 > 0 ? " La línea morada marca el inicio de la segunda semana." : ""}</p>
  </section>

  <section class="sec">
    <div class="kicker">Paso a paso</div>
    <h2>Qué hacer en cada etapa</h2>
    <p>Entra a <code>ya.onl</code> con tu cuenta. En cada paso te indicamos la sección del panel donde se hace y cómo saber que quedó listo.</p>
    <div class="steps">${steps}</div>
  </section>

  <section class="sec">
    <div class="kicker">Acompañamiento</div>
    <h2>Sesiones de dudas y consultas</h2>
    <div class="sessions">
      <img src="${b64("yago/yago-avatar.png")}" alt="Yago, el asistente de yavendió!">
      <div>
        <p style="margin:0">Sesión grupal abierta a todos los negocios que están arrancando. Trae tus dudas: las resolvemos en vivo y te ayudamos a mejorar tu configuración.</p>
        <ul>
          <li>Lo que te bloqueó o no sabes cómo hacer.</li>
          <li>Lo que te toca antes de la siguiente sesión.</li>
          <li>Respuestas del vendedor que quieras mejorar.</li>
        </ul>
        <div class="dates">${sess.map(i => `<span>${short(days[i])} · ${TIME}</span>`).join("")}</div>
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="kicker">Antes de salir en vivo</div>
    <h2>Checklist final</h2>
    <ul class="check">${checklist.map((c, i) => `<li><label for="ck${i}"><input type="checkbox" id="ck${i}"><span>${c}</span></label></li>`).join("")}</ul>
  </section>
</div>
<div class="footer-bar"><span>yavendió! · Vende con IA tus productos en WhatsApp</span><span>yavendio.com</span></div>
<script>
const KEY = "plan-yavendio." + ${JSON.stringify(MERCHANT ? SLUG + "." + START : START)} + ".";
// Google puede tardar; sin límite, un pedido colgado bloquearía la sincronización
const sfetch = (u, o = {}) => fetch(u, { ...o, signal: AbortSignal.timeout ? AbortSignal.timeout(20000) : undefined });
const SYNC = ${JSON.stringify(CFG.syncUrl || "")};
const SLUG = ${JSON.stringify(SLUG)};
const BAKED_ID = ${JSON.stringify(CFG.merchantId || "")};
const state = {};
const boxes = [...document.querySelectorAll(".check input, .mark input")];
const syncEl = document.getElementById("syncState");
function lsGet(k) { try { return localStorage.getItem(KEY + k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(KEY + k, v); } catch (e) {} }
function setSync(kind, text) { if (syncEl) { syncEl.className = "sync " + kind; syncEl.textContent = text; } }

function update() {
  const tasks = [...document.querySelectorAll(".mark input")];
  const done = tasks.filter(x => x.checked).length;
  const pct = tasks.length ? Math.round(done / tasks.length * 100) : 0;
  document.getElementById("progTxt").textContent = done + " de " + tasks.length + " pasos completados";
  document.getElementById("progPct").textContent = pct + "%";
  document.getElementById("progBar").style.width = pct + "%";
  tasks.forEach(x => x.closest("li").classList.toggle("is-done", x.checked));
  document.querySelectorAll("[data-pc]").forEach(el => {
    const id = el.dataset.pc, list = tasks.filter(x => x.dataset.phase === id), n = list.filter(x => x.checked).length;
    el.textContent = n === list.length ? "✓ Completa" : n + " de " + list.length;
    el.classList.toggle("full", n === list.length);
    document.querySelector('[data-bar="' + id + '"]')?.classList.toggle("is-done", n === list.length);
    document.querySelector('[data-rn="' + id + '"]')?.classList.toggle("is-done", n === list.length);
  });
}

// merchant ID
const val = document.getElementById("midVal"), form = document.getElementById("midForm"), inp = document.getElementById("midIn"), copy = document.getElementById("midCopy"), hint = document.getElementById("midHint");
function showId(id) {
  val.textContent = id || "Pendiente";
  copy.hidden = !id;
  if (document.activeElement !== inp) form.hidden = !!BAKED_ID || !!id;
  if (id && !BAKED_ID) hint.textContent = SYNC ? "Guardado para todo el equipo. Doble clic sobre el ID para corregirlo." : "Guardado en este navegador. Doble clic sobre el ID para corregirlo.";
}

function apply() {
  boxes.forEach(b => { b.checked = state[b.id] === "1"; });
  showId(BAKED_ID || state.merchantId || "");
  update();
}

let pending = 0;
async function save(clave, valor) {
  state[clave] = valor; lsSet(clave, valor); apply();
  if (!SYNC) return;
  pending++; setSync("", "Guardando…");
  const post = async () => {
    const r = await sfetch(SYNC, { method: "POST", body: JSON.stringify({ merchant: SLUG, clave, valor }) });
    const j = await r.json(); if (!j.ok) throw new Error(j.error);
  };
  // Google a veces responde mal aunque sí guardó: si falla, confirmamos leyendo y reintentamos una vez
  const stored = async () => {
    try { const j = await (await sfetch(SYNC + "?merchant=" + SLUG + "&t=" + Date.now())).json(); return j.ok && j.data[clave] === valor; } catch (e) { return false; }
  };
  try {
    // solo reintenta si nadie cambió ese paso mientras tanto (evita revivir un check ya desmarcado)
    try { await post(); } catch (e) { if (state[clave] === valor && !(await stored())) { await post(); } }
    setSync("ok", "Guardado · lo ve todo el equipo");
  } catch (e) {
    if (await stored()) setSync("ok", "Guardado · lo ve todo el equipo");
    else setSync("warn", "No se pudo guardar en línea. Quedó en este navegador; revisa tu conexión y vuelve a marcarlo.");
  }
  finally { pending--; }
}
let pullFails = 0;
async function pull() {
  if (!SYNC || pending) return;
  try {
    const r = await sfetch(SYNC + "?merchant=" + SLUG + "&t=" + Date.now());
    const j = await r.json(); if (!j.ok) throw new Error(j.error);
    if (pending) return;
    // la hoja manda: reemplaza lo local para que todos vean lo mismo
    Object.keys(state).forEach(k => { delete state[k]; });
    Object.assign(state, j.data);
    Object.entries(state).forEach(([k, v]) => lsSet(k, v));
    boxes.forEach(b => { if (!(b.id in state)) lsSet(b.id, "0"); });
    apply();
    pullFails = 0;
    setSync("ok", "Sincronizado · lo ve todo el equipo");
  } catch (e) {
    // un fallo suelto de Google es normal; avisamos solo si se repite
    if (++pullFails >= 2) setSync("warn", "Sin conexión: por ahora los cambios se guardan solo en este navegador.");
  }
}

boxes.forEach(b => { const v = lsGet(b.id); if (v !== null) state[b.id] = v; b.addEventListener("change", () => save(b.id, b.checked ? "1" : "0")); });
{ const v = lsGet("merchantId"); if (v) state.merchantId = v; }
form.addEventListener("submit", e => { e.preventDefault(); const id = inp.value.trim(); if (!id) return; inp.blur(); form.hidden = true; save("merchantId", id); });
val.addEventListener("dblclick", () => { if (BAKED_ID) return; form.hidden = false; inp.value = val.textContent === "Pendiente" ? "" : val.textContent; inp.focus(); });
copy.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(val.textContent); copy.textContent = "Copiado"; }
  catch (e) { const r = document.createRange(); r.selectNodeContents(val); const s = getSelection(); s.removeAllRanges(); s.addRange(r); copy.textContent = "Selecciónalo y cópialo"; }
  setTimeout(() => { copy.textContent = "Copiar"; }, 2000);
});

apply();
if (SYNC) {
  setSync("", "Cargando avance…");
  pull();
  setInterval(() => { if (!document.hidden) pull(); }, 20000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) pull(); });
}
</script>
`;
fs.writeFileSync(OUT + "-cliente.html", html);
// standalone copy with a full document skeleton for sending as a file
fs.writeFileSync(OUT + "-standalone.html", `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` + html.replace("<style>", "</head><body><style>").replace(/^<title>/, "<title>") + `</body></html>`);
console.log("ok", days.map(short).join(" | "), "sessions:", sess.map(i => short(days[i])).join(", "));
