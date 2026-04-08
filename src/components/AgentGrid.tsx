import type { AgentDef } from "@/types/agents";
import type { AgentState } from "@/types/replay";
import { AgentCard } from "./AgentCard";

interface AgentGridProps {
  agents: AgentDef[];
  states: Record<string, AgentState>;
}

export function AgentGrid({ agents, states }: AgentGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {agents.map((agent) => (
        <AgentCard
          key={agent.slug}
          agent={agent}
          state={states[agent.slug]}
        />
      ))}
    </div>
  );
}
