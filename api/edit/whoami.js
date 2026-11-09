// GET /api/edit/whoami -> { name } of the signed-in editor
import { json, requireEditor, handler } from "../../lib/server.js";

export const GET = handler(async (request) => json({ name: requireEditor(request).name }));
