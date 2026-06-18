export interface ProgressionWeek {
  week: number | string;
  sets: number | string;
  reps: number | string;
  notes?: string;
  rir?: number | null;
  rirNote?: string;
  rest?: string;
}

export interface Exercise {
  name: string;
  videoUrl: string | null;
  muscleGroups: string[];
  progression: ProgressionWeek[];
}

export interface WorkoutBlock {
  id: string;
  name: string;
  exercises: Exercise[];
}

export interface WorkoutDay {
  id: string;
  name: string;
  blocks: WorkoutBlock[];
}

export interface Phase {
  id: string;
  name: string;
  days: WorkoutDay[];
}

export interface WarmupExercise {
  name: string;
  instructions: string;
  videoUrl: string | null;
  muscleGroups: string[];
}

export interface WarmupSection {
  name: string;
  exercises: WarmupExercise[];
}

export interface Program {
  name: string;
  version: string;
  warmups: WarmupSection[];
  phases: Phase[];
  videoLinks: Record<string, string>;
}

export interface SetLog {
  weight: string;
  reps: string;
  completed: boolean;
}

export interface ExerciseLog {
  sets: SetLog[];
}

export interface WorkoutLogs {
  [key: string]: ExerciseLog;
}

export interface WeightEntry {
  date: string;
  weight: string;
}

export interface CompletionRecord {
  completedAt: string;
}

export type CompletionState = Record<string, CompletionRecord>;

export interface AppSettings {
  currentPhaseId: string;
  currentDayId: string;
  currentWeek: number;
  startDate: string;
  bodyWeight: string;
}

export type View = 'workout' | 'dashboard' | 'warmups' | 'weight' | 'library';
