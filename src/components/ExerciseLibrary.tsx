import { useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import type { Program } from '../types';
import { MuscleMapButton } from './MuscleMapButton';
import { VideoModal } from './VideoModal';

interface ExerciseLibraryProps {
  program: Program;
}

interface LibraryExercise {
  name: string;
  videoUrl: string | null;
  muscleGroups: string[];
  phases: string[];
}

export function ExerciseLibrary({ program }: ExerciseLibraryProps) {
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('all');
  const [activeVideo, setActiveVideo] = useState<{ title: string; url: string } | null>(null);

  const exercises = useMemo(() => {
    const map = new Map<string, LibraryExercise>();

    const add = (name: string, videoUrl: string | null, muscleGroups: string[], phase: string) => {
      const existing = map.get(name);
      if (existing) {
        if (!existing.phases.includes(phase)) existing.phases.push(phase);
        if (!existing.videoUrl && videoUrl) existing.videoUrl = videoUrl;
      } else {
        map.set(name, { name, videoUrl, muscleGroups, phases: [phase] });
      }
    };

    for (const section of program.warmups) {
      for (const ex of section.exercises) {
        add(ex.name, ex.videoUrl, ex.muscleGroups, 'Warm-Up');
      }
    }

    for (const phase of program.phases) {
      for (const day of phase.days) {
        for (const block of day.blocks) {
          for (const ex of block.exercises) {
            add(ex.name, ex.videoUrl, ex.muscleGroups, phase.name.split('—')[0].trim());
          }
        }
      }
    }

    for (const [name, url] of Object.entries(program.videoLinks)) {
      if (!map.has(name)) {
        map.set(name, { name, videoUrl: url, muscleGroups: [], phases: ['Links sheet'] });
      }
    }

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [program]);

  const allMuscles = useMemo(() => {
    const muscles = new Set<string>();
    exercises.forEach((ex) => ex.muscleGroups.forEach((m) => muscles.add(m)));
    return Array.from(muscles).sort();
  }, [exercises]);

  const filtered = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle =
      muscleFilter === 'all' || ex.muscleGroups.includes(muscleFilter);
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="exercise-library">
      <header className="page-header">
        <h2>Exercise Library</h2>
        <p>Browse all exercises with muscle groups and video tutorials.</p>
      </header>

      <div className="library-filters">
        <input
          type="search"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={muscleFilter} onChange={(e) => setMuscleFilter(e.target.value)}>
          <option value="all">All muscle groups</option>
          {allMuscles.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <p className="result-count">{filtered.length} exercises</p>

      <div className="library-grid">
        {filtered.map((ex) => (
          <article key={ex.name} className="library-card">
            <div className="library-card-top">
              <h4>{ex.name}</h4>
              {ex.videoUrl ? (
                <button
                  type="button"
                  className="video-btn small"
                  onClick={() =>
                    flushSync(() => setActiveVideo({ title: ex.name, url: ex.videoUrl! }))
                  }
                >
                  ▶ Video
                </button>
              ) : (
                <span className="no-video-tag">No video</span>
              )}
            </div>
            {ex.muscleGroups.length > 0 && (
              <MuscleMapButton exerciseName={ex.name} muscleGroups={ex.muscleGroups} compact />
            )}
            <p className="phase-tags">{ex.phases.join(' · ')}</p>
          </article>
        ))}
      </div>

      {activeVideo && (
        <VideoModal
          title={activeVideo.title}
          videoUrl={activeVideo.url}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </div>
  );
}
