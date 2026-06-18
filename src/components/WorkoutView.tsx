import { useMemo } from 'react';
import type { Phase } from '../types';
import type { PhaseProgress } from '../utils/progress';
import { makeLogKey } from '../hooks/useWorkoutStorage';
import type { useWorkoutStorage } from '../hooks/useWorkoutStorage';
import { ExerciseCard } from './ExerciseCard';
import {
  getSessionSetProgress,
  isSessionComplete,
  isWeekCompleteForPhase,
  makeSessionKey,
  WEEKS,
} from '../utils/progress';

type Storage = ReturnType<typeof useWorkoutStorage>;

interface WorkoutViewProps {
  phases: Phase[];
  phaseProgress: PhaseProgress[];
  phase: Phase;
  dayId: string;
  week: number;
  storage: Storage;
  onPhaseChange: (phaseId: string) => void;
  onDayChange: (dayId: string) => void;
  onWeekChange: (week: number) => void;
}

export function WorkoutView({
  phases,
  phaseProgress,
  phase,
  dayId,
  week,
  storage,
  onPhaseChange,
  onDayChange,
  onWeekChange,
}: WorkoutViewProps) {
  const day = phase.days.find((d) => d.id === dayId) ?? phase.days[0];
  const sessionKey = makeSessionKey(phase.id, day.id, week);
  const sessionComplete = isSessionComplete(sessionKey, storage.completions);
  const progressMap = Object.fromEntries(phaseProgress.map((p) => [p.phaseId, p]));

  const setProgress = useMemo(
    () => getSessionSetProgress(phase, day.id, week, storage.logs, makeLogKey),
    [phase, day.id, week, storage.logs]
  );

  const isDayComplete = (dId: string) =>
    WEEKS.every((w) => isSessionComplete(makeSessionKey(phase.id, dId, w), storage.completions));

  const isWeekComplete = (w: number) =>
    isWeekCompleteForPhase(phase, w, storage.completions);

  return (
    <div className="workout-view">
      <div className="phase-scroll">
        {phases.map((p) => {
          const prog = progressMap[p.id];
          const shortName = p.name.split('—')[0].trim().replace('Phase ', 'Ph ');
          return (
            <button
              key={p.id}
              type="button"
              className={`phase-pill ${p.id === phase.id ? 'active' : ''} ${prog?.isComplete ? 'complete' : ''}`}
              onClick={() => onPhaseChange(p.id)}
            >
              {shortName}
              <span className="phase-pill-count">
                {prog?.isComplete ? '✓' : `${prog?.completed ?? 0}/${prog?.total ?? 0}`}
              </span>
            </button>
          );
        })}
      </div>

      <header className="page-header">
        <div className="workout-header-row">
          <div>
            <h2>{phase.name.split('—')[0].trim()}</h2>
            <p>{day.name.replace('DAY ', 'Day ')} · Week {week}</p>
          </div>
          {sessionComplete && <span className="session-complete-badge">✓ Done</span>}
        </div>
      </header>

      <div className={`session-progress-bar ${sessionComplete ? 'complete' : ''}`}>
        <div className="session-progress-top">
          <span className="session-progress-label">
            {sessionComplete
              ? 'Workout complete'
              : `${setProgress.completedSets}/${setProgress.totalSets} sets done`}
          </span>
          <div className="session-progress-track">
            <div
              className="session-progress-fill"
              style={{ width: `${sessionComplete ? 100 : setProgress.percent}%` }}
            />
          </div>
        </div>
        <button
          type="button"
          className={`complete-workout-btn ${sessionComplete ? 'done' : ''}`}
          onClick={() => storage.toggleSessionComplete(sessionKey, !sessionComplete)}
        >
          <span>{sessionComplete ? 'Undo complete' : 'Mark workout complete'}</span>
          <span className="btn-arrow" aria-hidden="true">→</span>
        </button>
      </div>

      <div className="controls-row">
        <div className="tab-scroll">
          <div className="tab-group">
            {phase.days.map((d) => {
              const done = isDayComplete(d.id);
              const currentWeekDone = isSessionComplete(
                makeSessionKey(phase.id, d.id, week),
                storage.completions
              );
              return (
                <button
                  key={d.id}
                  type="button"
                  className={`tab ${d.id === day.id ? 'active' : ''} ${done ? 'all-done' : ''} ${currentWeekDone ? 'session-done' : ''}`}
                  onClick={() => onDayChange(d.id)}
                >
                  {currentWeekDone && !done && <span className="tab-check">✓</span>}
                  {done && <span className="tab-check">✓</span>}
                  {d.name.replace('DAY ', 'Day ')}
                </button>
              );
            })}
          </div>
        </div>

        <div className="week-selector">
          <label>Week</label>
          <div className="week-pills">
            {WEEKS.map((w) => (
              <button
                key={w}
                type="button"
                className={`week-pill ${w === week ? 'active' : ''} ${isWeekComplete(w) ? 'done' : ''}`}
                onClick={() => onWeekChange(w)}
                aria-label={`Week ${w}${isWeekComplete(w) ? ', complete' : ''}`}
              >
                {isWeekComplete(w) && <span className="pill-check">✓</span>}
                {w}
              </button>
            ))}
          </div>
        </div>
      </div>

      {day.blocks.map((block) => (
        <section key={block.id} className="workout-block">
          <h3 className="block-title">{block.name}</h3>
          <div className="exercise-list" key={`${day.id}-w${week}`}>
            {block.exercises.map((exercise) => {
              const weekData = exercise.progression.find((p) => Number(p.week) === week);
              const logKey = makeLogKey(phase.id, day.id, week, exercise.name);
              const setCount = Number(weekData?.sets) || 3;
              const setLogs = storage.getExerciseLog(logKey, setCount);
              const exerciseDone = setLogs.length > 0 && setLogs.every((s) => s.completed);

              return (
                <ExerciseCard
                  key={exercise.name}
                  exercise={exercise}
                  weekData={weekData}
                  setLogs={setLogs}
                  exerciseDone={exerciseDone}
                  onSetChange={(setIndex, patch) =>
                    storage.updateSetLog(logKey, setIndex, patch, setCount)
                  }
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
