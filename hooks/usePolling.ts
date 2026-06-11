"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Hook polling sederhana — dapat diganti ke Socket.io
 * tanpa mengubah logika komponen
 */
export function usePolling(
  callback: () => void,
  intervalMs: number,
  enabled: boolean = true
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    intervalRef.current = setInterval(() => {
      callbackRef.current();
    }, intervalMs);
  }, [intervalMs, stop]);

  useEffect(() => {
    if (enabled) {
      start();
    } else {
      stop();
    }
    return stop;
  }, [enabled, start, stop]);

  return { start, stop };
}
