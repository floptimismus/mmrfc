/* ======================================================================
   TAB: KONTO – Anmeldung mit Passkeys, Profil, Sprache, SpielerPlus-Kalender
   ====================================================================== */

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
  if (e && (e.name === "NotAllowedError" || e.name === "AbortError")) return T("Abgebrochen – kein Problem, versuch's einfach nochmal.", "Cancelled – no problem, just try again.");
  if (e && e.name === "InvalidStateError") return T("Auf diesem Gerät gibt es schon einen Passkey für dieses Konto.", "This device already has a passkey for this account.");
  if (e && e.name === "SecurityError") return T("Passkeys funktionieren nur auf der echten App-Adresse (https).", "Passkeys only work on the real app address (https).");
  return (e && e.message) || T("Das hat nicht geklappt.", "That didn't work.");
}

/* ---------- Anmelden / Registrieren ---------- */
async function doRegister(username) {
  const { flowId, options } = await api("/api/auth/register/options", { method: "POST", body: { username } });
  const response = await createPasskey(options);
  return api("/api/auth/register/verify", { method: "POST", body: { flowId, response, lang: LANG } });
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
function setUser(u) {
  Auth.user = u; Auth.offline = false;
  if (u) store.set("me", u); else store.del("me");
}
// nach Anmeldung: alles neu laden, ggf. Sprache aus dem Konto übernehmen
function signedIn(res, welcome) {
  setUser(res.user); Auth.members = null;
  if (res.user.lang && res.user.lang !== LANG) { setLang(res.user.lang, { save: false }); return; }
  if (!res.user.lang) api("/api/me", { method: "PUT", body: { lang: LANG } }).catch(() => {});
  closeSheet();
  toast(welcome);
  refreshAll();
}
function refreshAll() {
  renderKonto(); loadCalendar();
  if (!$("#tab-ergebnisse").hidden) renderErgebnisse();
  if (!$("#tab-team").hidden) renderTeam();
}

/* ---------- Konto laden ---------- */
async function loadMe() {
  try {
    const r = await fetch("/api/me", { cache: "no-store", credentials: "same-origin" });
    if (!r.ok) throw new Error(r.status);
    const u = (await r.json()).user;
    setUser(u);
  } catch (e) {
    // offline: letzten bekannten Stand nutzen
    Auth.user = store.get("me", null); Auth.offline = !!Auth.user;
  }
  Auth.loaded = true;
}

/* ---------- Ansicht ---------- */
function renderKonto(anchor) {
  const root = $("#tab-konto");
  if (!Auth.loaded) { root.innerHTML = `<div class="loader"><div class="ring"></div>${T("Lade …", "Loading …")}</div>`; return; }
  if (!Auth.user) renderLoggedOut(root); else renderLoggedIn(root);
  if (anchor === "calendar") setTimeout(() => { const c = $("#calCard"); if (c) c.scrollIntoView({ behavior: "smooth", block: "start" }); }, 50);
}

function renderLoggedOut(root) {
  const ok = passkeysSupported();
  root.innerHTML = `
    <div class="hero"><div class="top"><small>${T("Dein Konto", "Your account")}</small><h1>${T("Sei dabei!", "Join in!")}</h1></div><div class="stripe"></div>
      <div class="body"><p>${T("Mit einem Konto siehst du deine Termine, trägst Ergebnisse ein und siehst alle Teammates.", "With an account you see your events, add results and see all your teammates.")}</p></div></div>
    ${langSwitch()}
    ${ok ? "" : `<div class="note" style="margin-bottom:12px">${T("Dein Browser unterstützt keine Passkeys. Nimm bitte ein aktuelles Safari, Chrome oder Edge.", "Your browser doesn't support passkeys. Please use an up-to-date Safari, Chrome or Edge.")}</div>`}
    <div class="card">
      <h3 style="margin:0 0 6px">${T("Schon dabei?", "Already a member?")}</h3>
      <p class="mut">${T("Melde dich mit deinem Passkey an – Face ID, Fingerabdruck oder Geräte-PIN. Kein Passwort nötig.", "Sign in with your passkey – Face ID, fingerprint or device PIN. No password needed.")}</p>
      <button class="btn primary" id="loginBtn" style="width:100%" ${ok ? "" : "disabled"}>🔑 ${T("Mit Passkey anmelden", "Sign in with passkey")}</button>
      <p class="err" id="loginErr"></p>
    </div>
    <div class="card form">
      <h3 style="margin:0 0 6px">${T("Neu hier?", "New here?")}</h3>
      <label for="regUser">Username</label>
      <input class="inp" id="regUser" autocomplete="username webauthn" autocapitalize="none" spellcheck="false" placeholder="${T("z. B. sam.rugby", "e.g. sam.rugby")}" maxlength="24">
      <p class="hint">${T("3–24 Zeichen: Kleinbuchstaben, Zahlen, Punkt, Strich, Unterstrich. Wird für alle Mitglieder sichtbar.", "3–24 characters: lower-case letters, numbers, dot, dash, underscore. Visible to all members.")}</p>
      <button class="btn primary" id="regBtn" style="width:100%;margin-top:12px" ${ok ? "" : "disabled"}>${T("Konto erstellen", "Create account")}</button>
      <p class="err" id="regErr"></p>
    </div>
    <div class="note">📱 <b>${T("Neues Handy oder anderer Browser?", "New phone or another browser?")}</b> ${T("Erstelle auf deinem angemeldeten Gerät unter „Weiteres Gerät verbinden“ einen Code.", "Create a code on your signed-in device under “Connect another device”.")}
      <div style="margin-top:8px"><button class="btn sm" id="linkBtn" ${ok ? "" : "disabled"}>${T("Mit Code verbinden", "Connect with code")}</button></div></div>`;

  bindLangSwitch(root);
  $("#loginBtn", root).onclick = () => loginFlow($("#loginErr"));
  $("#regBtn", root).onclick = () => registerFlow($("#regUser").value, $("#regErr"));
  $("#linkBtn", root).onclick = openLinkSheet;
}
async function loginFlow(errEl) {
  errEl.textContent = "";
  try { const res = await doLogin(); signedIn(res, T(`Hi ${displayName(res.user)} 👋`, TP("Hi {0} 👋", displayName(res.user)))); }
  catch (err) { errEl.textContent = passkeyError(err); }
}
async function registerFlow(raw, errEl) {
  errEl.textContent = "";
  const name = String(raw || "").trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9_.-]{2,23}$/.test(name)) { errEl.textContent = T("Username: 3–24 Zeichen, nur a–z, 0–9, Punkt, Strich, Unterstrich.", "Username: 3–24 characters, only a–z, 0–9, dot, dash, underscore."); return; }
  try {
    const res = await doRegister(name);
    signedIn(res, res.firstAdmin ? T("Willkommen! Du bist Admin 👑", "Welcome! You're an admin 👑") : T("Willkommen bei den Monks! 🏉", "Welcome to the Monks! 🏉"));
  } catch (err) { errEl.textContent = passkeyError(err); }
}

