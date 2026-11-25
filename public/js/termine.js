/* ======================================================================
   TAB: TERMINE – Termine aus dem eigenen SpielerPlus-Kalender (Link im Konto)
   ====================================================================== */

/* ---------- Typ & Team erkennen ---------- */
const TYPES = {
  training: { label: "Training", plural: { de: "Trainings", en: "Training" }, color: "var(--c-training)",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l6.5 16h-13z"/><path d="M3.5 21h17M9 11.5h6M7.6 15h8.8"/></svg>' },
  spiel: { label: { de: "Spiel", en: "Match" }, plural: { de: "Spiele", en: "Matches" }, color: "var(--c-spiel)",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="9.5" ry="5.8" transform="rotate(-35 12 12)"/><path d="M8.6 15.4l6.8-6.8M10.3 11.3l2.4 2.4M12.2 9.6l2.2 2.2"/></svg>' },
  turnier: { label: { de: "Turnier", en: "Tournament" }, plural: { de: "Turniere", en: "Tournaments" }, color: "var(--c-turnier)",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.5 3.5h9v5.5a4.5 4.5 0 0 1-9 0z"/><path d="M7.5 5.5H4.5a3 3 0 0 0 3.4 4.2M16.5 5.5h3a3 3 0 0 1-3.4 4.2M12 13.5v3.5M8 21h8M9.5 17h5"/></svg>' },
  social: { label: "Social/Event", plural: "Socials & Events", color: "var(--c-social)",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h6l-.6 6.2a2.4 2.4 0 0 1-4.8 0z"/><path d="M8 11.6V19M5.5 19h5"/><path d="M14 5h5.5l-.6 5.5a2.2 2.2 0 0 1-4.3 0z"/><path d="M16.8 12.7V19M14.5 19h4.6"/></svg>' },
};
const TEAM_NAMES = { mixed: "Mixed", flinta: "FLINTA*", flying: "Flying Monks", beide: "Mixed + FLINTA*" };
function classify(e) {
  const s = [e.summary, e.categories].filter(Boolean).join(" ").toLowerCase();
  let type = "social";
  if (/turnier|tournament|\bcup\b|bingham|\bigr\b|festival|sevens|\b7s\b|\b10s\b|\bxv\b.*turnier/.test(s)) type = "turnier";
  else if (/training|\btrain\b|practice|übungseinheit|fitness|athletik/.test(s)) type = "training";
  else if (/liga|league|spieltag|punktspiel|heimspiel|auswärts|\bmatch\b|\bgame\b|\bspiel\b|freundschaftsspiel|friendly|\bvs\.?\b|\bgegen\b| - /.test(s)) type = "spiel";
  let sub = "";
  if (type === "training") sub = /indoor|halle/.test(s) ? "Training · indoor" : /outdoor|draußen|platz/.test(s) ? "Training · outdoor" : "";
  if (type === "spiel") sub = /liga|league|spieltag|punktspiel/.test(s) ? T("Ligaspiel", "League match") : (/freundschaft|friendly/.test(s) ? T("Freundschaftsspiel", "Friendly") : "");
  const fly = /flying monks|vienna|eagles/.test(s);
  const fl = /flinta|frauen|women|ladies|damen/.test(s);
  const mx = /mixed|herren|\bmen'?s?\b/.test(s.replace(/women/g, ""));
  const team = fly ? "flying" : fl && mx ? "beide" : fl ? "flinta" : mx ? "mixed" : "alle";
  return { type, sub, team, autoTeam: team };
}
function makeEvent(e, start, dur) {
  const c = classify(e);
  return {
    id: (e.uid || e.summary || "ev") + "@" + start, title: e.summary || T("Termin", "Event"), desc: e.description || "",
    loc: (e.location || "").replace(/,\s*(Deutschland|Germany)$/i, ""), url: e.url || "", start, end: start + dur, allDay: !!e.dtstart.allDay,
    cancelled: e.status === "CANCELLED" || /abgesagt|cancel+ed|fällt aus/i.test(e.summary || ""), ...c,
  };
}

/* ---------- Datumsformat (immer Europe/Berlin) ---------- */
const fmt = o => new Intl.DateTimeFormat(LOC, { timeZone: TZ, ...o });
const F = {
  wd: fmt({ weekday: "short" }), day: fmt({ day: "numeric" }), mon: fmt({ month: "short" }),
  long: fmt({ weekday: "long", day: "numeric", month: "long" }), time: fmt({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" }),
  dm: fmt({ day: "2-digit", month: "2-digit" }), stamp: fmt({ day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }),
};
const berlinDayKey = t => { const w = wallParts(t); return Date.UTC(w.y, w.m - 1, w.d); };
const UHR = T(" Uhr", "");
function timeRange(ev) {
  if (ev.allDay) { const days = Math.round((ev.end - ev.start) / 864e5); return days > 1 ? T("ganztägig · bis ", "all day · until ") + F.dm.format(ev.end - 1) : T("ganztägig", "all day"); }
  const sameDay = berlinDayKey(ev.start) === berlinDayKey(Math.max(ev.start, ev.end - 1));
  { const w = wallParts(ev.start); if (w.h === 0 && w.mi === 0) return T("Uhrzeit folgt", "Time TBC"); }
  if (ev.end <= ev.start) return F.time.format(ev.start) + UHR;
  return F.time.format(ev.start) + "–" + (sameDay ? "" : F.dm.format(ev.end) + " ") + F.time.format(ev.end) + UHR;
}
function weekInfo(t) {
  const day = berlinDayKey(t), dow = (new Date(day).getUTCDay() + 6) % 7, mon = day - dow * 864e5;
  const th = new Date(mon + 3 * 864e5), y = th.getUTCFullYear(), jan4 = Date.UTC(y, 0, 4);
  const kw = 1 + Math.round(((th - jan4) / 864e5 - 3 + ((new Date(jan4).getUTCDay() + 6) % 7)) / 7);
  return { mon, kw };
}
const FU = { dm: new Intl.DateTimeFormat(LOC, { timeZone: "UTC", day: "numeric", month: "short" }) };

/* ---------- Links ---------- */
const mapsLinks = loc => ({ g: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(loc), a: "https://maps.apple.com/?q=" + encodeURIComponent(loc) });
function gcalLink(ev) {
  const z = t => new Date(t).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const d = t => { const w = wallParts(t); return "" + w.y + String(w.m).padStart(2, "0") + String(w.d).padStart(2, "0"); };
  const dates = ev.allDay ? d(ev.start) + "/" + d(Math.max(ev.end, ev.start + 864e5)) : z(ev.start) + "/" + z(Math.max(ev.end, ev.start + 36e5));
  return "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(ev.title) + "&dates=" + dates +
    "&details=" + encodeURIComponent(ev.desc || "") + "&location=" + encodeURIComponent(ev.loc || "") + "&ctz=" + encodeURIComponent(TZ);
}
function eventText(ev) { return [ev.title, F.long.format(ev.start) + ", " + timeRange(ev), ev.loc, ev.desc].filter(Boolean).join("\n"); }

/* ---------- Laden ---------- */
const Cal = { events: [], source: null, at: null, error: "", weeks: 6, filter: store.get("filter", { type: "alle", team: "alle" }), timer: null, teams: { key: {}, alt: {} } };
const altKey = e => "t:" + e.title + "@" + e.start;

async function loadCalendar() {
  const root = $("#tab-termine");
  const u = Auth.user;
  if (!u) { Cal.source = "nologin"; Cal.events = []; return renderTermine(); }
  if (!u.calendarUrl) { Cal.source = "nolink"; Cal.events = []; return renderTermine(); }
  const cached = store.get("ics_v4");
  if (cached && cached.uid === u.id && cached.text) useICS(cached.text, "cache", cached.at);
  else root.innerHTML = `<div class="loader"><div class="ring"></div>${T("Termine werden geladen …", "Loading events …")}</div>`;
  loadEventTeams();
  try {
    const r = await fetch("/api/ics", { cache: "no-store", credentials: "same-origin" });
    const text = await r.text();
    if (!r.ok || !text.includes("BEGIN:VCALENDAR")) {
      let msg = ""; try { msg = serverMsg(JSON.parse(text)); } catch (e) {}
      throw new Error(msg || T("Kalender konnte nicht geladen werden.", "Couldn't load the calendar."));
    }
    store.set("ics_v4", { uid: u.id, text, at: Date.now() });
    useICS(text, "live", Date.now());
  } catch (e) {
    Cal.error = e.message;
    if (Cal.source !== "cache") { Cal.source = "error"; Cal.events = []; }
    renderTermine();
  }
}
async function loadEventTeams() {
  try {
    const { teams } = await api("/api/event-teams");
    Cal.teams = { key: {}, alt: {} };
    for (const t of teams) { Cal.teams.key[t.key] = t.team; if (t.alt) Cal.teams.alt[t.alt] = t.team; }
    applyTeams(); if (Cal.events.length) renderTermine();
  } catch (e) {}
}
function applyTeams() {
  for (const e of Cal.events) {
    const o = Cal.teams.key[e.id] || Cal.teams.alt[altKey(e)];
    e.team = o || e.autoTeam; e.manual = !!o;
  }
}
function useICS(text, source, at) {
  try {
    const now = Date.now();
    Cal.events = expandEvents(parseICS(text), now - 200 * 864e5, /* Vergangenes für „Ergebnis aus Termin“ */ now + CONFIG.HORIZON_DAYS * 864e5);
    applyTeams();
    Cal.source = source; Cal.at = at; Cal.error = "";
  } catch (e) { console.error(e); Cal.source = "error"; Cal.error = T("Der Kalender konnte nicht gelesen werden.", "The calendar couldn't be read."); }
  renderTermine();
}
function clearCalendar() { store.del("ics_v4"); Cal.events = []; Cal.source = null; Cal.teams = { key: {}, alt: {} }; }

/* ---------- Anzeige ---------- */
function filtered() {
  const f = Cal.filter, now = Date.now();
  return Cal.events.filter(e => e.end > now || (e.end === e.start && e.start > now - 2 * 36e5))
    .filter(e => f.type === "alle" || e.type === f.type)
    // Termine ohne Team-Angabe gelten für Mixed und FLINTA* – Flying Monks zeigt nur zugeordnete Termine
    .filter(e => f.team === "alle" || e.team === f.team || (f.team !== "flying" && (e.team === "alle" || e.team === "beide")));
}
function sourceLine() {
  const st = Cal.at ? F.stamp.format(Cal.at) : "–";
  const [cls, txt] = Cal.source === "live" ? ["", T("Live aus deinem SpielerPlus · ", "Live from your SpielerPlus · ") + st]
    : ["warn", T("Offline-Stand vom ", "Offline copy from ") + st + (Cal.error ? " · " + Cal.error : "")];
  return `<div class="status"><span class="led ${cls}"></span><span>${esc(txt)}</span><button id="srcBtn">${T("Aktualisieren", "Refresh")}</button></div>`;
}
function typeChip(key, label, color) {
  return `<button class="chip" data-ft="${key}" aria-pressed="${Cal.filter.type === key}">${color ? `<span class="dot" style="background:${color}"></span>` : ""}${esc(label)}</button>`;
}
function teamChip(key, label) { return `<button class="chip" data-fteam="${key}" aria-pressed="${Cal.filter.team === key}">${esc(label)}</button>`; }
function teamTag(e) { return TEAM_NAMES[e.team] ? `<span class="tag">${TEAM_NAMES[e.team]}</span>` : ""; }
function typeTag(e) { const Ty = TYPES[e.type]; return `<span class="tag" style="--tc:${Ty.color}">${Ty.icon}${esc(L(e.sub) || L(Ty.label))}</span>`; }
const CANCELLED = () => `<span class="tag cancel">${T("Abgesagt", "Cancelled")}</span>`;

function hintState(kind) {
  const head = `<div class="hero"><div class="top"><small>${T("Termine", "Events")}</small><h1>${T("Wann wird gespielt?", "When do we play?")}</h1></div><div class="stripe"></div>
    <div class="body"><p>${T("Hier erscheinen deine Trainings, Spiele, Turniere und Socials aus SpielerPlus.", "Your training sessions, matches, tournaments and socials from SpielerPlus show up here.")}</p></div></div>`;
  const box = {
    nologin: [T("Melde dich an", "Sign in"), T("Melde dich an und verbinde deinen SpielerPlus-Kalender – dann siehst du hier deine Termine.", "Sign in and connect your SpielerPlus calendar – then you'll see your events here."), T("Zum Konto", "Go to account")],
    nolink: [T("Verbinde deinen Kalender", "Connect your calendar"), T("Füge im Konto deinen SpielerPlus-Kalenderlink ein – dann siehst du hier deine Termine. Eine Anleitung findest du dort.", "Add your SpielerPlus calendar link in your account – then you'll see your events here. You'll find step-by-step instructions there."), T("Kalender verbinden", "Connect calendar")],
    error: [T("Termine konnten nicht geladen werden", "Couldn't load events"), esc(Cal.error), T("Link im Konto prüfen", "Check link in account")],
  }[kind];
  return head + `<div class="empty"><h3>${box[0]}</h3><p>${box[1]}</p>
    <div class="btnrow"><button class="btn primary" id="toKonto">${box[2]}</button>${kind === "error" ? `<button class="btn" id="retryCal">${ICON.refresh}${T("Nochmal", "Retry")}</button>` : ""}</div></div>`;
}

function renderTermine() {
  clearInterval(Cal.timer);
  const root = $("#tab-termine");
  if (!Cal.source) return;
  if (["nologin", "nolink", "error"].includes(Cal.source)) {
    root.innerHTML = hintState(Cal.source);
    $("#toKonto", root).onclick = () => showTab("konto", Cal.source === "nologin" ? null : "calendar");
    const rt = $("#retryCal", root); if (rt) rt.onclick = loadCalendar;
    return;
  }
  const list = filtered();
  const next = list[0];
  let html = sourceLine();
  html += `<div class="filter-label">${T("Art", "Type")}</div><div class="chips">${typeChip("alle", T("Alle", "All"))}${Object.entries(TYPES).map(([k, Ty]) => typeChip(k, L(Ty.plural), Ty.color)).join("")}</div>`;
  html += `<div class="filter-label">Team</div><div class="chips">${teamChip("alle", T("Alle Teams", "All teams"))}${teamChip("mixed", "Mixed")}${teamChip("flinta", "FLINTA*")}${teamChip("flying", "Flying Monks")}</div>`;

  if (!next) {
    html += `<div class="empty"><h3>${T("Nix los? 🤔", "Nothing on? 🤔")}</h3><p>${T("Für diese Filter gibt's gerade keine kommenden Termine. Probier mal „Alle“.", "There are no upcoming events for these filters. Try “All”.")}</p></div>`;
  } else {
    const Ty = TYPES[next.type], running = next.start <= Date.now();
    html += `<div class="hero next" style="--tc:${Ty.color}">
      <div class="top"><div class="ticon">${Ty.icon}</div><div style="min-width:0"><small>${T("Nächster Termin", "Next up")} · ${esc(L(Ty.label))}</small><h2>${esc(next.title)}</h2></div></div>
      <div class="stripe"></div>
      <div class="body">
        ${running ? `<div class="live-now">${T("Läuft gerade", "Happening now")}</div>` : `<div class="countdown" id="cd"><div><b>–</b><span>${T("Tage", "Days")}</span></div><div><b>–</b><span>${T("Std", "Hrs")}</span></div><div><b>–</b><span>Min</span></div><div><b>–</b><span>${T("Sek", "Sec")}</span></div></div>`}
        <div class="meta">
          <div>${ICON.cal}<span>${esc(F.long.format(next.start))}</span></div>
          <div>${ICON.clock}<span>${esc(timeRange(next))}</span></div>
          ${next.loc ? `<div>${ICON.pin}<span>${esc(next.loc)}</span></div>` : ""}
        </div>
        ${next.cancelled ? `<p style="margin-bottom:12px">${CANCELLED()}</p>` : ""}
        <div class="btnrow">
          ${next.loc ? `<a class="btn primary" href="${mapsLinks(next.loc).g}" target="_blank" rel="noopener">${ICON.map}Route</a>` : ""}
          <a class="btn" href="${gcalLink(next)}" target="_blank" rel="noopener">${ICON.cal}${T("Kalender", "Calendar")}</a>
          <button class="btn" data-detail="${esc(next.id)}">Details</button>
        </div>
      </div></div>`;
    const rest = list.slice(1);
    let curWeek = null;
    const thisMon = weekInfo(Date.now()).mon;
    let shownWeeks = 0, hiddenCount = 0;
    for (const e of rest) {
      const wi = weekInfo(e.start);
      if (wi.mon !== curWeek) {
        if (shownWeeks >= Cal.weeks) { hiddenCount = rest.length - rest.indexOf(e); break; }
        shownWeeks++;
        curWeek = wi.mon;
        const diff = Math.round((wi.mon - thisMon) / (7 * 864e5));
        const name = diff === 0 ? T("Diese Woche", "This week") : diff === 1 ? T("Nächste Woche", "Next week") : T("KW ", "Week ") + wi.kw;
        html += `<div class="week"><h3>${name}</h3><span>${FU.dm.format(wi.mon)} – ${FU.dm.format(wi.mon + 6 * 864e5)}</span></div>`;
      }
      html += eventCard(e);
    }
    if (hiddenCount) html += `<div style="text-align:center;margin:16px 0"><button class="btn" id="moreBtn">${T(`Weitere ${hiddenCount} Termine anzeigen`, TP("Show {0} more events", hiddenCount))}</button></div>`;
    if (!rest.length) html += `<p class="foot">${T("Danach ist (noch) nichts eingetragen.", "Nothing else planned (yet).")}</p>`;
  }
  html += `<p class="foot">${T("Alle Zeiten in deutscher Zeit (Europe/Berlin).", "All times are German time (Europe/Berlin).")}</p>`;
  root.innerHTML = html;

  $$("[data-ft]", root).forEach(b => b.onclick = () => { Cal.filter.type = b.dataset.ft; store.set("filter", Cal.filter); renderTermine(); });
  $$("[data-fteam]", root).forEach(b => b.onclick = () => { Cal.filter.team = b.dataset.fteam; store.set("filter", Cal.filter); renderTermine(); });
  $$("[data-detail]", root).forEach(b => b.onclick = () => { const el = root.querySelector(`details[data-id="${CSS.escape(b.dataset.detail)}"]`); if (el) { el.open = true; el.scrollIntoView({ behavior: "smooth", block: "center" }); } else openEventSheet(b.dataset.detail); });
  bindEventBody(root);
  $("#srcBtn").onclick = loadCalendar;
  const mb = $("#moreBtn", root); if (mb) mb.onclick = () => { const y = scrollY; Cal.weeks += 8; renderTermine(); scrollTo(0, y); };
  if (next && next.start > Date.now()) tick(next.start);
}
function eventCard(e) {
  const Ty = TYPES[e.type];
  return `<details class="ev ${e.cancelled ? "cancelled" : ""}" data-id="${esc(e.id)}" style="--tc:${Ty.color}">
    <summary>
      <div class="date"><small>${esc(F.wd.format(e.start).replace(".", ""))}</small><b>${F.day.format(e.start)}</b><small>${esc(F.mon.format(e.start).replace(".", ""))}</small></div>
      <div class="info"><div class="title">${esc(e.title)}</div>
        <div class="sub">${esc(timeRange(e))}${e.loc ? " · " + esc(e.loc) : ""}</div>
        <div class="tags">${typeTag(e)}${teamTag(e)}${e.cancelled ? CANCELLED() : ""}</div></div>
      ${ICON.chev}
    </summary>
    <div class="more">${eventBody(e)}</div>
  </details>`;
}
function teamAssign(e) {
  const opts = [["mixed", "Mixed"], ["flinta", "FLINTA*"], ["flying", "Flying Monks"]];
  return `<div class="assign"><span class="assignlab">${T("Team", "Team")}${e.manual ? "" : ` <small>(${T("automatisch", "automatic")})</small>`}</span>
    <div class="seg sm">${opts.map(([k, v]) => `<button type="button" data-assign="${k}" data-ev="${esc(e.id)}" aria-pressed="${e.manual && e.team === k}">${v}</button>`).join("")}
    ${e.manual ? `<button type="button" data-assign="" data-ev="${esc(e.id)}" aria-label="${T("Zuordnung entfernen", "Remove assignment")}">✕</button>` : ""}</div></div>`;
}
function eventBody(e) {
  const ml = e.loc ? mapsLinks(e.loc) : null;
  return `<div class="meta">
      <div>${ICON.cal}<span>${esc(F.long.format(e.start))}</span></div>
      <div>${ICON.clock}<span>${esc(timeRange(e))}</span></div>
      ${e.loc ? `<div>${ICON.pin}<span>${esc(e.loc)}</span></div>` : ""}
    </div>
    ${descHTML(e)}
    ${teamAssign(e)}
    <div class="btnrow">
      ${ml ? `<a class="btn sm" href="${ml.g}" target="_blank" rel="noopener">${ICON.map}Google Maps</a><a class="btn sm" href="${ml.a}" target="_blank" rel="noopener">${ICON.map}${T("Apple Karten", "Apple Maps")}</a>` : ""}
      <a class="btn sm primary" href="${gcalLink(e)}" target="_blank" rel="noopener">${ICON.cal}${T("In Kalender übernehmen", "Add to calendar")}</a>
      ${spLink(e) ? `<a class="btn sm" href="${esc(spLink(e))}" target="_blank" rel="noopener">✅ ${T("Zu-/Absagen in SpielerPlus", "RSVP in SpielerPlus")}</a>` : ""}
      <button class="btn sm" data-copy="${esc(e.id)}">${ICON.copy}${T("Kopieren", "Copy")}</button>
    </div>`;
}
function bindEventBody(scope) {
  $$("[data-copy]", scope).forEach(b => b.onclick = () => { const ev = Cal.events.find(x => x.id === b.dataset.copy); ev && copyText(eventText(ev)); });
  $$("[data-assign]", scope).forEach(b => b.onclick = async () => {
    const e = Cal.events.find(x => x.id === b.dataset.ev); if (!e) return;
    const team = b.dataset.assign;
    try {
      await api("/api/event-teams", { method: "PUT", body: { key: e.id, alt: altKey(e), team } });
      if (team) { Cal.teams.key[e.id] = team; Cal.teams.alt[altKey(e)] = team; } else { delete Cal.teams.key[e.id]; delete Cal.teams.alt[altKey(e)]; }
      applyTeams();
      const inSheet = scope.id === "sheetInner";
      renderTermine();
      if (inSheet) openEventSheet(e.id);
      else { const d = $(`#tab-termine details[data-id="${CSS.escape(e.id)}"]`); if (d) d.open = true; }
      toast(team ? T(`Für alle als ${TEAM_NAMES[team]} markiert ✓`, TP("Marked as {0} for everyone ✓", TEAM_NAMES[team])) : T("Zuordnung entfernt", "Assignment removed"));
    } catch (err) { toast(err.message); }
  });
}
const URL_RE = /https?:\/\/\S+/;
function spLink(e) { const m = URL_RE.exec(e.desc || ""); return m && /spielerplus|teamplus/i.test(m[0]) ? m[0] : ""; }
function descHTML(e) { const t = (e.desc || "").replace(spLink(e) || "\u0000", "").trim(); return t ? `<p class="desc">${esc(t)}</p>` : ""; }
function openEventSheet(id) {
  const e = Cal.events.find(x => x.id === id); if (!e) return;
  openSheet(`<h2 style="font-size:26px;margin:4px 40px 10px 0">${esc(e.title)}</h2>${eventBody(e)}`);
  bindEventBody($("#sheetInner"));
}
function tick(target) {
  const cd = $("#cd"); if (!cd) return;
  const b = $$("b", cd);
  const upd = () => {
    let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
    if (s <= 0) { clearInterval(Cal.timer); renderTermine(); return; }
    const d = Math.floor(s / 86400); s -= d * 86400; const h = Math.floor(s / 3600); s -= h * 3600; const m = Math.floor(s / 60); s -= m * 60;
    b[0].textContent = d; b[1].textContent = String(h).padStart(2, "0"); b[2].textContent = String(m).padStart(2, "0"); b[3].textContent = String(s).padStart(2, "0");
  };
  upd(); Cal.timer = setInterval(upd, 1000);
}
