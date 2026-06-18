import type { CompletionState, Phase, Program, WorkoutLogs, WeightEntry } from '../types';

export const WEEKS = [1, 2, 3, 4, 5] as const;

export function makeSessionKey(phaseId: string, dayId: string, week: number) {
  return `${phaseId}::${dayId}::w${week}`;
}

export function parseSessionKey(key: string) {
  const [phaseId, dayId, weekPart] = key.split('::');
  return { phaseId, dayId, week: Number(weekPart.replace('w', '')) };
}

export function getAllSessionKeys(phases: Phase[]): string[] {
  const keys: string[] = [];
  for (const phase of phases) {
    for (const day of phase.days) {
      for (const week of WEEKS) {
        keys.push(makeSessionKey(phase.id, day.id, week));
      }
    }
  }
  return keys;
}

export function getDayExercises(phase: Phase, dayId: string) {
  const day = phase.days.find((d) => d.id === dayId);
  if (!day) return [];
  return day.blocks.flatMap((b) => b.exercises);
}

export function getSessionSetProgress(
  phase: Phase,
  dayId: string,
  week: number,
  logs: WorkoutLogs,
  makeLogKey: (phaseId: string, dayId: string, week: number, exerciseName: string) => string
) {
  const exercises = getDayExercises(phase, dayId);
  let totalSets = 0;
  let completedSets = 0;

  for (const exercise of exercises) {
    const weekData = exercise.progression.find((p) => Number(p.week) === week);
    const setCount = Number(weekData?.sets) || 3;
    totalSets += setCount;
    const key = makeLogKey(phase.id, dayId, week, exercise.name);
    const sets = logs[key]?.sets ?? [];
    for (let i = 0; i < setCount; i++) {
      if (sets[i]?.completed) completedSets++;
    }
  }

  return {
    totalSets,
    completedSets,
    percent: totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0,
    allSetsDone: totalSets > 0 && completedSets === totalSets,
  };
}

export function isSessionComplete(
  sessionKey: string,
  completions: CompletionState
): boolean {
  return Boolean(completions[sessionKey]);
}

/** Week is complete only when every day in the phase has that week's workout done. */
export function isWeekCompleteForPhase(
  phase: Phase,
  week: number,
  completions: CompletionState
): boolean {
  return phase.days.every((day) =>
    isSessionComplete(makeSessionKey(phase.id, day.id, week), completions)
  );
}

export function getWeekCompletionCount(
  phase: Phase,
  week: number,
  completions: CompletionState
): { completed: number; total: number } {
  const total = phase.days.length;
  const completed = phase.days.filter((day) =>
    isSessionComplete(makeSessionKey(phase.id, day.id, week), completions)
  ).length;
  return { completed, total };
}

export interface PhaseProgress {
  phaseId: string;
  phaseName: string;
  completed: number;
  total: number;
  percent: number;
  isComplete: boolean;
}

export interface ProgramProgress {
  totalSessions: number;
  completedSessions: number;
  percent: number;
  phases: PhaseProgress[];
}

export function computeProgramProgress(
  program: Program,
  completions: CompletionState
): ProgramProgress {
  const phases = program.phases.map((phase) => {
    const total = phase.days.length * WEEKS.length;
    let completed = 0;
    for (const day of phase.days) {
      for (const week of WEEKS) {
        if (completions[makeSessionKey(phase.id, day.id, week)]) completed++;
      }
    }
    return {
      phaseId: phase.id,
      phaseName: phase.name,
      completed,
      total,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      isComplete: completed === total,
    };
  });

  const totalSessions = phases.reduce((s, p) => s + p.total, 0);
  const completedSessions = phases.reduce((s, p) => s + p.completed, 0);

  return {
    totalSessions,
    completedSessions,
    percent: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
    phases,
  };
}

export interface DashboardStats {
  program: ProgramProgress;
  setsCompleted: number;
  setsLogged: number;
  exercisesLogged: number;
  totalVolume: number;
  weightChange: number | null;
  startWeight: string | null;
  latestWeight: string | null;
  daysSinceStart: number;
  recentCompletions: { key: string; label: string; date: string }[];
  muscleFrequency: { muscle: string; count: number }[];
  currentStreak: number;
}

