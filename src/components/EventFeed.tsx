"use client";

import { useEffect, useRef } from "react";
import type { LogEvent } from "@/types/log";
import type { AgentDef } from "@/types/agents";

interface EventFeedProps {
  events: LogEvent[];
  agents: AgentDef[];
}

function formatTime(ts: string): string {
  try {
    return new Date(ts).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return ts;
  }
}

function AgentDot({ agent }: { agent: AgentDef | undefined }) {
  if (!agent) return null;
  return (
    <span
      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
      style={{ backgroundColor: agent.colorHex }}
    />
  );
}

export function EventFeed({ events, agents }: EventFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [events.length]);

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-zinc-600 text-sm font-mono">
        No events yet — press play to start replay
      </div>
    );
  }

  const reversed = [...events].reverse();

  return (
    <div ref={containerRef} className="overflow-y-auto h-[500px] space-y-0.5 font-mono text-xs">
      {reversed.map((event, i) => {
        const agent = agents.find((a) => a.slug === event.agent);
        const stableKey = `${events.length - 1 - i}-${event.ts}-${event.agent}`;

        if (event.type === "issue-found") {
          return (
            <div
              key={stableKey}
              className="flex gap-2 px-3 py-2 rounded"
              style={{ background: "#f9731610" }}
            >
              <span className="text-zinc-600 flex-shrink-0">{formatTime(event.ts)}</span>
              <span className="text-orange-400">! ISSUE</span>
              <span className="text-orange-300 flex-1">{event.data.description}</span>
            </div>
          );
        }

        if (event.type === "fix-applied") {
          return (
            <div
              key={stableKey}
              className="flex gap-2 px-3 py-2 rounded"
              style={{ background: "#22c55e10" }}
            >
              <span className="text-zinc-600 flex-shrink-0">{formatTime(event.ts)}</span>
              <span className="text-green-400">✓ FIX</span>
              <span className="text-green-300 flex-1">{event.data.description}</span>
            </div>
          );
        }

        if (event.type === "message") {
          const fromAgent = agents.find((a) => a.slug === event.data.from);
          const toAgent = agents.find((a) => a.slug === event.data.to);
          return (
            <div key={stableKey} className="flex gap-2 px-3 py-2">
              <span className="text-zinc-600 flex-shrink-0">{formatTime(event.ts)}</span>
              <span className="flex items-center gap-1 flex-shrink-0">
                <AgentDot agent={fromAgent} />
                <span style={{ color: fromAgent?.colorHex ?? "#9ca3af" }}>{event.data.from}</span>
                <span className="text-zinc-600">→</span>
                <AgentDot agent={toAgent} />
                <span style={{ color: toAgent?.colorHex ?? "#9ca3af" }}>{event.data.to}</span>
              </span>
              <span className="text-zinc-300 flex-1 break-words">{event.data.body}</span>
            </div>
          );
        }

        return (
          <div key={stableKey} className="flex gap-2 px-3 py-1.5">
            <span className="text-zinc-600 flex-shrink-0">{formatTime(event.ts)}</span>
            <span className="flex items-center gap-1 flex-shrink-0">
              <AgentDot agent={agent} />
              <span style={{ color: agent?.colorHex ?? "#9ca3af" }}>{event.agent}</span>
            </span>
            <span className="text-zinc-400 flex-1">{event.message}</span>
          </div>
        );
      })}
    </div>
  );
}
