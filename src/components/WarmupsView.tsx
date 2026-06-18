import type { WarmupSection } from '../types';
import { MuscleMapButton } from './MuscleMapButton';
import { VideoModal } from './VideoModal';
import { useState } from 'react';

interface WarmupsViewProps {
  warmups: WarmupSection[];
}

export function WarmupsView({ warmups }: WarmupsViewProps) {
  const [activeVideo, setActiveVideo] = useState<{ title: string; url: string } | null>(null);

  return (
    <div className="warmups-view">
      <header className="page-header">
        <h2>Warm-Ups</h2>
        <p>Use what helps. The Core Four is recommended before every workout.</p>
      </header>

      {warmups.map((section) => (
        <section key={section.name} className="warmup-section">
          <h3>{section.name}</h3>
          <div className="warmup-grid">
            {section.exercises.map((ex) => (
              <article key={ex.name} className="warmup-card">
                <div className="warmup-card-top">
                  <h4>{ex.name}</h4>
                  {ex.videoUrl && (
                    <button
                      type="button"
                      className="video-btn small"
                      onClick={() => setActiveVideo({ title: ex.name, url: ex.videoUrl! })}
                    >
                      ▶
                    </button>
                  )}
                </div>
                <p>{ex.instructions}</p>
                <MuscleMapButton exerciseName={ex.name} muscleGroups={ex.muscleGroups} compact />
              </article>
            ))}
          </div>
        </section>
      ))}

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
