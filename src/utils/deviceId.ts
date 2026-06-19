const DEVICE_ID_KEY = 'b2b-device-id';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const LOCAL_DATA_KEYS = [
  'b2b-workout-logs',
  'b2b-workout-settings',
  'b2b-weight-log',
  'b2b-completions',
  'b2b-updated-at',
] as const;

export function isValidDeviceId(id: string): boolean {
  return UUID_RE.test(id.trim());
}

export function clearWorkoutLocalState(): void {
  for (const key of LOCAL_DATA_KEYS) {
    localStorage.removeItem(key);
  }
}

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function setDeviceId(id: string): void {
  localStorage.setItem(DEVICE_ID_KEY, id.trim());
}

/** Server-backed single profile for production (SHARED_DEVICE_ID env). */
export async function resolveDeviceId(): Promise<{ deviceId: string; shared: boolean }> {
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const data = (await res.json()) as { sharedDeviceId?: string };
      const sharedId = data.sharedDeviceId?.trim();
      if (sharedId && isValidDeviceId(sharedId)) {
        const previous = localStorage.getItem(DEVICE_ID_KEY);
        if (previous !== sharedId) {
          clearWorkoutLocalState();
        }
        localStorage.setItem(DEVICE_ID_KEY, sharedId);
        return { deviceId: sharedId, shared: true };
      }
    }
  } catch {
    // Offline local dev — fall back to per-browser ID
  }

  return { deviceId: getDeviceId(), shared: false };
}
