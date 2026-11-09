// POST /api/edit/change { op: "add" | "update" | "delete", ... } (editors only)
import { json, fail, requireEditor, requireSameSite, mutate, applyOp, deletePhoto, handler } from "../../lib/server.js";

export const POST = handler(async (request) => {
  requireSameSite(request);
  const editor = requireEditor(request);
  let op;
  try { op = await request.json(); } catch { return fail("The change could not be read."); }
  const result = await mutate(editor.name, (doc) => applyOp(doc, op));
  // Removing a person also removes the photo uploaded for them.
  const photo = result.removed && String(result.removed.photo || "");
  if ((op.op === "delete" || op.op === "merge") && photo && photo.startsWith("/api/photo?key=")) await deletePhoto(photo.slice(15));
  return json({ id: result.id, message: result.summary, doc: result.doc });
});
