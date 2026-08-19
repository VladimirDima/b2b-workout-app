import { useCallback, useEffect, useRef, useState } from 'react';

export interface WorkoutTimer {
  elapsed: number;
  running: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  toggle: () => void;
  formattedTime: string;
}

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
}

export function useWorkoutTimer(
  sessionKey: string,
  initialMs: number,
  onPersist?: (ms: number) => void
): WorkoutTimer {
  const [elapsed, setElapsed] = useState(initialMs);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(initialMs);
  const prevSessionRef = useRef(sessionKey);
  const persistRef = useRef(onPersist);
  persistRef.current = onPersist;

  if (prevSessionRef.current !== sessionKey) {
    prevSessionRef.current = sessionKey;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    accumulatedRef.current = initialMs;
    startTimeRef.current = 0;
    setElapsed(initialMs);
    setRunning(false);
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Persist every 5 seconds while running
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const current = accumulatedRef.current + (Date.now() - startTimeRef.current);
      persistRef.current?.(current);
    }, 5000);
    return () => clearInterval(id);
  }, [running]);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    startTimeRef.current = Date.now();
    setRunning(true);

    intervalRef.current = setInterval(() => {
      setElapsed(accumulatedRef.current + (Date.now() - startTimeRef.current));
    }, 250);
  }, []);

  const stop = useCallback(() => {
    if (!intervalRef.current) return;
    accumulatedRef.current += Date.now() - startTimeRef.current;
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setElapsed(accumulatedRef.current);
    setRunning(false);
    persistRef.current?.(accumulatedRef.current);
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    accumulatedRef.current = 0;
    startTimeRef.current = 0;
    setElapsed(0);
    setRunning(false);
    persistRef.current?.(0);
  }, []);

  const toggle = useCallback(() => {
    if (running) stop();
    else start();
  }, [running, start, stop]);

  return {
    elapsed,
    running,
    start,
    stop,
    reset,
    toggle,
    formattedTime: formatElapsed(elapsed),
  };
}
