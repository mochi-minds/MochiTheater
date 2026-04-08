import Image from "next/image";
import Link from "next/link";
import type { AgentDef } from "@/types/agents";
import type { AgentState } from "@/types/replay";
import { HoverTooltip } from "./HoverTooltip";

interface AgentCardProps {
  agent: AgentDef;
  state?: AgentState;
  showTooltip?: boolean;
  onClick?: () => void;
}

export function AgentCard({ agent, state, showTooltip = false, onClick }: AgentCardProps) {
  const status = state?.status ?? "idle";
  const activity = state?.activity ?? null;

  const isBusy = status === "busy";
  const isOffline = status === "offline";

  const cardContent = (
    <div
      className={`relative group flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 cursor-pointer select-none ${
        isOffline ? "opacity-40" : "opacity-100"
      }`}
      style={{
        background: "#111111",
        border: isBusy
          ? `1px solid ${agent.colorHex}80`
          : "1px solid #1f1f1f",
        // box-shadow glow uses inline style because colorHex is dynamic and can't be safelisted in Tailwind
        boxShadow: isBusy ? `0 0 16px ${agent.colorHex}40` : "none",
      }}
      onClick={onClick}
    >
      {showTooltip && <HoverTooltip agent={agent} />}

      <div
        className="relative w-16 h-16 rounded-full overflow-hidden"
        style={{
          boxShadow: isBusy ? `0 0 14px ${agent.colorHex}60` : "none",
        }}
      >
        <Image
          src={`/avatars/${agent.slug}.png`}
          alt={agent.name}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>

      <div className="text-center">
        <p
          className="text-sm font-semibold"
          style={{ color: isBusy ? agent.colorHex : "#f5f5f5" }}
        >
          {agent.name}
        </p>
        <p className="text-xs text-zinc-500">{agent.role}</p>
        {isBusy && activity && (
          <p
            className="text-xs mt-1 font-medium"
            style={{ color: agent.colorHex }}
          >
            {activity}...
          </p>
        )}
      </div>
    </div>
  );

  if (onClick) return cardContent;

  return (
    <Link href={`/agents/${agent.slug}`} className="block">
      {cardContent}
    </Link>
  );
}
