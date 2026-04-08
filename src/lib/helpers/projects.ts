import type { LogEvent } from "@/types/log";

export interface ProjectSummary {
  name: string;
  agents: string[];       // unique agent slugs that appear in events
  eventCount: number;
  githubUrl?: string;
}

const PROJECT_GITHUB_URLS: Record<string, string> = {
  MochiCard: "https://github.com/mochi-minds/MochiCard",
  MochiTheater: "https://github.com/mochi-minds/MochiTheater",
};

export function deriveProjects(events: LogEvent[]): ProjectSummary[] {
  const map = new Map<string, { agents: Set<string>; count: number }>();

  for (const event of events) {
    const key = event.project;
    if (!map.has(key)) map.set(key, { agents: new Set(), count: 0 });
    const entry = map.get(key)!;
    entry.agents.add(event.agent);
    entry.count++;
  }

  return Array.from(map.entries()).map(([name, { agents, count }]) => ({
    name,
    agents: Array.from(agents),
    eventCount: count,
    githubUrl: PROJECT_GITHUB_URLS[name],
  }));
}
