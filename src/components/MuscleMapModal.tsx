import { BodyDiagram, MuscleLegend } from './BodyDiagram';
import { ModalPortal } from './ModalPortal';

interface MuscleMapModalProps {
  exerciseName: string;
  muscleGroups: string[];
  onClose: () => void;
}

export function MuscleMapModal({ exerciseName, muscleGroups, onClose }: MuscleMapModalProps) {
  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose} role="presentation">
        <div className="modal-content muscle-map-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <h3>{exerciseName}</h3>
              <p className="modal-subtitle">Muscles worked</p>
            </div>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
              <span aria-hidden="true">✕</span>
            </button>
          </div>

          <div className="muscle-map-body">
            <div className="body-diagram-wrap">
              <BodyDiagram muscleGroups={muscleGroups} />
            </div>
            <MuscleLegend muscleGroups={muscleGroups} />
          </div>

          <p className="muscle-map-hint">Highlighted areas show primary muscles targeted by this exercise.</p>
        </div>
      </div>
    </ModalPortal>
  );
}
