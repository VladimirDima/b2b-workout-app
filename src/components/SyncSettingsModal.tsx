import { useState } from 'react';
import { ModalPortal } from './ModalPortal';
import { isValidDeviceId } from '../utils/deviceId';

interface SyncSettingsModalProps {
  deviceId: string;
  onApply: (syncId: string) => void;
  onClose: () => void;
}

export function SyncSettingsModal({ deviceId, onApply, onClose }: SyncSettingsModalProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(deviceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleApply = () => {
    const trimmed = input.trim();
    if (!isValidDeviceId(trimmed)) {
      setError('Enter a valid Sync ID (looks like xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)');
      return;
    }
    if (trimmed === deviceId) {
      onClose();
      return;
    }
    onApply(trimmed);
  };

  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose} role="presentation">
        <div className="modal-content sync-settings-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <h3>Sync ID</h3>
              <p className="modal-subtitle">Link progress across phone, Mac, and tunnel URLs</p>
            </div>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
              <span aria-hidden="true">✕</span>
            </button>
          </div>

          <div className="sync-settings-section">
            <label className="sync-settings-label">Your Sync ID</label>
            <div className="sync-id-row">
              <code className="sync-id-value">{deviceId}</code>
              <button type="button" className="sync-copy-btn" onClick={handleCopy}>
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="sync-settings-hint">
              Copy this on one device and paste it on another to load the same progress.
            </p>
          </div>

          <div className="sync-settings-section">
            <label className="sync-settings-label" htmlFor="sync-id-input">
              Use Sync ID from another device
            </label>
            <input
              id="sync-id-input"
              type="text"
              className="sync-id-input"
              placeholder="Paste Sync ID here"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError('');
              }}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {error && <p className="sync-settings-error">{error}</p>}
            <button type="button" className="sync-apply-btn" onClick={handleApply}>
              Load this profile
            </button>
          </div>

          <p className="sync-settings-footnote">
            Loading a Sync ID always pulls from the server and replaces data on this device.
            Make sure the server is running (<code>npm run share</code>) and shows Synced before
            you log workouts.
          </p>
        </div>
      </div>
    </ModalPortal>
  );
}
