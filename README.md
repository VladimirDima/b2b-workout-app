# B2B Workout App

A React web app for the **Bony to Beastly Workouts 3.1** program. It mirrors the spreadsheet functionality with an easier way to follow workouts, log sets, watch exercise videos, and see targeted muscle groups.

## Features

- **5 workout phases** (Phase 0–4) with 3 training days each
- **Week-by-week progression** (sets, reps, RIR/rest notes)
- **Set logging** with weight, reps, and completion checkboxes
- **Progress tracking** — mark workouts, weeks, days, and phases complete
- **Dashboard** with stats, completion grid, and muscle frequency
- **Video tutorials** and **muscle body maps**
- **Persistent storage** — SQLite database on the server (survives redeploys)

## Getting Started

```bash
npm install
npm run dev
```

This starts both:
- **API + SQLite** at http://localhost:4001
- **Frontend** at http://localhost:5173 (proxies `/api` to the server)

Your progress (set logs, completions, weight, settings) is saved to `data/workout.db` automatically.

## Production

```bash
npm run build
npm start
```

Open http://localhost:4001 — the server serves the built app and the API.

**Deploy to the cloud (Railway):** see [DEPLOY.md](./DEPLOY.md) for always-on hosting from your phone without running your Mac.

**Important for redeploys:** keep the `data/` folder (or set `DB_PATH` to a persistent volume). The database file is where all your workout progress lives.

```bash
DB_PATH=/var/lib/b2b/workout.db npm start
```

## How data is stored

| What | Where |
|------|--------|
| Set logs, completions, settings, weight | SQLite (`data/workout.db`) |
| Browser cache | localStorage (offline fallback + faster loads) |
| Device identity | A UUID in localStorage links your browser to your DB row |

On first load, local data is migrated to the server if the server has no record yet. After that, the newest copy wins.

## Regenerating workout data

If you update the spreadsheet, re-run the parser:

```bash
python3 scripts/parse_workbook.py
```

Requires `openpyxl` (`pip install openpyxl`).

## Data source

Workout structure and YouTube links are extracted from `Bony to Beastly Workouts 3.1.xlsx`. Muscle group mappings are based on standard exercise anatomy and program context from the PDF guide.
