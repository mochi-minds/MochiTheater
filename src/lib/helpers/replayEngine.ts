import type { LogEvent } from "@/types/log";
import type { ReplayState, AgentState, Phase } from "@/types/replay";

export function deriveReplayState(events: LogEvent[], cursor: number): ReplayState {
  const agents: Record<string, AgentState> = {};
  let projectName: string | null = null;
  let phase: Phase | null = null;
  const tasks: ReplayState["tasks"] = [];
  const visibleEvents: LogEvent[] = [];

  const end = Math.min(cursor, events.length);

  for (let i = 0; i < end; i++) {
    const event = events[i];
    visibleEvents.push(event);

    // Normalize agent name to lowercase slug for matching with AgentDef
    const slug = event.agent.toLowerCase();

    // Ensure agent entry exists
    if (!agents[slug]) {
      agents[slug] = { slug, status: "offline", activity: null };
    }

    switch (event.type) {
      case "project-created":
        projectName = event.data.team_name ?? event.data.name;
        break;

      case "phase-changed":
        phase = event.data.phase;
        break;

      case "agent-joined":
        agents[slug].status = "idle";
        agents[slug].activity = null;
        break;

      case "agent-left":
        agents[slug].status = "offline";
        agents[slug].activity = null;
        break;

      case "agent-busy":
        agents[slug].status = "busy";
        agents[slug].activity = event.data.activity;
        break;

      case "agent-idle":
        agents[slug].status = "idle";
        agents[slug].activity = null;
        break;

      case "task-created":
        tasks.push({
          taskId: event.data.taskId,
          subject: event.data.subject,
          status: "pending",
          assignee: null,
        });
        break;

      case "task-started": {
        let task = tasks.find((t) => t.taskId === event.data.taskId);
        if (!task) {
          task = { taskId: event.data.taskId, subject: event.data.subject ?? `Task #${event.data.taskId}`, status: "pending", assignee: null };
          tasks.push(task);
        }
        task.status = "in-progress";
        task.assignee = slug;
        break;
      }

      case "task-completed": {
        const task = tasks.find((t) => t.taskId === event.data.taskId);
        if (task) {
          task.status = "completed";
        }
        break;
      }

      // message, issue-found, fix-applied: pushed to visibleEvents only (already done above)
    }
  }

  return {
    projectName,
    phase,
    agents,
    tasks,
    visibleEvents,
    cursor: end,
    totalEvents: events.length,
  };
}
