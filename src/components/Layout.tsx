import type { Phase, View } from '../types';
import type { PhaseProgress } from '../utils/progress';
import type { SyncStatus } from '../api/storageApi';
import { NavIcon } from './NavIcon';
import { SyncStatusBadge } from './SyncStatus';

interface LayoutProps {
  programName: string;
  phases: Phase[];
  phaseProgress: PhaseProgress[];
  currentPhaseId: string;
  currentView: View;
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  onPhaseChange: (phaseId: string) => void;
  onViewChange: (view: View) => void;
  onSyncClick?: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS: { id: View; label: string }[] = [
  { id: 'workout', label: 'Train' },
  { id: 'dashboard', label: 'Stats' },
  { id: 'warmups', label: 'Warm' },
  { id: 'weight', label: 'Weight' },
  { id: 'library', label: 'Moves' },
];

export function Layout({
  programName,
  phases,
  phaseProgress,
  currentPhaseId,
  currentView,
  syncStatus,
  lastSyncedAt,
  onPhaseChange,
  onViewChange,
  onSyncClick,
  children,
}: LayoutProps) {
  const progressMap = Object.fromEntries(phaseProgress.map((p) => [p.phaseId, p]));

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header-brand">
          <span className="header-eyebrow">Bony to Beastly</span>
          <h1>Workouts</h1>
          <span className="version">{programName}</span>
        </div>
        <SyncStatusBadge
          status={syncStatus}
          lastSyncedAt={lastSyncedAt}
          compact
          onClick={onSyncClick}
        />
      </header>

      <aside className="sidebar">
        <div className="brand">
          <span className="header-eyebrow">Bony to Beastly</span>
          <h1>Workouts</h1>
          <span className="version">{programName}</span>
          <SyncStatusBadge
            status={syncStatus}
            lastSyncedAt={lastSyncedAt}
            onClick={onSyncClick}
          />
        </div>

        <nav className="main-nav" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
            >
              <span className="nav-icon-wrap">
                <NavIcon view={item.id} size={20} />
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        {currentView === 'workout' && (
          <div className="phase-nav">
            <h3>Phase</h3>
            {phases.map((phase) => {
              const prog = progressMap[phase.id];
              return (
                <button
                  key={phase.id}
                  type="button"
                  className={`phase-btn ${currentPhaseId === phase.id ? 'active' : ''} ${prog?.isComplete ? 'complete' : ''}`}
                  onClick={() => onPhaseChange(phase.id)}
                >
                  <span className="phase-btn-label">{phase.name.split('—')[0].trim()}</span>
                  <span className="phase-btn-progress">
                    {prog?.isComplete ? '✓' : `${prog?.completed ?? 0}/${prog?.total ?? 0}`}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </aside>

      <main className="main-content">{children}</main>

      <nav className="bottom-nav" aria-label="Main">
        <div className="bottom-nav-inner">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`bottom-nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
              aria-label={item.label}
              aria-current={currentView === item.id ? 'page' : undefined}
            >
              <span className="bottom-nav-icon-wrap">
                <NavIcon view={item.id} />
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