function openLinkSheet() {
  openSheet(`<h2 style="font-size:26px;margin:4px 40px 6px 0">${T("Gerät verbinden", "Connect device")}</h2>
    <p class="mut">${T("Auf deinem angemeldeten Gerät: Konto → „Weiteres Gerät verbinden“. Den Code hier eingeben – dann wird auf diesem Gerät ein neuer Passkey angelegt.", "On your signed-in device: Account → “Connect another device”. Enter the code here – a new passkey is then created on this device.")}</p>
    <div class="form">
      <label for="lnUser">Username</label><input class="inp" id="lnUser" autocapitalize="none" spellcheck="false">
      <label for="lnCode">Code</label><input class="inp" id="lnCode" inputmode="numeric" maxlength="6" placeholder="123456">
      <button class="btn primary" id="lnGo" style="width:100%;margin-top:14px">${T("Verbinden", "Connect")}</button>
      <p class="err" id="lnErr"></p>
    </div>`);
  $("#lnGo").onclick = async () => {
    const e = $("#lnErr"); e.textContent = "";
    try { const res = await doLinkDevice($("#lnUser").value.trim(), $("#lnCode").value.trim()); signedIn(res, T("Gerät verbunden ✓", "Device connected ✓")); }
    catch (err) { e.textContent = passkeyError(err); }
  };
}

