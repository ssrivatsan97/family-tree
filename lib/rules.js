// Validation and the tree changes (add / update / delete). Shared by the API routes.
export class UserError extends Error {}

// ---------------------------------------------------------------- validation
const clean = (v, max) => (v === undefined || v === null ? "" : String(v).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max));
// Fields the tree no longer uses. They are never saved, and are wiped from everyone on every save.
const RETIRED = ["born", "died", "location"];

function cleanGender(v) {
  const g = clean(v, 10).toUpperCase();
  return g === "M" || g === "F" ? g : "";
}
// Only these fields can be set from the page.
function cleanFields(input, { requireName }) {
  const out = {};
  if ("name" in input || requireName) {
    out.name = clean(input.name, 100);
    if (!out.name && !clean(input.nickname, 60)) throw new UserError("Please type a name or a nickname.");
  }
  if ("nickname" in input) out.nickname = clean(input.nickname, 60);
  if ("gender" in input) out.gender = cleanGender(input.gender);
  return out;
}
function setFields(person, fields) {
  for (const [k, v] of Object.entries(fields)) {
    if (v === "" || v === undefined) delete person[k];
    else person[k] = v;
  }
}
function newId(people, name) {
  const base = clean(name, 60).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "person";
  let id = base, n = 2;
  while (people.some((p) => p.id === id)) id = `${base}-${n++}`;
  return id;
}
const label = (p) => p.name || p.nickname || "someone";
const setSpouses = (p, list) => { if (!list.length) delete p.spouse; else p.spouse = list.length === 1 ? list[0] : list; };
const spousesOf = (p) => (Array.isArray(p.spouse) ? p.spouse : p.spouse ? [p.spouse] : []);

// ---------------------------------------------------------------- changes
// op = { op: "add", relation: "child"|"partner", of: id, otherParent?: id, person: {...} }
//    | { op: "update", id, fields: {...} }
//    | { op: "delete", id }
export function applyOp(doc, op) {
  for (const p of doc.people) for (const f of RETIRED) delete p[f];
  const people = doc.people;
  const find = (id) => people.find((p) => p.id === id);
  if (!op || typeof op !== "object") throw new UserError("Nothing to change.");

  if (op.op === "add") {
    const anchor = find(op.of);
    if (!anchor) throw new UserError("That person is no longer in the tree. Please reload the page.");
    const fields = cleanFields(op.person || {}, { requireName: true });
    const person = { id: newId(people, fields.name || fields.nickname) };
    setFields(person, fields);
    if (op.relation === "child") {
      const parents = [anchor.id];
      if (op.otherParent) {
        if (!find(op.otherParent)) throw new UserError("The other parent is no longer in the tree.");
        if (op.otherParent !== anchor.id) parents.push(op.otherParent);
      }
      person.parents = parents;
    } else if (op.relation === "partner") {
      person.spouse = anchor.id;
    } else throw new UserError("Unknown kind of relative.");
    people.push(person);
    return { id: person.id, summary: `Added ${label(person)} (${op.relation} of ${label(anchor)})`, op };
  }

  if (op.op === "update") {
    const p = find(op.id);
    if (!p) throw new UserError("That person is no longer in the tree. Please reload the page.");
    const fields = cleanFields(op.fields || {}, { requireName: false });
    setFields(p, fields);
    return { id: p.id, summary: `Updated ${label(p)}: ${Object.keys(fields).join(", ")}`, op };
  }

  if (op.op === "marry" || op.op === "unmarry") {
    const a = find(op.id), b = find(op.spouse);
    if (!a || !b) throw new UserError("One of them is no longer in the tree. Please reload the page.");
    if (a.id === b.id) throw new UserError("Please choose a different person.");
    const linked = spousesOf(a).includes(b.id) || spousesOf(b).includes(a.id);
    const setSp = (p, list) => { if (!list.length) delete p.spouse; else p.spouse = list.length === 1 ? list[0] : list; };
    if (op.op === "marry") {
      if (linked) throw new UserError(`${label(a)} and ${label(b)} are already connected.`);
      const parents = (p) => (Array.isArray(p.parents) ? p.parents : []);
      if (parents(a).includes(b.id) || parents(b).includes(a.id))
        throw new UserError("A parent and child can't be connected as husband and wife. Please check you picked the right person.");
      setSp(a, [...spousesOf(a), b.id]);
      return { id: a.id, summary: `Connected ${label(a)} and ${label(b)} as husband and wife`, op };
    }
    const together = people.some((c) => Array.isArray(c.parents) && c.parents.includes(a.id) && c.parents.includes(b.id));
    if (together) throw new UserError(`${label(a)} and ${label(b)} have children together in the tree, so they stay connected.`);
    if (!linked) throw new UserError("They are not connected.");
    setSp(a, spousesOf(a).filter((x) => x !== b.id));
    setSp(b, spousesOf(b).filter((x) => x !== a.id));
    return { id: a.id, summary: `Disconnected ${label(a)} and ${label(b)}`, op };
  }

  if (op.op === "merge") {
    // Two entries for the same person: keep op.id, fold op.other into it.
    const keep = find(op.id), other = find(op.other);
    if (!keep || !other) throw new UserError("One of them is no longer in the tree. Please reload the page.");
    if (keep.id === other.id) throw new UserError("Please choose a different entry.");
    const par = (p) => (Array.isArray(p.parents) ? p.parents : []);
    if (par(keep).includes(other.id) || par(other).includes(keep.id))
      throw new UserError("A parent and child can't be merged. Please check you picked the right person.");
    const parents = [...new Set([...par(keep), ...par(other)])];
    if (parents.length > 2)
      throw new UserError(`${label(keep)} and ${label(other)} have different parents listed, so they can't be merged. Please check they are the same person.`);
    for (const k of ["name", "nickname", "gender", "photo"]) if (!keep[k] && other[k]) keep[k] = other[k];
    if (parents.length) keep.parents = parents; else delete keep.parents;
    const spouses = [...new Set([...spousesOf(keep), ...spousesOf(other)])].filter((x) => x !== keep.id && x !== other.id);
    people.splice(people.indexOf(other), 1);
    for (const p of people) {
      if (p === keep) continue;
      if (Array.isArray(p.parents)) p.parents = [...new Set(p.parents.map((x) => (x === other.id ? keep.id : x)))];
      const sp = spousesOf(p);
      if (sp.includes(other.id)) setSpouses(p, [...new Set(sp.map((x) => (x === other.id ? keep.id : x)))]);
    }
    setSpouses(keep, spouses);
    const dropped = other.photo && other.photo !== keep.photo ? other.photo : "";
    return { id: keep.id, removed: dropped ? { photo: dropped } : null, summary: `Merged ${label(other)} into ${label(keep)}`, op };
  }

  if (op.op === "delete") {
    const idx = people.findIndex((p) => p.id === op.id);
    if (idx < 0) throw new UserError("That person was already removed.");
    const [gone] = people.splice(idx, 1);
    for (const p of people) {
      if (Array.isArray(p.parents)) p.parents = p.parents.filter((x) => x !== gone.id);
      const sp = spousesOf(p).filter((x) => x !== gone.id);
      if (sp.length === 0) delete p.spouse; else p.spouse = sp.length === 1 ? sp[0] : sp;
    }
    return { id: gone.id, removed: gone, summary: `Removed ${label(gone)}`, op };
  }

  throw new UserError("Unknown change.");
}
