/* ======================================================================
   TAB: ERGEBNISSE – Spieltage/Turniere mit einem oder mehreren Spielen
   Lesen: alle · Eintragen & bearbeiten: alle angemeldeten Mitglieder
   Löschen: Admins und die Person, die den Eintrag erstellt hat
   ====================================================================== */
const Res = { list: null, error: null, season: null, team: "alle" };
const KIND = {
  spieltag: { label: { de: "Spieltag", en: "Matchday" }, icon: "🏉" },
  turnier: { label: { de: "Turnier", en: "Tournament" }, icon: "🏆" },
  freundschaft: { label: { de: "Freundschaftsspiel", en: "Friendly" }, short: { de: "Freundschaft", en: "Friendly" }, icon: "🤝" },
};
const RES_TEAMS = { "": "–", mixed: "Mixed", flinta: "FLINTA*", flying: "Flying Monks" };
const FLYING_NOTE = () => T("SG mit Vienna Eagles", "joint team with Vienna Eagles");

/* ---------- Hilfen ---------- */
const seasonOf = d => { const [y, m] = d.split("-").map(Number); const s = m >= 8 ? y : y - 1; return `${s}/${String((s + 1) % 100).padStart(2, "0")}`; };
// Ausgang eines Spiels: w = Sieg, d = Unentschieden, l = Niederlage, o = offen
function outcome(g) {
  if (g.mode === "outcome" && ["w", "d", "l"].includes(g.outcome)) return g.outcome;
  if (g.us == null || g.them == null) return "o";
  return g.us > g.them ? "w" : g.us < g.them ? "l" : "d";
}
const hasScore = g => g.us != null && g.them != null && g.mode !== "outcome";
const OUT = {
  w: { letter: T("S", "W"), word: T("Sieg", "Win") },
  d: { letter: T("U", "D"), word: T("Unentschieden", "Draw") },
  l: { letter: T("N", "L"), word: T("Niederlage", "Loss") },
  o: { letter: "–", word: T("offen", "open") },
};
const fmtDate = d => new Intl.DateTimeFormat(LOC, { weekday: "short", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(d + "T12:00:00Z"));
function tally(games) {
  const t = { n: 0, w: 0, d: 0, l: 0, pf: 0, pa: 0, scored: 0 };
  for (const g of games) {
    const o = outcome(g); if (o === "o") continue;
    t.n++; t[o]++;
    if (hasScore(g)) { t.scored++; t.pf += g.us; t.pa += g.them; }
  }
  return t;
}
const canWrite = () => !!Auth.user;
const canDelete = r => Auth.user && (Auth.user.admin || r.createdBy === Auth.user.id);

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
  if (!Res.list) { root.innerHTML = `<div class="loader"><div class="ring"></div>${T("Ergebnisse werden geladen …", "Loading results …")}</div>`; await loadResults(); }
  const all = Res.list || [];
  const seasons = [...new Set(all.map(r => seasonOf(r.date)))].sort().reverse();
  if (!Res.season || (Res.season !== "alle" && !seasons.includes(Res.season))) Res.season = seasons[0] || "alle";
  const list = all.filter(r => (Res.season === "alle" || seasonOf(r.date) === Res.season) && (Res.team === "alle" || r.team === Res.team));
  const games = list.flatMap(r => r.games), t = tally(games), totalDecided = t.n;

  root.innerHTML = `
    <div class="hero"><div class="top"><small>${T("Ergebnisse", "Results")}</small><h1>${T("Wie lief's?", "How did it go?")}</h1></div><div class="stripe"></div>
      <div class="body"><p>${T("Alle Spieltage, Turniere und Freundschaftsspiele – Spiel für Spiel.", "Every matchday, tournament and friendly – game by game.")}</p></div></div>
    ${canWrite() ? `<button class="btn primary" id="resAdd" style="width:100%;margin-bottom:10px">＋ ${T("Ergebnis eintragen", "Add result")}</button>`
      : `<div class="note" style="margin:0 0 10px">${T("Ergebnisse eintragen kann jedes Mitglied mit Konto.", "Every member with an account can add results.")} <button class="btn sm ghost" id="resLogin">${T("Zum Konto", "Go to account")}</button></div>`}
    ${Res.error === "offline" ? `<div class="note" style="margin:0 0 10px">${T("Offline – du siehst den zuletzt geladenen Stand.", "Offline – you're seeing the last loaded copy.")}</div>` : ""}
    ${Res.error === "error" ? `<div class="note" style="margin:0 0 10px">${T("Ergebnisse konnten nicht geladen werden.", "Results couldn't be loaded.")} <button class="btn sm ghost" id="resRetry">${T("Nochmal", "Retry")}</button></div>` : ""}
    ${all.length ? `<div class="chips">${seasons.map(s => `<button class="chip" data-season="${s}" aria-pressed="${Res.season === s}">${T("Saison", "Season")} ${s}</button>`).join("")}
      ${seasons.length > 1 ? `<button class="chip" data-season="alle" aria-pressed="${Res.season === "alle"}">${T("Alle", "All")}</button>` : ""}</div>
    <div class="chips">${[["alle", T("Alle Teams", "All teams")], ["mixed", "Mixed"], ["flinta", "FLINTA*"], ["flying", "Flying Monks"]].map(([k, v]) => `<button class="chip" data-rteam="${k}" aria-pressed="${Res.team === k}">${v}</button>`).join("")}</div>` : ""}
    ${Res.team === "flying" ? `<p class="hint" style="margin:-2px 0 8px">Flying Monks = ${FLYING_NOTE()}</p>` : ""}
    ${totalDecided ? `<div class="stats">
      <div class="stat"><b>${t.n}</b><span>${T("Spiele", "Games")}</span></div>
      <div class="stat w"><b>${t.w}</b><span>${T("Siege", "Wins")}</span></div>
      <div class="stat d"><b>${t.d}</b><span>${T("Unentsch.", "Draws")}</span></div>
      <div class="stat l"><b>${t.l}</b><span>${T("Niederl.", "Losses")}</span></div>
    </div>${t.scored ? `<p class="hint" style="margin:-4px 0 12px;text-align:center">${T("Punkte", "Points")} ${t.pf} : ${t.pa} (${t.pf - t.pa >= 0 ? "+" : ""}${t.pf - t.pa})${t.scored < t.n ? ` · ${T(`aus ${t.scored} von ${t.n} Spielen`, `from ${t.scored} of ${t.n} games`)}` : ""}</p>` : ""}` : ""}
    ${list.length ? list.map(matchdayCard).join("") : `<div class="empty"><h3>${T("Noch keine Ergebnisse", "No results yet")}</h3>
      <p style="margin:0">${canWrite() ? T("Trag das erste Ergebnis über den Knopf oben ein.", "Add the first result with the button above.") : T("Sobald etwas eingetragen ist, erscheint es hier.", "As soon as something is added, it shows up here.")}</p></div>`}`;

  const add = $("#resAdd", root); if (add) add.onclick = () => openResultEditor(null);
  const lg = $("#resLogin", root); if (lg) lg.onclick = () => showTab("konto");
  const rt = $("#resRetry", root); if (rt) rt.onclick = async () => { Res.list = null; await loadResults(true); renderErgebnisse(); };
  $$("[data-season]", root).forEach(b => b.onclick = () => { Res.season = b.dataset.season; renderErgebnisse(); });
  $$("[data-rteam]", root).forEach(b => b.onclick = () => { Res.team = b.dataset.rteam; renderErgebnisse(); });
  $$("[data-redit]", root).forEach(b => b.onclick = () => openResultEditor(Res.list.find(r => r.id === b.dataset.redit)));
}

