import { MUSCLE_COLORS } from '../utils/muscleMap';

interface MuscleBadgeProps {
  muscle: string;
}

export function MuscleBadge({ muscle }: MuscleBadgeProps) {
  const color = MUSCLE_COLORS[muscle] ?? '#666';
  return (
    <span className="muscle-badge" style={{ '--muscle-color': color } as React.CSSProperties}>
      {muscle}
    </span>
  );
}