function yearOptions(sel) {
  const now = new Date().getFullYear(); let o = `<option value="">${T("– bitte wählen –", "– please choose –")}</option>`;
  for (let y = now; y >= CONFIG.FOUNDED; y--) o += `<option value="${y}" ${sel === y ? "selected" : ""}>${y}</option>`;
  return o;
}
function calendarCard(u) {
  const steps = T(
    ["Tippe in SpielerPlus in der Navigationsleiste auf das <b>Kalender-Symbol</b>.", "Bei <b>„Nächste Events“</b> auf <b>„Alle ansehen“</b> (bzw. „View all“).", "Oben den Tab <b>„Kalender“</b> wählen.", "Ganz unten auf <b>„Kalender folgen“</b> tippen und den <b>Link kopieren</b>.", "Hier einfügen und <b>Speichern</b> – fertig! 🏉"],
    ["In SpielerPlus, tap the <b>calendar icon</b> in the navigation bar.", "Under <b>“Next events”</b>, tap <b>“View all”</b>.", "Choose the <b>“Calendar”</b> tab at the top.", "At the very bottom, tap <b>“Follow calendar”</b> and <b>copy the link</b>.", "Paste it here and <b>save</b> – done! 🏉"]);
  return `<div class="card form" id="calCard">
    <h3 style="margin:0 0 4px">📅 ${T("Mein SpielerPlus-Kalender", "My SpielerPlus calendar")}</h3>
    ${u.calendarUrl ? `<p class="okline">✓ ${T("Verbunden – deine Termine erscheinen im Tab „Termine“.", "Connected – your events show up in the “Events” tab.")}</p>`
      : `<p class="mut">${T("Füge deinen persönlichen Kalenderlink ein – dann zeigt dir die App deine Termine. Niemand sonst sieht deinen Link.", "Paste your personal calendar link – then the app shows your events. Nobody else can see your link.")}</p>`}
    <label for="calUrl">${T("Kalenderlink", "Calendar link")}</label>
    <input class="inp" id="calUrl" type="url" inputmode="url" autocapitalize="none" spellcheck="false" placeholder="https://www.spielerplus.de/…" value="${esc(u.calendarUrl)}">
    <div class="btnrow" style="margin-top:10px"><button class="btn primary" id="calSave">${T("Speichern", "Save")}</button>${u.calendarUrl ? `<button class="btn ghost" id="calDel">${T("Entfernen", "Remove")}</button>` : ""}</div>
    <p class="err" id="calErr"></p>
    <details class="basics" ${u.calendarUrl ? "" : "open"}><summary>${T("So findest du deinen Link in SpielerPlus", "How to find your link in SpielerPlus")}</summary>
      <ol class="steps">${steps.map(s => `<li>${s}</li>`).join("")}</ol></details>
  </div>`;
}

