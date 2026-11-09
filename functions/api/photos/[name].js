// PUT    /api/photos/:name  – Foto setzen (Body = data:image/…-URL)
// DELETE /api/photos/:name  – Foto entfernen
// Geschützt über das Secret ADMIN_TOKEN (Header X-Admin-Token).
const MAX_BYTES = 400_000;

function authorized(request, env) {
  const t = request.headers.get("X-Admin-Token") || "";
  return env.ADMIN_TOKEN && t.length === env.ADMIN_TOKEN.length && t === env.ADMIN_TOKEN;
}

async function update(env, name, value) {
  const all = JSON.parse((await env.PHOTOS.get("all")) || "{}");
  // null = Foto bewusst entfernt (überschreibt auch ein fest eingebautes Foto)
  all[name] = value;
  await env.PHOTOS.put("all", JSON.stringify(all));
}

export async function onRequest({ request, env, params }) {
  if (!env.PHOTOS) return new Response("KV-Bindung PHOTOS fehlt", { status: 500 });
  if (!authorized(request, env)) return new Response("Nicht erlaubt", { status: 401 });
  const name = String(params.name || "").slice(0, 60);
  if (!name) return new Response("Name fehlt", { status: 400 });

  if (request.method === "PUT") {
    const body = await request.text();
    if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(body) || body.length > MAX_BYTES) {
      return new Response("Ungültiges Bild", { status: 400 });
    }
    await update(env, name, body);
    return new Response("ok");
  }
  if (request.method === "DELETE") {
    await update(env, name, null);
    return new Response("ok");
  }
  return new Response("Methode nicht erlaubt", { status: 405 });
}
