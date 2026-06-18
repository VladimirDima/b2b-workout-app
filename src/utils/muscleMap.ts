/** Maps workout muscle labels to react-body-highlighter polygon muscle IDs. */
export type RbhMuscle =
  | 'trapezius'
  | 'upper-back'
  | 'lower-back'
  | 'chest'
  | 'biceps'
  | 'triceps'
  | 'forearm'
  | 'back-deltoids'
  | 'front-deltoids'
  | 'abs'
  | 'obliques'
  | 'abductor'
  | 'hamstring'
  | 'quadriceps'
  | 'abductors'
  | 'calves'
  | 'gluteal'
  | 'neck'
  | 'head'
  | 'knees'
  | 'left-soleus'
  | 'right-soleus';

export const ALL_RBH_MUSCLES: RbhMuscle[] = [
  'trapezius',
  'upper-back',
  'lower-back',
  'chest',
  'biceps',
  'triceps',
  'forearm',
  'back-deltoids',
  'front-deltoids',
  'abs',
  'obliques',
  'abductor',
  'hamstring',
  'quadriceps',
  'abductors',
  'calves',
  'gluteal',
  'neck',
  'head',
  'knees',
  'left-soleus',
  'right-soleus',
];

export const MUSCLE_COLORS: Record<string, string> = {
  Chest: '#e85d4c',
  'Upper Chest': '#f07060',
  Triceps: '#d4a03c',
  Shoulders: '#5b8def',
  'Rear Delts': '#7b6fd6',
  Lats: '#3d9e6a',
  Back: '#2d7a52',
  Biceps: '#c45cb0',
  Quads: '#4a90c4',
  Glutes: '#b86b3d',
  Hamstrings: '#8b5a2b',
  Core: '#6b7b8c',
  Abs: '#5a9e8f',
  Obliques: '#4a8a7a',
  Traps: '#9a7b4f',
  'Upper Back': '#3d7a6a',
  Forearms: '#8a6b5a',
  'Rotator Cuff': '#7a8ab0',
  'Hip Abductors': '#a07050',
  'Hip Flexors': '#7090a0',
  'Full Body': '#c6ff00',
};

/** Maps app muscle labels to anatomical SVG muscle groups. */
export const MUSCLE_TO_RBH: Record<string, RbhMuscle[]> = {
  Chest: ['chest'],
  'Upper Chest': ['chest'],
  Triceps: ['triceps'],
  Shoulders: ['front-deltoids', 'back-deltoids'],
  'Rear Delts': ['back-deltoids'],
  Lats: ['upper-back'],
  Back: ['lower-back', 'upper-back'],
  Biceps: ['biceps'],
  Quads: ['quadriceps'],
  Glutes: ['gluteal'],
  Hamstrings: ['hamstring'],
  Core: ['abs', 'obliques'],
  Abs: ['abs'],
  Obliques: ['obliques'],
  Traps: ['trapezius'],
  'Upper Back': ['upper-back', 'trapezius', 'back-deltoids'],
  Forearms: ['forearm'],
  'Rotator Cuff': ['front-deltoids', 'back-deltoids'],
  'Hip Abductors': ['abductors', 'abductor'],
  'Hip Flexors': ['abductors', 'quadriceps'],
  'Full Body': ALL_RBH_MUSCLES,
};

export function getActiveMuscles(muscles: string[]): string[] {
  return muscles.length > 0 ? muscles : ['Full Body'];
}

export function getHighlightedRbhMuscles(muscleGroups: string[]): Set<RbhMuscle> {
  const active = getActiveMuscles(muscleGroups);
  const highlighted = new Set<RbhMuscle>();
  for (const label of active) {
    const mapped = MUSCLE_TO_RBH[label];
    if (mapped) {
      mapped.forEach((id) => highlighted.add(id));
    }
  }
  return highlighted;
}

/** Used by library filter — all unique muscle labels */
export function getAllMuscleLabels(): string[] {
  return Object.keys(MUSCLE_COLORS).filter((m) => m !== 'Full Body').sort();
}
