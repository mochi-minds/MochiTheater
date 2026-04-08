import type { AgentDef } from "@/types/agents";
import { AgentPill } from "./AgentPill";

interface ProjectHistoryCardProps {
  projectName: string;
  description: string;
  status: "done" | "in-progress" | "upcoming";
  collaborators: AgentDef[];
}

const STATUS_STYLES = {
  done: { bg: "#22c55e10", border: "#22c55e40", text: "#4ade80", label: "DONE" },
  "in-progress": { bg: "#6366f110", border: "#6366f140", text: "#a5b4fc", label: "IN PROGRESS" },
  upcoming: { bg: "#6b728010", border: "#6b728040", text: "#9ca3af", label: "UPCOMING" },
};

export function ProjectHistoryCard({
  projectName,
  description,
  status,
  collaborators,
}: ProjectHistoryCardProps) {
  const style = STATUS_STYLES[status];

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "#111111", border: "1px solid #1f1f1f" }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-white">{projectName}</h3>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded flex-shrink-0"
          style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.text }}
        >
          {style.label}
        </span>
      </div>
      <p className="text-sm text-zinc-400 mb-3 leading-relaxed">{description}</p>
      {collaborators.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {collaborators.map((agent) => (
            <AgentPill key={agent.slug} agent={agent} size="sm" />
          ))}
        </div>
      )}
    </div>
  );
}
