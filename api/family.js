// GET /api/family -> the whole tree (only for people who know the family password, or editors)
import { json, loadDoc, handler, requireViewer } from "../lib/server.js";

export const GET = handler(async (request) => {
  requireViewer(request);
  return json(await loadDoc());
});
