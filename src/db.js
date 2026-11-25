// Durable Object mit SQLite: Konten (Passkeys), Profile, Kalender-Links, Team-Zuordnungen und Spielergebnisse.
// Eine einzige Instanz ("main") hält alle Daten des Vereins.
import { DurableObject } from "cloudflare:workers";
import {
  generateRegistrationOptions, verifyRegistrationResponse,
  generateAuthenticationOptions, verifyAuthenticationResponse,
} from "@simplewebauthn/server";

const SESSION_DAYS = 180;
const COOKIE = "mm_session";
const POSITIONS = Array.from({ length: 15 }, (_, i) => i + 1);
const KINDS = ["spieltag", "turnier", "freundschaft"];
const TEAMS = ["", "mixed", "flinta", "flying"];
const EVENT_TEAMS = ["mixed", "flinta", "flying"];
const LANGS = ["de", "en", "fr", "es"];
const FOUNDED = 2016;

/* ---------- kleine Helfer ---------- */
const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers } });
// message: [deutsch, englisch] – der Client zeigt die passende Sprache
const fail = (status, error, de, en) => json({ error, message: de, message_en: en || de }, status);
const now = () => Date.now();
const b64u = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64u = s => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), c => c.charCodeAt(0));
const randomId = (n = 18) => b64u(crypto.getRandomValues(new Uint8Array(n)));
const str = (v, max) => String(v ?? "").trim().slice(0, max);
const int = (v, min, max) => { if (v === null || v === undefined || v === "") return null; const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : null; };
const USERNAME_RE = /^[a-z0-9][a-z0-9_.-]{2,23}$/;

function getCookie(request, name) {
  const m = (request.headers.get("Cookie") || "").match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
  return m ? m[1] : null;
}
function sessionCookie(token, url, maxAge) {
  const secure = url.protocol === "https:" ? "; Secure" : "";
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}
async function body(request) { try { return await request.json(); } catch { return {}; } }

