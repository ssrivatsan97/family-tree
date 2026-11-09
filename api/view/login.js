// POST /api/view/login { password } -> remembers on this device (for a year) that the family password was typed
import { json, fail, handler, requireSameSite, familyPassword, checkFamilyPassword, viewCookie,
         clientIp, tooManyFails, recordFail } from "../../lib/server.js";

export const POST = handler(async (request) => {
  requireSameSite(request);
  if (!familyPassword()) {
    return fail("This family tree isn't ready yet: the owner needs to set a family password (FAMILY_PASSWORD).", 503);
  }
  const who = "view:" + clientIp(request);
  if (await tooManyFails(who)) return fail("Too many wrong passwords. Please wait 15 minutes and try again.", 429);
  let body = {};
  try { body = await request.json(); } catch {}
  if (!checkFamilyPassword(body.password)) {
    await recordFail(who);
    return fail("That password didn't work. Please check it and try again.", 401);
  }
  return json({ ok: true }, 200, { "set-cookie": viewCookie() });
});
