/* ======================================================================
   SPRACHE / LANGUAGE – Deutsch, English, Français, Español
   T("Deutsch", "English") liefert den Text in der aktuellen Sprache.
   L({ de: …, en: … }) macht dasselbe für zweisprachige Inhalte.
   Französisch und Spanisch: Wörterbücher in lang-fr.js / lang-es.js,
   Schlüssel ist jeweils der englische Text. Fehlt ein Eintrag, erscheint Englisch.
   ====================================================================== */
const LANGS = ["de", "en", "fr", "es"];
const LANG_INFO = { de: ["🇩🇪", "Deutsch", "de-DE"], en: ["🇬🇧", "English", "en-GB"], fr: ["🇫🇷", "Français", "fr-FR"], es: ["🇪🇸", "Español", "es-ES"] };
const LANG = (() => {
  let l = null;
  try { l = JSON.parse(localStorage.getItem("mm_lang")); } catch (e) {}
  if (!LANGS.includes(l)) { const nav = (navigator.language || "").slice(0, 2).toLowerCase(); l = LANGS.includes(nav) ? nav : "en"; }
  return l;
})();
const LOC = LANG_INFO[LANG][2];
const DICT = window.DICT || (window.DICT = {});       // wird von lang-fr.js / lang-es.js gefüllt

const tr = s => (DICT[LANG] && DICT[LANG][s]) ?? s;   // englischen Text nachschlagen
// ganze Strukturen (Arrays/Objekte aus Strings) übersetzen
const deepTr = x => typeof x === "string" ? tr(x) : Array.isArray(x) ? x.map(deepTr)
  : (x && typeof x === "object") ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, deepTr(v)])) : x;
// Vorlagen mit Platzhaltern: TP("Show {0} more events", n)
const TP = (pattern, ...vals) => ({ __p: pattern, vals });
const fill = (p, vals) => p.replace(/\{(\d+)\}/g, (_, i) => vals[+i] ?? "");

function T(de, en) {
  if (LANG === "de") return de;
  if (en && en.__p) return fill(LANG === "en" ? en.__p : tr(en.__p), en.vals);
  return LANG === "en" ? en : deepTr(en);
}
const isLangObj = v => v && typeof v === "object" && !Array.isArray(v) && ("de" in v || "en" in v);
function L(v) {
  if (isLangObj(v)) {
    if (v[LANG] !== undefined) return v[LANG];
    return LANG === "de" ? v.de : deepTr(v.en ?? v.de);
  }
  return typeof v === "string" && LANG !== "de" && LANG !== "en" ? tr(v) : v;
}

// Sprache wechseln: merken und App neu laden (alle Texte werden neu aufgebaut)
function setLang(l, { save = true } = {}) {
  if (!LANGS.includes(l)) return;
  try { localStorage.setItem("mm_lang", JSON.stringify(l)); } catch (e) {}
  if (save && typeof api === "function" && typeof Auth !== "undefined" && Auth.user) {
    api("/api/me", { method: "PUT", body: { lang: l } }).catch(() => {}).finally(() => location.reload());
  } else location.reload();
}
// Sprach-Schalter mit vier Knöpfen
function langSwitch() {
  return `<div class="seg langseg" role="group" aria-label="Sprache / Language / Langue / Idioma">
    ${LANGS.map(l => `<button type="button" data-lang="${l}" aria-pressed="${LANG === l}" title="${LANG_INFO[l][1]}"><span class="flag">${LANG_INFO[l][0]}</span> ${l.toUpperCase()}</button>`).join("")}</div>`;
}
function bindLangSwitch(scope) {
  scope.querySelectorAll("[data-lang]").forEach(b => b.onclick = () => { if (b.dataset.lang !== LANG) setLang(b.dataset.lang); });
}

// Statische Texte in index.html: data-i18n="Deutsch|English", data-i18n-aria="Deutsch|English"
document.documentElement.lang = LANG;
document.querySelectorAll("[data-i18n]").forEach(el => { const [de, en] = el.dataset.i18n.split("|"); el.textContent = T(de, en); });
document.querySelectorAll("[data-i18n-aria]").forEach(el => { const [de, en] = el.dataset.i18nAria.split("|"); el.setAttribute("aria-label", T(de, en)); });
