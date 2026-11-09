/* ======================================================================
   KONTO & MITGLIEDER – Anmeldung mit Passkeys, Profil, Mitgliederliste
   Nutzt Helfer aus index.html: $, $$, esc, store, toast, openSheet, closeSheet,
   showTab, onShow, jerseyInner, initials, POSITIONS
   ====================================================================== */
const Auth = { user: null, loaded: false, members: null, q: "", pos: "" };

/* ---------- API ---------- */
async function api(path, opts = {}) {
  const r = await fetch(path, {
    method: opts.method || "GET", credentials: "same-origin",
    headers: opts.body !== undefined ? { "Content-Type": "application/json" } : {},
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  let data = {}; try { data = await r.json(); } catch (e) {}
  if (!r.ok) throw Object.assign(new Error(data.message || "Fehler " + r.status), { status: r.status, code: data.error });
  return data;
}

/* ---------- Passkey-Helfer (WebAuthn) ---------- */
const b64uToBuf = s => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), c => c.charCodeAt(0)).buffer;
const bufToB64u = b => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const passkeysSupported = () => !!(window.PublicKeyCredential && navigator.credentials && navigator.credentials.create);

async function createPasskey(o) {
  const cred = await navigator.credentials.create({ publicKey: {
    ...o, challenge: b64uToBuf(o.challenge), user: { ...o.user, id: b64uToBuf(o.user.id) },
    excludeCredentials: (o.excludeCredentials || []).map(c => ({ ...c, id: b64uToBuf(c.id) })),
  } });
  return {
    id: cred.id, rawId: bufToB64u(cred.rawId), type: cred.type,
    clientExtensionResults: cred.getClientExtensionResults ? cred.getClientExtensionResults() : {},
    authenticatorAttachment: cred.authenticatorAttachment || undefined,
    response: {
      clientDataJSON: bufToB64u(cred.response.clientDataJSON),
      attestationObject: bufToB64u(cred.response.attestationObject),
      transports: cred.response.getTransports ? cred.response.getTransports() : [],
    },
  };
}
async function getPasskey(o) {
  const cred = await navigator.credentials.get({ publicKey: {
    ...o, challenge: b64uToBuf(o.challenge),
    allowCredentials: (o.allowCredentials || []).map(c => ({ ...c, id: b64uToBuf(c.id) })),
  } });
  return {
    id: cred.id, rawId: bufToB64u(cred.rawId), type: cred.type,
    clientExtensionResults: cred.getClientExtensionResults ? cred.getClientExtensionResults() : {},
    authenticatorAttachment: cred.authenticatorAttachment || undefined,
    response: {
      clientDataJSON: bufToB64u(cred.response.clientDataJSON),
      authenticatorData: bufToB64u(cred.response.authenticatorData),
      signature: bufToB64u(cred.response.signature),
      userHandle: cred.response.userHandle ? bufToB64u(cred.response.userHandle) : undefined,
    },
  };
}
function passkeyError(e) {
  if (e && (e.name === "NotAllowedError" || e.name === "AbortError")) return "Abgebrochen – kein Problem, versuch's einfach nochmal.";
  if (e && e.name === "InvalidStateError") return "Auf diesem Gerät gibt es schon einen Passkey für dieses Konto.";
  if (e && e.name === "SecurityError") return "Passkeys funktionieren nur auf der echten App-Adresse (https).";
  return (e && e.message) || "Das hat nicht geklappt.";
}

