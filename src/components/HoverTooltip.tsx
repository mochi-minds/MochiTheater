"use client";

import type { AgentDef } from "@/types/agents";

interface HoverTooltipProps {
  agent: AgentDef;
}

export function HoverTooltip({ agent }: HoverTooltipProps) {
  return (
    <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
      <div
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-xl p-4 shadow-2xl"
        style={{
          background: "#111111",
          border: `1px solid ${agent.colorHex}40`,
        }}
      >
        <div className="flex items-start justify-between mb-2">
          <span className="font-bold text-white text-base">{agent.name}</span>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${agent.colorHex}20`,
              color: agent.colorHex,
              border: `1px solid ${agent.colorHex}40`,
            }}
          >
            {agent.role}
          </span>
        </div>
        <p className="text-zinc-400 text-xs mb-3 leading-relaxed">{agent.description}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {agent.skills.slice(0, 3).map((skill) => (
            <span
              key={skill.name}
              className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300"
              title={skill.description}
            >
              {skill.name}
            </span>
          ))}
        </div>
        <span
          className="text-xs font-medium hover:underline cursor-pointer"
          style={{ color: agent.colorHex }}
        >
          View Profile →
        </span>
        {/* Arrow */}
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: `6px solid ${agent.colorHex}40`,
          }}
        />
      </div>
    </div>
  );
}
