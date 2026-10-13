import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(DATA_DIR, 'workout.db');
const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS user_data (
    device_id TEXT PRIMARY KEY,
    logs TEXT NOT NULL DEFAULT '{}',
    settings TEXT NOT NULL DEFAULT '{}',
    weight_log TEXT NOT NULL DEFAULT '[]',
    completions TEXT NOT NULL DEFAULT '{}',
    timers TEXT NOT NULL DEFAULT '{}',
    exercise_notes TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT NOT NULL
  )
`);

// Migrate: add columns if missing (existing Railway DBs)
const cols = db.prepare(`PRAGMA table_info(user_data)`).all();
const colNames = cols.map((c) => c.name);
if (!colNames.includes('timers')) {
  db.exec(`ALTER TABLE user_data ADD COLUMN timers TEXT NOT NULL DEFAULT '{}'`);
}
if (!colNames.includes('exercise_notes')) {
  db.exec(
    `ALTER TABLE user_data ADD COLUMN exercise_notes TEXT NOT NULL DEFAULT '{}'`
  );
}

export function getUserData(deviceId) {
  const row = db
    .prepare(
      `SELECT device_id, logs, settings, weight_log, completions, timers, exercise_notes, updated_at
       FROM user_data WHERE device_id = ?`
    )
    .get(deviceId);

  if (!row) return null;

  return {
    deviceId: row.device_id,
    logs: JSON.parse(row.logs),
    settings: JSON.parse(row.settings),
    weightLog: JSON.parse(row.weight_log),
    completions: JSON.parse(row.completions),
    timers: JSON.parse(row.timers || '{}'),
    exerciseNotes: JSON.parse(row.exercise_notes || '{}'),
    updatedAt: row.updated_at,
  };
}

export function saveUserData(deviceId, data) {
  const updatedAt = new Date().toISOString();
  db.prepare(
    `INSERT INTO user_data (device_id, logs, settings, weight_log, completions, timers, exercise_notes, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(device_id) DO UPDATE SET
       logs = excluded.logs,
       settings = excluded.settings,
       weight_log = excluded.weight_log,
       completions = excluded.completions,
       timers = excluded.timers,
       exercise_notes = excluded.exercise_notes,
       updated_at = excluded.updated_at`
  ).run(
    deviceId,
    JSON.stringify(data.logs ?? {}),
    JSON.stringify(data.settings ?? {}),
    JSON.stringify(data.weightLog ?? []),
    JSON.stringify(data.completions ?? {}),
    JSON.stringify(data.timers ?? {}),
    JSON.stringify(data.exerciseNotes ?? {}),
    updatedAt
  );
  return updatedAt;
}

export { dbPath };
