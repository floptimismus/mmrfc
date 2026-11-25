/* ======================================================================
   SPRACHE / LANGUAGE – Deutsch & English
   T("Deutsch", "English") liefert den Text in der aktuellen Sprache.
   L({ de: …, en: … }) macht dasselbe für zweisprachige Inhalte.
   ====================================================================== */
const LANG = (() => {
  let l = null;
  try { l = JSON.parse(localStorage.getItem("mm_lang")); } catch (e) {}
  if (l !== "de" && l !== "en") l = /^de\b/i.test(navigator.language || "") ? "de" : "en";
  return l;
})();
const T = (de, en) => (LANG === "en" ? en : de);
const L = v => (v && typeof v === "object" && !Array.isArray(v) && ("de" in v || "en" in v)) ? (v[LANG] ?? v.de) : v;
const LOC = LANG === "en" ? "en-GB" : "de-DE";

// Sprache wechseln: merken und App neu laden (alle Texte werden neu aufgebaut)
function setLang(l, { save = true } = {}) {
  if (l !== "de" && l !== "en") return;
  try { localStorage.setItem("mm_lang", JSON.stringify(l)); } catch (e) {}
  if (save && typeof api === "function" && typeof Auth !== "undefined" && Auth.user) {
    api("/api/me", { method: "PUT", body: { lang: l } }).catch(() => {}).finally(() => location.reload());
  } else location.reload();
}
// kleiner DE | EN-Schalter
function langSwitch() {
  return `<div class="seg langseg" role="group" aria-label="Sprache / Language">
    <button type="button" data-lang="de" aria-pressed="${LANG === "de"}">🇩🇪 Deutsch</button>
    <button type="button" data-lang="en" aria-pressed="${LANG === "en"}">🇬🇧 English</button></div>`;
}
function bindLangSwitch(scope) {
  scope.querySelectorAll("[data-lang]").forEach(b => b.onclick = () => { if (b.dataset.lang !== LANG) setLang(b.dataset.lang); });
}

// Statische Texte in index.html: data-i18n="Deutsch|English", data-i18n-aria="Deutsch|English"
document.documentElement.lang = LANG;
document.querySelectorAll("[data-i18n]").forEach(el => { const [de, en] = el.dataset.i18n.split("|"); el.textContent = T(de, en); });
document.querySelectorAll("[data-i18n-aria]").forEach(el => { const [de, en] = el.dataset.i18nAria.split("|"); el.setAttribute("aria-label", T(de, en)); });
