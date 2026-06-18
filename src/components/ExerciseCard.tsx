import { useState } from 'react';
import type { Exercise, ProgressionWeek, SetLog } from '../types';
import { MuscleMapButton } from './MuscleMapButton';
import { VideoModal } from './VideoModal';

interface ExerciseCardProps {
  exercise: Exercise;
  weekData: ProgressionWeek | undefined;
  setLogs: SetLog[];
  exerciseDone?: boolean;
  onSetChange: (setIndex: number, patch: Partial<SetLog>) => void;
}

export function ExerciseCard({ exercise, weekData, setLogs, exerciseDone, onSetChange }: ExerciseCardProps) {
  const [showVideo, setShowVideo] = useState(false);
  const setCount = Number(weekData?.sets) || setLogs.length || 3;

  return (
    <article className={`exercise-card ${exerciseDone ? 'exercise-done' : ''}`}>
      <div className="exercise-header">
        <div>
          <div className="exercise-title-row">
            <h4>{exercise.name}</h4>
            {exerciseDone && <span className="exercise-done-badge" title="All sets complete">✓</span>}
          </div>
          <MuscleMapButton exerciseName={exercise.name} muscleGroups={exercise.muscleGroups} />
        </div>
        <div className="exercise-actions">
          {exercise.videoUrl && (
            <button
              type="button"
              className="video-btn"
              onClick={() => setShowVideo(true)}
              title="Watch tutorial"
            >
              Watch
            </button>
          )}
        </div>
      </div>

      {weekData && (
        <div className="prescription">
          <span className="prescription-item">
            <strong>{weekData.sets}</strong> sets
          </span>
          <span className="prescription-item">
            <strong>{weekData.reps}</strong> reps
          </span>
          {weekData.rir !== undefined && weekData.rir !== null && (
            <span className="prescription-item rir-badge" title={weekData.rirNote}>
              <strong>RIR {weekData.rir}</strong>
            </span>
          )}
          {weekData.rest && (
            <span className="prescription-item rest-badge">{weekData.rest}</span>
          )}
          {weekData.notes && <p className="exercise-notes">{weekData.notes}</p>}
        </div>
      )}

      <div className="set-logging">
        <div className="set-log-header">
          <span>Set</span>
          <span>Weight</span>
          <span>Reps</span>
          <span>Done</span>
        </div>
        {Array.from({ length: setCount }, (_, i) => {
          const log = setLogs[i] ?? { weight: '', reps: '', completed: false };
          return (
            <div key={i} className={`set-row ${log.completed ? 'completed' : ''}`}>
              <span className="set-num">{i + 1}</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="lbs/kg"
                value={log.weight}
                onChange={(e) => onSetChange(i, { weight: e.target.value })}
              />
              <input
                type="text"
                inputMode="numeric"
                placeholder="reps"
                value={log.reps}
                onChange={(e) => onSetChange(i, { reps: e.target.value })}
              />
              <input
                type="checkbox"
                checked={log.completed}
                onChange={(e) => onSetChange(i, { completed: e.target.checked })}
                aria-label={`Mark set ${i + 1} complete`}
              />
            </div>
          );
        })}
      </div>

      {showVideo && exercise.videoUrl && (
        <VideoModal
          title={exercise.name}
          videoUrl={exercise.videoUrl}
          onClose={() => setShowVideo(false)}
        />
      )}
    </article>
  );
}
