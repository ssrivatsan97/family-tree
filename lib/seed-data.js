/* =====================================================================
   SAMPLE STARTING DATA (a made-up family)
   ---------------------------------------------------------------------
   ⚠️  Do NOT type your real family into this file. This code is public on
   GitHub, so anything written here can be seen by anyone.

   This sample is copied into YOUR site's private database only the first
   time the site runs. After that, add and change people on the website
   itself ("/?edit" -> sign in -> tap a person -> Make changes). Those changes
   are stored privately in your database, never in this file.

   Tip: you can remove the sample people on the website, or merge them into
   your own relatives as you go.
   ===================================================================== */

export default {
  title: "Our Family Tree",

  people: [
    {"id": "joseph", "name": "Joseph Rivera", "nickname": "Grandpa Joe", "gender": "M"},
    {"id": "maria", "name": "Maria Rivera", "nickname": "Nana", "gender": "F", "spouse": "joseph"},
    {"id": "daniel", "name": "Daniel Rivera", "nickname": "Danny", "gender": "M", "parents": ["joseph", "maria"]},
    {"id": "linda", "name": "Linda Rivera", "nickname": "", "gender": "F", "spouse": "daniel"},
    {"id": "sofia", "name": "Sofia Chen", "nickname": "Aunt Sofi", "gender": "F", "parents": ["joseph", "maria"]},
    {"id": "robert", "name": "Robert Chen", "nickname": "Uncle Bob", "gender": "M", "spouse": "sofia"},
    {"id": "michael", "name": "Michael Rivera", "nickname": "Mikey", "gender": "M", "parents": ["joseph", "maria"]},
    {"id": "emma", "name": "Emma Walsh", "nickname": "Em", "gender": "F", "parents": ["daniel", "linda"]},
    {"id": "james", "name": "James Walsh", "nickname": "Jamie", "gender": "M", "spouse": "emma"},
    {"id": "lucas", "name": "Lucas Rivera", "nickname": "Luke", "gender": "M", "parents": ["daniel", "linda"]},
    {"id": "olivia", "name": "Olivia Chen", "nickname": "Liv", "gender": "F", "parents": ["sofia", "robert"]},
    {"id": "ethan", "name": "Ethan Chen", "nickname": "", "gender": "M", "parents": ["sofia", "robert"]},
    {"id": "priya", "name": "Priya Chen", "nickname": "Pri", "gender": "F", "spouse": "ethan"},
    {"id": "mia", "name": "Mia Walsh", "nickname": "Mimi", "gender": "F", "parents": ["emma", "james"]},
    {"id": "noah", "name": "Noah Walsh", "nickname": "Bear", "gender": "M", "parents": ["emma", "james"]},
    {"id": "leo", "name": "Leo Chen", "nickname": "Little Leo", "gender": "M", "parents": ["ethan", "priya"]}
  ]
};
