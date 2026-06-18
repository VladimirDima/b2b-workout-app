const DEVICE_ID_KEY = 'b2b-device-id';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidDeviceId(id: string): boolean {
  return UUID_RE.test(id.trim());
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
