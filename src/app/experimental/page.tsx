"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useReplay } from "@/lib/hooks/useReplay";
import { fetchLog } from "@/lib/helpers/parseLog";
import { PlaybackControls } from "@/components/PlaybackControls";
import { AGENTS, AGENTS_BY_SLUG } from "@/lib/agents";
import type { LogEvent } from "@/types/log";
import type { ReplayState } from "@/types/replay";

// ── Available log files ──

const AVAILABLE_LOGS = [
  { label: "Office Demo", path: "/replays/office-demo.display.jsonl" },
  { label: "ChainPulse Build", path: "/replays/chainpulse.display.jsonl" },
];

// ── Office layout: named positions as percentages of the office floor ──

const POSITIONS: Record<string, { x: number; y: number }> = {
  // Personal desks — 3 rows of 3
  "desk-lead":      { x: 12, y: 32 },
  "desk-mochi":     { x: 42, y: 32 },
  "desk-blueprint": { x: 72, y: 32 },
  "desk-forge":     { x: 12, y: 52 },
  "desk-naga":      { x: 42, y: 52 },
  "desk-link":      { x: 72, y: 52 },
  "desk-pixel":     { x: 12, y: 72 },
  "desk-sage":      { x: 42, y: 72 },
  "desk-rocket":    { x: 72, y: 72 },

  // Meeting table — spread around center top
  "meeting-lead":      { x: 35, y: 10 },
  "meeting-mochi":     { x: 42, y: 6 },
  "meeting-blueprint": { x: 49, y: 10 },
  "meeting-forge":     { x: 56, y: 6 },
  "meeting-naga":      { x: 63, y: 10 },
  "meeting-link":      { x: 35, y: 16 },
  "meeting-pixel":     { x: 42, y: 16 },
  "meeting-sage":      { x: 56, y: 16 },
  "meeting-rocket":    { x: 63, y: 16 },

  // Coffee corner — bottom right
  "coffee-1": { x: 85, y: 82 },
  "coffee-2": { x: 90, y: 88 },
  "coffee-3": { x: 88, y: 76 },

  // Review area — bottom left
  "review": { x: 12, y: 90 },

  // Launch pad — bottom center
  "launchpad": { x: 50, y: 90 },
};

// ── Station assignment logic ──

function getPosition(slug: string, status: string, activity: string | null): string {
  if (activity === "meeting") return `meeting-${slug}`;
  if (status === "busy") {
    if (activity === "reviewing") return "review";
    if (activity === "deploying") return "launchpad";
    return `desk-${slug}`; // writing, reading, etc → personal desk
  }
  // idle or offline → personal desk
  return `desk-${slug}`;
}

// ── Furniture items (purely decorative labels) ──

const FURNITURE = [
  { label: "MEETING TABLE", x: 49, y: 11, w: 32, h: 14 },
  { label: "☕ COFFEE", x: 88, y: 80, w: 12, h: 14 },
  { label: "REVIEW", x: 12, y: 88, w: 10, h: 6 },
  { label: "🚀 LAUNCH", x: 50, y: 88, w: 12, h: 6 },
];

const DESK_LABELS = AGENTS.map((a) => ({
  slug: a.slug,
  name: a.name,
  x: POSITIONS[`desk-${a.slug}`].x,
  y: POSITIONS[`desk-${a.slug}`].y - 9,
}));

// ── Main component ──

