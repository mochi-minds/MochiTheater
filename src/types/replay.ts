import type { LogEvent } from "./log";
export type { Phase, AgentActivity } from "./common";
import type { Phase, AgentActivity } from "./common";

export type AgentStatus = "offline" | "idle" | "busy";

export interface AgentState {
  slug: string;
  status: AgentStatus;
  activity: AgentActivity | null;
}

export type TaskStatus = "pending" | "in-progress" | "completed";

export interface TaskState {
  taskId: string;
  subject: string;
  status: TaskStatus;
  assignee: string | null;
}

export interface ReplayState {
  projectName: string | null;
  phase: Phase | null;
  agents: Record<string, AgentState>;
  tasks: TaskState[];
  visibleEvents: LogEvent[];
  cursor: number;
  totalEvents: number;
}
