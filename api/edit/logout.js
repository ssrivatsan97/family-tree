// POST /api/edit/logout -> signs this device out
import { json, handler, clearCookie } from "../../lib/server.js";

export const POST = handler(async () => json({ ok: true }, 200, { "set-cookie": clearCookie() }));
