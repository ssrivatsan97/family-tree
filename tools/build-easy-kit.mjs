// Builds the offline "Easy kit" (no server, no database) from this repo's current code.
//
//   node tools/build-easy-kit.mjs        ->  dist/family-tree-easy-kit/
//
// GitHub runs this automatically (see .github/workflows/easy-kit.yml), so you can also
// download the kit from the repo's Actions tab without installing anything.
// No packages needed: only Node.js.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "dist", "family-tree-easy-kit");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const write = (p, text) => fs.writeFileSync(path.join(out, p), text);

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, "photos"), { recursive: true });

// 1. The page: the same index.html as the website, plus three scripts loaded first.
const marker = "<script>\n(async function () {";
let html = read("public/index.html");
if (!html.includes(marker)) throw new Error("Could not find the main script in public/index.html");
html = html.replace(marker,
  '<script src="family-data.js"></script>\n<script src="family-tree-rules.js"></script>\n<script src="easy-kit.js"></script>\n' + marker);
write("index.html", html);

// 2. The rules (add / edit / merge / remove), turned into a plain script that works when double-clicked.
let rules = read("lib/rules.js");
if (/^\s*import\s/m.test(rules)) throw new Error("lib/rules.js must not import other files");
rules = rules.replace(/^export\s+/gm, "");
write("family-tree-rules.js",
  "/* Family tree rules (built from lib/rules.js, do not edit here) */\n" +
  "window.FamilyRules = (function () {\n" + rules + "\nreturn { applyOp, UserError };\n})();\n");

// 3. The in-browser stand-in for the server.
write("easy-kit.js", read("easy-kit/easy-kit.js"));

// 4. Starting data: the sample family from lib/seed-data.js.
const seed = (await import(pathToFileURL(path.join(root, "lib/seed-data.js")).href)).default;
const lines = seed.people.map((p) => "    " + JSON.stringify(p)).join(",\n");
write("family-data.js", `/* =====================================================================
   FAMILY TREE DATA: starts with a made-up sample family.
   ---------------------------------------------------------------------
   Easiest way to change it: double-click index.html, tap a person, then use
   "Make changes". Press "Save family file" when you're done and put the
   saved family-data.js in this folder (replacing this one).
   ===================================================================== */

window.FAMILY_DATA = {
  title: ${JSON.stringify(seed.title || "Our Family Tree")},

  people: [
${lines}
  ]
};
`);

// 5. Guide, photos folder, and "don't list in search engines" settings for Netlify.
write("START-HERE.html", read("easy-kit/START-HERE.html"));
write(path.join("photos", "PUT_PHOTOS_HERE.txt"),
  "Optional: put pictures here (e.g. grandma.jpg). Photos added on the page are stored inside family-data.js instead.\n");
write("robots.txt", read("public/robots.txt"));
write("_headers", "/*\n  X-Robots-Tag: noindex, nofollow, noarchive, nosnippet, noimageindex\n  Referrer-Policy: no-referrer\n");

const built = new Date().toISOString().slice(0, 10);
const commit = (process.env.GITHUB_SHA || "").slice(0, 7);
write("VERSION.txt", `Family tree Easy kit, built ${built}${commit ? ` from commit ${commit}` : ""}.\n`);
console.log(`Easy kit built ${built}${commit ? ` (commit ${commit})` : ""}: ${path.relative(root, out)}/`);
for (const f of fs.readdirSync(out)) console.log("  " + f);
