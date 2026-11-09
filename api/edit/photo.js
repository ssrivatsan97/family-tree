// POST /api/edit/photo?id=<person id>   body = the picture (editors only)
// The page shrinks pictures before sending them, so they are small.
import { json, fail, requireEditor, requireSameSite, mutate, savePhoto, deletePhoto, UserError, handler } from "../../lib/server.js";

const TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 1.5 * 1024 * 1024;

export const POST = handler(async (request) => {
  requireSameSite(request);
  const editor = requireEditor(request);
  const id = new URL(request.url).searchParams.get("id") || "";
  const type = (request.headers.get("content-type") || "").split(";")[0].trim();
  if (!TYPES.includes(type)) return fail("Please choose a JPG, PNG or WebP picture.");
  const bytes = await request.arrayBuffer();
  if (!bytes.byteLength) return fail("The picture was empty.");
  if (bytes.byteLength > MAX_BYTES) return fail("That picture is too big. Please choose a smaller one.");

  const key = `${id.replace(/[^a-z0-9-]/gi, "").slice(0, 60) || "p"}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  await savePhoto(key, id, type, bytes);
  let oldPhoto = "";
  try {
    const result = await mutate(editor.name, (doc) => {
      const p = doc.people.find((x) => x.id === id);
      if (!p) throw new UserError("That person is no longer in the tree. Please reload the page.");
      oldPhoto = p.photo || "";
      p.photo = `/api/photo?key=${key}`;
      return { id, summary: `New photo for ${p.name || p.nickname || id}`, op: { op: "photo", id } };
    });
    if (oldPhoto.startsWith("/api/photo?key=")) await deletePhoto(oldPhoto.slice(15));
    return json({ id, message: result.summary, doc: result.doc });
  } catch (e) {
    await deletePhoto(key);
    throw e;
  }
});
