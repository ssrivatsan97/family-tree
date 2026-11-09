/* =====================================================================
   EASY KIT: lets the family tree page work with NO server and NO database.

   - Opened from your computer (double-clicking index.html): you can make
     changes. They are kept in this browser until you press "Save family file",
     which saves a new family-data.js to put in this folder.
   - Opened from a website (e.g. Netlify): view only. Nobody can change it.

   It answers the page's requests (/api/...) right here in the browser, using
   the same rules as the online version (family-tree-rules.js).
   ===================================================================== */
(function () {
  "use strict";
  const canEdit = location.protocol === "file:";
  window.FT_EASY_KIT = { edit: canEdit };

  const DATA = window.FAMILY_DATA && Array.isArray(window.FAMILY_DATA.people)
    ? window.FAMILY_DATA : { title: "Our Family Tree", people: [] };
  const original = JSON.stringify(DATA.people);
  const hash = (str) => { let h = 5381; for (let i = 0; i < str.length; i++) h = ((h * 33) ^ str.charCodeAt(i)) >>> 0; return h.toString(36); };
  const KEY = "familyTreeEasyKit:" + hash(original);   // a new family file starts fresh

  let doc = { title: DATA.title || "Our Family Tree", people: JSON.parse(original), version: 0 };
  let unsaved = false, storageFull = false;
  if (canEdit) {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || "null");
      if (s && Array.isArray(s.people)) { doc.people = s.people; doc.version = s.version || 0; unsaved = !!s.unsaved; }
    } catch (e) { /* storage not available: changes last until the page is closed */ }
  }
  function store() {
    try { localStorage.setItem(KEY, JSON.stringify({ people: doc.people, version: doc.version, unsaved })); storageFull = false; }
    catch (e) { storageFull = true; }
  }
  const copy = () => JSON.parse(JSON.stringify(doc));
  const reply = (body, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  function commit(next) { doc = next; doc.version++; unsaved = true; store(); updateBar(); }

  // Photos are kept inside the family file, so make them small.
  async function smallPhoto(blob) {
    const bmp = await createImageBitmap(blob);
    const k = Math.min(1, 400 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(bmp.width * k)); c.height = Math.max(1, Math.round(bmp.height * k));
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.8);
  }

  const realFetch = window.fetch.bind(window);
  window.fetch = async function (input, init) {
    init = init || {};
    const url = new URL(typeof input === "string" ? input : input.url, location.href);
    if (!url.pathname.startsWith("/api/")) return realFetch(input, init);
    const path = url.pathname, method = (init.method || "GET").toUpperCase();

    if (path === "/api/family") return reply(copy());
    if (!canEdit) return reply({ error: "This copy of the family tree can only be viewed." }, 403);
    if (path === "/api/edit/whoami" || path === "/api/edit/login") return reply({ name: "you" });
    if (path === "/api/edit/logout") return reply({ ok: true });

    if (path === "/api/edit/change" && method === "POST") {
      let op;
      try { op = JSON.parse(init.body); } catch (e) { return reply({ error: "The change could not be read." }, 400); }
      const next = copy();
      try {
        const r = window.FamilyRules.applyOp(next, op);
        commit(next);
        return reply({ id: r.id, message: r.summary, doc: copy() });
      } catch (e) {
        if (e instanceof window.FamilyRules.UserError) return reply({ error: e.message }, 400);
        console.error(e);
        return reply({ error: "Something went wrong. Please try again." }, 500);
      }
    }
    if (path === "/api/edit/photo" && method === "POST") {
      const id = url.searchParams.get("id");
      const next = copy(), p = next.people.find((x) => x.id === id);
      if (!p) return reply({ error: "That person is no longer in the tree." }, 400);
      try { p.photo = await smallPhoto(init.body); }
      catch (e) { return reply({ error: "Could not read that picture. Please choose a JPG or PNG photo." }, 400); }
      commit(next);
      return reply({ id, message: "New photo", doc: copy() });
    }
    return reply({ error: "Not found" }, 404);
  };

  // ---------------------------------------------------------------- saving the family file
  function fileText() {
    const lines = doc.people.map((p) => "    " + JSON.stringify(p)).join(",\n");
    return `/* =====================================================================
   FAMILY TREE DATA (saved from the family tree page on ${new Date().toLocaleDateString()})
   ---------------------------------------------------------------------
   Keep this file in the same folder as index.html.
   The easiest way to change it is on the page itself: double-click
   index.html, tap a person, then use "Make changes", and press
   "Save family file" when you are done.
   ===================================================================== */

window.FAMILY_DATA = {
  title: ${JSON.stringify(doc.title)},

  people: [
${lines}
  ]
};
`;
  }
  async function saveFile() {
    const text = fileText();
    try {
      if (window.showSaveFilePicker) {
        const h = await window.showSaveFilePicker({ suggestedName: "family-data.js",
          types: [{ description: "Family data", accept: { "text/javascript": [".js"] } }] });
        const w = await h.createWritable(); await w.write(text); await w.close();
        saved("✓ Saved. If you saved it into this folder (replacing the old family-data.js), you're all set.");
        return;
      }
    } catch (e) { if (e && e.name === "AbortError") return; }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/javascript" }));
    a.download = "family-data.js";
    document.body.appendChild(a); a.click(); a.remove();
    saved("✓ Downloaded “family-data.js”. Move it into this family tree folder and replace the old one.");
  }
  function saved(msg) { unsaved = false; store(); updateBar(msg); }

  // ---------------------------------------------------------------- the bar at the top
  let bar, msgEl;
  function updateBar(msg) {
    if (!bar) return;
    bar.classList.toggle("ok", !unsaved && !storageFull);
    msgEl.textContent = msg || (storageFull
      ? "⚠️ This browser's storage is full. Press “Save family file” now so your changes aren't lost."
      : unsaved
        ? "✏️ You have changes that aren't in the family file yet. Press “Save family file” when you're done."
        : "✏️ This is your own copy. Tap anyone, then “Make changes”. Press “Save family file” when you're done.");
  }
  function setup() {
    if (!canEdit) return;
    const css = document.createElement("style");
    css.textContent = "#editbar{display:none!important}";
    document.head.appendChild(css);
    bar = document.createElement("div");
    bar.className = "savebar"; bar.id = "ekbar"; bar.setAttribute("role", "status");
    msgEl = document.createElement("span"); msgEl.className = "grow";
    const save = document.createElement("button"); save.className = "btn primary"; save.type = "button";
    save.textContent = "💾 Save family file"; save.onclick = saveFile;
    const undo = document.createElement("button"); undo.className = "btn"; undo.type = "button";
    undo.textContent = "↩ Undo unsaved changes";
    let armed = null;
    undo.onclick = () => {
      if (!armed) {
        undo.textContent = "Tap again to undo ALL unsaved changes";
        armed = setTimeout(() => { armed = null; undo.textContent = "↩ Undo unsaved changes"; }, 4000);
        return;
      }
      try { localStorage.removeItem(KEY); } catch (e) {}
      unsaved = false;
      location.reload();
    };
    bar.append(msgEl, save, undo);
    const anchor = document.getElementById("statusbar");
    anchor.parentNode.insertBefore(bar, anchor);
    updateBar();
    window.addEventListener("beforeunload", (e) => { if (unsaved) { e.preventDefault(); e.returnValue = ""; } });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setup); else setup();
})();