function renderLoggedIn(root) {
  const u = Auth.user, sel = new Set(u.positions);
  root.innerHTML = `
    <div class="hero"><div class="top"><small>${T("Dein Konto", "Your account")}${u.admin ? " · Admin" : ""}</small><h1>Hey ${esc(displayName(u))}!</h1></div><div class="stripe"></div>
      <div class="body"><p>${T(`Angemeldet als <b>@${esc(u.username)}</b>. Dein Profil sehen alle angemeldeten Mitglieder im Tab „Team“.`, TP("Signed in as <b>@{0}</b>. All signed-in members can see your profile in the “Team” tab.", esc(u.username)))}</p></div></div>
    ${Auth.offline ? `<div class="note" style="margin:0 0 10px">${T("Offline – Änderungen sind gerade nicht möglich.", "Offline – changes aren't possible right now.")}</div>` : ""}
    <div class="card form" id="profileForm">
      <h3 style="margin:0 0 4px">${T("Dein Profil", "Your profile")}</h3>
      <label for="pfNick">${T("Spitzname", "Nickname")}</label>
      <input class="inp" id="pfNick" maxlength="40" value="${esc(u.nickname)}" placeholder="${T("So nennen dich alle", "What everyone calls you")}">
      <label for="pfPron">${T("Pronomen", "Pronouns")}</label>
      <input class="inp" id="pfPron" maxlength="30" value="${esc(u.pronouns)}" placeholder="${T("z. B. sie/ihr, er/ihm, they/them", "e.g. she/her, he/him, they/them")}" list="pronList">
      <datalist id="pronList">${T(["sie/ihr", "er/ihm", "they/them", "keine – nur Name", "frag mich"], ["she/her", "he/him", "they/them", "no pronouns – use my name", "ask me"]).map(p => `<option value="${p}">`).join("")}</datalist>
      <label for="pfYear">${T("Dabei seit", "Playing with the Monks since")}</label>
      <select class="inp" id="pfYear">${yearOptions(u.joinedYear)}</select>
      <label>${T("Positionen, die du spielen kannst", "Positions you can play")}</label>
      <div class="poschips">${Object.keys(POSITIONS).map(Number).map(n =>
        `<button type="button" class="poschip" data-pos="${n}" aria-pressed="${sel.has(n)}"><b>${n}</b>${esc(posName(n))}</button>`).join("")}</div>
      <p class="hint">${T("Noch unsicher? Lass es leer – im Tab „Basics“ findest du heraus, was zu dir passt.", "Not sure yet? Leave it empty – the “Basics” tab helps you find out what suits you.")}</p>
      <button class="btn primary" id="pfSave" style="width:100%;margin-top:14px" ${Auth.offline ? "disabled" : ""}>${T("Profil speichern", "Save profile")}</button>
      <p class="err" id="pfErr"></p>
    </div>
    <div class="card"><h3 style="margin:0 0 4px">${T("Sprache", "Language")}</h3>${langSwitch()}</div>
    ${calendarCard(u)}
    <div class="btnrow" style="margin-bottom:6px">
      <button class="btn" id="codeBtn">📱 ${T("Weiteres Gerät verbinden", "Connect another device")}</button>
      <button class="btn ghost" id="logoutBtn">${T("Abmelden", "Sign out")}</button>
    </div>
    <div style="margin:22px 0 8px"><button class="btn sm ghost" id="delMe">${T("Konto löschen", "Delete account")}</button></div>`;

  bindLangSwitch(root);
  $$(".poschip", root).forEach(b => b.onclick = () => b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") !== "true"));
  $("#pfSave", root).onclick = async () => {
    const e = $("#pfErr"); e.textContent = "";
    const positions = $$(".poschip[aria-pressed=true]", root).map(b => +b.dataset.pos);
    try {
      setUser((await api("/api/me", { method: "PUT", body: { nickname: $("#pfNick").value, pronouns: $("#pfPron").value, positions, joinedYear: $("#pfYear").value || null } })).user);
      Auth.members = null; renderKonto(); toast(T("Profil gespeichert ✓", "Profile saved ✓"));
    } catch (err) { e.textContent = err.message; }
  };
  $("#calSave", root).onclick = () => saveCalendar($("#calUrl").value);
  const cd = $("#calDel", root); if (cd) cd.onclick = () => saveCalendar("");
  $("#codeBtn", root).onclick = () => showCode("/api/me/code", T("Weiteres Gerät verbinden", "Connect another device"),
    T(`Öffne die App auf dem neuen Gerät → Konto → „Mit Code verbinden“ und gib <b>@${esc(u.username)}</b> und diesen Code ein.`,
      TP("Open the app on the new device → Account → “Connect with code” and enter <b>@{0}</b> and this code.", esc(u.username))));
  $("#logoutBtn", root).onclick = async () => {
    try { await api("/api/auth/logout", { method: "POST", body: {} }); } catch (e) {}
    signedOut(T("Abgemeldet", "Signed out"));
  };
  $("#delMe", root).onclick = async () => {
    if (!confirm(T("Dein Konto und dein Profil werden endgültig gelöscht. Sicher?", "Your account and profile will be deleted permanently. Are you sure?"))) return;
    try { await api("/api/me", { method: "DELETE" }); signedOut(T("Konto gelöscht", "Account deleted")); }
    catch (err) { toast(err.message); }
  };
}
function signedOut(msg) {
  setUser(null); Auth.members = null; clearCalendar();
  renderKonto(); loadCalendar(); toast(msg);
}
async function saveCalendar(url) {
  const e = $("#calErr"); e.textContent = "";
  try {
    const r = await api("/api/me/calendar", { method: "PUT", body: { url } });
    setUser({ ...Auth.user, calendarUrl: r.calendarUrl });
    store.del("ics_v4");
    renderKonto(); loadCalendar();
    toast(r.calendarUrl ? T("Kalender verbunden ✓", "Calendar connected ✓") : T("Kalender entfernt", "Calendar removed"));
  } catch (err) { e.textContent = err.message; }
}
async function showCode(path, title, text) {
  try {
    const { code } = await api(path, { method: "POST", body: {} });
    openSheet(`<h2 style="font-size:26px;margin:4px 40px 6px 0">${esc(title)}</h2><p class="mut">${text}</p>
      <div class="codebox">${esc(code)}</div><p class="hint" style="text-align:center">${T("Gültig für 15 Minuten · nur einmal verwendbar", "Valid for 15 minutes · single use")}</p>`);
  } catch (err) { toast(err.message); }
}

/* ---------- Willkommens-Fenster (ohne Konto höchstens 1× pro Woche) ---------- */
function maybeWelcome() {
  if (Auth.user || Auth.offline) return;
  const last = store.get("welcome_at", 0);
  if (last && Date.now() - last < 7 * 864e5) return;
  store.set("welcome_at", Date.now());
  const ok = passkeysSupported();
  const perks = T(
    [["📅", "<b>deine Termine</b> live aus SpielerPlus sehen"], ["🏆", "<b>Ergebnisse eintragen</b> – auch direkt vom Turnier"], ["👋", "<b>dein Profil</b> anlegen: Spitzname, Pronomen, Positionen, dabei seit …"], ["👥", "<b>alle Teammates</b> und ihre Positionen sehen"], ["🔑", "dich <b>ohne Passwort</b> anmelden – per Face ID oder Fingerabdruck"]],
    [["📅", "see <b>your events</b> live from SpielerPlus"], ["🏆", "<b>add results</b> – even straight from the tournament"], ["👋", "set up <b>your profile</b>: nickname, pronouns, positions, playing since …"], ["👥", "see <b>all your teammates</b> and their positions"], ["🔑", "sign in <b>without a password</b> – with Face ID or fingerprint"]]);
  openSheet(`<div class="welcome">
    ${langSwitch()}
    <h2>${T("Willkommen bei den Munich Monks! 🏉", "Welcome to the Munich Monks! 🏉")}</h2>
    <p class="mut">${T("Mit einem Konto kannst du:", "With an account you can:")}</p>
    <ul class="perks">${perks.map(([i, t]) => `<li><span>${i}</span><span>${t}</span></li>`).join("")}</ul>
    <div class="form"><label for="wUser">${T("Wähle einen Username", "Choose a username")}</label>
      <input class="inp" id="wUser" autocapitalize="none" spellcheck="false" maxlength="24" placeholder="${T("z. B. sam.rugby", "e.g. sam.rugby")}"></div>
    <button class="btn primary" id="wReg" style="width:100%;margin-top:12px" ${ok ? "" : "disabled"}>${T("Konto erstellen", "Create account")}</button>
    <p class="err" id="wErr"></p>
    <div class="btnrow" style="justify-content:space-between;margin-top:4px">
      <button class="btn ghost sm" id="wLogin" ${ok ? "" : "disabled"}>${T("Ich habe schon ein Konto – anmelden", "I already have an account – sign in")}</button>
      <button class="btn ghost sm" id="wLater">${T("Später", "Later")}</button>
    </div></div>`);
  const S = $("#sheetInner");
  // Sprache im Willkommens-Fenster wechseln: Fenster nach dem Neuladen nochmal zeigen
  $$("[data-lang]", S).forEach(b => b.onclick = () => { if (b.dataset.lang !== LANG) { store.del("welcome_at"); setLang(b.dataset.lang); } });
  $("#wReg", S).onclick = () => registerFlow($("#wUser", S).value, $("#wErr", S));
  $("#wLogin", S).onclick = () => loginFlow($("#wErr", S));
  $("#wLater", S).onclick = closeSheet;
}

onShow.konto = renderKonto;
