# Deploy to Railway (always-on hosting)

Host the app in the cloud so you can open it from your phone anywhere — no Mac tunnel needed.

**Cost:** Railway Hobby plan is about **$5/month** (includes a small usage credit). You need a **persistent volume** (~$0.25/GB/mo) so your SQLite database survives redeploys.

Your workout data (`62ded9ca-3c68-424f-85fe-1467a93523e2`) is bundled in `server/seed-profile.json` and is imported automatically on first boot if that profile is not already in the database.

---

## Option A — Deploy from GitHub (recommended)

### 1. Push the project to GitHub

```bash
cd /Users/vladimirdima/Desktop/b2b-workout-app
git init
git add .
git commit -m "Prepare Railway deployment"
```

Create a **private** repo on GitHub, then:

```bash
git remote add origin git@github.com:YOUR_USERNAME/b2b-workout-app.git
git branch -M main
git push -u origin main
```

### 2. Create a Railway project

1. Go to [railway.app](https://railway.app) and sign in.
2. **New Project** → **Deploy from GitHub repo** → select `b2b-workout-app`.
3. Railway detects the `Dockerfile` automatically.

### 3. Add persistent storage (required)

Without this, your logs reset on every redeploy.

1. In your Railway service, open **Volumes**.
2. **Add Volume** → mount path: **`/data`**
3. In **Variables**, add:
   - `DB_PATH` = `/data/workout.db`

### 4. Enable one shared profile (recommended)

So every device sees the same data automatically — no Sync ID needed.

In **Variables**, add:

- `SHARED_DEVICE_ID` = `62ded9ca-3c68-424f-85fe-1467a93523e2` (or any UUID you prefer)

The app always loads and saves this profile from the database. Phone, laptop, and tablet stay in sync.

### 5. Generate a public URL

1. Open **Settings** → **Networking** → **Generate Domain**
2. You get something like `b2b-workout-app-production.up.railway.app`

Open that URL on your phone. If you set `SHARED_DEVICE_ID`, your data loads automatically.

If you did **not** set `SHARED_DEVICE_ID`, tap **Sync** and paste:

```
62ded9ca-3c68-424f-85fe-1467a93523e2
```

Save that ID in Notes — use it on every new device/browser.

---

## Option B — Deploy with Railway CLI (no GitHub)

```bash
npm install -g @railway/cli
railway login
cd /Users/vladimirdima/Desktop/b2b-workout-app
railway init
railway up
```

Then add the volume and `DB_PATH` variable as in step 3 above, and generate a domain.

---

## Verify it works

```bash
curl https://YOUR-RAILWAY-DOMAIN.up.railway.app/api/health
```

Should return `{"ok":true,"db":"/data/workout.db"}`.

Check your profile exists:

```bash
curl https://YOUR-RAILWAY-DOMAIN.up.railway.app/api/data/62ded9ca-3c68-424f-85fe-1467a93523e2
```

You should see your logs with weights and reps.

---

## Updating the app later

Push to GitHub (or run `railway up`). Railway rebuilds and redeploys. Your data stays on the volume.

To refresh the seed file from your local Mac database:

```bash
node scripts/export-profile.mjs 62ded9ca-3c68-424f-85fe-1467a93523e2
git add server/seed-profile.json
git commit -m "Update seed profile"
git push
```

The seed only runs when that profile ID is **missing** from the database — it will not overwrite live cloud data.

---

## Alternatives

| Platform | Notes |
|----------|--------|
| **Render** | Web Service + Persistent Disk (~$7/mo). Use the same Dockerfile, set `DB_PATH` to disk mount path. |
| **Fly.io** | `fly launch` + volume. Free tier is limited; good if you already use Fly. |
| **Cloudflare Tunnel** | Free, but requires your Mac running (`npm run share`). |

Railway is the simplest fit for this Node + SQLite app.
