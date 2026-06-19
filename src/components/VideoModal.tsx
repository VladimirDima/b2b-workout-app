import { getEmbedUrl } from '../utils/youtube';
import { ModalPortal } from './ModalPortal';

interface VideoModalProps {
  title: string;
  videoUrl: string;
  onClose: () => void;
}

export function VideoModal({ title, videoUrl, onClose }: VideoModalProps) {
  const embedUrl = getEmbedUrl(videoUrl, { autoplay: true, mute: true });

  return (
    <ModalPortal>
      <div className="modal-overlay modal-overlay--video" onClick={onClose} role="presentation">
        <div className="modal-content video-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{title}</h3>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
              <span aria-hidden="true">✕</span>
            </button>
          </div>
          {embedUrl ? (
            <div className="video-wrapper">
              <iframe
                src={embedUrl}
                title={`${title} tutorial`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <p className="no-video">No embedded video available.</p>
          )}
          <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="external-link">
            Open on YouTube ↗
          </a>
        </div>
      </div>
    </ModalPortal>
  );
}
