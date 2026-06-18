import { useState } from 'react';
import { BodyDiagram } from './BodyDiagram';
import { MuscleMapModal } from './MuscleMapModal';

interface MuscleMapButtonProps {
  exerciseName: string;
  muscleGroups: string[];
  compact?: boolean;
}

export function MuscleMapButton({ exerciseName, muscleGroups, compact = false }: MuscleMapButtonProps) {
  const [open, setOpen] = useState(false);

  if (muscleGroups.length === 0) return null;

  return (
    <>
      <button
        type="button"
        className={`muscle-map-btn ${compact ? 'compact' : ''}`}
        onClick={() => setOpen(true)}
        title="View muscles worked"
        aria-label={`View muscle map for ${exerciseName}`}
      >
        <span className="muscle-map-btn-preview" aria-hidden="true">
          <BodyDiagram muscleGroups={muscleGroups} compact tone="light" />
        </span>
        {!compact && <span className="muscle-map-btn-label">Muscles</span>}
      </button>

      {open && (
        <MuscleMapModal
          exerciseName={exerciseName}
          muscleGroups={muscleGroups}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
