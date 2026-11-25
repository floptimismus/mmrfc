/* ======================================================================
   ICS-PARSER inkl. RRULE + Zeitzonen
   ====================================================================== */
const TZ = CONFIG.TIMEZONE;
const _dtf = {};
function dtf(tz) { return _dtf[tz] || (_dtf[tz] = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })); }
function validTz(tz) { try { dtf(tz); return true; } catch (e) { return false; } }
function wallParts(t, tz = TZ) { const p = {}; for (const x of dtf(tz).formatToParts(new Date(t))) p[x.type] = x.value; return { y: +p.year, m: +p.month, d: +p.day, h: (+p.hour) % 24, mi: +p.minute, s: +p.second }; }
function tzOffset(t, tz) { const w = wallParts(t, tz); return Date.UTC(w.y, w.m - 1, w.d, w.h, w.mi, w.s) - Math.floor(t / 1000) * 1000; }
function zonedToUtc(f, tz) {
  const guess = Date.UTC(f.y, f.m - 1, f.d, f.h || 0, f.mi || 0, f.s || 0);
  const o1 = tzOffset(guess, tz); let t = guess - o1;
  const o2 = tzOffset(t, tz); if (o2 !== o1) t = guess - o2;
  return t;
}
const unesc = s => s.replace(/\\n/gi, "\n").replace(/\\([,;\\])/g, "$1").trim();
function parseDateVal(val, params = {}) {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/.exec(String(val).trim());
  if (!m) return null;
  const f = { y: +m[1], m: +m[2], d: +m[3], h: +(m[4] || 0), mi: +(m[5] || 0), s: +(m[6] || 0) };
  let tz = params.TZID || null; if (tz && !validTz(tz)) tz = TZ;
  return { f, allDay: !m[4] || params.VALUE === "DATE", utc: !!m[7], tz: m[7] ? "UTC" : (tz || TZ) };
}
function toInstant(dv) { return dv.utc ? Date.UTC(dv.f.y, dv.f.m - 1, dv.f.d, dv.f.h, dv.f.mi, dv.f.s) : zonedToUtc(dv.f, dv.tz); }
function parseDuration(v) {
  const m = /^([+-])?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(v.trim()); if (!m) return null;
  const ms = (((+m[2] || 0) * 7 + (+m[3] || 0)) * 86400 + (+m[4] || 0) * 3600 + (+m[5] || 0) * 60 + (+m[6] || 0)) * 1000;
  return m[1] === "-" ? -ms : ms;
}
const WD = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
function parseRRule(v) {
  const r = {};
  for (const part of v.split(";")) {
    const [k, val] = part.split("="); if (!val) continue;
    switch (k.toUpperCase()) {
      case "FREQ": r.freq = val.toUpperCase(); break;
      case "INTERVAL": r.interval = Math.max(1, +val); break;
      case "COUNT": r.count = +val; break;
      case "UNTIL": r.until = parseDateVal(val); break;
      case "WKST": r.wkst = WD[val.toUpperCase()]; break;
      case "BYDAY": r.byday = val.split(",").map(s => { const mm = /^([+-]?\d+)?([A-Z]{2})$/i.exec(s.trim()); return mm ? { n: mm[1] ? +mm[1] : 0, wd: WD[mm[2].toUpperCase()] } : null; }).filter(Boolean); break;
      case "BYMONTHDAY": r.bymonthday = val.split(",").map(Number); break;
      case "BYSETPOS": r.bysetpos = val.split(",").map(Number); break;
    }
  }
  return r;
}
function parseLine(line) {
  let i = 0, q = false;
  for (; i < line.length; i++) { const c = line[i]; if (c === '"') q = !q; else if (c === ":" && !q) break; }
  const head = line.slice(0, i), value = line.slice(i + 1);
  const parts = head.split(";"); const name = parts.shift().toUpperCase();
  const params = {};
  for (const p of parts) { const k = p.indexOf("="); if (k > 0) params[p.slice(0, k).toUpperCase()] = p.slice(k + 1).replace(/^"|"$/g, ""); }
  return { name, params, value };
}
function parseICS(text) {
  const lines = text.replace(/\r\n?/g, "\n").replace(/\n[ \t]/g, "").split("\n");
  const evs = []; let cur = null, depth = 0;
  for (const raw of lines) {
    if (!raw.trim()) continue;
    const { name, params, value } = parseLine(raw);
    if (name === "BEGIN") { if (value.trim().toUpperCase() === "VEVENT") { cur = { exdates: [] }; depth = 0; } else if (cur) depth++; continue; }
    if (name === "END") { if (value.trim().toUpperCase() === "VEVENT") { if (cur) evs.push(cur); cur = null; } else if (cur && depth) depth--; continue; }
    if (!cur || depth) continue;
    switch (name) {
      case "SUMMARY": cur.summary = unesc(value); break;
      case "DESCRIPTION": cur.description = unesc(value); break;
      case "LOCATION": cur.location = unesc(value); break;
      case "UID": cur.uid = value.trim(); break;
      case "STATUS": cur.status = value.trim().toUpperCase(); break;
      case "CATEGORIES": cur.categories = unesc(value); break;
      case "URL": cur.url = value.trim(); break;
      case "DTSTART": cur.dtstart = parseDateVal(value, params); break;
      case "DTEND": cur.dtend = parseDateVal(value, params); break;
      case "DURATION": cur.duration = parseDuration(value); break;
      case "RRULE": cur.rrule = parseRRule(value); break;
      case "EXDATE": for (const v of value.split(",")) { const d = parseDateVal(v, params); if (d) cur.exdates.push(d); } break;
      case "RECURRENCE-ID": cur.recurrenceId = parseDateVal(value, params); break;
    }
  }
  return evs;
}
function* rruleInstants(dv, r, to) {
  const DAY = 864e5;
  const tz = dv.utc ? TZ : dv.tz;
  const startT = toInstant(dv);
  const w = dv.utc ? wallParts(startT, TZ) : dv.f;
  let until = Infinity;
  if (r.until) until = toInstant(r.until) + (r.until.allDay ? DAY - 1 : 0);
  const d0 = Date.UTC(w.y, w.m - 1, w.d);
  const interval = r.interval || 1;
  let count = 0;
  for (let period = 0; period < 3000; period++) {
    let c = [];
    if (r.freq === "DAILY") c = [d0 + period * interval * DAY];
    else if (r.freq === "WEEKLY") {
      const wk = r.wkst ?? 1, dow0 = new Date(d0).getUTCDay();
      const ws = d0 - ((dow0 - wk + 7) % 7) * DAY + period * interval * 7 * DAY;
      const days = r.byday && r.byday.length ? r.byday.map(b => b.wd) : [dow0];
      c = days.map(wd => ws + ((wd - wk + 7) % 7) * DAY);
    } else if (r.freq === "MONTHLY") {
      const tot = (w.m - 1) + period * interval, y = w.y + Math.floor(tot / 12), m = tot % 12;
      const dim = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
      if (r.bymonthday && r.bymonthday.length) c = r.bymonthday.map(n => n > 0 ? n : dim + n + 1).filter(n => n >= 1 && n <= dim).map(n => Date.UTC(y, m, n));
      else if (r.byday && r.byday.length) {
        for (const b of r.byday) {
          const all = []; for (let dd = 1; dd <= dim; dd++) if (new Date(Date.UTC(y, m, dd)).getUTCDay() === b.wd) all.push(Date.UTC(y, m, dd));
          if (b.n) { const x = b.n > 0 ? all[b.n - 1] : all[all.length + b.n]; if (x != null) c.push(x); } else c.push(...all);
        }
        if (r.bysetpos && r.bysetpos.length) { c.sort((a, b) => a - b); c = r.bysetpos.map(p => p > 0 ? c[p - 1] : c[c.length + p]).filter(x => x != null); }
      } else if (w.d <= dim) c = [Date.UTC(y, m, w.d)];
    } else if (r.freq === "YEARLY") {
      const y = w.y + period * interval, dt = Date.UTC(y, w.m - 1, w.d);
      if (new Date(dt).getUTCDate() === w.d) c = [dt];
    } else { yield startT; return; }
    c.sort((a, b) => a - b);
    for (const ds of c) {
      if (ds < d0) continue;
      const D = new Date(ds);
      const t = zonedToUtc({ y: D.getUTCFullYear(), m: D.getUTCMonth() + 1, d: D.getUTCDate(), h: dv.allDay ? 0 : w.h, mi: dv.allDay ? 0 : w.mi, s: dv.allDay ? 0 : w.s }, tz);
      if (t < startT) continue;
      if (t > until) return;
      if (r.count && count >= r.count) return;
      count++;
      if (t > to) return;
      yield t;
    }
  }
}
function expandEvents(raw, from, to) {
  const out = [], overrides = new Map();
  for (const e of raw) if (e.recurrenceId && e.uid) { const s = overrides.get(e.uid) || new Set(); s.add(toInstant(e.recurrenceId)); overrides.set(e.uid, s); }
  for (const e of raw) {
    if (!e.dtstart) continue;
    const start = toInstant(e.dtstart);
    let dur = e.dtend ? toInstant(e.dtend) - start : (e.duration != null ? e.duration : (e.dtstart.allDay ? 864e5 : 0));
    if (dur < 0) dur = 0;
    if (!e.rrule || e.recurrenceId) { if (start + dur >= from && start <= to) out.push(makeEvent(e, start, dur)); continue; }
    const ex = new Set(e.exdates.map(toInstant)), ov = overrides.get(e.uid);
    for (const t of rruleInstants(e.dtstart, e.rrule, to)) {
      if (ex.has(t) || (ov && ov.has(t)) || t + dur < from) continue;
      out.push(makeEvent(e, t, dur));
    }
  }
  return out.sort((a, b) => a.start - b.start);
}
