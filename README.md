# GeneraXion — Setup Guide

A plain HTML/CSS/JS club website with a hero carousel, mission section, team
and gallery, member login, RSVPs, backed by Supabase and deployed on Vercel.
No build tools, no framework.

## Adding your own photos

The homepage currently uses colored placeholder blocks (marked "📷 replace")
instead of real photos, so you have something to look at immediately without
needing images yet. To swap them in:

1. Create an `images/` folder in this project and drop your photos in.
2. **Hero carousel:** open `index.html`, find the `.slide` divs near the top,
   and add an inline style to each: `style="background-image: url('images/your-photo.jpg')"`.
3. **Team photos:** replace each `<div class="team-photo">📷 photo</div>` with
   `<img src="images/name.jpg" alt="...">` (add `object-fit: cover` sizing in
   `.team-photo` in `css/style.css` if needed).
4. **Gallery:** same idea — replace each `.gallery-item` div's placeholder text
   with a background-image, or swap in an `<img>`.
5. **Map:** find the `<iframe>` under "Where we meet" and replace its `src`
   with your own venue — get the embed link from Google Maps → Share → Embed a map.

## What's in this folder

```
club-website/
  index.html          Public landing page + event list (no login needed)
  login.html           Login form
  signup.html           Sign-up form
  dashboard.html        Members-only page (redirects to login if not signed in)
  css/style.css          All styling
  js/supabase-config.js    <-- you edit this one with your project keys
  js/auth.js               Sign up / log in / log out helpers
  js/events.js              Fetches events, renders cards, handles RSVPs
  supabase/schema.sql        Run this in Supabase to create your database
```

---

## Step 1 — Create your Supabase project

1. Go to https://supabase.com and sign up / log in.
2. Click **New project**. Pick a name, a database password (save it somewhere), and a region close to your users.
3. Wait ~2 minutes for the project to finish provisioning.

## Step 2 — Create the database tables

1. In your Supabase project, open **SQL Editor** (left sidebar) → **New query**.
2. Open `supabase/schema.sql` from this folder, copy the whole file, paste it into the query editor.
3. Click **Run**.

This creates three tables and locks them down with Row Level Security:
- **profiles** — one row per member (name), auto-created on signup
- **events** — club events, readable by everyone, even signed-out visitors
- **event_rsvps** — who's going to what; only visible to the member who created it

It also adds two sample events so you have something to look at right away.

## Step 3 — Turn on email login

Supabase has email/password auth turned on by default, so there's nothing to
configure here. Optional: go to **Authentication → Providers → Email** and
toggle **Confirm email** off while you're testing, so new accounts don't need
to click a confirmation link. Turn it back on before you launch for real.

## Step 4 — Connect your site to Supabase

1. In Supabase, go to **Project Settings → API**.
2. Copy the **Project URL** and the **anon public** key.
3. Open `js/supabase-config.js` in this folder and paste them in:

```js
const SUPABASE_URL = "https://your-project-id.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key-here";
```

The anon key is meant to be public — it's safe to ship in frontend code. Your
Row Level Security policies (from schema.sql) are what actually keep data safe.

## Step 5 — Test it locally

You can't just double-click `index.html` — the browser will block some
requests. Instead, serve the folder locally. Easiest option if you have Python:

```bash
cd club-website
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser. Try signing up, logging in,
and RSVPing to an event.

(No Python? Any static server works — e.g. the VS Code "Live Server" extension.)

## Step 6 — Push this to GitHub

Vercel deploys straight from a GitHub repo.

```bash
cd club-website
git init
git add .
git commit -m "Initial club website"
```

Then create a new repo on https://github.com/new, and push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## Step 7 — Deploy on Vercel

1. Go to https://vercel.com and sign in with GitHub.
2. Click **Add New → Project**, and import the repo you just pushed.
3. Framework preset: choose **Other** (this is plain static HTML — no build step needed).
4. Click **Deploy**.

That's it — Vercel gives you a live URL in about 30 seconds. Every time you
push to `main` on GitHub, it redeploys automatically.

---

## Where to go from here

- **Custom domain:** Vercel → your project → Settings → Domains.
- **Admin form to add events:** right now events are added via the Supabase
  Table Editor (Table Editor → events → Insert row). A simple in-app form is a
  natural next step once you're comfortable with the code here.
- **Password reset / email confirmation styling:** Supabase → Authentication →
  Email Templates lets you customize those emails.
- **Avatars, member directory, etc.:** the `profiles` table is a good place to
  add more columns later (e.g. `avatar_url`, `bio`).

## How the login-protection works, in plain terms

`dashboard.html` calls `requireLogin()` (in `js/auth.js`) as soon as the page
loads. That function asks Supabase "is anyone logged in right now?" — if not,
it immediately redirects to `login.html`. This is a *frontend* redirect for
user experience; the *real* security is the Row Level Security policies in
`schema.sql`, which stop the database from returning private data to anyone
who isn't logged in, no matter what frontend code does.
