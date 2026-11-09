// GET /api/ics – reicht den SpielerPlus-Kalender (ICS) durch, damit der Browser ihn ohne CORS-Probleme laden kann.
// Optional: Umgebungsvariable ICS_URL im Cloudflare-Dashboard setzen (überschreibt den Standard-Link).
const DEFAULT_ICS_URL = "https://www.spielerplus.de/en-gb/events/ics?t=YfmEVQ_7cX&u=wscW2YysrO";

export async function onRequestGet({ env }) {
  const url = env.ICS_URL || DEFAULT_ICS_URL;
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": "MunichMonksApp/1.0", Accept: "text/calendar,*/*" },
      cf: { cacheTtl: 600, cacheEverything: true }, // 10 Minuten bei Cloudflare zwischenspeichern
    });
    const text = await r.text();
    if (!r.ok || !text.includes("BEGIN:VCALENDAR")) {
      return new Response("Kalender nicht erreichbar", { status: 502 });
    }
    return new Response(text, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (e) {
    return new Response("Kalender nicht erreichbar", { status: 502 });
  }
}