function gameScore(g) {
  const o = outcome(g);
  if (hasScore(g)) return `<span class="score">${g.us} : ${g.them}</span>`;
  return `<span class="score word ${o}">${OUT[o].word}</span>`;
}
function matchdayCard(r) {
  const k = KIND[r.kind] || KIND.spieltag, t = tally(r.games), multi = r.games.length > 1;
  const title = r.title || (multi ? L(k.label) : "vs " + r.games[0].opponent);
  const stamp = r.updatedAt ? new Intl.DateTimeFormat(LOC, { day: "2-digit", month: "2-digit", year: "numeric" }).format(r.updatedAt) : "";
  return `<article class="md">
    <div class="mdhead"><div>
      <div class="kind">${k.icon} ${esc(L(k.label))}${r.team ? " · " + RES_TEAMS[r.team] : ""}</div>
      <h3>${esc(title)}</h3>
      <div class="meta">${esc(fmtDate(r.date))}${r.location ? " · " + esc(r.location) : ""}</div>
      ${r.placement ? `<span class="place">${esc(r.placement)}</span>` : ""}
      ${multi && t.n ? `<div class="record">${T("Bilanz", "Record")}: ${t.w} ${OUT.w.letter} · ${t.d} ${OUT.d.letter} · ${t.l} ${OUT.l.letter}${t.scored ? ` · ${t.pf}:${t.pa}` : ""}</div>` : ""}
    </div>${canWrite() ? `<button class="iconbtn" data-redit="${esc(r.id)}" aria-label="${T("Bearbeiten", "Edit")}">✏️</button>` : ""}</div>
    <div class="games">${r.games.map(g => { const o = outcome(g); return `<div class="game">
      <span class="wdl ${o}" aria-label="${OUT[o].word}">${OUT[o].letter}</span>
      <span class="opp">Monks vs ${esc(g.opponent)}${g.note ? `<small>${esc(g.note)}</small>` : ""}</span>
      ${gameScore(g)}</div>`; }).join("")}</div>
    ${r.notes ? `<p class="notes">${esc(r.notes)}</p>` : ""}
    ${r.updatedByName ? `<p class="byline">${T("Zuletzt geändert von", "Last edited by")} ${esc(r.updatedByName)}${stamp ? " · " + stamp : ""}</p>` : ""}
  </article>`;
}

