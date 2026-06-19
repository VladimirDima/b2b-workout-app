import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppSettings, CompletionRecord, CompletionState, SetLog, WeightEntry, WorkoutLogs } from '../types';
import { applySetPatch, createDefaultSetLog, normalizeSetLog } from '../utils/setLog';
import { fetchRemoteState, saveRemoteState, type SyncStatus } from '../api/storageApi';
import { setDeviceId, isValidDeviceId, clearWorkoutLocalState, resolveDeviceId } from '../utils/deviceId';

const LOGS_KEY = 'b2b-workout-logs';
const SETTINGS_KEY = 'b2b-workout-settings';
const WEIGHT_KEY = 'b2b-weight-log';
const COMPLETIONS_KEY = 'b2b-completions';
const UPDATED_AT_KEY = 'b2b-updated-at';

const defaultSettings: AppSettings = {
  currentPhaseId: 'phase-0',
  currentDayId: 'day-1',
  currentWeek: 1,
  startDate: new Date().toISOString().split('T')[0],
  bodyWeight: '',
};

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function loadLocalState() {
  return {
    logs: loadJson<WorkoutLogs>(LOGS_KEY, {}),
    settings: loadJson(SETTINGS_KEY, defaultSettings),
    weightLog: loadJson<WeightEntry[]>(WEIGHT_KEY, []),
    completions: loadJson<CompletionState>(COMPLETIONS_KEY, {}),
    updatedAt: localStorage.getItem(UPDATED_AT_KEY) ?? undefined,
  };
}

function saveLocalState(state: {
  logs: WorkoutLogs;
  settings: AppSettings;
  weightLog: WeightEntry[];
  completions: CompletionState;
  updatedAt?: string;
}) {
  localStorage.setItem(LOGS_KEY, JSON.stringify(state.logs));
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
  localStorage.setItem(WEIGHT_KEY, JSON.stringify(state.weightLog));
  localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(state.completions));
  if (state.updatedAt) {
    localStorage.setItem(UPDATED_AT_KEY, state.updatedAt);
  }
}

function clearLocalState() {
  clearWorkoutLocalState();
}

async function loadRemoteProfile(deviceId: string) {
  const remote = await fetchRemoteState(deviceId);
  if (!remote?.updatedAt) {
    return {
      logs: {} as WorkoutLogs,
      settings: { ...defaultSettings },
      weightLog: [] as WeightEntry[],
      completions: {} as CompletionState,
      updatedAt: undefined,
    };
  }

  return {
    logs: remote.logs,
    settings: { ...defaultSettings, ...remote.settings },
    weightLog: remote.weightLog,
    completions: remote.completions,
    updatedAt: remote.updatedAt,
  };
}

function hasAnyData(state: ReturnType<typeof loadLocalState>) {
  return (
    Object.keys(state.logs).length > 0 ||
    Object.keys(state.completions).length > 0 ||
    state.weightLog.length > 0 ||
    state.settings.bodyWeight !== '' ||
    state.settings.startDate !== defaultSettings.startDate
  );
}

export function makeLogKey(phaseId: string, dayId: string, week: number, exerciseName: string) {
  return `${phaseId}::${dayId}::w${week}::${exerciseName}`;
}

