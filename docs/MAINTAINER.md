# Maintainer guide

How to publish this template on GitHub, connect your own existing Vercel site to it without touching its database, accept improvements from others, and export the Easy kit.

---

## A. Publish the template (one time, about 15 minutes)

You need: a GitHub account, **git** (`git --version`; on a Mac it offers to install the Command Line Tools), and **Node.js 22+**.

1. **Unzip** `family-tree-template.zip` to its own folder, e.g. `~/Documents/family-tree-template`.
   Keep it separate from your current project folder (`~/Documents/family-tree-vercel`), which contains your real family's starting data and must **never** be pushed to GitHub.

2. **Make sure there's no private information** in the template. This should print nothing:
   ```bash
   cd ~/Documents/family-tree-template
   grep -rniI "your-surname\|a-real-passcode\|your-site-name" . --exclude-dir=node_modules
   ```
   (Replace the words with your family's surname, one of your real passcodes and your site name.)
   `lib/seed-data.js` must only contain the made-up sample family.

3. **Lock the dependency versions** (safer, repeatable installs):
   ```bash
   npm install
   ```
   This creates `package-lock.json`. Keep it and commit it.

4. **Optional check:** build the Easy kit locally:
   ```bash
   node tools/build-easy-kit.mjs
   open dist/family-tree-easy-kit/index.html
   ```

5. **Create an empty repository:** go to **github.com/new**. Name it `family-tree`, make it **Public**, and don't add a README, .gitignore or license. Click **Create repository**.

6. **Upload the code:**
   ```bash
   cd ~/Documents/family-tree-template
   git init -b main
   git add .
   git status            # check: no .env files, no node_modules, no .vercel folder
   git commit -m "Family tree template"
   git remote add origin https://github.com/<you>/family-tree.git
   git push -u origin main
   ```
   (With the GitHub CLI: `gh repo create family-tree --public --source . --push`.)

7. **Choose a licence** so others are allowed to reuse it: on the repo page, **Add file → Create new file**, name it `LICENSE`, click **Choose a license template**, pick one (e.g. MIT), and commit.

### Recommended repository security settings
- **Protect `main`:** **Settings → Rules → Rulesets → New branch ruleset.** Target: default branch. Turn on **Restrict deletions**, **Block force pushes** and **Require a pull request before merging**. Add **Repository admin** to the bypass list so you can still push your own changes.
- **Approve outside contributors' automation:** **Settings → Actions → General → Approval for running fork pull request workflows from contributors →** "Require approval for all external contributors". Under **Workflow permissions**, keep **Read repository contents**.
- **Security alerts:** **Settings → Code security →** turn on **Dependabot alerts** and **Dependabot security updates**. Secret scanning and push protection are on by default for public repos. Leave them on.
- The Easy-kit workflow already runs with read-only permissions and can't change the repo.

---

## B. Connect your current Vercel site to the repo (database unchanged)

Your family's data lives in the **Neon database attached to your Vercel project**. Connecting a Git repository only changes **where the code comes from**. The project, its database, its settings (`FAMILY_PASSWORD`, `EDITORS`, `SESSION_SECRET`, `DATABASE_URL`) and its link all stay the same.

**Before the first deploy from GitHub,** make sure your project has `FAMILY_PASSWORD` (Settings → Environment Variables, Production + Preview, Sensitive, 8+ characters). Without it the site shows an "Almost ready" page instead of your tree.

1. **Back up first:** open `https://<your-site>.vercel.app/api/family` and **File → Save As** (`family-backup-YYYY-MM-DD.json`).
2. In Vercel open **your existing project → Settings → Git → Connect Git Repository → GitHub**.
   If asked, allow the Vercel GitHub app access to **only** the `family-tree` repository. Select `<you>/family-tree` and **Connect**.
3. **Settings → Build and Deployment:** Framework Preset **Other**, Root Directory empty, no overrides (`vercel.json` handles everything).
   **Settings → Environments → Production:** the branch should be `main`.
4. **Deploy from GitHub once:** make any small commit, for example edit `README.md` on GitHub and commit to `main`.
   Vercel builds it and it becomes your live site. Check **Deployments**: the top one should show a commit from `main`.
5. **Check:** your site still shows **your** family, `/?edit` sign-in still works (your `SESSION_SECRET` is unchanged, so editors stay signed in), and photos still load.

**From now on:**
- Update your site through GitHub (push or merge to `main`). **Don't** run `npx vercel --prod` from the old folder, because it would put the old code back.
- Keep the old folder **private** as an archive. Its `lib/seed-data.js` holds your notebook transcription.
- ⚠️ If you ever run `DELETE FROM family;`, the site now restarts from the **sample** family, not yours. Restore from your backup instead.

---

## C. Make changes to the template

1. Work on a branch: `git switch -c better-colours`, then edit and `git push -u origin better-colours`.
2. Vercel builds a **preview** link for the branch. Previews are behind Vercel Authentication, so only you can open them.
   ⚠️ Previews use the **same database** as your live site, so edits you make while testing a preview are real.
   (Neon's Vercel integration can give previews their own copy of the database. Look for its preview-branch option if you want that.)
3. Open a pull request and merge it into `main`. Your live site updates, the Easy kit rebuilds, and every family can get the change with **Sync fork**.

**Keep changes safe for everyone:** don't rename or remove settings people rely on (`FAMILY_PASSWORD`, `EDITORS`, `SESSION_SECRET`, `DATABASE_URL`), and keep the stored data format compatible. Families' existing data must keep working after they sync.

**If a change needs a new setting** (as the family password did), say so in the release notes **before** families sync. For example:
"Before you click Sync fork, add `FAMILY_PASSWORD` in Vercel → Settings → Environment Variables (see Part 5 of the setup guide)." The site also tells them what's missing instead of breaking silently.

## D. Review improvements from others (pull requests)

1. Open the pull request → **Files changed**.
2. Check:
   - It contains **no personal information** (names, dates, passcodes, links).
   - Changes to `api/`, `lib/server.js` or `vercel.json` get extra care. These control sign-in and saving. Don't merge anything there you don't fully understand.
   - It doesn't add new packages, outside scripts or tracking.
3. For first-time contributors, GitHub asks you to approve running the checks. Look at the changes first.
4. **Merge pull request.** Then tell the families they can **Sync fork**.

---

## E. Export the Easy kit (Option A) from the repo

The kit is built from the **current code on `main`**, so it always includes the latest features.

**Automatically:** every change merged into `main` builds a new kit.

**Download it:**
1. Repo → **Actions** → **Build Easy Kit** → the latest green run.
2. Scroll to **Artifacts** → **family-tree-easy-kit** (downloads a zip).

**Build one right now:** **Actions → Build Easy Kit → Run workflow → main → Run workflow**, wait about a minute, then download as above.

**Give families a public download link** (artifacts need a GitHub login and expire after 90 days):
1. Unzip the downloaded artifact into a folder named **`family-tree-easy-kit`**, then compress that folder again. People then get a tidy folder when they unzip.
2. Repo → **Releases → Draft a new release** → **Choose a tag** → type e.g. `kit-2026-11-08` → **Create new tag**.
3. Attach `family-tree-easy-kit.zip`, write a line about what's new, and click **Publish release**.

The README's **Download the latest Easy kit** link always points to the newest release.

**On your own computer instead:** `node tools/build-easy-kit.mjs` creates `dist/family-tree-easy-kit/`. `VERSION.txt` inside the kit records the build date and commit.

How it works: the kit is the same `public/index.html` plus `easy-kit/easy-kit.js`, which answers the page's `/api/...` requests inside the browser using the same rules (`lib/rules.js`). So features you add to the website appear in the kit automatically, as long as they go through those same requests.

---

## Security checklist (what's already built in)

- Real family data is never in the repo. It lives only in each family's database. The sample family is made up.
- **Viewing needs the family password** (`FAMILY_PASSWORD`, set only in Vercel, 8+ characters). The page itself contains no family information. Names, dates and photos are only sent after the password is checked (or to signed-in editors). The password is remembered per device for a year in a signed, HttpOnly cookie, and changing it signs everyone out. Without the setting, the site refuses to show data ("Almost ready").
- Search engines and AI crawlers are told to stay away (`robots.txt`, `X-Robots-Tag` headers, robots meta tag), and they can't get past the password anyway. The site address isn't leaked to other sites (`Referrer-Policy: no-referrer`). Photos are sent with `Cache-Control: private`.
- Editing needs a personal passcode (8+ characters). Sign-in uses a signed, HttpOnly, Secure cookie, valid for 90 days and cancelled when the passcode changes.
- 10 wrong family passwords, or 10 wrong editor passcodes, in 15 minutes pauses that kind of sign-in for that place for 15 minutes.
- Saves must come from the site itself (cross-site requests are refused), and every change is validated and logged with the editor's name.
- Photo uploads are limited to JPG/PNG/WebP, shrunk in the browser, and capped at 1.5 MB.
- `.gitignore` keeps `.env` files, `.vercel/` and `node_modules/` out of Git. `.vercelignore` keeps docs and tools off the website. Passwords and passcodes are never in the repo.
- The website has no public photos folder: photos are added on the site and stored in the database behind the password.
- The **Easy kit** has no password by design (it's a plain folder). Its START-HERE guide says so.
- `SESSION_SECRET` is optional for families: if unset, the key is derived from the private database address.
