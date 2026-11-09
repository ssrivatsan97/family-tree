# Set up your own online family tree

**About 20 minutes. Everything happens in your web browser. No coding, no command line.**

When you're done you'll have:
- a website like `https://our-family-k7q2m.vercel.app` that anyone with the link can look at, and
- passcodes for the relatives you choose, so they can add and change people from any phone or computer.

It's free: GitHub (stores the website code), Vercel (runs the website, on its free "Hobby" plan for personal use) and Neon (a free private database for your family's information).

> 🔒 **Privacy in one sentence:** the *code* lives on GitHub (public), but your *family* lives only in your private database. **Never type real family members into the files on GitHub.** Add them on your website.

---

## Part 1: Create two free accounts (5 minutes)

1. **GitHub:** go to **github.com/signup** and create an account. Confirm your email.
2. **Vercel:** go to **vercel.com/signup**, choose **Hobby**, and click **Continue with GitHub**. That way you have one login for both.

## Part 2: Make your own copy of the template (1 minute)

1. Open the template page (the link you were given, for example `github.com/<maintainer>/family-tree`).
2. Click **Fork** (top right).
3. Leave the settings as they are and click **Create fork**.

You now have your own copy at `github.com/<your-name>/family-tree`. It stays linked to the original, so you can get new features later with one click.

## Part 3: Put it online with Vercel (3 minutes)

1. Go to **vercel.com/new**.
2. Under **Import Git Repository**, find **family-tree** and click **Import**.
   - If you don't see it, click **Adjust GitHub App Permissions** (or **Install**), choose **Only select repositories**, pick **family-tree**, and save.
3. **Project Name:** choose something hard to guess, like `our-family-k7q2m`. It becomes your link, `our-family-k7q2m.vercel.app`.
4. **Framework Preset:** choose **Other**. Leave everything else as it is.
5. Click **Deploy** and wait for the confetti 🎉.

The site isn't ready yet: it still needs its database (next part).

## Part 4: Add the free database (3 minutes)

1. On your new project's page, click the **Storage** tab.
2. Click **Create Database** (or **Browse Marketplace**), choose **Neon**, then **Continue**.
3. Pick the **Free** plan and the region closest to most of your family. Name it `family-tree`.
4. When asked which project to connect, choose **your project** and tick **Development, Preview and Production**. Click **Connect**.

## Part 5: Choose your editors (3 minutes)

Decide who may change the tree, and make up a **passcode for each person**: three words and a number works well, for example `sunny-garden-42`. Each passcode must be **at least 8 characters**, and capital letters matter.

1. In your project, click **Settings → Environment Variables**.
2. Fill in:
   - **Key:** `EDITORS`
   - **Value:** each person's name, `=`, and their passcode, with `;` between people. For example:
     `Grandma=sunny-garden-42; Alex=river-stone-17; Priya=blue-lake-58`
   - **Environments:** tick **Production** and **Preview**.
   - Turn on **Sensitive** if you see it (it hides the passcodes).
3. Click **Save**.
4. Go to **Deployments**, click **⋯** on the top one, and choose **Redeploy**. Settings only take effect after a redeploy.

The name before `=` is shown as "Signed in as Grandma" and in the change history. Don't use `=` or `;` inside names or passcodes.

## Part 6: Check one safety setting (1 minute)

**Settings → Deployment Protection** should say **Standard Protection** (the normal default).
That keeps your main link open for family to view. Don't choose **All Deployments**, or everyone would be asked to log in to Vercel just to look.

## Part 7: Add your family

1. Open your link, e.g. `https://our-family-k7q2m.vercel.app`. You'll see a **made-up sample family**.
2. Click **✏️ Family editors: sign in to make changes** and type your passcode.
3. Tap any person and use **Make changes**:
   - **✏️ Edit all details:** name, nickname, gender, date of birth, location, photo.
   - **➕ Add child** and **➕ Add husband/wife:** add people.
   - **🔗 Merge with a duplicate:** if the same person was added twice.
   - **🗑 Remove from tree:** remove sample people you don't need.

   The quickest start: turn the sample people into your relatives with **Edit all details**, then add and remove as needed.
4. Send the normal link to your family, and send each editor **their own passcode privately** (a call or a private message).

## Part 8: Get new features

When the template gets improvements:

1. Open your fork on GitHub (`github.com/<your-name>/family-tree`).
2. If it says "This branch is … commits behind", click **Sync fork → Update branch**.
3. That's it. Vercel updates your website within a couple of minutes. **Your family data is not touched.**

If GitHub says there are **conflicts**, it means files in your fork were changed by hand. If you didn't mean to keep those changes, choose **Discard commits** (this only affects code, never your family data). Otherwise ask the maintainer for help.

## Part 9: Share an improvement (optional)

Made the site better, for example clearer wording or a nicer colour? You can offer it to everyone:

1. In your fork on GitHub, open the file, click the ✏️ pencil, and make your change.
2. Click **Commit changes…**, choose **Create a new branch**, and confirm.
3. Click **Contribute → Open pull request**, describe your change, and submit.

The maintainer reviews it. Once accepted, everyone can get it with **Sync fork**.
Pull requests only contain code. Your family's information is never included.

---

## Everyday questions

**Add or remove an editor, or change a passcode?** Edit `EDITORS` in **Settings → Environment Variables**, then **Deployments → ⋯ → Redeploy**.
Removing someone, or changing their passcode, signs them out on all their devices.

**Someone typed a wrong passcode many times?** After 10 wrong tries in 15 minutes, sign-in pauses for 15 minutes.

**Back up the family?** Open `https://<your-link>/api/family` and use **File → Save As**. Photos are kept in the database and aren't in that file.

**Who changed what?** **Storage → your Neon database → Open in Neon → SQL Editor**, then run:
`SELECT at, editor, summary FROM changes ORDER BY at DESC LIMIT 50;`

**Things to keep in mind**
- Anyone with the link can see the tree. Don't post the link publicly.
- Think twice before adding exact birth dates of living children. Just the year works too.
- Previews of new versions (special links Vercel makes for testing) use the **same** family data, so changes made there are real.
