# Set up your own online family tree

**About 20 minutes. Everything happens in your web browser. No coding, no command line.**

When you're done you'll have:
- a private website like `https://our-family-k7q2m.vercel.app` that only opens for people who know your **family password**, and
- **editor passcodes** for the relatives you choose, so they can add and change people from any phone or computer.

It's free: GitHub (stores the website code), Vercel (runs the website, on its free "Hobby" plan for personal use) and Neon (a free private database for your family's information).

> 🔒 **Privacy in one sentence:** the *code* lives on GitHub (public), but your *family* lives only in your private database, behind your family password. **Never type real family members, or any password, into the files on GitHub.**

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

The site isn't ready yet: it still needs its database and passwords (next parts).

## Part 4: Add the free database (3 minutes)

1. On your new project's page, click the **Storage** tab.
2. Click **Create Database** (or **Browse Marketplace**), choose **Neon**, then **Continue**.
3. Pick the **Free** plan and the region closest to most of your family. Name it `family-tree`.
4. When asked which project to connect, choose **your project** and tick **Development, Preview and Production**. Click **Connect**.

## Part 5: Set your family password (2 minutes)

This is the one password everyone in the family types (once per device) to **look at** the tree. Without it, the site shows nothing: not to strangers, not to search engines, not to AI bots.

Pick something **at least 8 characters** long that's easy to say over the phone but hard to guess, for example `sunflower-kite-73`. Capital letters matter. Don't use a password you use anywhere else.

1. In your project, click **Settings → Environment Variables**.
2. Fill in:
   - **Key:** `FAMILY_PASSWORD`
   - **Value:** your family password, e.g. `sunflower-kite-73` (no quotation marks)
   - **Environments:** tick **Production** and **Preview**.
   - Turn on **Sensitive** if you see it (it hides the password).
3. Click **Save**.

Write the password down somewhere safe. It is **only** stored in Vercel's settings, never on GitHub.

## Part 6: Choose your editors (3 minutes)

Editors are the people who may **change** the tree. Give each editor **their own passcode** (different from the family password): three words and a number works well, for example `apple-cloud-58`. Each must be **at least 8 characters**.

1. Still in **Settings → Environment Variables**, add another one:
   - **Key:** `EDITORS`
   - **Value:** each person's name, `=`, and their passcode, with `;` between people. For example:
     `Grandma=apple-cloud-58; Alex=paper-boat-31; Priya=green-tram-64`
   - **Environments:** tick **Production** and **Preview**. Turn on **Sensitive**.
2. Click **Save**.
3. Go to **Deployments**, click **⋯** on the top one, and choose **Redeploy**. Settings only take effect after a redeploy.

The name before `=` is shown as "Signed in as Grandma" and in the change history. Don't use `=` or `;` inside names or passcodes.

## Part 7: Check one safety setting (1 minute)

**Settings → Deployment Protection** should say **Standard Protection** (the normal default).
Your family password already keeps strangers out. Don't choose **All Deployments**, or every relative would also need a Vercel account just to look.

## Part 8: Add your family

1. Open your link, e.g. `https://our-family-k7q2m.vercel.app`, and type your **family password**. You'll see a **made-up sample family**.
2. Click **✏️ Family editors: sign in to make changes** and type your **editor passcode**.
3. Tap any person and use **Make changes**:
   - **✏️ Edit all details:** name, nickname, gender, photo.
   - **➕ Add child** and **➕ Add husband/wife:** add people.
   - **🔗 Merge with a duplicate:** if the same person was added twice.
   - **🗑 Remove from tree:** remove sample people you don't need.

   The quickest start: turn the sample people into your relatives with **Edit all details**, then add and remove as needed.
4. **Share it with your family: send the link and the password separately.** For example, the link in a message and the password by phone call or in a different message. That way, if someone forwards or posts the link by mistake, the password doesn't go with it.
5. Send each editor **their own passcode** privately too.

Each device only needs the family password once. It's remembered for a year.

## Part 9: Get new features

When the template gets improvements:

1. Open your fork on GitHub (`github.com/<your-name>/family-tree`).
2. If it says "This branch is … commits behind", click **Sync fork → Update branch**.
3. That's it. Vercel updates your website within a couple of minutes. **Your family data and passwords are not touched.**

Occasionally a new feature needs a new setting. The maintainer will tell you, and the site explains what's missing.
If GitHub says there are **conflicts**, it means files in your fork were changed by hand. If you didn't mean to keep those changes, choose **Discard commits** (this only affects code, never your family data). Otherwise ask the maintainer for help.

## Part 10: Share an improvement (optional)

Made the site better, for example clearer wording or a nicer colour? You can offer it to everyone:

1. In your fork on GitHub, open the file, click the ✏️ pencil, and make your change.
2. Click **Commit changes…**, choose **Create a new branch**, and confirm.
3. Click **Contribute → Open pull request**, describe your change, and submit.

The maintainer reviews it. Once accepted, everyone can get it with **Sync fork**.
Pull requests only contain code. Your family's information and passwords are never included.

---

## Everyday questions

**Change the family password** (for example, if it was shared too widely)? Edit `FAMILY_PASSWORD` in **Settings → Environment Variables** (⋯ → **Edit**), then **Deployments → ⋯ → Redeploy**. Everyone is asked for the new password next time they open the site. Send it to them again (separately from the link).

**Add or remove an editor, or change a passcode?** Edit `EDITORS` the same way, then Redeploy.
Removing someone, or changing their passcode, signs them out on all their devices.

**Someone forgot the family password?** Tell them again. Nobody can look it up on the website itself.

**Too many wrong tries?** After 10 wrong passwords or passcodes in 15 minutes, that place has to wait 15 minutes.

**Back up the family?** While signed in, open `https://<your-link>/api/family` and use **File → Save As**. Photos are kept in the database and aren't in that file.

**Who changed what?** **Storage → your Neon database → Open in Neon → SQL Editor**, then run:
`SELECT at, editor, summary FROM changes ORDER BY at DESC LIMIT 50;`

**Things to keep in mind**
- Anyone who has **both** the link and the family password can see the tree. Keep them separate, and change the password if it spreads.
- Previews of new versions (special links Vercel makes for testing) use the **same** family data, so changes made there are real.
