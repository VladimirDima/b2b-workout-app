import { useEffect, useRef, useState } from 'react';
import { getEmbedUrl } from '../utils/youtube';
import { isTouchMobile } from '../utils/youtubePlayer';
import { ModalPortal } from './ModalPortal';

interface VideoModalProps {
  title: string;
  videoUrl: string;
  onClose: () => void;
}

const YT_PLAYING = 1;

export function VideoModal({ title, videoUrl, onClose }: VideoModalProps) {
  const embedUrl = getEmbedUrl(videoUrl, { autoplay: true, mute: true });
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [needsTap, setNeedsTap] = useState(false);
  const playingRef = useRef(false);

  useEffect(() => {
    if (!embedUrl || !isTouchMobile()) return;

    playingRef.current = false;
    setNeedsTap(false);

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.event === 'onStateChange' && data?.info === YT_PLAYING) {
          playingRef.current = true;
          setNeedsTap(false);
        }
      } catch {
        // ignore non-JSON messages
      }
    };

    window.addEventListener('message', onMessage);

    const timer = setTimeout(() => {
      if (!playingRef.current) setNeedsTap(true);
    }, 800);

    return () => {
      window.removeEventListener('message', onMessage);
      clearTimeout(timer);
    };
  }, [embedUrl]);

  const handlePlayTap = () => {
    const iframe = iframeRef.current;
    if (!iframe || !embedUrl) return;
    iframe.src = embedUrl;
    setNeedsTap(false);
  };

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
                ref={iframeRef}
                src={embedUrl}
                title={`${title} tutorial`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
              {needsTap && (
                <button
                  type="button"
                  className="video-play-overlay"
                  onClick={handlePlayTap}
                  aria-label="Play video"
                >
                  <span className="video-play-icon" aria-hidden="true">▶</span>
                  <span>Tap to play</span>
                </button>
              )}
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
