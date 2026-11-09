// GET /api/family -> the whole tree (public: anyone with the link can view)
import { json, loadDoc, handler } from "../lib/server.js";

export const GET = handler(async () => json(await loadDoc()));