/* ---------- Eintragen / Bearbeiten ---------- */
function calendarSuggestions() {
  if (!Cal.events) return [];
  const now = Date.now();
  return Cal.events.filter(e => (e.type === "spiel" || e.type === "turnier") && e.start < now + 2 * 864e5 && e.start > now - 200 * 864e5)
    .sort((a, b) => b.start - a.start).slice(0, 25);
}
function isoDay(t) { const w = wallParts(t); return `${w.y}-${String(w.m).padStart(2, "0")}-${String(w.d).padStart(2, "0")}`; }
const emptyGame = () => ({ opponent: "", mode: "score", us: null, them: null, outcome: "", note: "" });

function openResultEditor(r) {
  if (!canWrite()) { showTab("konto"); return; }
  const d = r ? JSON.parse(JSON.stringify(r)) : { date: isoDay(Date.now()), kind: "spieltag", team: "", title: "", location: "", placement: "", notes: "", games: [emptyGame()] };
  d.games = d.games.map(g => ({ ...emptyGame(), ...g, mode: g.mode || (g.us != null && g.them != null ? "score" : "score") }));
  const sugg = r ? [] : calendarSuggestions();
  openSheet(`<h2 style="font-size:26px;margin:4px 40px 6px 0">${r ? T("Ergebnis bearbeiten", "Edit result") : T("Ergebnis eintragen", "Add result")}</h2>
    <div class="form" id="resForm">
      ${sugg.length ? `<label for="rfCal">${T("Aus Termin übernehmen (optional)", "Take from an event (optional)")}</label>
        <select class="inp" id="rfCal"><option value="">${T("– Termin wählen –", "– Choose an event –")}</option>${sugg.map((e, i) => `<option value="${i}">${esc(F.dm.format(e.start))} · ${esc(e.title)}</option>`).join("")}</select>` : ""}
      <label>${T("Art", "Type")}</label>
      <div class="seg" id="rfKind" style="margin:0">${Object.entries(KIND).map(([k, v]) => `<button type="button" data-kind="${k}" aria-pressed="${d.kind === k}">${esc(L(v.short || v.label))}</button>`).join("")}</div>
      <div class="row2">
        <div><label for="rfDate">${T("Datum", "Date")}</label><input class="inp" type="date" id="rfDate" value="${esc(d.date)}"></div>
        <div><label for="rfTeam">Team</label><select class="inp" id="rfTeam">${Object.entries(RES_TEAMS).map(([k, v]) => `<option value="${k}" ${d.team === k ? "selected" : ""}>${v}</option>`).join("")}</select></div>
      </div>
      <p class="hint" id="rfFlyHint" ${d.team === "flying" ? "" : "hidden"}>Flying Monks = ${FLYING_NOTE()}</p>
      <label for="rfTitle">${T("Titel (optional)", "Title (optional)")}</label>
      <input class="inp" id="rfTitle" maxlength="80" value="${esc(d.title)}" placeholder="${T("z. B. Bayernliga 3. Spieltag · Bingham Cup", "e.g. Bavarian League round 3 · Bingham Cup")}">
      <label for="rfLoc">${T("Ort (optional)", "Location (optional)")}</label>
      <input class="inp" id="rfLoc" maxlength="100" value="${esc(d.location)}">
      <div id="rfPlaceWrap" ${d.kind === "turnier" ? "" : "hidden"}><label for="rfPlace">${T("Platzierung (optional)", "Placing (optional)")}</label>
        <input class="inp" id="rfPlace" maxlength="40" value="${esc(d.placement)}" placeholder="${T("z. B. 3. Platz · Bowl-Sieger", "e.g. 3rd place · Bowl winners")}"></div>
      <label>${T("Spiele", "Games")}</label>
      <p class="hint" style="margin:0 0 8px">${T("Pro Spiel: genauer Spielstand, nur der Ausgang – oder noch offen.", "Per game: exact score, just the outcome – or still open.")}</p>
      <div id="rfGames"></div>
      <button type="button" class="btn sm" id="rfAddGame">＋ ${T("Weiteres Spiel", "Add game")}</button>
      <label for="rfNotes">${T("Notizen (optional)", "Notes (optional)")}</label>
      <textarea class="inp" id="rfNotes" maxlength="500" placeholder="${T("Try-Scorer*innen, Highlights, Wetter …", "Try scorers, highlights, weather …")}">${esc(d.notes)}</textarea>
      <div class="btnrow" style="margin-top:14px">
        <button class="btn primary" id="rfSave">${T("Speichern – für alle sichtbar", "Save – visible to everyone")}</button>
        ${r && canDelete(r) ? `<button class="btn ghost" id="rfDel" style="color:var(--loss)">${T("Löschen", "Delete")}</button>` : ""}
      </div>
      <p class="err" id="rfErr"></p>
    </div>`);

  const S = $("#sheetInner");
  const gamesEl = $("#rfGames", S);
  let games = d.games;
  const readGames = () => $$(".gamebox", gamesEl).map((box, i) => {
    const g = games[i];
    const num = sel => { const v = $(sel, box)?.value; return v === "" || v == null ? null : +v; };
    return { ...g, opponent: $(".g-opp", box).value, us: g.mode === "score" ? num(".g-us") : null, them: g.mode === "score" ? num(".g-them") : null };
  });
  const drawGames = () => {
    gamesEl.innerHTML = games.map((g, i) => `<div class="gamebox" data-i="${i}">
      <div class="gametop">
        <input class="inp g-opp" maxlength="60" value="${esc(g.opponent)}" placeholder="${T("Gegner", "Opponent")}" aria-label="${T("Gegner", "Opponent")} ${i + 1}">
        <button type="button" class="x" data-rm="${i}" aria-label="${T("Spiel entfernen", "Remove game")} ${i + 1}" ${games.length < 2 ? "disabled" : ""}>✕</button>
      </div>
      <div class="seg sm modeseg">${[["score", T("Spielstand", "Score")], ["outcome", T("Nur Ausgang", "Outcome only")], ["open", T("Offen", "Open")]].map(([k, v]) =>
        `<button type="button" data-mode="${k}" data-gi="${i}" aria-pressed="${g.mode === k}">${v}</button>`).join("")}</div>
      ${g.mode === "score" ? `<div class="scorerow"><label>${T("Wir", "Us")}<input class="inp num g-us" type="number" inputmode="numeric" min="0" max="999" value="${g.us ?? ""}"></label><span>:</span>
        <label>${T("Die", "Them")}<input class="inp num g-them" type="number" inputmode="numeric" min="0" max="999" value="${g.them ?? ""}"></label></div>` : ""}
      ${g.mode === "outcome" ? `<div class="seg sm outseg">${["w", "d", "l"].map(o => `<button type="button" class="o-${o}" data-out="${o}" data-gi="${i}" aria-pressed="${g.outcome === o}">${OUT[o].word}</button>`).join("")}</div>` : ""}
    </div>`).join("");
    $$("[data-rm]", gamesEl).forEach(b => b.onclick = () => { games = readGames(); games.splice(+b.dataset.rm, 1); drawGames(); });
    $$("[data-mode]", gamesEl).forEach(b => b.onclick = () => { games = readGames(); games[+b.dataset.gi].mode = b.dataset.mode; drawGames(); });
    $$("[data-out]", gamesEl).forEach(b => b.onclick = () => { games = readGames(); games[+b.dataset.gi].outcome = b.dataset.out; drawGames(); });
  };
  drawGames();

  $("#rfAddGame", S).onclick = () => { games = readGames(); games.push(emptyGame()); drawGames(); $$(".g-opp", gamesEl).pop().focus(); };
  $$("[data-kind]", S).forEach(b => b.onclick = () => {
    d.kind = b.dataset.kind; $$("[data-kind]", S).forEach(x => x.setAttribute("aria-pressed", x === b));
    $("#rfPlaceWrap", S).hidden = d.kind !== "turnier";
  });
  $("#rfTeam", S).onchange = e => { $("#rfFlyHint", S).hidden = e.target.value !== "flying"; };
  const cal = $("#rfCal", S);
  if (cal) cal.onchange = () => {
    const e = sugg[+cal.value]; if (!e) return;
    $("#rfDate", S).value = isoDay(e.start); $("#rfTitle", S).value = e.title; $("#rfLoc", S).value = e.loc || "";
    if (RES_TEAMS[e.team] && e.team) { $("#rfTeam", S).value = e.team; $("#rfFlyHint", S).hidden = e.team !== "flying"; }
    const k = e.type === "turnier" ? "turnier" : /freundschaft|friendly/i.test(e.title) ? "freundschaft" : "spieltag";
    $(`[data-kind="${k}"]`, S).click();
  };

  $("#rfSave", S).onclick = async () => {
    const err = $("#rfErr", S); err.textContent = "";
    games = readGames();
    if (games.some(g => g.mode === "outcome" && !g.outcome)) { err.textContent = T("Bitte bei „Nur Ausgang“ Sieg, Unentschieden oder Niederlage wählen.", "Please pick win, draw or loss for “Outcome only”."); return; }
    if (games.some(g => g.mode === "score" && (g.us == null) !== (g.them == null))) { err.textContent = T("Bitte beim Spielstand beide Zahlen eintragen – oder „Offen“ wählen.", "Please enter both numbers for the score – or choose “Open”."); return; }
    const payload = {
      date: $("#rfDate", S).value, kind: d.kind, team: $("#rfTeam", S).value, title: $("#rfTitle", S).value,
      location: $("#rfLoc", S).value, placement: d.kind === "turnier" ? $("#rfPlace", S).value : "",
      notes: $("#rfNotes", S).value, games,
    };
    $("#rfSave", S).disabled = true;
    try {
      await api(r ? "/api/results/" + r.id : "/api/results", { method: r ? "PUT" : "POST", body: payload });
      closeSheet(); Res.list = null; Res.season = seasonOf(payload.date); await loadResults(true); renderErgebnisse(); toast(T("Gespeichert ✓", "Saved ✓"));
    } catch (e) { err.textContent = e.message; $("#rfSave", S).disabled = false; }
  };
  const del = $("#rfDel", S);
  if (del) del.onclick = async () => {
    if (!confirm(T("Diesen Eintrag wirklich löschen?", "Really delete this entry?"))) return;
    try { await api("/api/results/" + r.id, { method: "DELETE" }); closeSheet(); Res.list = null; await loadResults(true); renderErgebnisse(); toast(T("Gelöscht", "Deleted")); }
    catch (e) { $("#rfErr", S).textContent = e.message; }
  };
}

onShow.ergebnisse = () => renderErgebnisse();
