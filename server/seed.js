import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getUserData, saveUserData } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_PATH = path.join(__dirname, 'seed-profile.json');

export function applySeedIfNeeded() {
  if (!fs.existsSync(SEED_PATH)) return;

  const seed = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
  if (!seed.deviceId) return;

  const existing = getUserData(seed.deviceId);
  if (existing) return;

  saveUserData(seed.deviceId, {
    logs: seed.logs ?? {},
    settings: seed.settings ?? {},
    weightLog: seed.weightLog ?? [],
    completions: seed.completions ?? {},
  });

  console.log(`Seeded workout profile: ${seed.deviceId}`);
}
