// GET /api/photo?key=... -> a photo uploaded from the website (family password needed)
import { getPhoto, handler, requireViewer } from "../lib/server.js";

export const GET = handler(async (request) => {
  requireViewer(request);
  const key = new URL(request.url).searchParams.get("key") || "";
  const photo = key ? await getPhoto(key) : null;
  if (!photo) return new Response("Not found", { status: 404 });
  return new Response(photo.bytes, {
    headers: {
      "content-type": photo.type, "cache-control": "private, max-age=31536000, immutable",
      "x-robots-tag": "noindex, noimageindex", "x-content-type-options": "nosniff",
    },
  });
});
