import { useState } from 'react';
import type { WeightEntry } from '../types';

interface WeightTrackerProps {
  bodyWeight: string;
  weightLog: WeightEntry[];
  startDate: string;
  onBodyWeightChange: (weight: string) => void;
  onStartDateChange: (date: string) => void;
  onAddEntry: (entry: WeightEntry) => void;
}

export function WeightTracker({
  bodyWeight,
  weightLog,
  startDate,
  onBodyWeightChange,
  onStartDateChange,
  onAddEntry,
}: WeightTrackerProps) {
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newWeight, setNewWeight] = useState('');

  const handleAdd = () => {
    if (!newWeight.trim()) return;
    onAddEntry({ date: newDate, weight: newWeight.trim() });
    setNewWeight('');
  };

  return (
    <div className="weight-tracker">
      <header className="page-header">
        <h2>Weight Tracking</h2>
        <p>Track your body weight over time, just like the spreadsheet.</p>
      </header>

      <div className="settings-cards">
        <label className="setting-field">
          <span>Program start date</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
        </label>
        <label className="setting-field">
          <span>Current weight</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="e.g. 155 lbs"
            value={bodyWeight}
            onChange={(e) => onBodyWeightChange(e.target.value)}
          />
        </label>
      </div>

      <div className="add-weight-form">
        <h3>Log a weigh-in</h3>
        <div className="form-row">
          <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
          <input
            type="text"
            inputMode="decimal"
            placeholder="Weight"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
          />
          <button type="button" onClick={handleAdd}>
            Add
          </button>
        </div>
      </div>

      {weightLog.length > 0 && (
        <table className="weight-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Weight</th>
            </tr>
          </thead>
          <tbody>
            {weightLog.map((entry) => (
              <tr key={entry.date}>
                <td>{entry.date}</td>
                <td>{entry.weight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
