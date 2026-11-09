// Shared server code for the family tree on Vercel (Functions + Neon Postgres).
import crypto from "node:crypto";
import SEED from "./seed-data.js";
import { UserError } from "./rules.js";
export { UserError, applyOp } from "./rules.js";

// ---------------------------------------------------------------- responses
const SAFE_HEADERS = {
  "cache-control": "no-store",
  "x-robots-tag": "noindex, nofollow, noarchive, nosnippet, noimageindex",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
};
export function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status, headers: { "content-type": "application/json; charset=utf-8", ...SAFE_HEADERS, ...extra },
  });
}
export const fail = (message, status = 400, extra) => json({ error: message }, status, extra);

// Wraps a route: friendly errors instead of crashes.
export function handler(fn) {
  return async (request) => {
    try {
      return await fn(request);
    } catch (e) {
      if (e instanceof Response) return e;
      if (e instanceof UserError) return fail(e.message, 400);
      console.error(e);
      return fail(e && e.expose ? e.message : "Something went wrong on the server. Please try again.", 500);
    }
  };
}

// ---------------------------------------------------------------- database
// q(text, params) -> array of rows. Uses Neon's serverless driver over HTTPS.
let query = null;
export function useQueryForTests(fn) { query = fn; schemaReady = false; }
async function q(text, params = []) {
  if (!query) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) {
      const e = new Error("No database is connected yet (DATABASE_URL is missing). See README step 4.");
      e.expose = true; throw e;
    }
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(url);
    query = (t, p) => sql.query(t, p);
  }
  return query(text, params);
}

let schemaReady = false;
async function ensureSchema() {
  if (schemaReady) return;
  await q(`CREATE TABLE IF NOT EXISTS family (
    id INTEGER PRIMARY KEY, data TEXT NOT NULL, version INTEGER NOT NULL, updated_at TEXT, updated_by TEXT)`);
  await q(`CREATE TABLE IF NOT EXISTS photos (
    key TEXT PRIMARY KEY, person_id TEXT, content_type TEXT NOT NULL, data TEXT NOT NULL, created_at TEXT)`);
  await q(`CREATE TABLE IF NOT EXISTS changes (at TEXT NOT NULL, editor TEXT, summary TEXT, op TEXT)`);
  await q(`CREATE TABLE IF NOT EXISTS login_fails (ip TEXT NOT NULL, at BIGINT NOT NULL)`);
  schemaReady = true;
}

// { title, people, version, updatedAt, updatedBy }. Fills the database from seed-data.js on first use.
export async function loadDoc() {
  await ensureSchema();
  let rows = await q("SELECT data, version, updated_at, updated_by FROM family WHERE id = 1");
  if (!rows.length) {
    const seed = { title: SEED.title || "Family Tree", people: Array.isArray(SEED.people) ? SEED.people : [] };
    await q("INSERT INTO family (id, data, version, updated_at, updated_by) VALUES (1, $1, 0, $2, $3) ON CONFLICT (id) DO NOTHING",
      [JSON.stringify(seed), new Date().toISOString(), "starting data"]);
    rows = await q("SELECT data, version, updated_at, updated_by FROM family WHERE id = 1");
  }
  const r = rows[0], data = JSON.parse(r.data);
  return { title: data.title, people: data.people, version: Number(r.version), updatedAt: r.updated_at, updatedBy: r.updated_by };
}

// Read-modify-write with a version check; retried if two editors save at the same moment.
export async function mutate(editor, change) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const doc = await loadDoc();
    const result = await change(doc);
    const now = new Date().toISOString();
    const saved = await q(
      "UPDATE family SET data = $1, version = version + 1, updated_at = $2, updated_by = $3 WHERE id = 1 AND version = $4 RETURNING version",
      [JSON.stringify({ title: doc.title, people: doc.people }), now, editor, doc.version]);
    if (saved.length === 1) {
      await q("INSERT INTO changes (at, editor, summary, op) VALUES ($1, $2, $3, $4)",
        [now, editor, result.summary || "", JSON.stringify(result.op || null)]);
      return { ...result, doc: await loadDoc() };
    }
  }
  throw new UserError("Someone else was saving at the same time. Please try again.");
}

export async function savePhoto(key, personId, type, bytes) {
  await ensureSchema();
  await q("INSERT INTO photos (key, person_id, content_type, data, created_at) VALUES ($1, $2, $3, $4, $5)",
    [key, personId, type, Buffer.from(bytes).toString("base64"), new Date().toISOString()]);
}
export async function getPhoto(key) {
  await ensureSchema();
  const rows = await q("SELECT content_type, data FROM photos WHERE key = $1", [key]);
  return rows[0] ? { type: rows[0].content_type, bytes: Buffer.from(rows[0].data, "base64") } : null;
}
export async function deletePhoto(key) {
  await ensureSchema();
  await q("DELETE FROM photos WHERE key = $1", [key]);
}