function parseNumber(val: string): number | null {
  const n = parseFloat(val.replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : null;
}

export function computeDashboardStats(
  program: Program,
  completions: CompletionState,
  logs: WorkoutLogs,
  weightLog: WeightEntry[],
  startDate: string,
  makeLogKey: (phaseId: string, dayId: string, week: number, exerciseName: string) => string
): DashboardStats {
  const programProgress = computeProgramProgress(program, completions);

  let setsCompleted = 0;
  let setsLogged = 0;
  let exercisesLogged = 0;
  let totalVolume = 0;
  const muscleCounts: Record<string, number> = {};

  for (const phase of program.phases) {
    for (const day of phase.days) {
      for (const week of WEEKS) {
        for (const block of day.blocks) {
          for (const exercise of block.exercises) {
            const key = makeLogKey(phase.id, day.id, week, exercise.name);
            const sets = logs[key]?.sets ?? [];
            if (sets.some((s) => s.weight || s.reps || s.completed)) {
              exercisesLogged++;
              for (const muscle of exercise.muscleGroups) {
                muscleCounts[muscle] = (muscleCounts[muscle] ?? 0) + 1;
              }
            }
            for (const set of sets) {
              if (set.weight || set.reps) setsLogged++;
              if (set.completed) {
                setsCompleted++;
                const w = parseNumber(set.weight);
                const r = parseNumber(set.reps);
                if (w !== null && r !== null) totalVolume += w * r;
              }
            }
          }
        }
      }
    }
  }

  const sortedWeights = [...weightLog].sort((a, b) => a.date.localeCompare(b.date));
  const startWeight = sortedWeights[0]?.weight ?? null;
  const latestWeight = sortedWeights[sortedWeights.length - 1]?.weight ?? null;
  const startNum = startWeight ? parseNumber(startWeight) : null;
  const latestNum = latestWeight ? parseNumber(latestWeight) : null;
  const weightChange =
    startNum !== null && latestNum !== null ? Math.round((latestNum - startNum) * 10) / 10 : null;

  const daysSinceStart = startDate
    ? Math.max(
        0,
        Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
      )
    : 0;

  const recentCompletions = Object.entries(completions)
    .map(([key, record]) => {
      const { phaseId, dayId, week } = parseSessionKey(key);
      const phase = program.phases.find((p) => p.id === phaseId);
      const day = phase?.days.find((d) => d.id === dayId);
      const phaseLabel = phase?.name.split('—')[0].trim() ?? phaseId;
      const dayLabel = day?.name.replace('DAY ', 'Day ') ?? dayId;
      return {
        key,
        label: `${phaseLabel} · ${dayLabel} · Week ${week}`,
        date: record.completedAt,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  const muscleFrequency = Object.entries(muscleCounts)
    .map(([muscle, count]) => ({ muscle, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const currentStreak = computeStreak(completions, program);

  return {
    program: programProgress,
    setsCompleted,
    setsLogged,
    exercisesLogged,
    totalVolume: Math.round(totalVolume),
    weightChange,
    startWeight,
    latestWeight,
    daysSinceStart,
    recentCompletions,
    muscleFrequency,
    currentStreak,
  };
}

function computeStreak(completions: CompletionState, program: Program): number {
  const allKeys = getAllSessionKeys(program.phases);
  const completedKeys = new Set(Object.keys(completions));
  let streak = 0;
  for (const key of allKeys) {
    if (completedKeys.has(key)) streak++;
    else break;
  }
  return streak;
}

export function getSessionLabel(
  program: Program,
  phaseId: string,
  dayId: string,
  week: number
): string {
  const phase = program.phases.find((p) => p.id === phaseId);
  const day = phase?.days.find((d) => d.id === dayId);
  return `${phase?.name.split('—')[0].trim() ?? phaseId} · ${day?.name.replace('DAY ', 'Day ') ?? dayId} · Week ${week}`;
}

export function getPhaseSessionGrid(phase: Phase, completions: CompletionState) {
  return phase.days.map((day) => ({
    dayId: day.id,
    dayName: day.name.replace('DAY ', 'Day '),
    weeks: WEEKS.map((week) => ({
      week,
      key: makeSessionKey(phase.id, day.id, week),
      complete: Boolean(completions[makeSessionKey(phase.id, day.id, week)]),
    })),
  }));
}
