/* ======================================================================
   KERN: Hilfsfunktionen, Sheet, Theme, Router, Server-Anbindung
   ====================================================================== */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const store = {
  get(k, d = null) { try { const v = localStorage.getItem("mm_" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("mm_" + k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem("mm_" + k); } catch (e) {} },
};
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 2000); }
async function copyText(txt) { try { await navigator.clipboard.writeText(txt); toast(T("Kopiert ✓", "Copied ✓")); } catch (e) { toast(T("Kopieren nicht möglich", "Couldn't copy")); } }

const ICON = {
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4M12 13v5M9.5 15.5h5"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="8" y="8" width="13" height="13" rx="3"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4L3 6.5v13.5L9 17.5l6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/></svg>',
  people: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M16.5 14.6c2.6 0 4.4 1.6 5 4.4"/></svg>',
};

/* ---------- Sheet (Fenster von unten) ---------- */
function openSheet(html) { $("#sheetInner").innerHTML = html; $("#sheet").classList.add("open"); $("#sheetBg").classList.add("open"); $("#sheet").scrollTop = 0; }
function closeSheet() { $("#sheet").classList.remove("open"); $("#sheetBg").classList.remove("open"); document.dispatchEvent(new Event("sheetclosed")); }
$("#sheetBg").onclick = closeSheet; $("#sheetClose").onclick = closeSheet;
document.addEventListener("keydown", e => { if (e.key === "Escape") closeSheet(); });

/* ---------- Hell / Dunkel ---------- */
(function () {
  const t = store.get("theme", "dark"); document.documentElement.dataset.theme = t;
  $("#themeBtn").onclick = () => { const n = document.documentElement.dataset.theme === "dark" ? "light" : "dark"; document.documentElement.dataset.theme = n; store.set("theme", n); };
})();

/* ---------- Router ---------- */
const TABS = ["termine", "ergebnisse", "team", "basics", "konto"];
const onShow = {};
function showTab(name, anchor) {
  if (name === "positionen" || name === "calls") name = "basics"; // alte Links aus Version 3
  if (!TABS.includes(name)) name = "termine";
  for (const t of TABS) $("#tab-" + t).hidden = t !== name;
  $$(".tab").forEach(b => b.setAttribute("aria-selected", b.dataset.tab === name));
  if (location.hash.slice(1) !== name) { try { history.replaceState(null, "", "#" + name); } catch (e) { location.hash = name; } }
  window.scrollTo({ top: 0 });
  onShow[name] && onShow[name](anchor);
}
$$(".tab").forEach(b => b.onclick = () => showTab(b.dataset.tab));
addEventListener("hashchange", () => showTab(location.hash.slice(1)));

/* ---------- Server-Anbindung ---------- */
// Server-Meldungen kommen auf Deutsch + Englisch; Französisch/Spanisch über das Wörterbuch
const serverMsg = d => !d ? "" : LANG === "de" ? d.message : d.message_en ? (LANG === "en" ? d.message_en : tr(d.message_en)) : d.message;
async function api(path, opts = {}) {
  const r = await fetch(path, {
    method: opts.method || "GET", credentials: "same-origin", cache: "no-store",
    headers: opts.body !== undefined ? { "Content-Type": "application/json" } : {},
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  let data = {}; try { data = await r.json(); } catch (e) {}
  if (!r.ok) throw Object.assign(new Error(serverMsg(data) || T("Fehler ", "Error ") + r.status), { status: r.status, code: data.error });
  return data;
}

/* ---------- Konto-Zustand (wird in konto.js gefüllt) ---------- */
const Auth = { user: null, loaded: false, offline: false, members: null, q: "", pos: "" };
const displayName = u => (u.nickname || u.username);

/* ---------- Trikot-Avatar ---------- */
const JERSEY_D = "M-6,-14 Q0,-9 6,-14 L15,-9 L13,-1 L9,-2 L9,19 L-9,19 L-9,-2 L-13,-1 L-15,-9 Z";
function jerseyInner(label, fs = 10) {
  return `<g clip-path="url(#jc)"><rect x="-16" y="-16" width="32" height="15" fill="#ffcc00"/><rect x="-16" y="-1" width="32" height="5" fill="#fff"/><rect x="-16" y="4" width="32" height="16" fill="#000"/></g>
    <path d="${JERSEY_D}" fill="none" stroke="#000" stroke-width="1.1" stroke-linejoin="round"/>
    <text x="0" y="${12.6 + (fs - 10) * 0.3}" text-anchor="middle" font-family="Barlow Condensed,system-ui" font-weight="800" font-size="${fs}" fill="#fff">${esc(label)}</text>`;
}
const initials = (name, fallback = "?") => {
  if (name && name.trim()) return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return fallback;
};
function jerseyAvatar(label, size = 64) {
  return `<svg class="ava" viewBox="-19 -18 38 40" style="width:${size}px;height:${size}px" aria-hidden="true">${jerseyInner(label, 9.5)}</svg>`;
}
const posName = n => (POSITIONS[n] ? POSITIONS[n].en : "");
