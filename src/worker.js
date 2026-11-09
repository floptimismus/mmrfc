// Einstiegspunkt für Cloudflare Workers.
// Läuft nur für /api/* (siehe run_worker_first in wrangler.jsonc) – alles andere liefert Cloudflare direkt aus public/.
import { onRequestGet as getIcs } from "../functions/api/ics.js";
export { MonksDB } from "./db.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/ics") {
      if (request.method !== "GET") return new Response("Methode nicht erlaubt", { status: 405 });
      return getIcs({ request, env, ctx });
    }

    // Fotos sind vorerst nicht eingerichtet: leere Liste, damit die App normal weiterläuft.
    if (url.pathname === "/api/photos" && request.method === "GET") {
      return Response.json({}, { headers: { "Cache-Control": "no-store" } });
    }

    // Konten, Profile, Mitglieder, Ergebnisse → Datenbank (Durable Object)
    if (/^\/api\/(auth|me|members|results)(\/|$)/.test(url.pathname)) {
      const db = env.DB.get(env.DB.idFromName("main"));
      return db.fetch(request);
    }

    if (url.pathname.startsWith("/api/")) return new Response("Nicht gefunden", { status: 404 });
    return env.ASSETS.fetch(request);
  },
};
