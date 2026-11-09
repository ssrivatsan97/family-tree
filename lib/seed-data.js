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
    {"id": "joseph", "name": "Joseph Rivera", "nickname": "Grandpa Joe", "gender": "M", "born": "1938-04-12", "died": 2015, "location": "San Antonio, Texas"},
    {"id": "maria", "name": "Maria Rivera", "nickname": "Nana", "gender": "F", "born": "1941-09-03", "died": "living", "location": "San Antonio, Texas", "spouse": "joseph"},
    {"id": "daniel", "name": "Daniel Rivera", "nickname": "Danny", "gender": "M", "born": "1962-01-25", "died": "living", "location": "Austin, Texas", "parents": ["joseph", "maria"]},
    {"id": "linda", "name": "Linda Rivera", "nickname": "", "gender": "F", "born": "1964-06-30", "died": "living", "location": "Austin, Texas", "spouse": "daniel"},
    {"id": "sofia", "name": "Sofia Chen", "nickname": "Aunt Sofi", "gender": "F", "born": "1965-11-08", "died": "living", "location": "San Jose, California", "parents": ["joseph", "maria"]},
    {"id": "robert", "name": "Robert Chen", "nickname": "Uncle Bob", "gender": "M", "born": "1960-02-17", "died": 2021, "location": "San Jose, California", "spouse": "sofia"},
    {"id": "michael", "name": "Michael Rivera", "nickname": "Mikey", "gender": "M", "born": "1970-07-04", "died": "living", "location": "Denver, Colorado", "parents": ["joseph", "maria"]},
    {"id": "emma", "name": "Emma Walsh", "nickname": "Em", "gender": "F", "born": "1988-03-19", "died": "living", "location": "Seattle, Washington", "parents": ["daniel", "linda"]},
    {"id": "james", "name": "James Walsh", "nickname": "Jamie", "gender": "M", "born": "1986-12-02", "died": "living", "location": "Seattle, Washington", "spouse": "emma"},
    {"id": "lucas", "name": "Lucas Rivera", "nickname": "Luke", "gender": "M", "born": "1991-08-14", "died": "living", "location": "Austin, Texas", "parents": ["daniel", "linda"]},
    {"id": "olivia", "name": "Olivia Chen", "nickname": "Liv", "gender": "F", "born": "1993-05-21", "died": "living", "location": "Portland, Oregon", "parents": ["sofia", "robert"]},
    {"id": "ethan", "name": "Ethan Chen", "nickname": "", "gender": "M", "born": "1996-10-10", "died": "living", "location": "San Francisco, California", "parents": ["sofia", "robert"]},
    {"id": "priya", "name": "Priya Chen", "nickname": "Pri", "gender": "F", "born": "1997-01-29", "died": "living", "location": "San Francisco, California", "spouse": "ethan"},
    {"id": "mia", "name": "Mia Walsh", "nickname": "Mimi", "gender": "F", "born": "2016-04-02", "died": "living", "location": "Seattle, Washington", "parents": ["emma", "james"]},
    {"id": "noah", "name": "Noah Walsh", "nickname": "Bear", "gender": "M", "born": "2019-09-15", "died": "living", "location": "Seattle, Washington", "parents": ["emma", "james"]},
    {"id": "leo", "name": "Leo Chen", "nickname": "Little Leo", "gender": "M", "born": "2023-02-11", "died": "living", "location": "San Francisco, California", "parents": ["ethan", "priya"]}
  ]
};
