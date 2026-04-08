"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { LogEvent } from "@/types/log";
import type { ReplayState } from "@/types/replay";
import { deriveReplayState } from "@/lib/helpers/replayEngine";

const BASE_INTERVAL_MS = 1000;

interface UseReplayReturn {
  replayState: ReplayState;
  playing: boolean;
  speed: 0.5 | 1 | 2 | 4;
  error: string | null;
  play: () => void;
  pause: () => void;
  skip: () => void;
  seek: (cursor: number) => void;
  setSpeed: (speed: 0.5 | 1 | 2 | 4) => void;
}

export function useReplay(events: LogEvent[]): UseReplayReturn {
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<0.5 | 1 | 2 | 4>(1);
  const [error] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current != null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!playing) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setCursor((c) => {
        if (c >= events.length) return c;
        return c + 1;
      });
    }, BASE_INTERVAL_MS / speed);

    return clearTimer;
  }, [playing, speed, events.length, clearTimer]);

  // Stop when reaching end (but not when cursor was just reset to 0 by play())
  useEffect(() => {
    if (cursor > 0 && cursor >= events.length && events.length > 0) {
      setPlaying(false);
    }
  }, [cursor, events.length]);

  // Reset cursor when events change (new log loaded)
  useEffect(() => {
    setCursor(0);
    setPlaying(false);
  }, [events]);

  const play = useCallback(() => {
    if (cursor >= events.length && events.length > 0) {
      setCursor(0);
    }
    setPlaying(true);
  }, [cursor, events.length]);

  const pause = useCallback(() => setPlaying(false), []);

  const skip = useCallback(() => {
    setPlaying(false);
    setCursor(events.length);
  }, [events.length]);

  const seek = useCallback((value: number) => {
    setCursor(Math.max(0, Math.min(value, events.length)));
  }, [events.length]);

  const replayState = deriveReplayState(events, cursor);

  return { replayState, playing, speed, error, play, pause, skip, seek, setSpeed };
}