// SpielerPlus-Kalenderlink prüfen. webcal:// wird zu https:// (so liefert „Kalender folgen“ den Link oft aus).
function cleanCalendarUrl(raw, env) {
  let s = str(raw, 600).replace(/^webcals?:\/\//i, "https://");
  let u; try { u = new URL(s); } catch { return null; }
  if (env.DEV_ICS_ANY_HOST === "1" && /^https?:$/.test(u.protocol)) return u.toString(); // nur für lokale Tests
  if (u.protocol !== "https:") return null;
  if (!/(^|\.)spielerplus\.de$/i.test(u.hostname)) return null;
  return u.toString();
}

export class MonksDB extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.env = env;
    this.sql = ctx.storage.sql;
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, nickname TEXT NOT NULL DEFAULT '',
        pronouns TEXT NOT NULL DEFAULT '', positions TEXT NOT NULL DEFAULT '[]', is_admin INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS credentials (
        id TEXT PRIMARY KEY, user_id TEXT NOT NULL, public_key TEXT NOT NULL, counter INTEGER NOT NULL DEFAULT 0,
        transports TEXT NOT NULL DEFAULT '[]', created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS challenges (id TEXT PRIMARY KEY, challenge TEXT NOT NULL, data TEXT NOT NULL, expires INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS link_codes (user_id TEXT PRIMARY KEY, code TEXT NOT NULL, expires INTEGER NOT NULL, tries INTEGER NOT NULL DEFAULT 0);
      CREATE TABLE IF NOT EXISTS results (id TEXT PRIMARY KEY, date TEXT NOT NULL, data TEXT NOT NULL,
        updated_at INTEGER NOT NULL, updated_by TEXT NOT NULL DEFAULT '');
      CREATE TABLE IF NOT EXISTS event_teams (key TEXT PRIMARY KEY, alt TEXT NOT NULL DEFAULT '', team TEXT NOT NULL,
        updated_by TEXT NOT NULL DEFAULT '', updated_at INTEGER NOT NULL);
    `);
    // Version 4: neue Spalten nachrüsten (bestehende Daten bleiben erhalten)
    this.addColumn("users", "joined_year", "INTEGER");
    this.addColumn("users", "lang", "TEXT NOT NULL DEFAULT ''");
    this.addColumn("users", "ics_url", "TEXT NOT NULL DEFAULT ''");
    this.addColumn("results", "created_by", "TEXT NOT NULL DEFAULT ''");
  }
  addColumn(table, col, type) {
    const cols = this.rows(`PRAGMA table_info(${table})`).map(c => c.name);
    if (!cols.includes(col)) this.sql.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`);
  }

  rows(q, ...a) { return this.sql.exec(q, ...a).toArray(); }
  row(q, ...a) { return this.rows(q, ...a)[0] || null; }

  /* ---------- Sitzung ---------- */
  currentUser(request) {
    const token = getCookie(request, COOKIE);
    if (!token) return null;
    const s = this.row("SELECT user_id FROM sessions WHERE token = ? AND expires > ?", token, now());
    return s ? this.row("SELECT * FROM users WHERE id = ?", s.user_id) : null;
  }
  startSession(userId, url, extra = {}) {
    const token = randomId(32);
    this.sql.exec("INSERT INTO sessions (token, user_id, expires) VALUES (?, ?, ?)", token, userId, now() + SESSION_DAYS * 864e5);
    return json({ ok: true, user: this.publicUser(this.row("SELECT * FROM users WHERE id = ?", userId), true), ...extra }, 200,
      { "Set-Cookie": sessionCookie(token, url, SESSION_DAYS * 86400) });
  }
  publicUser(u, self = false) {
    if (!u) return null;
    const out = {
      id: u.id, username: u.username, nickname: u.nickname, pronouns: u.pronouns,
      positions: JSON.parse(u.positions || "[]"), joinedYear: u.joined_year || null, admin: !!u.is_admin,
    };
    if (self) {
      out.passkeys = this.row("SELECT COUNT(*) AS n FROM credentials WHERE user_id = ?", u.id).n;
      out.lang = u.lang || "";
      out.calendarUrl = u.ics_url || "";
    }
    return out;
  }
  nameOf(id) {
    const u = id && this.row("SELECT nickname, username FROM users WHERE id = ?", id);
    return u ? (u.nickname || u.username) : "";
  }
  cleanup() {
    const t = now();
    this.sql.exec("DELETE FROM challenges WHERE expires < ?", t);
    this.sql.exec("DELETE FROM sessions WHERE expires < ?", t);
    this.sql.exec("DELETE FROM link_codes WHERE expires < ?", t);
  }
  saveChallenge(challenge, data) {
    const id = randomId();
    this.sql.exec("INSERT INTO challenges (id, challenge, data, expires) VALUES (?, ?, ?, ?)", id, challenge, JSON.stringify(data), now() + 5 * 6e4);
    return id;
  }
  takeChallenge(id) {
    const c = this.row("SELECT * FROM challenges WHERE id = ? AND expires > ?", String(id || ""), now());
    this.sql.exec("DELETE FROM challenges WHERE id = ?", String(id || ""));
    return c ? { challenge: c.challenge, ...JSON.parse(c.data) } : null;
  }

  /* ---------- Passkeys ---------- */
  rp(url) { return { rpID: url.hostname, rpName: "Munich Monks RFC", origin: url.origin }; }

  async registrationOptions(url, user) {
    const { rpID, rpName } = this.rp(url);
    const exclude = this.rows("SELECT id, transports FROM credentials WHERE user_id = ?", user.id)
      .map(c => ({ id: c.id, transports: JSON.parse(c.transports) }));
    return generateRegistrationOptions({
      rpName, rpID, userName: user.username, userDisplayName: user.nickname || user.username,
      userID: new TextEncoder().encode(user.id), attestationType: "none", excludeCredentials: exclude,
      authenticatorSelection: { residentKey: "required", userVerification: "preferred" },
    });
  }
  async verifyRegistration(url, flow, response) {
    const { rpID, origin } = this.rp(url);
    let v;
    try {
      v = await verifyRegistrationResponse({ response, expectedChallenge: flow.challenge, expectedOrigin: origin, expectedRPID: rpID, requireUserVerification: false });
    } catch (e) { return null; }
    if (!v.verified || !v.registrationInfo) return null;
    return v.registrationInfo.credential;
  }
  storeCredential(userId, cred) {
    this.sql.exec("INSERT INTO credentials (id, user_id, public_key, counter, transports, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      cred.id, userId, b64u(cred.publicKey), cred.counter || 0, JSON.stringify(cred.transports || []), now());
  }

  /* ---------- Kalender ---------- */
  async calendar(me) {
    if (!me.ics_url) return fail(409, "no_link", "Du hast noch keinen SpielerPlus-Kalender verbunden.", "You haven't connected a SpielerPlus calendar yet.");
    try {
      const ac = new AbortController(); const to = setTimeout(() => ac.abort(), 12000);
      const r = await fetch(me.ics_url, { headers: { "User-Agent": "MunichMonksApp/1.0", Accept: "text/calendar,*/*" }, signal: ac.signal });
      clearTimeout(to);
      const text = await r.text();
      if (!r.ok || !text.includes("BEGIN:VCALENDAR"))
        return fail(502, "bad_feed", "SpielerPlus hat keinen Kalender geliefert. Prüfe deinen Link im Konto.", "SpielerPlus didn't return a calendar. Check your link in your account.");
      return new Response(text, { headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "private, no-store" } });
    } catch (e) {
      return fail(502, "unreachable", "SpielerPlus ist gerade nicht erreichbar.", "SpielerPlus can't be reached right now.");
    }
  }

  /* ---------- Router ---------- */
  async fetch(request) {
    const url = new URL(request.url), p = url.pathname, m = request.method;
    if (m !== "GET" && m !== "HEAD") {
      // Schutz gegen Anfragen von fremden Seiten
      const o = request.headers.get("Origin");
      if (o && o !== url.origin) return fail(403, "bad_origin", "Ungültige Herkunft.", "Invalid origin.");
    }
    this.cleanup();
    const me = this.currentUser(request);
    try {
      /* ----- Anmeldung ----- */
      if (p === "/api/auth/register/options" && m === "POST") {
        const { username } = await body(request);
        const name = str(username, 40).toLowerCase();
        if (!USERNAME_RE.test(name)) return fail(400, "bad_username", "Username: 3–24 Zeichen, nur a–z, 0–9, Punkt, Strich und Unterstrich.", "Username: 3–24 characters, only a–z, 0–9, dot, dash and underscore.");
        if (this.row("SELECT 1 AS x FROM users WHERE username = ?", name)) return fail(409, "taken", "Dieser Username ist schon vergeben.", "This username is already taken.");
        const user = { id: randomId(), username: name, nickname: "" };
        const options = await this.registrationOptions(url, user);
        return json({ flowId: this.saveChallenge(options.challenge, { kind: "register", userId: user.id, username: name }), options });
      }
      if (p === "/api/auth/register/verify" && m === "POST") {
        const { flowId, response, lang } = await body(request);
        const flow = this.takeChallenge(flowId);
        if (!flow || flow.kind !== "register") return fail(400, "expired", "Das hat zu lange gedauert – bitte nochmal.", "That took too long – please try again.");
        if (this.row("SELECT 1 AS x FROM users WHERE username = ?", flow.username)) return fail(409, "taken", "Dieser Username ist schon vergeben.", "This username is already taken.");
        const cred = await this.verifyRegistration(url, flow, response);
        if (!cred) return fail(400, "verify_failed", "Der Passkey konnte nicht bestätigt werden.", "The passkey couldn't be verified.");
        const first = this.row("SELECT COUNT(*) AS n FROM users").n === 0;
        this.sql.exec("INSERT INTO users (id, username, is_admin, lang, created_at) VALUES (?, ?, ?, ?, ?)",
          flow.userId, flow.username, first ? 1 : 0, LANGS.includes(lang) ? lang : "", now());
        this.storeCredential(flow.userId, cred);
        return this.startSession(flow.userId, url, { firstAdmin: first });
      }
      if (p === "/api/auth/login/options" && m === "POST") {
        const options = await generateAuthenticationOptions({ rpID: url.hostname, userVerification: "preferred" });
        return json({ flowId: this.saveChallenge(options.challenge, { kind: "login" }), options });
      }
      if (p === "/api/auth/login/verify" && m === "POST") {
        const { flowId, response } = await body(request);
        const flow = this.takeChallenge(flowId);
        if (!flow || flow.kind !== "login") return fail(400, "expired", "Das hat zu lange gedauert – bitte nochmal.", "That took too long – please try again.");
        const c = this.row("SELECT * FROM credentials WHERE id = ?", String(response?.id || ""));
        if (!c) return fail(404, "unknown_passkey", "Diesen Passkey kennen wir nicht. Registriere dich zuerst oder verbinde dein Gerät mit einem Code.",
          "We don't know this passkey. Sign up first or connect your device with a code.");
        const { rpID, origin } = this.rp(url);
        let v;
        try {
          v = await verifyAuthenticationResponse({
            response, expectedChallenge: flow.challenge, expectedOrigin: origin, expectedRPID: rpID, requireUserVerification: false,
            credential: { id: c.id, publicKey: fromB64u(c.public_key), counter: c.counter, transports: JSON.parse(c.transports) },
          });
        } catch (e) { v = null; }
        if (!v || !v.verified) return fail(400, "verify_failed", "Anmeldung fehlgeschlagen.", "Sign-in failed.");
        this.sql.exec("UPDATE credentials SET counter = ? WHERE id = ?", v.authenticationInfo.newCounter, c.id);
        return this.startSession(c.user_id, url);
      }
      if (p === "/api/auth/logout" && m === "POST") {
        const t = getCookie(request, COOKIE);
        if (t) this.sql.exec("DELETE FROM sessions WHERE token = ?", t);
        return json({ ok: true }, 200, { "Set-Cookie": sessionCookie("", url, 0) });
      }
      // Weiteres Gerät verbinden: Username + 6-stelliger Code → neuer Passkey für bestehendes Konto
      if (p === "/api/auth/code/options" && m === "POST") {
        const { username, code } = await body(request);
        const u = this.row("SELECT * FROM users WHERE username = ?", str(username, 40).toLowerCase());
        const lc = u && this.row("SELECT * FROM link_codes WHERE user_id = ? AND expires > ?", u.id, now());
        const bad = () => fail(400, "bad_code", "Username oder Code stimmt nicht (oder der Code ist abgelaufen).", "Username or code is wrong (or the code has expired).");
        if (!lc) return bad();
        if (lc.tries >= 5) { this.sql.exec("DELETE FROM link_codes WHERE user_id = ?", u.id); return fail(429, "too_many", "Zu viele Versuche – bitte einen neuen Code erstellen.", "Too many attempts – please create a new code."); }
        if (str(code, 10).replace(/\D/g, "") !== lc.code) { this.sql.exec("UPDATE link_codes SET tries = tries + 1 WHERE user_id = ?", u.id); return bad(); }
        const options = await this.registrationOptions(url, u);
        return json({ flowId: this.saveChallenge(options.challenge, { kind: "link", userId: u.id }), options });
      }
      if (p === "/api/auth/code/verify" && m === "POST") {
        const { flowId, response } = await body(request);
        const flow = this.takeChallenge(flowId);
        if (!flow || flow.kind !== "link") return fail(400, "expired", "Das hat zu lange gedauert – bitte nochmal.", "That took too long – please try again.");
        const cred = await this.verifyRegistration(url, flow, response);
        if (!cred) return fail(400, "verify_failed", "Der Passkey konnte nicht bestätigt werden.", "The passkey couldn't be verified.");
        this.storeCredential(flow.userId, cred);
        this.sql.exec("DELETE FROM link_codes WHERE user_id = ?", flow.userId);
        return this.startSession(flow.userId, url);
      }

      /* ----- Ergebnisse lesen (alle, auch ohne Konto) ----- */
      if (p === "/api/results" && m === "GET") {
        return json({ results: this.rows("SELECT * FROM results ORDER BY date DESC, updated_at DESC").map(r => ({
          id: r.id, ...JSON.parse(r.data), createdBy: r.created_by, updatedByName: this.nameOf(r.updated_by), updatedAt: r.updated_at,
        })) });
      }

      /* ----- ab hier nur angemeldet ----- */
      if (p === "/api/me" && m === "GET") return json({ user: this.publicUser(me, true) });
      if (!me) return fail(401, "login", "Bitte zuerst anmelden.", "Please sign in first.");

      /* ----- Eigenes Profil ----- */
      if (p === "/api/me" && m === "PUT") {
        const b = await body(request);
        const cur = this.publicUser(me, true);
        const positions = b.positions === undefined ? cur.positions
          : [...new Set((Array.isArray(b.positions) ? b.positions : []).map(Number).filter(n => POSITIONS.includes(n)))].sort((a, c) => a - c);
        const year = b.joinedYear === undefined ? me.joined_year : int(b.joinedYear, FOUNDED, new Date().getUTCFullYear());
        const lang = b.lang === undefined ? me.lang : (LANGS.includes(b.lang) ? b.lang : "");
        this.sql.exec("UPDATE users SET nickname = ?, pronouns = ?, positions = ?, joined_year = ?, lang = ? WHERE id = ?",
          b.nickname === undefined ? me.nickname : str(b.nickname, 40), b.pronouns === undefined ? me.pronouns : str(b.pronouns, 30),
          JSON.stringify(positions), year, lang, me.id);
        return json({ user: this.publicUser(this.row("SELECT * FROM users WHERE id = ?", me.id), true) });
      }
      if (p === "/api/me/calendar" && m === "PUT") {
        const { url: raw } = await body(request);
        if (!str(raw, 10)) { this.sql.exec("UPDATE users SET ics_url = '' WHERE id = ?", me.id); return json({ ok: true, calendarUrl: "" }); }
        const clean = cleanCalendarUrl(raw, this.env);
        if (!clean) return fail(400, "bad_link", "Das ist kein SpielerPlus-Kalenderlink. Er beginnt mit https://www.spielerplus.de/ (oder webcal://).",
          "That's not a SpielerPlus calendar link. It starts with https://www.spielerplus.de/ (or webcal://).");
        this.sql.exec("UPDATE users SET ics_url = ? WHERE id = ?", clean, me.id);
        return json({ ok: true, calendarUrl: clean });
      }
      if (p === "/api/me" && m === "DELETE") {
        if (me.is_admin && this.row("SELECT COUNT(*) AS n FROM users WHERE is_admin = 1").n === 1 && this.row("SELECT COUNT(*) AS n FROM users").n > 1)
          return fail(400, "last_admin", "Du bist die einzige Admin-Person. Gib zuerst jemand anderem Admin-Rechte.", "You're the only admin. Make someone else an admin first.");
        this.deleteUser(me.id);
        return json({ ok: true }, 200, { "Set-Cookie": sessionCookie("", url, 0) });
      }
      if (p === "/api/me/code" && m === "POST") return json(this.makeCode(me.id));

      /* ----- Kalender & Team-Zuordnung ----- */
      if (p === "/api/ics" && m === "GET") return this.calendar(me);
      if (p === "/api/event-teams" && m === "GET") {
        return json({ teams: this.rows("SELECT key, alt, team FROM event_teams") });
      }
      if (p === "/api/event-teams" && m === "PUT") {
        const b = await body(request);
        const key = str(b.key, 300), alt = str(b.alt, 300);
        if (!key) return fail(400, "invalid", "Termin fehlt.", "Event missing.");
        if (!EVENT_TEAMS.includes(b.team)) { this.sql.exec("DELETE FROM event_teams WHERE key = ? OR (alt <> '' AND alt = ?)", key, alt); return json({ ok: true }); }
        this.sql.exec("DELETE FROM event_teams WHERE alt <> '' AND alt = ? AND key <> ?", alt, key);
        this.sql.exec("INSERT OR REPLACE INTO event_teams (key, alt, team, updated_by, updated_at) VALUES (?, ?, ?, ?, ?)", key, alt, b.team, me.id, now());
        return json({ ok: true });
      }

      /* ----- Mitglieder ----- */
      if (p === "/api/members" && m === "GET") {
        return json({ members: this.rows("SELECT * FROM users ORDER BY COALESCE(NULLIF(nickname, ''), username) COLLATE NOCASE").map(u => this.publicUser(u)) });
      }
      const mm = p.match(/^\/api\/members\/([A-Za-z0-9_-]+)(\/code|\/admin)?$/);
      if (mm) {
        if (!me.is_admin) return fail(403, "admin", "Nur für Admins.", "Admins only.");
        const target = this.row("SELECT * FROM users WHERE id = ?", mm[1]);
        if (!target) return fail(404, "not_found", "Mitglied nicht gefunden.", "Member not found.");
        if (mm[2] === "/code" && m === "POST") return json(this.makeCode(target.id));
        if (mm[2] === "/admin" && m === "POST") {
          const { admin } = await body(request);
          if (!admin && target.id === me.id) return fail(400, "self", "Du kannst dir die Admin-Rechte nicht selbst nehmen.", "You can't remove your own admin rights.");
          this.sql.exec("UPDATE users SET is_admin = ? WHERE id = ?", admin ? 1 : 0, target.id);
          return json({ ok: true });
        }
        if (!mm[2] && m === "DELETE") {
          if (target.id === me.id) return fail(400, "self", "Dein eigenes Konto löschst du im Konto-Tab.", "Delete your own account in the Account tab.");
          this.deleteUser(target.id);
          return json({ ok: true });
        }
      }

      /* ----- Ergebnisse schreiben (alle angemeldeten Mitglieder) ----- */
      const rm = p.match(/^\/api\/results(?:\/([A-Za-z0-9_-]+))?$/);
      if (rm && m !== "GET") {
        const existing = rm[1] ? this.row("SELECT * FROM results WHERE id = ?", rm[1]) : null;
        if (rm[1] && !existing) return fail(404, "not_found", "Eintrag nicht gefunden.", "Entry not found.");
        if (m === "DELETE" && existing) {
          if (!me.is_admin && existing.created_by !== me.id)
            return fail(403, "not_allowed", "Löschen dürfen nur Admins und die Person, die den Eintrag erstellt hat.", "Only admins and the person who created the entry can delete it.");
          this.sql.exec("DELETE FROM results WHERE id = ?", existing.id); return json({ ok: true });
        }
        if ((m === "POST" && !rm[1]) || (m === "PUT" && existing)) {
          const d = this.cleanResult(await body(request));
          if (d.error) return fail(400, "invalid", d.error[0], d.error[1]);
          const id = existing ? existing.id : randomId(9);
          this.sql.exec("INSERT OR REPLACE INTO results (id, date, data, updated_at, updated_by, created_by) VALUES (?, ?, ?, ?, ?, ?)",
            id, d.date, JSON.stringify(d), now(), me.id, existing ? existing.created_by : me.id);
          return json({ result: { id, ...d } });
        }
      }
      return fail(404, "not_found", "Unbekannte Adresse.", "Unknown address.");
    } catch (e) {
      console.error(e);
      return fail(500, "server", "Da ist etwas schiefgelaufen.", "Something went wrong.");
    }
  }

  makeCode(userId) {
    const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1e6).padStart(6, "0");
    const expires = now() + 15 * 6e4;
    this.sql.exec("INSERT OR REPLACE INTO link_codes (user_id, code, expires, tries) VALUES (?, ?, ?, 0)", userId, code, expires);
    return { code, expires };
  }
  deleteUser(id) {
    for (const t of ["credentials", "sessions", "link_codes"]) this.sql.exec(`DELETE FROM ${t} WHERE user_id = ?`, id);
    this.sql.exec("DELETE FROM users WHERE id = ?", id);
  }
  // Ein Spiel: mode "score" (Spielstand), "outcome" (nur Sieg/Unentschieden/Niederlage) oder "open" (noch kein Ergebnis)
  cleanGame(g) {
    const us = int(g.us, 0, 999), them = int(g.them, 0, 999);
    let mode = ["score", "outcome", "open"].includes(g.mode) ? g.mode : (us !== null || them !== null ? "score" : "open");
    const out = { opponent: str(g.opponent, 60), mode, us: null, them: null, outcome: "", note: str(g.note, 120) };
    if (mode === "score") {
      if (us === null || them === null) out.mode = "open";
      else { out.us = us; out.them = them; out.outcome = us > them ? "w" : us < them ? "l" : "d"; }
    } else if (mode === "outcome") {
      if (["w", "d", "l"].includes(g.outcome)) out.outcome = g.outcome; else out.mode = "open";
    }
    return out;
  }
  cleanResult(b) {
    const date = str(b.date, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: ["Bitte ein Datum angeben.", "Please enter a date."] };
    const kind = KINDS.includes(b.kind) ? b.kind : "spieltag";
    const games = (Array.isArray(b.games) ? b.games : []).slice(0, 20).map(g => this.cleanGame(g || {}))
      .filter(g => g.opponent || g.mode !== "open");
    if (!games.length) return { error: ["Bitte mindestens ein Spiel eintragen.", "Please add at least one game."] };
    if (games.some(g => !g.opponent)) return { error: ["Bitte bei jedem Spiel den Gegner eintragen.", "Please enter the opponent for every game."] };
    return {
      date, kind, team: TEAMS.includes(b.team) ? b.team : "", title: str(b.title, 80), location: str(b.location, 100),
      placement: kind === "turnier" ? str(b.placement, 40) : "", notes: str(b.notes, 500), games,
    };
  }
}
