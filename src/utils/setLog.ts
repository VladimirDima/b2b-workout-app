import type { SetLog } from '../types';

export function isSetLogComplete(weight: string, reps: string): boolean {
  return weight.trim() !== '' && reps.trim() !== '';
}

export function normalizeSetLog(raw?: Partial<SetLog>): SetLog {
  const weight = raw?.weight ?? '';
  const reps = raw?.reps ?? '';

  return {
    weight,
    reps,
    completed: raw?.completed ?? isSetLogComplete(weight, reps),
  };
}

export function createDefaultSetLog(): SetLog {
  return { weight: '', reps: '', completed: false };
}

function readSet(raw: SetLog | undefined): SetLog {
  if (!raw) return createDefaultSetLog();
  return {
    weight: raw.weight ?? '',
    reps: raw.reps ?? '',
    completed: raw.completed ?? false,
  };
}

function applyToSet(
  sets: SetLog[],
  index: number,
  patch: Partial<SetLog>,
  updateCompleted: boolean
): void {
  const current = sets[index];
  const weight = patch.weight !== undefined ? patch.weight : current.weight;
  const reps = patch.reps !== undefined ? patch.reps : current.reps;

  sets[index] = {
    weight,
    reps,
    completed: updateCompleted ? isSetLogComplete(weight, reps) : current.completed,
  };
}

export function applySetPatch(
  sets: SetLog[],
  setIndex: number,
  patch: Partial<SetLog>,
  setCount: number
): SetLog[] {
  const next = Array.from({ length: setCount }, (_, i) => readSet(sets[i]));

  applyToSet(next, setIndex, patch, true);

  if (setIndex === 0) {
    for (let i = 1; i < setCount; i++) {
      const copyPatch: Partial<SetLog> = {};
      if (patch.weight !== undefined) copyPatch.weight = next[0].weight;
      if (patch.reps !== undefined) copyPatch.reps = next[0].reps;
      if (Object.keys(copyPatch).length > 0) {
        applyToSet(next, i, copyPatch, false);
      }
    }
  }

  return next;
}