/* ---------- Anmelden / Registrieren ---------- */
async function doRegister(username) {
  const { flowId, options } = await api("/api/auth/register/options", { method: "POST", body: { username } });
  const response = await createPasskey(options);
  return api("/api/auth/register/verify", { method: "POST", body: { flowId, response } });
}
async function doLogin() {
  const { flowId, options } = await api("/api/auth/login/options", { method: "POST", body: {} });
  const response = await getPasskey(options);
  return api("/api/auth/login/verify", { method: "POST", body: { flowId, response } });
}
async function doLinkDevice(username, code) {
  const { flowId, options } = await api("/api/auth/code/options", { method: "POST", body: { username, code } });
  const response = await createPasskey(options);
  return api("/api/auth/code/verify", { method: "POST", body: { flowId, response } });
}
function signedIn(res, welcome) {
  Auth.user = res.user; Auth.members = null;
  updateAcctBtn(); renderKonto();
  if (typeof renderErgebnisse === "function" && !$("#tab-ergebnisse").hidden) renderErgebnisse();
  toast(welcome);
}

/* ---------- Kopfzeilen-Knopf ---------- */
const displayName = u => (u.nickname || u.username);
function updateAcctBtn() {
  const b = $("#acctBtn"); if (!b) return;
  if (Auth.user) { b.classList.add("in"); b.textContent = initials(displayName(Auth.user), "?").slice(0, 2); b.setAttribute("aria-label", "Dein Konto: " + displayName(Auth.user)); }
  else { b.classList.remove("in"); b.innerHTML = ICON.people; b.setAttribute("aria-label", "Anmelden / Konto"); }
}

/* ---------- Positionen ---------- */
const posLabel = n => POSITIONS[n] ? POSITIONS[n].en : "";
function posTags(list) {
  if (!list || !list.length) return '<span class="hint" style="margin:0">Noch keine Positionen angegeben</span>';
  return `<div class="ptags">${list.map(n => `<span class="ptag"><b>${n}</b>${esc(posLabel(n))}</span>`).join("")}</div>`;
}
function avatarFor(u, size = 56) {
  return `<svg class="ava" viewBox="-19 -18 38 40" style="width:${size}px;height:${size}px" aria-hidden="true">${jerseyInner(initials(displayName(u), "?"), 9.5)}</svg>`;
}

/* ---------- Ansicht ---------- */
async function loadMe() {
  try { Auth.user = (await api("/api/me")).user; } catch (e) { Auth.user = null; }
  Auth.loaded = true; updateAcctBtn();
}

function renderKonto() {
  const root = $("#tab-konto");
  if (!Auth.loaded) { root.innerHTML = '<div class="loader"><div class="ring"></div>Lade …</div>'; return; }
  if (!Auth.user) return renderLoggedOut(root);
  renderLoggedIn(root);
}

function renderLoggedOut(root) {
  const ok = passkeysSupported();
  root.innerHTML = `
    <div class="hero"><div class="top"><small>Dein Konto</small><h1>Sei dabei!</h1></div><div class="stripe"></div>
      <div class="body"><p>Mit einem Konto legst du dein Profil an – Spitzname, Pronomen und deine Positionen – und siehst, wer sonst noch im Team ist.</p></div></div>
    ${ok ? "" : '<div class="note" style="margin-bottom:12px">Dein Browser unterstützt keine Passkeys. Nimm bitte ein aktuelles Safari, Chrome oder Edge.</div>'}
    <div class="card">
      <h3 style="margin:0 0 6px">Schon dabei?</h3>
      <p class="mut">Melde dich mit deinem Passkey an – Face ID, Fingerabdruck oder Geräte-PIN. Kein Passwort nötig.</p>
      <button class="btn primary" id="loginBtn" style="width:100%" ${ok ? "" : "disabled"}>🔑 Mit Passkey anmelden</button>
      <p class="err" id="loginErr"></p>
    </div>
    <div class="card form">
      <h3 style="margin:0 0 6px">Neu hier?</h3>
      <label for="regUser">Username</label>
      <input class="inp" id="regUser" autocomplete="username webauthn" autocapitalize="none" spellcheck="false" placeholder="z. B. sam.rugby" maxlength="24">
      <p class="hint">3–24 Zeichen: Kleinbuchstaben, Zahlen, Punkt, Strich, Unterstrich. Wird für alle sichtbar.</p>
      <button class="btn primary" id="regBtn" style="width:100%;margin-top:12px" ${ok ? "" : "disabled"}>Konto erstellen</button>
      <p class="err" id="regErr"></p>
    </div>
    <div class="note">📱 <b>Neues Handy oder anderer Browser?</b> Erstelle auf deinem angemeldeten Gerät unter „Weiteres Gerät verbinden“ einen Code.
      <div style="margin-top:8px"><button class="btn sm" id="linkBtn" ${ok ? "" : "disabled"}>Mit Code verbinden</button></div></div>`;

  $("#loginBtn", root).onclick = async () => {
    const e = $("#loginErr"); e.textContent = "";
    try { const res = await doLogin(); signedIn(res, `Hi ${displayName(res.user)} 👋`); }
    catch (err) { e.textContent = passkeyError(err); }
  };
  $("#regBtn", root).onclick = async () => {
    const e = $("#regErr"); e.textContent = "";
    const name = $("#regUser").value.trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9_.-]{2,23}$/.test(name)) { e.textContent = "Username: 3–24 Zeichen, nur a–z, 0–9, Punkt, Strich, Unterstrich."; return; }
    try {
      const res = await doRegister(name);
      signedIn(res, res.firstAdmin ? "Willkommen! Du bist Admin 👑" : "Willkommen bei den Monks! 🏉");
    } catch (err) { e.textContent = passkeyError(err); }
  };
  $("#linkBtn", root).onclick = openLinkSheet;
}

