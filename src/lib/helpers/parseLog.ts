import type { LogEvent } from "@/types/log";
import { KNOWN_EVENT_TYPES } from "@/types/log";

export function parseLog(raw: string): LogEvent[] {
  const events: LogEvent[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const parsed = JSON.parse(trimmed);
      if (KNOWN_EVENT_TYPES.has(parsed.type)) {
        events.push(parsed as LogEvent);
      }
    } catch {
      // silently drop malformed lines
    }
  }
  return events;
}

export function groupByProject(events: LogEvent[]): Record<string, LogEvent[]> {
  const groups: Record<string, LogEvent[]> = {};
  for (const event of events) {
    const key = event.project ?? "unknown";
    if (!groups[key]) groups[key] = [];
    groups[key].push(event);
  }
  return groups;
}

export async function fetchLog(url = "/sample-log.jsonl"): Promise<LogEvent[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch log: ${res.status}`);
  const text = await res.text();
  return parseLog(text);
}
