import type { TaskState } from "@/types/replay";
import type { AgentDef } from "@/types/agents";
import { AgentPill } from "./AgentPill";

interface TaskTrackerProps {
  tasks: TaskState[];
  agents: AgentDef[];
}

function StatusIcon({ status }: { status: TaskState["status"] }) {
  if (status === "completed") {
    return (
      <span className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center flex-shrink-0">
        <svg className="w-2.5 h-2.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </span>
    );
  }
  if (status === "in-progress") {
    return (
      <span className="w-4 h-4 rounded-full border-2 border-yellow-500 border-t-transparent flex-shrink-0 animate-spin" />
    );
  }
  return (
    <span className="w-4 h-4 rounded-full border border-zinc-600 flex-shrink-0" />
  );
}

export function TaskTracker({ tasks, agents }: TaskTrackerProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-zinc-600 text-xs text-center py-4 font-mono">
        No tasks yet
      </div>
    );
  }

  return (
    <div className="space-y-2 overflow-y-auto max-h-64">
      {tasks.map((task) => {
        const assignee = task.assignee
          ? agents.find((a) => a.slug === task.assignee)
          : null;

        return (
          <div key={task.taskId} className="flex items-start gap-2 py-1.5">
            <StatusIcon status={task.status} />
            <div className="flex-1 min-w-0">
              <p
                className={`text-xs leading-snug ${
                  task.status === "completed"
                    ? "text-zinc-500 line-through"
                    : "text-zinc-300"
                }`}
              >
                {task.subject}
              </p>
              {assignee && task.status !== "pending" && (
                <div className="mt-1">
                  <AgentPill agent={assignee} size="sm" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
