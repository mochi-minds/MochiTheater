import type { AgentDef } from "@/types/agents";

interface AgentPillProps {
  agent: AgentDef;
  size?: "sm" | "md";
}

export function AgentPill({ agent, size = "sm" }: AgentPillProps) {
  const sizeClasses = size === "sm"
    ? "text-xs px-2 py-0.5"
    : "text-sm px-3 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses}`}
      style={{
        backgroundColor: `${agent.colorHex}20`,
        color: agent.colorHex,
        border: `1px solid ${agent.colorHex}40`,
      }}
    >
      {agent.name}
    </span>
  );
}
