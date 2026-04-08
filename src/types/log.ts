import type { Phase, AgentActivity } from "./common";

export interface BaseEvent {
  ts: string;
  agent: string;
  message: string;
  project: string;
}

export interface ProjectCreatedEvent extends BaseEvent {
  type: "project-created";
  data: { name: string; team_name?: string };
}

export interface PhaseChangedEvent extends BaseEvent {
  type: "phase-changed";
  data: { phase: Phase };
}

export interface AgentJoinedEvent extends BaseEvent {
  type: "agent-joined";
  data: Record<string, never>;
}

export interface AgentLeftEvent extends BaseEvent {
  type: "agent-left";
  data: Record<string, never>;
}

export interface AgentBusyEvent extends BaseEvent {
  type: "agent-busy";
  data: { activity: AgentActivity };
}

export interface AgentIdleEvent extends BaseEvent {
  type: "agent-idle";
  data: Record<string, never>;
}

export interface TaskCreatedEvent extends BaseEvent {
  type: "task-created";
  data: { taskId: string; subject: string };
}

export interface TaskStartedEvent extends BaseEvent {
  type: "task-started";
  data: { taskId: string; subject?: string };
}

export interface TaskCompletedEvent extends BaseEvent {
  type: "task-completed";
  data: { taskId: string };
}

export interface MessageEvent extends BaseEvent {
  type: "message";
  data: { from: string; to: string; body: string };
}

export interface IssueFoundEvent extends BaseEvent {
  type: "issue-found";
  data: { description: string };
}

export interface FixAppliedEvent extends BaseEvent {
  type: "fix-applied";
  data: { description: string };
}

export type LogEvent =
  | ProjectCreatedEvent
  | PhaseChangedEvent
  | AgentJoinedEvent
  | AgentLeftEvent
  | AgentBusyEvent
  | AgentIdleEvent
  | TaskCreatedEvent
  | TaskStartedEvent
  | TaskCompletedEvent
  | MessageEvent
  | IssueFoundEvent
  | FixAppliedEvent;

export const KNOWN_EVENT_TYPES = new Set<LogEvent["type"]>([
  "project-created",
  "phase-changed",
  "agent-joined",
  "agent-left",
  "agent-busy",
  "agent-idle",
  "task-created",
  "task-started",
  "task-completed",
  "message",
  "issue-found",
  "fix-applied",
]);
