// POST /api/edit/login { passcode } -> signs an approved editor in for 90 days
import { json, fail, handler, findEditorByPasscode, sessionCookie, requireSameSite,
         clientIp, tooManyFails, recordFail } from "../../lib/server.js";

export const POST = handler(async (request) => {
  requireSameSite(request);
  const ip = clientIp(request);
  if (await tooManyFails(ip)) return fail("Too many wrong passcodes. Please wait 15 minutes and try again.", 429);
  let body = {};
  try { body = await request.json(); } catch {}
  const editor = findEditorByPasscode(body.passcode);
  if (!editor) {
    await recordFail(ip);
    return fail("That passcode didn't work. Please check it and try again.", 401);
  }
  return json({ name: editor.name }, 200, { "set-cookie": sessionCookie(editor) });
});
