"use client";

import { useState, useEffect } from "react";
import { fetchLog } from "@/lib/helpers/parseLog";
import { useReplay } from "@/lib/hooks/useReplay";
import { AGENTS } from "@/lib/agents";
import { AgentGrid } from "@/components/AgentGrid";
import { PhasePipeline } from "@/components/PhasePipeline";
import { TaskTracker } from "@/components/TaskTracker";
import { EventFeed } from "@/components/EventFeed";
import { PlaybackControls } from "@/components/PlaybackControls";
import type { LogEvent } from "@/types/log";

interface ReplaySectionProps {
  logUrl?: string;
}

export function ReplaySection({ logUrl = "/replays/chainpulse.display.jsonl" }: ReplaySectionProps) {
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLog(logUrl)
      .then(setEvents)
      .catch((err: unknown) => {
        setLoadError(err instanceof Error ? err.message : "Failed to load log");
      })
      .finally(() => setLoading(false));
  }, [logUrl]);

  const { replayState, playing, speed, play, pause, skip, seek, setSpeed } = useReplay(events);

  const handlePlayPause = () => {
    if (playing) pause();
    else play();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-zinc-500 font-mono text-sm animate-pulse">Loading log...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-red-400 font-mono text-sm">Error: {loadError}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold gradient-text">
            {replayState.projectName ?? "MochiTheater"}
          </h2>
          <p className="text-xs font-semibold tracking-[0.25em] text-zinc-600 uppercase mt-0.5">
            Watch Their Work
          </p>
        </div>
        <div
          className="text-xs font-mono px-3 py-1.5 rounded-lg"
          style={{ background: "#13121b", border: "1px solid #1f1f1f", color: "#6b7280" }}
        >
          {Object.values(replayState.agents).filter((a) => a.status !== "offline").length} agents active
        </div>
      </div>

      {/* Phase pipeline */}
      <PhasePipeline currentPhase={replayState.phase} />

      {/* Playback controls */}
      <PlaybackControls
        playing={playing}
        cursor={replayState.cursor}
        totalEvents={replayState.totalEvents}
        speed={speed}
        onPlayPause={handlePlayPause}
        onSkip={skip}
        onSeek={seek}
        onSpeedChange={setSpeed}
      />

      {/* Main grid: agents + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AgentGrid agents={AGENTS} states={replayState.agents} />
        </div>
        <div
          className="rounded-xl p-4"
          style={{ background: "#13121b", border: "1px solid #1f1f1f" }}
        >
          <h3 className="text-xs font-bold tracking-[0.25em] text-zinc-500 uppercase mb-3">
            Tasks
          </h3>
          <TaskTracker tasks={replayState.tasks} agents={AGENTS} />
        </div>
      </div>

      {/* Event feed */}
      <div
        className="rounded-xl p-4 overflow-hidden"
        style={{ background: "#13121b", border: "1px solid #1f1f1f" }}
      >
        <h3 className="text-xs font-bold tracking-[0.25em] text-zinc-500 uppercase mb-3">
          Event Feed
        </h3>
        <EventFeed events={replayState.visibleEvents} agents={AGENTS} />
      </div>
    </div>
  );
}
