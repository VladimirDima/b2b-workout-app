#!/usr/bin/env node
/**
 * Download a device profile from a running server to data/backups/
 * Usage: node scripts/backup-from-server.mjs https://YOUR-APP.up.railway.app [device-id]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseUrl = process.argv[2]?.replace(/\/$/, '');
const deviceId = process.argv[3] ?? '62ded9ca-3c68-424f-85fe-1467a93523e2';

if (!baseUrl) {
  console.error('Usage: node scripts/backup-from-server.mjs https://YOUR-APP.up.railway.app [device-id]');
  process.exit(1);
}

const res = await fetch(`${baseUrl}/api/data/${deviceId}`);
if (res.status === 404) {
  console.error(`No profile found on server for ${deviceId}`);
  process.exit(1);
}
if (!res.ok) {
  console.error('Backup failed:', res.status, await res.text());
  process.exit(1);
}

const data = await res.json();
const backup = {
  deviceId: data.deviceId ?? deviceId,
  logs: data.logs,
  settings: data.settings,
  weightLog: data.weightLog,
  completions: data.completions,
  updatedAt: data.updatedAt,
  backedUpAt: new Date().toISOString(),
  source: baseUrl,
};

const setsWithWeight = Object.values(backup.logs)
  .flatMap((v) => v.sets ?? [])
  .filter((s) => s.weight && s.weight.trim()).length;

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.join(__dirname, '..', 'data', 'backups');
fs.mkdirSync(backupDir, { recursive: true });

const filename = `${deviceId.slice(0, 8)}-${stamp}.json`;
const outPath = path.join(backupDir, filename);
fs.writeFileSync(outPath, JSON.stringify(backup, null, 2));

console.log('Backup saved:', outPath);
console.log('  exercises:', Object.keys(backup.logs).length);
console.log('  sets with weight:', setsWithWeight);
console.log('  completions:', Object.keys(backup.completions).length);
console.log('  server updatedAt:', backup.updatedAt);
