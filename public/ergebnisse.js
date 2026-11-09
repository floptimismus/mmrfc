/* ======================================================================
   ERGEBNISSE – Spieltage/Turniere mit einem oder mehreren Spielen
   Lesen: alle · Eintragen: Admins (siehe konto.js)
   ====================================================================== */
const Res = { list: null, error: null, season: null, team: "alle" };
const KIND = {
  spieltag: { label: "Spieltag", icon: "🏉" },
  turnier: { label: "Turnier", icon: "🏆" },
  freundschaft: { label: "Freundschaftsspiel", icon: "🤝" },
};
const TEAM_LABEL = { "": "", mixed: "Mixed", flinta: "FLINTA*" };

/* ---------- Hilfen ---------- */
const seasonOf = d => { const [y, m] = d.split("-").map(Number); const s = m >= 8 ? y : y - 1; return `${s}/${String((s + 1) % 100).padStart(2, "0")}`; };
const outcome = g => (g.us == null || g.them == null) ? "o" : g.us > g.them ? "w" : g.us < g.them ? "l" : "d";
const OUT_LETTER = { w: "S", d: "U", l: "N", o: "–" };
const fmtDate = d => new Intl.DateTimeFormat("de-DE", { weekday: "short", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(d + "T12:00:00Z"));
function tally(games) {
  const t = { n: 0, w: 0, d: 0, l: 0, pf: 0, pa: 0 };
  for (const g of games) { const o = outcome(g); if (o === "o") continue; t.n++; t[o]++; t.pf += g.us; t.pa += g.them; }
  return t;
}
const canEdit = () => typeof Auth !== "undefined" && Auth.user && Auth.user.admin;

/* ---------- Laden ---------- */
async function loadResults(force) {
  if (Res.list && !force) return;
  try {
    const r = await fetch("/api/results", { cache: "no-store" });
    if (!r.ok) throw new Error(r.status);
    Res.list = (await r.json()).results; Res.error = null;
    store.set("results", Res.list);
  } catch (e) {
    Res.list = store.get("results", null); // Offline: letzter Stand
    Res.error = Res.list ? "offline" : "error";
  }
}

/* ---------- Ansicht ---------- */
async function renderErgebnisse() {
  const root = $("#tab-ergebnisse");
  if (!Res.list) { root.innerHTML = '<div class="loader"><div class="ring"></div>Ergebnisse werden geladen …</div>'; await loadResults(); }
  const all = Res.list || [];
  const seasons = [...new Set(all.map(r => seasonOf(r.date)))].sort().reverse();
  if (!Res.season || (Res.season !== "alle" && !seasons.includes(Res.season))) Res.season = seasons[0] || "alle";
  const list = all.filter(r => (Res.season === "alle" || seasonOf(r.date) === Res.season) && (Res.team === "alle" || r.team === Res.team));
  const t = tally(list.flatMap(r => r.games));

  root.innerHTML = `
    <div class="hero"><div class="top"><small>Ergebnisse</small><h1>Wie lief's?</h1></div><div class="stripe"></div>
      <div class="body"><p>Alle Spieltage, Turniere und Freundschaftsspiele – Spiel für Spiel.</p></div></div>
    ${canEdit() ? `<button class="btn primary" id="resAdd" style="width:100%;margin-bottom:10px">＋ Ergebnis eintragen</button>` : ""}
    ${Res.error === "offline" ? '<div class="note" style="margin:0 0 10px">Offline – du siehst den zuletzt geladenen Stand.</div>' : ""}
    ${Res.error === "error" ? '<div class="note" style="margin:0 0 10px">Ergebnisse konnten nicht geladen werden. <button class="btn sm ghost" id="resRetry">Nochmal</button></div>' : ""}
    ${seasons.length ? `<div class="chips">${seasons.map(s => `<button class="chip" data-season="${s}" aria-pressed="${Res.season === s}">Saison ${s}</button>`).join("")}
      ${seasons.length > 1 ? `<button class="chip" data-season="alle" aria-pressed="${Res.season === "alle"}">Alle</button>` : ""}</div>
    <div class="chips">${[["alle", "Alle Teams"], ["mixed", "Mixed"], ["flinta", "FLINTA*"]].map(([k, v]) => `<button class="chip" data-rteam="${k}" aria-pressed="${Res.team === k}">${v}</button>`).join("")}</div>` : ""}
    ${t.n ? `<div class="stats">
      <div class="stat"><b>${t.n}</b><span>Spiele</span></div>
      <div class="stat w"><b>${t.w}</b><span>Siege</span></div>
      <div class="stat d"><b>${t.d}</b><span>Unentsch.</span></div>
      <div class="stat l"><b>${t.l}</b><span>Niederl.</span></div>
    </div><p class="hint" style="margin:-4px 0 12px;text-align:center">Punkte ${t.pf} : ${t.pa} (${t.pf - t.pa >= 0 ? "+" : ""}${t.pf - t.pa})</p>` : ""}
    ${list.length ? list.map(matchdayCard).join("") : `<div class="empty"><h3>Noch keine Ergebnisse</h3>
      <p style="margin:0">${canEdit() ? "Trag das erste Ergebnis über den Knopf oben ein." : "Sobald etwas eingetragen ist, erscheint es hier. Eintragen können Admins – im Konto-Bereich oben rechts."}</p></div>`}`;

  const add = $("#resAdd", root); if (add) add.onclick = () => openResultEditor(null);
  const rt = $("#resRetry", root); if (rt) rt.onclick = async () => { Res.list = null; await loadResults(true); renderErgebnisse(); };
  $$("[data-season]", root).forEach(b => b.onclick = () => { Res.season = b.dataset.season; renderErgebnisse(); });
  $$("[data-rteam]", root).forEach(b => b.onclick = () => { Res.team = b.dataset.rteam; renderErgebnisse(); });
  $$("[data-redit]", root).forEach(b => b.onclick = () => openResultEditor(Res.list.find(r => r.id === b.dataset.redit)));
}

function matchdayCard(r) {
  const k = KIND[r.kind] || KIND.spieltag, t = tally(r.games), multi = r.games.length > 1;
  const title = r.title || (multi ? k.label : "vs " + r.games[0].opponent);
  return `<article class="md">
    <div class="mdhead"><div>
      <div class="kind">${k.icon} ${k.label}${r.team ? " · " + TEAM_LABEL[r.team] : ""}</div>
      <h3>${esc(title)}</h3>
      <div class="meta">${esc(fmtDate(r.date))}${r.location ? " · " + esc(r.location) : ""}</div>
      ${r.placement ? `<span class="place">${esc(r.placement)}</span>` : ""}
      ${multi && t.n ? `<div class="record">Bilanz: ${t.w} S · ${t.d} U · ${t.l} N · ${t.pf}:${t.pa}</div>` : ""}
    </div>${canEdit() ? `<button class="iconbtn" data-redit="${esc(r.id)}" aria-label="Bearbeiten">✏️</button>` : ""}</div>
    <div class="games">${r.games.map(g => { const o = outcome(g); return `<div class="game">
      <span class="wdl ${o}" aria-label="${{ w: "Sieg", d: "Unentschieden", l: "Niederlage", o: "offen" }[o]}">${OUT_LETTER[o]}</span>
      <span class="opp">Monks vs ${esc(g.opponent)}${g.note ? `<small>${esc(g.note)}</small>` : ""}</span>
      <span class="score">${g.us ?? "–"} : ${g.them ?? "–"}</span></div>`; }).join("")}</div>
    ${r.notes ? `<p class="notes">${esc(r.notes)}</p>` : ""}
  </article>`;
}

/* ---------- Eintragen / Bearbeiten ---------- */
function calendarSuggestions() {
  if (typeof Cal === "undefined" || !Cal.events) return [];
  const now = Date.now();
  return Cal.events.filter(e => (e.type === "spiel" || e.type === "turnier") && e.start < now + 2 * 864e5 && e.start > now - 200 * 864e5)
    .sort((a, b) => b.start - a.start).slice(0, 25);
}
function isoDay(t) { const w = wallParts(t); return `${w.y}-${String(w.m).padStart(2, "0")}-${String(w.d).padStart(2, "0")}`; }

function openResultEditor(r) {
  const d = r ? JSON.parse(JSON.stringify(r)) : { date: isoDay(Date.now()), kind: "spieltag", team: "", title: "", location: "", placement: "", notes: "", games: [{ opponent: "", us: null, them: null, note: "" }] };
  const sugg = r ? [] : calendarSuggestions();
  openSheet(`<h2 style="font-size:26px;margin:4px 40px 6px 0">${r ? "Ergebnis bearbeiten" : "Ergebnis eintragen"}</h2>
    <div class="form" id="resForm">
      ${sugg.length ? `<label for="rfCal">Aus Termin übernehmen (optional)</label>
        <select class="inp" id="rfCal"><option value="">– Termin wählen –</option>${sugg.map((e, i) => `<option value="${i}">${esc(isoDay(e.start).split("-").reverse().join("."))} · ${esc(e.title)}</option>`).join("")}</select>` : ""}
      <label>Art</label>
      <div class="seg" id="rfKind" style="margin:0">${Object.entries(KIND).map(([k, v]) => `<button type="button" data-kind="${k}" aria-pressed="${d.kind === k}">${v.label.replace("Freundschaftsspiel", "Freundschaft")}</button>`).join("")}</div>
      <div class="row2">
        <div><label for="rfDate">Datum</label><input class="inp" type="date" id="rfDate" value="${esc(d.date)}"></div>
        <div><label for="rfTeam">Team</label><select class="inp" id="rfTeam">${Object.entries({ "": "–", mixed: "Mixed", flinta: "FLINTA*" }).map(([k, v]) => `<option value="${k}" ${d.team === k ? "selected" : ""}>${v}</option>`).join("")}</select></div>
      </div>
      <label for="rfTitle">Titel (optional)</label>
      <input class="inp" id="rfTitle" maxlength="80" value="${esc(d.title)}" placeholder="z. B. Bayernliga 3. Spieltag · Bingham Cup">
      <label for="rfLoc">Ort (optional)</label>
      <input class="inp" id="rfLoc" maxlength="100" value="${esc(d.location)}">
      <div id="rfPlaceWrap" ${d.kind === "turnier" ? "" : "hidden"}><label for="rfPlace">Platzierung (optional)</label>
        <input class="inp" id="rfPlace" maxlength="40" value="${esc(d.placement)}" placeholder="z. B. 3. Platz · Bowl-Sieger"></div>
      <label>Spiele</label>
      <div class="gamehead"><span>Gegner</span><span>Wir</span><span>Die</span><span></span></div>
      <div id="rfGames"></div>
      <button type="button" class="btn sm" id="rfAddGame">＋ Weiteres Spiel</button>
      <label for="rfNotes">Notizen (optional)</label>
      <textarea class="inp" id="rfNotes" maxlength="500" placeholder="Try-Scorer*innen, Highlights, Wetter …">${esc(d.notes)}</textarea>
      <div class="btnrow" style="margin-top:14px">
        <button class="btn primary" id="rfSave">Speichern – für alle sichtbar</button>
        ${r ? '<button class="btn ghost" id="rfDel" style="color:var(--loss)">Löschen</button>' : ""}
      </div>
      <p class="err" id="rfErr"></p>
    </div>`);

  const S = $("#sheetInner");
  const gamesEl = $("#rfGames", S);
  const readGames = () => $$(".gamerow", gamesEl).map(row => ({
    opponent: $(".g-opp", row).value, us: $(".g-us", row).value === "" ? null : +$(".g-us", row).value,
    them: $(".g-them", row).value === "" ? null : +$(".g-them", row).value, note: row.dataset.note || "",
  }));
  const drawGames = games => {
    gamesEl.innerHTML = games.map((g, i) => `<div class="gamerow" data-note="${esc(g.note || "")}">
      <input class="inp g-opp" maxlength="60" value="${esc(g.opponent)}" placeholder="Gegner" aria-label="Gegner Spiel ${i + 1}">
      <input class="inp num g-us" type="number" inputmode="numeric" min="0" max="999" value="${g.us ?? ""}" aria-label="Unsere Punkte Spiel ${i + 1}">
      <input class="inp num g-them" type="number" inputmode="numeric" min="0" max="999" value="${g.them ?? ""}" aria-label="Gegner-Punkte Spiel ${i + 1}">
      <button type="button" class="x" data-rm="${i}" aria-label="Spiel ${i + 1} entfernen" ${games.length < 2 ? "disabled" : ""}>✕</button></div>`).join("");
    $$("[data-rm]", gamesEl).forEach(b => b.onclick = () => { const g = readGames(); g.splice(+b.dataset.rm, 1); drawGames(g); });
  };
  drawGames(d.games);

  $("#rfAddGame", S).onclick = () => { const g = readGames(); g.push({ opponent: "", us: null, them: null, note: "" }); drawGames(g); $$(".g-opp", gamesEl).pop().focus(); };
  $$("[data-kind]", S).forEach(b => b.onclick = () => {
    d.kind = b.dataset.kind; $$("[data-kind]", S).forEach(x => x.setAttribute("aria-pressed", x === b));
    $("#rfPlaceWrap", S).hidden = d.kind !== "turnier";
  });
  const cal = $("#rfCal", S);
  if (cal) cal.onchange = () => {
    const e = sugg[+cal.value]; if (!e) return;
    $("#rfDate", S).value = isoDay(e.start); $("#rfTitle", S).value = e.title; $("#rfLoc", S).value = e.loc || "";
    if (e.team === "mixed" || e.team === "flinta") $("#rfTeam", S).value = e.team;
    const k = e.type === "turnier" ? "turnier" : /freundschaft|friendly/i.test(e.title) ? "freundschaft" : "spieltag";
    $(`[data-kind="${k}"]`, S).click();
  };

  $("#rfSave", S).onclick = async () => {
    const err = $("#rfErr", S); err.textContent = "";
    const payload = {
      date: $("#rfDate", S).value, kind: d.kind, team: $("#rfTeam", S).value, title: $("#rfTitle", S).value,
      location: $("#rfLoc", S).value, placement: d.kind === "turnier" ? $("#rfPlace", S).value : "",
      notes: $("#rfNotes", S).value, games: readGames(),
    };
    $("#rfSave", S).disabled = true;
    try {
      await api(r ? "/api/results/" + r.id : "/api/results", { method: r ? "PUT" : "POST", body: payload });
      closeSheet(); Res.list = null; Res.season = seasonOf(payload.date); await loadResults(true); renderErgebnisse(); toast("Gespeichert ✓");
    } catch (e) { err.textContent = e.message; $("#rfSave", S).disabled = false; }
  };
  const del = $("#rfDel", S);
  if (del) del.onclick = async () => {
    if (!confirm("Diesen Eintrag wirklich löschen?")) return;
    try { await api("/api/results/" + r.id, { method: "DELETE" }); closeSheet(); Res.list = null; await loadResults(true); renderErgebnisse(); toast("Gelöscht"); }
    catch (e) { $("#rfErr", S).textContent = e.message; }
  };
}

/* ---------- Start ---------- */
onShow.ergebnisse = () => renderErgebnisse();
{ const h = location.hash.slice(1); if (h === "ergebnisse" || h === "konto") showTab(h); }
