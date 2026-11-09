// GET /api/photos – alle gespeicherten Team-Fotos als { "Name": "data:image/jpeg;base64,…" }
// Benötigt eine KV-Bindung namens PHOTOS (siehe README).
export async function onRequestGet({ env }) {
  if (!env.PHOTOS) return Response.json({});
  const raw = await env.PHOTOS.get("all");
  return new Response(raw || "{}", {
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}
