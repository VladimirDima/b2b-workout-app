#!/usr/bin/env node
/**
 * Push a device profile from local SQLite to a running server (e.g. Railway).
 * Usage: node scripts/push-profile-to-server.mjs https://YOUR-APP.up.railway.app [device-id]
 */
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseUrl = process.argv[2]?.replace(/\/$/, '');
const deviceId = process.argv[3] ?? '62ded9ca-3c68-424f-85fe-1467a93523e2';
const dbPath = process.env.DB_PATH ?? path.join(__dirname, '..', 'data', 'workout.db');

if (!baseUrl) {
  console.error('Usage: node scripts/push-profile-to-server.mjs https://YOUR-APP.up.railway.app [device-id]');
  process.exit(1);
}

const db = new DatabaseSync(dbPath);
const row = db.prepare('SELECT * FROM user_data WHERE device_id = ?').get(deviceId);

if (!row) {
  console.error(`No profile ${deviceId} in ${dbPath}`);
  process.exit(1);
}

const payload = {
  logs: JSON.parse(row.logs),
  settings: JSON.parse(row.settings),
  weightLog: JSON.parse(row.weight_log),
  completions: JSON.parse(row.completions),
};

const setsWithWeight = Object.values(payload.logs)
  .flatMap((v) => v.sets ?? [])
  .filter((s) => s.weight && s.weight.trim()).length;

console.log(`Pushing ${deviceId} (${Object.keys(payload.logs).length} exercises, ${setsWithWeight} sets with weight)...`);

const res = await fetch(`${baseUrl}/api/data/${deviceId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

if (!res.ok) {
  console.error('Push failed:', res.status, await res.text());
  process.exit(1);
}

const data = await res.json();
console.log('Done. updatedAt:', data.updatedAt);
console.log('');
console.log('On your phone: tap Sync → paste this ID → Apply');
console.log(deviceId);
