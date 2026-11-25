/* ======================================================================
   TAB: TEAM – Ansprechpersonen + Mitgliederliste
   ====================================================================== */
const TEAM_GROUPS = { alle: { de: "Alle", en: "All" }, vorstand: { de: "Vorstand", en: "Board" }, coaching: "Coaching", orga: "Social Media" };
const Team = { filter: "alle" };

function contactBtns(p) {
  const b = [];
  if (p.email) b.push(`<a class="btn sm" href="mailto:${esc(p.email)}">✉️ ${esc(p.email)}</a>`);
  if (p.whatsapp) b.push(`<a class="btn sm" href="https://wa.me/${esc(String(p.whatsapp).replace(/\D/g, ""))}" target="_blank" rel="noopener">💬 WhatsApp</a>`);
  if (p.instagram) b.push(`<a class="btn sm" href="https://instagram.com/${esc(p.instagram.replace(/^@/, ""))}" target="_blank" rel="noopener">📸 @${esc(p.instagram.replace(/^@/, ""))}</a>`);
  return b.length ? `<div class="btnrow">${b.join("")}</div>` : "";
}
function personCard(p) {
  return `<article class="person">
    <div class="avawrap">${jerseyAvatar(initials(p.name, "?"), 64)}</div>
    <div class="pinfo">
      <div class="prole">${esc(L(p.rolle))}</div>
      <h3 class="${p.name ? "" : "ph"}">${esc(p.name || T("Name folgt", "Name to follow"))}${p.pronomen ? ` <span class="pron">${esc(p.pronomen)}</span>` : ""}</h3>
      ${contactBtns(p)}
    </div></article>`;
}
function confidantBox(p) {
  const text = p.name
    ? T(`<p>Dir ist etwas passiert, das sich nicht okay anfühlt – auf dem Platz, in der Kabine, im Gruppenchat oder beim Social? Melde dich bei ${esc(p.name)} – vertraulich, ohne Urteil und in deinem Tempo.</p>`,
        TP("<p>Something happened that doesn't feel okay – on the pitch, in the changing room, in the group chat or at a social? Reach out to {0} – confidentially, without judgement and at your own pace.</p>", esc(p.name)))
    : T("<p>Unsere Vertrauensperson wird gerade bestimmt. Bis dahin kannst du dich jederzeit vertraulich an den Vorstand wenden.</p>",
        "<p>We're currently choosing our confidant. Until then, you can always reach out to the board in confidence.</p>");
  return `<section class="confidant">
    <div class="conf-head"><div class="avawrap">${jerseyAvatar(p.name ? initials(p.name) : "?", 72)}</div><div><div class="prole">💛 ${esc(L(p.rolle))}</div>
      <h3 class="${p.name ? "" : "ph"}">${esc(p.name || T("folgt bald", "coming soon"))}${p.pronomen ? ` <span class="pron">${esc(p.pronomen)}</span>` : ""}</h3></div></div>
    ${text}${contactBtns(p)}
  </section>`;
}

function renderTeam() {
  const root = $("#tab-team");
  const gr = p => [].concat(p.gruppe);
  const conf = TEAM.filter(p => gr(p).includes("vertrauen"));
  const rest = TEAM.filter(p => !gr(p).includes("vertrauen") && (Team.filter === "alle" || gr(p).includes(Team.filter)));
  root.innerHTML = `
    <div class="hero"><div class="top"><small>${T("Team & Ansprechpersonen", "Team & contacts")}</small><h1>${T("Wer ist wer?", "Who's who?")}</h1></div><div class="stripe"></div>
      <div class="body"><p>${T("Neu hier? Willkommen! Hier findest du alle, die den Laden am Laufen halten – und alle Teammates. Niemand beißt (außer vielleicht im Scrum).", "New here? Welcome! Here you'll find everyone who keeps things running – and all your teammates. Nobody bites (except maybe in the scrum).")}</p></div></div>
    ${conf.map(confidantBox).join("")}
    <div class="chips" style="margin-top:6px">${Object.entries(TEAM_GROUPS).map(([k, v]) => `<button class="chip" data-tg="${k}" aria-pressed="${Team.filter === k}">${esc(L(v))}</button>`).join("")}</div>
    <div class="people">${rest.map(personCard).join("")}</div>
    <h2 class="sectionh" id="members">${T("Mitglieder", "Members")}</h2>
    <div id="memberArea"></div>
    <div class="clubbox">
      <h3>${T("Folg uns!", "Follow us!")}</h3>
      <p>${T("Matchday-Fotos, Trainings-Chaos und IGR-Abenteuer gibt's auf Instagram.", "Matchday photos, training chaos and IGR adventures – all on Instagram.")}</p>
      <a class="btn primary" href="https://instagram.com/${esc(CONFIG.INSTAGRAM)}" target="_blank" rel="noopener">📸 @${esc(CONFIG.INSTAGRAM)}</a>
    </div>`;
  $$("[data-tg]", root).forEach(b => b.onclick = () => { Team.filter = b.dataset.tg; renderTeam(); });
  renderMemberArea();
}