// ---------------------------------------------------------------- editors & passcodes
// EDITORS environment variable, e.g.:  Grandma=apple-cloud-58; Alex=paper-boat-31
// (separate people with ";" or new lines). Passcodes must be at least 8 characters.
const COOKIE = "ft_editor";
const DAYS = 90;
// Signing key for sign-in cookies. SESSION_SECRET is optional: if it isn't set, a key is
// derived from the (secret) database address, so non-technical owners have one less step.
function secret() {
  const s = process.env.SESSION_SECRET || "";
  if (s.length >= 32) return s;
  if (s) {
    const e = new Error("SESSION_SECRET is too short (needs 32+ characters), or remove it to use the automatic key.");
    e.expose = true; throw e;
  }
  const db = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
  if (!db) {
    const e = new Error("No database is connected yet, so editors can't sign in. See the setup guide (Storage → Neon).");
    e.expose = true; throw e;
  }
  return crypto.createHash("sha256").update("family-tree-session-key:" + db).digest("hex");
}
const hmac = (data) => crypto.createHmac("sha256", secret()).update(data).digest();
const b64u = (buf) => Buffer.from(buf).toString("base64url");
const same = (a, b) => a.length === b.length && crypto.timingSafeEqual(a, b);

export function editorList() {
  return String(process.env.EDITORS || "")
    .split(/[;\n]/).map((s) => s.trim()).filter(Boolean)
    .map((s) => { const i = s.indexOf("="); return i > 0 ? { name: s.slice(0, i).trim(), code: s.slice(i + 1).trim() } : null; })
    .filter((e) => e && e.name && e.code.length >= 8);
}
// A short fingerprint of an editor's passcode: changing or removing the passcode signs that editor out.
const fingerprint = (code) => b64u(hmac("code:" + code)).slice(0, 16);

export function findEditorByPasscode(passcode) {
  const tried = hmac("try:" + String(passcode || "").trim());
  let found = null;
  for (const e of editorList()) if (same(hmac("try:" + e.code), tried)) found = e;   // check all, constant-ish time
  return found;
}
export function sessionCookie(editor) {
  const payload = b64u(JSON.stringify({ n: editor.name, k: fingerprint(editor.code), e: Date.now() + DAYS * 864e5 }));
  const value = `${payload}.${b64u(hmac("session:" + payload))}`;
  return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${DAYS * 86400}`;
}
export const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

export function getEditor(request) {
  const raw = (request.headers.get("cookie") || "").split(/;\s*/).find((c) => c.startsWith(COOKIE + "="));
  if (!raw) return null;
  const [payload, sig] = raw.slice(COOKIE.length + 1).split(".");
  if (!payload || !sig) return null;
  try {
    if (!same(Buffer.from(sig, "base64url"), hmac("session:" + payload))) return null;
    const { n, k, e } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!e || e < Date.now()) return null;
    const editor = editorList().find((x) => x.name === n && fingerprint(x.code) === k);
    return editor ? { name: editor.name } : null;
  } catch {
    return null;
  }
}
export function requireEditor(request) {
  const editor = getEditor(request);
  if (!editor) throw fail("Please sign in with your editor passcode.", 401);
  return editor;
}
// Saves must come from this website (stops other sites from submitting changes).
export function requireSameSite(request) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) throw fail("Not allowed.", 403);
}

// ---------------------------------------------------------------- family password (viewing)
// FAMILY_PASSWORD environment variable: one password for everyone allowed to LOOK at the tree.
// Set it in Vercel (never in this repo). Changing it signs every viewer out.
const VIEW_COOKIE = "ft_view";
const VIEW_DAYS = 365;
export function familyPassword() {
  const p = String(process.env.FAMILY_PASSWORD || "").trim();
  return p.length >= 8 ? p : "";
}
export function checkFamilyPassword(attempt) {
  const real = familyPassword();
  if (!real) return false;
  return same(hmac("try:" + String(attempt || "").trim()), hmac("try:" + real));
}
export function viewCookie() {
  const payload = b64u(JSON.stringify({ k: fingerprint(familyPassword()), e: Date.now() + VIEW_DAYS * 864e5 }));
  const value = `${payload}.${b64u(hmac("view:" + payload))}`;
  return `${VIEW_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${VIEW_DAYS * 86400}`;
}
export const clearViewCookie = () => `${VIEW_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
function hasViewCookie(request) {
  const real = familyPassword();
  if (!real) return false;
  const raw = (request.headers.get("cookie") || "").split(/;\s*/).find((c) => c.startsWith(VIEW_COOKIE + "="));
  if (!raw) return false;
  const [payload, sig] = raw.slice(VIEW_COOKIE.length + 1).split(".");
  if (!payload || !sig) return false;
  try {
    if (!same(Buffer.from(sig, "base64url"), hmac("view:" + payload))) return false;
    const { k, e } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return e > Date.now() && k === fingerprint(real);
  } catch {
    return false;
  }
}
// Family data and photos are only sent to people who typed the family password (or signed-in editors).
export function requireViewer(request) {
  if (!familyPassword()) {
    throw json({ error: "This family tree isn't ready yet: the owner needs to set a family password (FAMILY_PASSWORD).", setup: true }, 503);
  }
  if (hasViewCookie(request) || getEditor(request)) return true;
  throw json({ error: "Please type the family password.", needPassword: true }, 401);
}

// ---------------------------------------------------------------- sign-in attempts
const WINDOW_MS = 15 * 60 * 1000, MAX_FAILS = 10;
export const clientIp = (request) =>
  (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
export async function tooManyFails(ip) {
  await ensureSchema();
  const rows = await q("SELECT COUNT(*) AS n FROM login_fails WHERE ip = $1 AND at > $2", [ip, Date.now() - WINDOW_MS]);
  return Number(rows[0].n) >= MAX_FAILS;
}
export async function recordFail(ip) {
  await q("INSERT INTO login_fails (ip, at) VALUES ($1, $2)", [ip, Date.now()]);
  await q("DELETE FROM login_fails WHERE at < $1", [Date.now() - 24 * 3600 * 1000]);
}
