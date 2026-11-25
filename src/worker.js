// Einstiegspunkt für Cloudflare Workers.
// Läuft nur für /api/* (siehe run_worker_first in wrangler.jsonc) – alles andere liefert Cloudflare direkt aus public/.
export { MonksDB } from "./db.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Kalender (pro Person), Konten, Profile, Mitglieder, Team-Zuordnungen, Ergebnisse → Datenbank (Durable Object)
    if (/^\/api\/(ics|auth|me|members|results|event-teams)(\/|$)/.test(url.pathname)) {
      const db = env.DB.get(env.DB.idFromName("main"));
      return db.fetch(request);
    }

    if (url.pathname.startsWith("/api/")) return new Response("Not found", { status: 404 });
    return env.ASSETS.fetch(request);
  },
};