export function useWorkoutStorage() {
  const [logs, setLogs] = useState<WorkoutLogs>({});
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [weightLog, setWeightLog] = useState<WeightEntry[]>([]);
  const [completions, setCompletions] = useState<CompletionState>({});
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('loading');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [deviceId, setDeviceIdState] = useState<string | null>(null);
  const [sharedMode, setSharedMode] = useState(false);
  const readyRef = useRef(false);
  const forceRemoteRef = useRef(false);
  const sharedModeRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Resolve device ID (shared profile on server, or per-browser locally)
  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const resolved = await resolveDeviceId();
      if (cancelled) return;

      sharedModeRef.current = resolved.shared;
      setSharedMode(resolved.shared);
      if (resolved.shared) {
        forceRemoteRef.current = true;
      }
      setDeviceIdState(resolved.deviceId);
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load from server (or local fallback) once device ID is known
  useEffect(() => {
    if (!deviceId) return;

    const id = deviceId;
    let cancelled = false;

    async function init() {
      const forceRemote = forceRemoteRef.current;
      forceRemoteRef.current = false;

      if (forceRemote) {
        try {
          const profile = await loadRemoteProfile(id);
          if (cancelled) return;

          setLogs(profile.logs);
          setSettings(profile.settings);
          setWeightLog(profile.weightLog);
          setCompletions(profile.completions);
          saveLocalState(profile);
          setLastSyncedAt(profile.updatedAt ?? null);
          setSyncStatus('synced');
        } catch {
          if (cancelled) return;
          setSyncStatus('offline');
        }

        readyRef.current = true;
        return;
      }

      const local = loadLocalState();

      try {
        const remote = await fetchRemoteState(id);

        if (cancelled) return;

        if (sharedModeRef.current && remote?.updatedAt) {
          setLogs(remote.logs);
          setSettings({ ...defaultSettings, ...remote.settings });
          setWeightLog(remote.weightLog);
          setCompletions(remote.completions);
          saveLocalState({ ...remote, updatedAt: remote.updatedAt });
          setLastSyncedAt(remote.updatedAt);
        } else if (remote?.updatedAt) {
          const localTime = local.updatedAt ? Date.parse(local.updatedAt) : 0;
          const remoteTime = Date.parse(remote.updatedAt);

          if (remoteTime >= localTime) {
            setLogs(remote.logs);
            setSettings({ ...defaultSettings, ...remote.settings });
            setWeightLog(remote.weightLog);
            setCompletions(remote.completions);
            saveLocalState({ ...remote, updatedAt: remote.updatedAt });
            setLastSyncedAt(remote.updatedAt);
          } else {
            setLogs(local.logs);
            setSettings(local.settings);
            setWeightLog(local.weightLog);
            setCompletions(local.completions);
            const updatedAt = await saveRemoteState(id, local);
            saveLocalState({ ...local, updatedAt });
            setLastSyncedAt(updatedAt);
          }
        } else if (!sharedModeRef.current && hasAnyData(local)) {
          setLogs(local.logs);
          setSettings(local.settings);
          setWeightLog(local.weightLog);
          setCompletions(local.completions);
          const updatedAt = await saveRemoteState(id, local);
          saveLocalState({ ...local, updatedAt });
          setLastSyncedAt(updatedAt);
        } else if (sharedModeRef.current) {
          setLogs({});
          setSettings({ ...defaultSettings });
          setWeightLog([]);
          setCompletions({});
        } else {
          setLogs(local.logs);
          setSettings(local.settings);
          setWeightLog(local.weightLog);
          setCompletions(local.completions);
        }

        if (!cancelled) setSyncStatus('synced');
      } catch {
        if (cancelled) return;
        if (!sharedModeRef.current) {
          setLogs(local.logs);
          setSettings(local.settings);
          setWeightLog(local.weightLog);
          setCompletions(local.completions);
        }
        setSyncStatus('offline');
      }

      readyRef.current = true;
    }

    readyRef.current = false;
    init();
    return () => {
      cancelled = true;
    };
  }, [deviceId]);

  // Persist locally + debounced remote save
  useEffect(() => {
    if (!deviceId || !readyRef.current) return;

    const state = { logs, settings, weightLog, completions };
    const updatedAt = new Date().toISOString();
    saveLocalState({ ...state, updatedAt });

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      try {
        const syncedAt = await saveRemoteState(deviceId, state);
        setLastSyncedAt(syncedAt);
        saveLocalState({ ...state, updatedAt: syncedAt });
        setSyncStatus('synced');
      } catch {
        setSyncStatus('offline');
      }
    }, 600);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [logs, settings, weightLog, completions, deviceId]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const getExerciseLog = useCallback(
    (key: string, setCount: number) => {
      const existing = logs[key]?.sets ?? [];
      return Array.from({ length: setCount }, (_, i) =>
        existing[i] ? normalizeSetLog(existing[i]) : createDefaultSetLog()
      );
    },
    [logs]
  );

  const updateSetLog = useCallback(
    (key: string, setIndex: number, patch: Partial<SetLog>, setCount: number) => {
      setLogs((prev) => {
        const current = prev[key]?.sets ?? [];
        const sets = applySetPatch(current, setIndex, patch, setCount);
        return { ...prev, [key]: { sets } };
      });
    },
    []
  );

  const addWeightEntry = useCallback((entry: WeightEntry) => {
    setWeightLog((prev) => [entry, ...prev.filter((e) => e.date !== entry.date)]);
  }, []);

  const markSessionComplete = useCallback((sessionKey: string) => {
    const record: CompletionRecord = { completedAt: new Date().toISOString() };
    setCompletions((prev) => ({ ...prev, [sessionKey]: record }));
  }, []);

  const unmarkSessionComplete = useCallback((sessionKey: string) => {
    setCompletions((prev) => {
      const next = { ...prev };
      delete next[sessionKey];
      return next;
    });
  }, []);

  const toggleSessionComplete = useCallback(
    (sessionKey: string, complete: boolean) => {
      if (complete) markSessionComplete(sessionKey);
      else unmarkSessionComplete(sessionKey);
    },
    [markSessionComplete, unmarkSessionComplete]
  );

  const setSyncId = useCallback((syncId: string) => {
    const trimmed = syncId.trim();
    if (!isValidDeviceId(trimmed)) return false;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    clearLocalState();
    setDeviceId(trimmed);
    setDeviceIdState(trimmed);
    forceRemoteRef.current = true;
    readyRef.current = false;
    setSyncStatus('loading');
    return true;
  }, []);

  return {
    logs,
    settings,
    weightLog,
    completions,
    syncStatus,
    lastSyncedAt,
    deviceId,
    setSyncId,
    sharedMode,
    updateSettings,
    getExerciseLog,
    updateSetLog,
    addWeightEntry,
    markSessionComplete,
    unmarkSessionComplete,
    toggleSessionComplete,
  };
}
