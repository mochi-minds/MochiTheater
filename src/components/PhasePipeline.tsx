import type { Phase } from "@/types/replay";

interface PhasePipelineProps {
  currentPhase: Phase | null;
}

const PHASES: Phase[] = ["planning", "design", "implementation", "review", "deployment"];

const PHASE_LABELS: Record<Phase, string> = {
  planning: "Planning",
  design: "Design",
  implementation: "Implementation",
  review: "Review",
  deployment: "Deployment",
};

export function PhasePipeline({ currentPhase }: PhasePipelineProps) {
  const activeIndex = currentPhase ? PHASES.indexOf(currentPhase) : -1;

  return (
    <div className="flex items-center gap-0">
      {PHASES.map((phase, i) => {
        const isActive = i === activeIndex;
        const isCompleted = i < activeIndex;

        return (
          <div key={phase} className="flex items-center flex-1 min-w-0">
            <div
              className="flex-1 flex items-center justify-center py-2 px-3 relative min-w-0"
              style={{
                background: isActive
                  ? "#6366f120"
                  : isCompleted
                  ? "#1a1a2e"
                  : "#111111",
                border: isActive
                  ? "1px solid #6366f160"
                  : "1px solid #1f1f1f",
                borderRadius: i === 0 ? "8px 0 0 8px" : i === PHASES.length - 1 ? "0 8px 8px 0" : "0",
                borderLeft: i > 0 ? "none" : undefined,
              }}
            >
              <div className="flex items-center gap-1.5">
                {isCompleted && (
                  <svg className="w-3 h-3 text-indigo-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse flex-shrink-0" />
                )}
                <span
                  className="text-xs font-medium truncate"
                  style={{
                    color: isActive ? "#a5b4fc" : isCompleted ? "#6366f180" : "#6b7280",
                  }}
                >
                  {PHASE_LABELS[phase]}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