function openLinkSheet() {
  openSheet(`<h2 style="font-size:26px;margin:4px 40px 6px 0">Gerät verbinden</h2>
    <p class="mut">Auf deinem angemeldeten Gerät: Konto → „Weiteres Gerät verbinden“. Den Code hier eingeben – dann wird auf diesem Gerät ein neuer Passkey angelegt.</p>
    <div class="form">
      <label for="lnUser">Username</label><input class="inp" id="lnUser" autocapitalize="none" spellcheck="false">
      <label for="lnCode">Code</label><input class="inp" id="lnCode" inputmode="numeric" maxlength="6" placeholder="123456">
      <button class="btn primary" id="lnGo" style="width:100%;margin-top:14px">Verbinden</button>
      <p class="err" id="lnErr"></p>
    </div>`);
  $("#lnGo").onclick = async () => {
    const e = $("#lnErr"); e.textContent = "";
    try { const res = await doLinkDevice($("#lnUser").value.trim(), $("#lnCode").value.trim()); closeSheet(); signedIn(res, "Gerät verbunden ✓"); }
    catch (err) { e.textContent = passkeyError(err); }
  };
}

function renderLoggedIn(root) {
  const u = Auth.user, sel = new Set(u.positions);
  root.innerHTML = `
    <div class="hero"><div class="top"><small>Dein Konto${u.admin ? " · Admin" : ""}</small><h1>Hey ${esc(displayName(u))}!</h1></div><div class="stripe"></div>
      <div class="body"><p>Angemeldet als <b>@${esc(u.username)}</b>. Dein Profil sehen alle angemeldeten Mitglieder.</p></div></div>
    <div class="card form" id="profileForm">
      <h3 style="margin:0 0 4px">Dein Profil</h3>
      <label for="pfNick">Spitzname</label>
      <input class="inp" id="pfNick" maxlength="40" value="${esc(u.nickname)}" placeholder="So nennen dich alle">
      <label for="pfPron">Pronomen</label>
      <input class="inp" id="pfPron" maxlength="30" value="${esc(u.pronouns)}" placeholder="z. B. sie/ihr, er/ihm, they/them" list="pronList">
      <datalist id="pronList"><option value="sie/ihr"><option value="er/ihm"><option value="they/them"><option value="keine – nur Name"><option value="frag mich"></datalist>
      <label>Positionen, die du spielen kannst</label>
      <div class="poschips">${Object.keys(POSITIONS).map(Number).map(n =>
        `<button type="button" class="poschip" data-pos="${n}" aria-pressed="${sel.has(n)}"><b>${n}</b>${esc(posLabel(n))}</button>`).join("")}</div>
      <p class="hint">Noch unsicher? Lass es leer – im Tab „Positionen“ findest du heraus, was zu dir passt.</p>
      <button class="btn primary" id="pfSave" style="width:100%;margin-top:14px">Profil speichern</button>
      <p class="err" id="pfErr"></p>
    </div>
    <div class="btnrow" style="margin-bottom:6px">
      <button class="btn" id="codeBtn">📱 Weiteres Gerät verbinden</button>
      <button class="btn ghost" id="logoutBtn">Abmelden</button>
    </div>
    <h2 style="font-size:28px;margin:22px 0 4px">Mitglieder</h2>
    <div class="membertools">
      <input class="inp" id="mSearch" type="search" placeholder="Suchen …" value="${esc(Auth.q)}" aria-label="Mitglieder durchsuchen">
      <select class="inp" id="mPos" aria-label="Nach Position filtern">
        <option value="">Alle Pos.</option>
        ${Object.keys(POSITIONS).map(n => `<option value="${n}" ${String(Auth.pos) === n ? "selected" : ""}>${n} · ${esc(posLabel(n))}</option>`).join("")}
      </select>
    </div>
    <div id="memberList"><div class="loader"><div class="ring"></div>Lade Mitglieder …</div></div>
    <div style="margin:22px 0 8px"><button class="btn sm ghost" id="delMe">Konto löschen</button></div>`;

  $$(".poschip", root).forEach(b => b.onclick = () => b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") !== "true"));
  $("#pfSave", root).onclick = async () => {
    const e = $("#pfErr"); e.textContent = "";
    const positions = $$(".poschip[aria-pressed=true]", root).map(b => +b.dataset.pos);
    try {
      Auth.user = (await api("/api/me", { method: "PUT", body: { nickname: $("#pfNick").value, pronouns: $("#pfPron").value, positions } })).user;
      Auth.members = null; updateAcctBtn(); renderKonto(); toast("Profil gespeichert ✓");
    } catch (err) { e.textContent = err.message; }
  };
  $("#codeBtn", root).onclick = () => showCode("/api/me/code", "Weiteres Gerät verbinden",
    `Öffne die App auf dem neuen Gerät → Konto → „Mit Code verbinden“ und gib <b>@${esc(u.username)}</b> und diesen Code ein.`);
  $("#logoutBtn", root).onclick = async () => { try { await api("/api/auth/logout", { method: "POST", body: {} }); } catch (e) {} Auth.user = null; Auth.members = null; updateAcctBtn(); renderKonto(); toast("Abgemeldet"); };
  $("#delMe", root).onclick = async () => {
    if (!confirm("Dein Konto und dein Profil werden endgültig gelöscht. Sicher?")) return;
    try { await api("/api/me", { method: "DELETE" }); Auth.user = null; Auth.members = null; updateAcctBtn(); renderKonto(); toast("Konto gelöscht"); }
    catch (err) { toast(err.message); }
  };
  $("#mSearch", root).oninput = e => { Auth.q = e.target.value; renderMemberList(); };
  $("#mPos", root).onchange = e => { Auth.pos = e.target.value; renderMemberList(); };
  loadMembers();
}

async function showCode(path, title, text) {
  try {
    const { code } = await api(path, { method: "POST", body: {} });
    openSheet(`<h2 style="font-size:26px;margin:4px 40px 6px 0">${esc(title)}</h2><p class="mut">${text}</p>
      <div class="codebox">${esc(code)}</div><p class="hint" style="text-align:center">Gültig für 15 Minuten · nur einmal verwendbar</p>`);
  } catch (err) { toast(err.message); }
}

async function loadMembers() {
  try { if (!Auth.members) Auth.members = (await api("/api/members")).members; renderMemberList(); }
  catch (err) { const l = $("#memberList"); if (l) l.innerHTML = `<p class="err">${esc(err.message)}</p>`; }
}
function renderMemberList() {
  const l = $("#memberList"); if (!l || !Auth.members) return;
  const q = Auth.q.trim().toLowerCase(), pos = +Auth.pos || 0;
  const list = Auth.members.filter(m => (!q || [m.nickname, m.username, m.pronouns].join(" ").toLowerCase().includes(q)) && (!pos || m.positions.includes(pos)));
  const isAdmin = Auth.user && Auth.user.admin;
  l.innerHTML = `<p class="hint" style="margin:0 0 8px">${list.length} von ${Auth.members.length} Mitgliedern</p>` + (list.length ? list.map(m => `
    <article class="member">
      ${avatarFor(m)}
      <div class="pinfo">
        <h3>${esc(displayName(m))}${m.pronouns ? ` <span class="pron">${esc(m.pronouns)}</span>` : ""}${m.admin ? '<span class="badge y">Admin</span>' : ""}</h3>
        <div class="uname">@${esc(m.username)}</div>
        ${posTags(m.positions)}
      </div>
      ${isAdmin && m.id !== Auth.user.id ? `<button class="iconbtn" data-madmin="${esc(m.id)}" aria-label="${esc(displayName(m))} verwalten">⋯</button>` : ""}
    </article>`).join("") : '<div class="empty" style="margin:0"><p style="margin:0">Niemand gefunden.</p></div>');
  $$("[data-madmin]", l).forEach(b => b.onclick = () => openMemberAdmin(Auth.members.find(m => m.id === b.dataset.madmin)));
}

function openMemberAdmin(m) {
  if (!m) return;
  openSheet(`<h2 style="font-size:26px;margin:4px 40px 6px 0">${esc(displayName(m))}</h2><p class="mut">@${esc(m.username)}</p>
    <div class="btnrow" style="flex-direction:column;align-items:stretch">
      <button class="btn" id="maAdmin">${m.admin ? "Admin-Rechte entziehen" : "👑 Zum Admin machen (darf Ergebnisse eintragen)"}</button>
      <button class="btn" id="maCode">🔑 Code für neues Gerät erstellen</button>
      <button class="btn ghost" id="maDel" style="color:var(--loss)">Mitglied entfernen</button>
    </div><p class="hint">Den Code brauchst du, wenn jemand alle Geräte verloren hat. Gib ihn nur persönlich weiter.</p>`);
  $("#maAdmin").onclick = async () => {
    try { await api(`/api/members/${m.id}/admin`, { method: "POST", body: { admin: !m.admin } }); Auth.members = null; closeSheet(); loadMembers(); toast("Gespeichert ✓"); }
    catch (err) { toast(err.message); }
  };
  $("#maCode").onclick = () => showCode(`/api/members/${m.id}/code`, "Code für " + displayName(m),
    `${esc(displayName(m))} öffnet die App → Konto → „Mit Code verbinden“ und gibt <b>@${esc(m.username)}</b> und diesen Code ein.`);
  $("#maDel").onclick = async () => {
    if (!confirm(`${displayName(m)} wirklich entfernen? Das Konto wird gelöscht.`)) return;
    try { await api(`/api/members/${m.id}`, { method: "DELETE" }); Auth.members = null; closeSheet(); loadMembers(); toast("Entfernt"); }
    catch (err) { toast(err.message); }
  };
}

/* ---------- Start ---------- */
onShow.konto = renderKonto;
$("#acctBtn").onclick = () => showTab("konto");
updateAcctBtn();
loadMe().then(() => {
  if (!$("#tab-konto").hidden) renderKonto();
  if (!$("#tab-ergebnisse").hidden && typeof renderErgebnisse === "function") renderErgebnisse();
});
