import type { SyncStatus as SyncStatusType } from '../api/storageApi';

interface SyncStatusProps {
  status: SyncStatusType;
  lastSyncedAt: string | null;
  compact?: boolean;
  onClick?: () => void;
}

export function SyncStatusBadge({ status, lastSyncedAt, compact = false, onClick }: SyncStatusProps) {
  const labels: Record<SyncStatusType, string> = {
    loading: 'Loading…',
    synced: compact ? 'Saved' : 'Saved to server',
    offline: compact ? 'Offline' : 'Offline — local only',
    error: 'Sync error',
  };

  const timeLabel =
    lastSyncedAt && status === 'synced'
      ? new Date(lastSyncedAt).toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : null;

  const content = (
    <>
      <span className="sync-dot" />
      {!compact && <span className="sync-label">{labels[status]}</span>}
      {compact && status !== 'synced' && <span className="sync-label">{labels[status]}</span>}
      {compact && status === 'synced' && <span className="sync-label sync-label-short">Sync</span>}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={`sync-status sync-${status} ${compact ? 'compact' : ''} sync-status-btn`}
        title={timeLabel ? `Last saved: ${timeLabel}. Tap to manage Sync ID.` : 'Tap to manage Sync ID'}
        onClick={onClick}
        aria-label="Open sync settings"
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={`sync-status sync-${status} ${compact ? 'compact' : ''}`}
      title={timeLabel ? `Last saved: ${timeLabel}` : undefined}
    >
      {content}
    </div>
  );
}
