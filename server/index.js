import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbPath, getUserData, saveUserData } from './db.js';
import { applySeedIfNeeded } from './seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4001;
const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, db: dbPath });
});

app.get('/api/data/:deviceId', (req, res) => {
  const data = getUserData(req.params.deviceId);
  if (!data) {
    return res.status(404).json({ error: 'No saved data for this device' });
  }
  res.json(data);
});

app.put('/api/data/:deviceId', (req, res) => {
  const { logs, settings, weightLog, completions } = req.body ?? {};
  if (
    typeof logs !== 'object' ||
    typeof settings !== 'object' ||
    !Array.isArray(weightLog) ||
    typeof completions !== 'object'
  ) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const updatedAt = saveUserData(req.params.deviceId, {
    logs,
    settings,
    weightLog,
    completions,
  });

  res.json({ ok: true, updatedAt });
});

const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

applySeedIfNeeded();

const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`B2B server running on http://${HOST}:${PORT}`);
  console.log(`SQLite database: ${dbPath}`);
});
