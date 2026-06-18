#!/usr/bin/env node
/**
 * Export a device profile from the local SQLite DB to server/seed-profile.json
 * Usage: node scripts/export-profile.mjs [device-id]
 */
import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const deviceId = process.argv[2] ?? '62ded9ca-3c68-424f-85fe-1467a93523e2';
const dbPath = process.env.DB_PATH ?? path.join(__dirname, '..', 'data', 'workout.db');

const db = new DatabaseSync(dbPath);
const row = db.prepare('SELECT * FROM user_data WHERE device_id = ?').get(deviceId);

if (!row) {
  console.error(`No profile found for ${deviceId} in ${dbPath}`);
  process.exit(1);
}

const profile = {
  deviceId: row.device_id,
  logs: JSON.parse(row.logs),
  settings: JSON.parse(row.settings),
  weightLog: JSON.parse(row.weight_log),
  completions: JSON.parse(row.completions),
};

const outPath = path.join(__dirname, '..', 'server', 'seed-profile.json');
fs.writeFileSync(outPath, JSON.stringify(profile, null, 2));
console.log(`Exported ${deviceId} → ${outPath}`);
console.log(`  ${Object.keys(profile.logs).length} exercises, ${Object.keys(profile.completions).length} completions`);
