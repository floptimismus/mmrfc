/* ======================================================================
   START
   ====================================================================== */
(async () => {
  // Version 4: alte Kalender-Daten (gemeinsamer Link aus Version 3) vom Gerät löschen
  if (!store.get("v4")) { ["ics", "gcal_ok", "admin_token"].forEach(k => store.del(k)); store.set("v4", 1); }

  $("#tab-termine").innerHTML = `<div class="loader"><div class="ring"></div>${T("Lade …", "Loading …")}</div>`;
  showTab(location.hash.slice(1) || "termine");

  await loadMe();
  // Sprache aus dem Konto übernehmen (gilt auf allen Geräten)
  if (Auth.user && !Auth.offline) {
    if (Auth.user.lang && Auth.user.lang !== LANG) { setLang(Auth.user.lang, { save: false }); return; }
    if (!Auth.user.lang) api("/api/me", { method: "PUT", body: { lang: LANG } }).catch(() => {});
  }
  loadCalendar();
  const cur = location.hash.slice(1);
  if (cur === "konto") renderKonto();
  if (cur === "team") renderTeam();
  if (cur === "ergebnisse") renderErgebnisse();
  maybeWelcome();

  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("/sw.js").catch(() => {});
})();