/* ---------- Mitgliederliste (nur angemeldet) ---------- */
function renderMemberArea() {
  const area = $("#memberArea"); if (!area) return;
  if (!Auth.user) {
    area.innerHTML = `<div class="empty" style="margin-top:6px"><p style="margin:0 0 12px">${T("Melde dich an, um alle Mitglieder mit Spitznamen, Pronomen und Positionen zu sehen.", "Sign in to see all members with their nicknames, pronouns and positions.")}</p>
      <button class="btn primary" id="memLogin">${T("Zum Konto", "Go to account")}</button></div>`;
    $("#memLogin", area).onclick = () => showTab("konto");
    return;
  }
  area.innerHTML = `<div class="membertools">
      <input class="inp" id="mSearch" type="search" placeholder="${T("Suchen …", "Search …")}" value="${esc(Auth.q)}" aria-label="${T("Mitglieder durchsuchen", "Search members")}">
      <select class="inp" id="mPos" aria-label="${T("Nach Position filtern", "Filter by position")}">
        <option value="">${T("Alle Pos.", "All pos.")}</option>
        ${Object.keys(POSITIONS).map(n => `<option value="${n}" ${String(Auth.pos) === n ? "selected" : ""}>${n} · ${esc(posName(n))}</option>`).join("")}
      </select>
    </div>
    <div id="memberList"><div class="loader"><div class="ring"></div>${T("Lade Mitglieder …", "Loading members …")}</div></div>`;
  $("#mSearch", area).oninput = e => { Auth.q = e.target.value; renderMemberList(); };
  $("#mPos", area).onchange = e => { Auth.pos = e.target.value; renderMemberList(); };
  loadMembers();
}
async function loadMembers() {
  try { if (!Auth.members) Auth.members = (await api("/api/members")).members; renderMemberList(); }
  catch (err) { const l = $("#memberList"); if (l) l.innerHTML = `<p class="err">${esc(err.message)}</p>`; }
}
function posTags(list) {
  if (!list || !list.length) return `<span class="hint" style="margin:0">${T("Noch keine Positionen angegeben", "No positions added yet")}</span>`;
  return `<div class="ptags">${list.map(n => `<span class="ptag"><b>${n}</b>${esc(posName(n))}</span>`).join("")}</div>`;
}
function renderMemberList() {
  const l = $("#memberList"); if (!l || !Auth.members) return;
  const q = Auth.q.trim().toLowerCase(), pos = +Auth.pos || 0;
  const list = Auth.members.filter(m => (!q || [m.nickname, m.username, m.pronouns].join(" ").toLowerCase().includes(q)) && (!pos || m.positions.includes(pos)));
  const isAdmin = Auth.user && Auth.user.admin;
  l.innerHTML = `<p class="hint" style="margin:0 0 8px">${T(`${list.length} von ${Auth.members.length} Mitgliedern`, TP("{0} of {1} members", list.length, Auth.members.length))}</p>` + (list.length ? list.map(m => `
    <article class="member">
      ${jerseyAvatar(initials(displayName(m)), 56)}
      <div class="pinfo">
        <h3>${esc(displayName(m))}${m.pronouns ? ` <span class="pron">${esc(m.pronouns)}</span>` : ""}${m.admin ? '<span class="badge y">Admin</span>' : ""}</h3>
        <div class="uname">@${esc(m.username)}${m.joinedYear ? ` · ${T("dabei seit", "with us since")} ${m.joinedYear}` : ""}</div>
        ${posTags(m.positions)}
      </div>
      ${isAdmin && m.id !== Auth.user.id ? `<button class="iconbtn" data-madmin="${esc(m.id)}" aria-label="${esc(displayName(m))} ${T("verwalten", "manage")}">⋯</button>` : ""}
    </article>`).join("") : `<div class="empty" style="margin:0"><p style="margin:0">${T("Niemand gefunden.", "Nobody found.")}</p></div>`);
  $$("[data-madmin]", l).forEach(b => b.onclick = () => openMemberAdmin(Auth.members.find(m => m.id === b.dataset.madmin)));
}
function openMemberAdmin(m) {
  if (!m) return;
  openSheet(`<h2 style="font-size:26px;margin:4px 40px 6px 0">${esc(displayName(m))}</h2><p class="mut">@${esc(m.username)}</p>
    <div class="btnrow" style="flex-direction:column;align-items:stretch">
      <button class="btn" id="maAdmin">${m.admin ? T("Admin-Rechte entziehen", "Remove admin rights") : "👑 " + T("Zum Admin machen", "Make admin")}</button>
      <button class="btn" id="maCode">🔑 ${T("Code für neues Gerät erstellen", "Create code for a new device")}</button>
      <button class="btn ghost" id="maDel" style="color:var(--loss)">${T("Mitglied entfernen", "Remove member")}</button>
    </div><p class="hint">${T("Admins können Mitglieder verwalten und alle Ergebnisse löschen. Den Code brauchst du, wenn jemand alle Geräte verloren hat – gib ihn nur persönlich weiter.", "Admins can manage members and delete any result. You need the code when someone has lost all their devices – only hand it over in person.")}</p>`);
  $("#maAdmin").onclick = async () => {
    try { await api(`/api/members/${m.id}/admin`, { method: "POST", body: { admin: !m.admin } }); Auth.members = null; closeSheet(); loadMembers(); toast(T("Gespeichert ✓", "Saved ✓")); }
    catch (err) { toast(err.message); }
  };
  $("#maCode").onclick = () => showCode(`/api/members/${m.id}/code`, T("Code für ", "Code for ") + displayName(m),
    T(`${esc(displayName(m))} öffnet die App → Konto → „Mit Code verbinden“ und gibt <b>@${esc(m.username)}</b> und diesen Code ein.`,
      TP("{0} opens the app → Account → “Connect with code” and enters <b>@{1}</b> and this code.", esc(displayName(m)), esc(m.username))));
  $("#maDel").onclick = async () => {
    if (!confirm(T(`${displayName(m)} wirklich entfernen? Das Konto wird gelöscht.`, TP("Really remove {0}? The account will be deleted.", displayName(m))))) return;
    try { await api(`/api/members/${m.id}`, { method: "DELETE" }); Auth.members = null; closeSheet(); loadMembers(); toast(T("Entfernt", "Removed")); }
    catch (err) { toast(err.message); }
  };
}

onShow.team = () => renderTeam();
