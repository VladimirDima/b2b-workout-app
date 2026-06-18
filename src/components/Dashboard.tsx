import type { Program } from '../types';
import type { useWorkoutStorage } from '../hooks/useWorkoutStorage';
import { makeLogKey } from '../hooks/useWorkoutStorage';
import {
  computeDashboardStats,
  getPhaseSessionGrid,
  isWeekCompleteForPhase,
} from '../utils/progress';

type Storage = ReturnType<typeof useWorkoutStorage>;

interface DashboardProps {
  program: Program;
  storage: Storage;
  onNavigate: (phaseId: string, dayId: string, week: number) => void;
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className={`stat-card ${accent ? 'accent' : ''}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="progress-ring-wrap">
      <svg viewBox="0 0 120 120" className="progress-ring">
        <circle cx="60" cy="60" r={r} className="ring-bg" />
        <circle
          cx="60"
          cy="60"
          r={r}
          className="ring-fill"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="progress-ring-label">{percent}%</span>
    </div>
  );
}

export function Dashboard({ program, storage, onNavigate }: DashboardProps) {
  const stats = computeDashboardStats(
    program,
    storage.completions,
    storage.logs,
    storage.weightLog,
    storage.settings.startDate,
    makeLogKey
  );

  const currentPhase =
    program.phases.find((p) => p.id === storage.settings.currentPhaseId) ?? program.phases[0];
  const phaseGrid = getPhaseSessionGrid(currentPhase, storage.completions);

  return (
    <div className="dashboard">
      <header className="page-header">
        <h2>Your progress</h2>
        <p>Training stats across the full program.</p>
      </header>

      <section className="dashboard-hero">
        <ProgressRing percent={stats.program.percent} />
        <div className="dashboard-hero-text">
          <h3>Program Progress</h3>
          <p>
            <strong>{stats.program.completedSessions}</strong> of{' '}
            <strong>{stats.program.totalSessions}</strong> workouts completed
          </p>
          {stats.currentStreak > 0 && (
            <p className="streak-badge">{stats.currentStreak} workout streak</p>
          )}
        </div>
      </section>

      <div className="stat-grid">
        <StatCard label="Sets completed" value={stats.setsCompleted} accent />
        <StatCard label="Exercises logged" value={stats.exercisesLogged} />
        <StatCard label="Total volume" value={stats.totalVolume.toLocaleString()} sub="weight × reps" />
        <StatCard label="Days training" value={stats.daysSinceStart} sub="since start date" />
        <StatCard
          label="Weight change"
          value={
            stats.weightChange !== null
              ? `${stats.weightChange > 0 ? '+' : ''}${stats.weightChange}`
              : '—'
          }
          sub={
            stats.startWeight && stats.latestWeight
              ? `${stats.startWeight} → ${stats.latestWeight}`
              : 'Log weigh-ins to track'
          }
        />
        <StatCard label="Workouts done" value={stats.program.completedSessions} sub="all phases" />
      </div>

      <section className="dashboard-section">
        <h3>Phase Progress</h3>
        <div className="phase-progress-list">
          {stats.program.phases.map((phase) => (
            <div key={phase.phaseId} className="phase-progress-row">
              <div className="phase-progress-header">
                <span className={`phase-status ${phase.isComplete ? 'done' : ''}`}>
                  {phase.isComplete ? '✓' : `${phase.completed}/${phase.total}`}
                </span>
                <span className="phase-progress-name">{phase.phaseName.split('—')[0].trim()}</span>
                <span className="phase-progress-pct">{phase.percent}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${phase.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h3>{currentPhase.name.split('—')[0].trim()} — Completion Grid</h3>
        <p className="section-hint">Tap a cell to jump to that workout.</p>
        <div className="completion-grid">
          <div className="completion-grid-header">
            <span />
            {phaseGrid[0]?.weeks.map((w) => (
              <span
                key={w.week}
                className={isWeekCompleteForPhase(currentPhase, w.week, storage.completions) ? 'week-col-done' : ''}
              >
                W{w.week}
                {isWeekCompleteForPhase(currentPhase, w.week, storage.completions) && ' ✓'}
              </span>
            ))}
          </div>
          {phaseGrid.map((row) => (
            <div key={row.dayId} className="completion-grid-row">
              <span className="grid-day-label">{row.dayName}</span>
              {row.weeks.map((cell) => (
                <button
                  key={cell.key}
                  type="button"
                  className={`grid-cell ${cell.complete ? 'complete' : ''}`}
                  title={cell.complete ? 'Completed' : 'Not completed'}
                  onClick={() => onNavigate(currentPhase.id, row.dayId, cell.week)}
                >
                  {cell.complete ? '✓' : ''}
                </button>
              ))}
            </div>
          ))}
        </div>
      </section>

      {stats.muscleFrequency.length > 0 && (
        <section className="dashboard-section">
          <h3>Most Trained Muscles</h3>
          <div className="muscle-freq-list">
            {stats.muscleFrequency.map(({ muscle, count }) => {
              const max = stats.muscleFrequency[0].count;
              return (
                <div key={muscle} className="muscle-freq-row">
                  <span>{muscle}</span>
                  <div className="muscle-freq-bar-wrap">
                    <div
                      className="muscle-freq-bar"
                      style={{ width: `${(count / max) * 100}%` }}
                    />
                  </div>
                  <span className="muscle-freq-count">{count}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {stats.recentCompletions.length > 0 && (
        <section className="dashboard-section">
          <h3>Recent Completions</h3>
          <ul className="recent-list">
            {stats.recentCompletions.map((item) => (
              <li key={item.key}>
                <span className="recent-check">✓</span>
                <div>
                  <span className="recent-label">{item.label}</span>
                  <span className="recent-date">
                    {new Date(item.date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