export default function ExperimentalPage() {
  const [logPath, setLogPath] = useState(AVAILABLE_LOGS[0].path);
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchLog(logPath).then((evts) => {
      setEvents(evts);
      setLoading(false);
    });
  }, [logPath]);

  const { replayState, playing, speed, play, pause, skip, seek, setSpeed } =
    useReplay(events);

  // Derive agent positions from replay state
  const agentPositions = AGENTS.map((agent) => {
    const state = replayState.agents[agent.slug];
    const status = state?.status ?? "idle";
    const activity = state?.activity ?? null;
    const posKey = getPosition(agent.slug, status, activity);
    const pos = POSITIONS[posKey] ?? POSITIONS[`desk-${agent.slug}`];

    // Find active task
    let taskLabel: string | null = null;
    if (status === "busy" && activity !== "meeting") {
      const task = replayState.tasks.find(
        (t) => t.assignee === agent.slug && t.status === "in-progress"
      );
      if (task) {
        taskLabel = task.subject.length > 20 ? task.subject.slice(0, 18) + "..." : task.subject;
      }
    }

    return { agent, status, activity, pos, taskLabel };
  });

  // Collect recent speech bubbles (last 3 message events)
  const recentMessages = replayState.visibleEvents
    .filter((e) => e.type === "message")
    .slice(-3)
    .reverse();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950 text-zinc-500">
        Loading office...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <a href="/" className="text-sm font-semibold text-zinc-400 hover:text-white">
            ← MochiTheater
          </a>
          <span className="text-zinc-600">|</span>
          <span className="text-sm font-semibold">Office View</span>
          <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
            EXPERIMENTAL
          </span>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={logPath}
            onChange={(e) => setLogPath(e.target.value)}
            className="text-xs bg-zinc-800 text-zinc-300 border border-zinc-700 rounded px-2 py-1 focus:outline-none focus:border-zinc-500"
          >
            {AVAILABLE_LOGS.map((log) => (
              <option key={log.path} value={log.path}>{log.label}</option>
            ))}
          </select>
          {replayState.phase && (
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
              {replayState.phase}
            </span>
          )}
        </div>
      </div>

      {/* Office floor */}
      <div className="flex-1 relative min-h-0 overflow-hidden">
        <div className="absolute inset-4 rounded-2xl border border-zinc-800 overflow-hidden"
          style={{ background: "linear-gradient(180deg, #13111a 0%, #17141f 100%)" }}>

          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Furniture zones */}
          {FURNITURE.map((f) => (
            <div
              key={f.label}
              className="absolute flex items-center justify-center rounded-xl border border-zinc-800/50"
              style={{
                left: `${f.x - f.w / 2}%`,
                top: `${f.y - f.h / 2}%`,
                width: `${f.w}%`,
                height: `${f.h}%`,
                background: "#1a172220",
              }}
            >
              <span className="text-[10px] text-zinc-600 tracking-wider font-mono">{f.label}</span>
            </div>
          ))}

          {/* Desk labels */}
          {DESK_LABELS.map((d) => (
            <div
              key={d.slug}
              className="absolute"
              style={{
                left: `${d.x}%`,
                top: `${d.y}%`,
                transform: "translateX(-50%)",
              }}
            >
              <div className="flex items-center gap-1">
                <div
                  className="w-6 h-3 rounded-sm border"
                  style={{
                    borderColor: AGENTS_BY_SLUG[d.slug]?.colorHex + "40",
                    background: AGENTS_BY_SLUG[d.slug]?.colorHex + "10",
                  }}
                />
                <span className="text-[9px] text-zinc-600">{d.name}</span>
              </div>
            </div>
          ))}

          {/* Agents */}
          {agentPositions.map(({ agent, status, activity, pos, taskLabel }) => (
            <div
              key={agent.slug}
              className="absolute"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
                transition: "left 1.5s ease-in-out, top 1.5s ease-in-out",
                zIndex: 10,
              }}
            >
              {/* Task label */}
              {taskLabel && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded font-mono"
                    style={{
                      background: agent.colorHex + "20",
                      color: agent.colorHex,
                      border: `1px solid ${agent.colorHex}30`,
                    }}
                  >
                    {taskLabel}
                  </span>
                </div>
              )}

              {/* Avatar */}
              <div
                className="relative w-10 h-10 rounded-full overflow-hidden border-2"
                style={{
                  borderColor: status === "busy" ? agent.colorHex : "#333",
                  boxShadow: status === "busy" ? `0 0 12px ${agent.colorHex}50` : "none",
                  opacity: status === "offline" ? 0.3 : 1,
                  transition: "border-color 0.5s, box-shadow 0.5s, opacity 0.5s",
                }}
              >
                <Image
                  src={`/avatars/${agent.slug}.png`}
                  alt={agent.name}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
                {/* Activity dot */}
                {status === "busy" && (
                  <div
                    className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border border-zinc-950"
                    style={{ background: "#4ADE80" }}
                  />
                )}
              </div>

              {/* Name */}
              <p className="text-[10px] text-center mt-1 font-medium text-zinc-400">
                {agent.name}
              </p>

              {/* Activity text */}
              {status === "busy" && activity && activity !== "meeting" && (
                <p
                  className="text-[8px] text-center font-mono"
                  style={{ color: agent.colorHex }}
                >
                  {activity}
                </p>
              )}
            </div>
          ))}

          {/* Speech bubbles */}
          {recentMessages.map((evt, i) => {
            const data = evt.data as { from?: string; to?: string; body?: string };
            if (!data.from || !data.body) return null;
            const fromAgent = AGENTS_BY_SLUG[data.from];
            const fromPos = POSITIONS[`desk-${data.from}`] ?? POSITIONS[`meeting-${data.from}`];
            if (!fromAgent || !fromPos) return null;

            return (
              <div
                key={`${evt.ts}-${i}`}
                className="absolute z-20 pointer-events-none"
                style={{
                  left: `${Math.min(75, fromPos.x + 5)}%`,
                  top: `${Math.max(5, fromPos.y - 5)}%`,
                  opacity: i === 0 ? 1 : 0.5,
                  transition: "opacity 0.5s",
                  maxWidth: "25%",
                }}
              >
                <div
                  className="rounded-lg px-2.5 py-1.5 text-[10px] border"
                  style={{
                    background: "#1a1a2eee",
                    borderColor: fromAgent.colorHex + "60",
                    borderLeftWidth: 3,
                  }}
                >
                  <span className="font-bold" style={{ color: fromAgent.colorHex }}>
                    {fromAgent.name}
                  </span>
                  {data.to && (
                    <span className="text-zinc-500"> → {AGENTS_BY_SLUG[data.to]?.name ?? data.to}</span>
                  )}
                  <p className="text-zinc-400 mt-0.5 leading-tight">
                    {data.body.length > 100 ? data.body.slice(0, 97) + "..." : data.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Playback controls */}
      <div className="border-t border-zinc-800 px-6 py-3 bg-zinc-950 shrink-0">
        <PlaybackControls
          playing={playing}
          cursor={replayState.cursor}
          totalEvents={replayState.totalEvents}
          speed={speed}
          onPlayPause={playing ? pause : play}
          onSkip={skip}
          onSeek={seek}
          onSpeedChange={setSpeed}
        />
      </div>
    </div>
  );
}
