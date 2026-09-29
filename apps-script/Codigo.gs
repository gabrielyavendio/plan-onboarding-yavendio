// Guarda el avance de los planes de onboarding (checks y merchant ID) en esta hoja.
// Se publica como aplicación web: Implementar → Nueva implementación → Aplicación web,
// Ejecutar como: Yo · Quién tiene acceso: Cualquier persona.

const HOJA = "avance";
const MERCHANT_RE = /^[a-z0-9-]{1,40}$/;
const CLAVE_RE = /^[A-Za-z0-9_-]{1,40}$/;

function hoja_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(HOJA);
  if (!sh) {
    sh = ss.insertSheet(HOJA);
    sh.appendRow(["merchant", "clave", "valor", "actualizado"]);
    sh.setFrozenRows(1);
    sh.getRange("C:C").setNumberFormat("@"); // texto: no pierde ceros del merchant ID
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// GET ?merchant=valente → { ok, data: { clave: valor } }
function doGet(e) {
  const merchant = String((e.parameter || {}).merchant || "");
  if (!MERCHANT_RE.test(merchant)) return json_({ ok: false, error: "merchant inválido" });
  const filas = hoja_().getDataRange().getValues().slice(1);
  const data = {};
  filas.forEach(f => { if (f[0] === merchant) data[f[1]] = String(f[2]); });
  return json_({ ok: true, data: data });
}

// POST { merchant, clave, valor } → guarda o actualiza una fila
function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: "JSON inválido" }); }
  const merchant = String(body.merchant || ""), clave = String(body.clave || ""), valor = String(body.valor ?? "").slice(0, 100);
  if (!MERCHANT_RE.test(merchant) || !CLAVE_RE.test(clave)) return json_({ ok: false, error: "datos inválidos" });
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = hoja_();
    const filas = sh.getDataRange().getValues();
    const ahora = new Date();
    for (let i = 1; i < filas.length; i++) {
      if (filas[i][0] === merchant && filas[i][1] === clave) {
        sh.getRange(i + 1, 3, 1, 2).setValues([[valor, ahora]]);
        return json_({ ok: true });
      }
    }
    sh.appendRow([merchant, clave, valor, ahora]);
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}
