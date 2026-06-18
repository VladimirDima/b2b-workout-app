import { useMemo, useState } from 'react';
import rawData from './data/workoutData.json';
import { Layout } from './components/Layout';
import { WorkoutView } from './components/WorkoutView';
import { Dashboard } from './components/Dashboard';
import { WarmupsView } from './components/WarmupsView';
import { WeightTracker } from './components/WeightTracker';
import { ExerciseLibrary } from './components/ExerciseLibrary';
import { SyncSettingsModal } from './components/SyncSettingsModal';
import { useWorkoutStorage } from './hooks/useWorkoutStorage';
import { computeProgramProgress } from './utils/progress';
import type { Program, View } from './types';
import './App.css';

const program = (rawData as { program: Program }).program;

function App() {
  const storage = useWorkoutStorage();
  const [view, setView] = useState<View>('workout');
  const [syncOpen, setSyncOpen] = useState(false);

  const currentPhase = useMemo(
    () =>
      program.phases.find((p) => p.id === storage.settings.currentPhaseId) ??
      program.phases[0],
    [storage.settings.currentPhaseId]
  );

  const programProgress = useMemo(
    () => computeProgramProgress(program, storage.completions),
    [storage.completions]
  );

  const navigateToWorkout = (phaseId: string, dayId: string, week: number) => {
    storage.updateSettings({ currentPhaseId: phaseId, currentDayId: dayId, currentWeek: week });
    setView('workout');
  };

  if (storage.syncStatus === 'loading') {
    return (
      <div className="app-loading">
        <p>Loading your progress…</p>
      </div>
    );
  }

  return (
    <Layout
      programName={`v${program.version}`}
      phases={program.phases}
      phaseProgress={programProgress.phases}
      currentPhaseId={storage.settings.currentPhaseId}
      currentView={view}
      syncStatus={storage.syncStatus}
      lastSyncedAt={storage.lastSyncedAt}
      onPhaseChange={(id) => storage.updateSettings({ currentPhaseId: id })}
      onViewChange={setView}
      onSyncClick={() => setSyncOpen(true)}
    >
      <div key={view} className="page-enter">
        {view === 'workout' && (
          <WorkoutView
            phases={program.phases}
            phaseProgress={programProgress.phases}
            phase={currentPhase}
            dayId={storage.settings.currentDayId}
            week={storage.settings.currentWeek}
            storage={storage}
            onPhaseChange={(id) => storage.updateSettings({ currentPhaseId: id })}
            onDayChange={(dayId) => storage.updateSettings({ currentDayId: dayId })}
            onWeekChange={(week) => storage.updateSettings({ currentWeek: week })}
          />
        )}

        {view === 'dashboard' && (
          <Dashboard program={program} storage={storage} onNavigate={navigateToWorkout} />
        )}

        {view === 'warmups' && <WarmupsView warmups={program.warmups} />}

        {view === 'weight' && (
          <WeightTracker
            bodyWeight={storage.settings.bodyWeight}
            weightLog={storage.weightLog}
            startDate={storage.settings.startDate}
            onBodyWeightChange={(bodyWeight) => storage.updateSettings({ bodyWeight })}
            onStartDateChange={(startDate) => storage.updateSettings({ startDate })}
            onAddEntry={storage.addWeightEntry}
          />
        )}

        {view === 'library' && <ExerciseLibrary program={program} />}
      </div>

      {syncOpen && (
        <SyncSettingsModal
          deviceId={storage.deviceId}
          onApply={(syncId) => {
            storage.setSyncId(syncId);
            setSyncOpen(false);
          }}
          onClose={() => setSyncOpen(false)}
        />
      )}
    </Layout>
  );
}

export default App;
