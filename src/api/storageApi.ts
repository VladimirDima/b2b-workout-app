import type { AppSettings, CompletionState, WorkoutLogs, WeightEntry } from '../types';

export interface PersistedState {
  logs: WorkoutLogs;
  settings: AppSettings;
  weightLog: WeightEntry[];
  completions: CompletionState;
  updatedAt?: string;
}

export type SyncStatus = 'loading' | 'synced' | 'offline' | 'error';

const API_BASE = '/api';

export async function fetchRemoteState(deviceId: string): Promise<PersistedState | null> {
  const res = await fetch(`${API_BASE}/data/${deviceId}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const data = await res.json();
  return {
    logs: data.logs,
    settings: data.settings,
    weightLog: data.weightLog,
    completions: data.completions,
    updatedAt: data.updatedAt,
  };
}

export async function saveRemoteState(
  deviceId: string,
  state: PersistedState
): Promise<string> {
  const res = await fetch(`${API_BASE}/data/${deviceId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      logs: state.logs,
      settings: state.settings,
      weightLog: state.weightLog,
      completions: state.completions,
    }),
  });
  if (!res.ok) throw new Error(`Save failed: ${res.status}`);
  const data = await res.json();
  return data.updatedAt as string;
}

export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
