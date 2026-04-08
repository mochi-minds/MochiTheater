import Link from "next/link";
import Image from "next/image";
import { AGENTS } from "@/lib/agents";
import { AgentCard } from "@/components/AgentCard";


const ROADMAP = [
  {
    phase: "Phase 1",
    title: "Foundation",
    status: "completed" as const,
    dot: "#4ade80",
    border: "#22c55e40",
    items: [
      { text: "9-agent team architecture with Claude Code Agent Teams", done: true },
      { text: "Smart contract development with Foundry + OpenZeppelin", done: true },
      { text: "Full-stack dApp generation (Next.js + Solidity)", done: true },
      { text: "Automated code review and security auditing", done: true },
      { text: "One-click deploy to Etherlink / Shadownet", done: true },
    ],
  },
  {
    phase: "Phase 2",
    title: "MochiTheater",
    status: "in-progress" as const,
    dot: "#fbbf24",
    border: "#f59e0b40",
    items: [
      { text: "Live replay of agent build sessions", done: true },
      { text: "Agent profile pages with skills and project history", done: true },
      { text: "Speed-controlled event playback", done: false },
      { text: "Interactive team visualization", done: false },
    ],
  },
  {
    phase: "Phase 3",
    title: "New Agents",
    status: "upcoming" as const,
    dot: "#6b7280",
    border: "#6b728040",
    items: [
      { text: "Beautify agent — UI generation from prompts", done: false },
      { text: "SmartPy contracts on Tezos L1 using our own Beautify skill", done: false },
    ],
  },
  {
    phase: "Phase 4",
    title: "Autonomy",
    status: "upcoming" as const,
    dot: "#f472b6",
    border: "#ec489940",
    items: [],
  },
];

const STATUS_BADGE = {
  completed: {
    label: "✓ COMPLETED",
    color: "#4ade80",
    bg: "#22c55e10",
    border: "#22c55e40",
  },
  "in-progress": {
    label: "● IN PROGRESS",
    color: "#fbbf24",
    bg: "#f59e0b10",
    border: "#f59e0b40",
  },
  upcoming: {
    label: "○ UPCOMING",
    color: "#6b7280",
    bg: "#6b728010",
    border: "#6b728040",
  },
};

const STEP_COLORS = [
  { tint: "#ec489908", border: "#ec489920" },
  { tint: "#6366f108", border: "#6366f120" },
  { tint: "#4ade8008", border: "#4ade8020" },
];

export default function LandingPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden px-4 sm:px-6 pt-20 pb-10 md:pt-28 md:pb-14"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, #1a1028 0%, #0f0e13 80%)" }}
      >
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
          {/* Left */}
          <div>
            <h1
              className="text-5xl sm:text-6xl md:text-8xl font-medium leading-tight gradient-text mb-4"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Mochi<br />Theater
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-md leading-relaxed">
              A team of 9 AI agents built with Claude Code Agent Teams that autonomously
              ideate, architect, code, review, and deploy full-stack dApps on Etherlink.
              Watch the entire build process replay in real time.
            </p>
          </div>

          {/* Right — floating avatars */}
          <div className="relative h-64 sm:h-72 md:h-80">
            {AGENTS.map((agent, i) => {
              const col = i % 3;
              const row = Math.floor(i / 3);
              const leftPct = col * 32 + 2;
              const topPct = row * 30 + 5;
              const offsets = [0, 6, -4, 8, -2, 4, -6, 2, 10];
              const delays = ["0s", "0.3s", "0.6s", "0.9s", "1.2s", "1.5s", "0.15s", "0.75s", "1.05s"];

              return (
                <Link
                  key={agent.slug}
                  href={`/agents/${agent.slug}`}
                  className="absolute flex flex-col items-center gap-1 hover:scale-110 transition-transform duration-200"
                  style={{
                    left: `${leftPct + (offsets[i] ?? 0)}%`,
                    top: `${topPct}%`,
                    animation: "float 3s ease-in-out infinite",
                    animationDelay: delays[i],
                  }}
                >
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden">
                    <Image
                      src={`/avatars/${agent.slug}.png`}
                      alt={agent.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium" style={{ color: agent.colorHex }}>
                    {agent.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Meet the Team ── */}
      <section
        id="team"
        className="py-12 md:py-16 px-4 sm:px-6"
        style={{ background: "linear-gradient(180deg, #0f0e13 0%, #13111d 50%, #0f0e13 100%)" }}
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xs font-bold tracking-[0.3em] uppercase mb-2 text-center" style={{ color: "#f9a8d4" }}>
            Meet the Team
          </h2>
          <p className="text-zinc-500 text-sm text-center mb-8">
            Hover a card to see each agent&apos;s profile.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {AGENTS.map((agent) => (
              <div key={agent.slug} className="relative">
                <AgentCard agent={agent} showTooltip />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        id="how-it-works"
        className="py-12 md:py-16 px-4 sm:px-6"
        style={{ background: "linear-gradient(180deg, #0f0e13 0%, #12111a 50%, #0f0e13 100%)" }}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xs font-bold tracking-[0.3em] uppercase mb-8 text-center" style={{ color: "#c084fc" }}>
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                n: "1",
                title: "Describe your project",
                body: "Tell the Lead agent what you want to build. Annything you can dream of.",
                icon: "✏️",
              },
              {
                n: "2",
                title: "Agents build it",
                body: "9 specialized agents work in parallel — writing Solidity contracts, building the frontend, API routes, and reviewing each other's code.",
                icon: "⚙️",
              },
              {
                n: "3",
                title: "Ship to Etherlink",
                body: "Verified contracts deploy to Etherlink. Code pushed to GitHub. All automated, all audited before deployment.",
                icon: "🚀",
              },
            ].map((step, idx) => (
              <div
                key={step.n}
                className="p-5 rounded-xl"
                style={{
                  background: STEP_COLORS[idx].tint,
                  border: `1px solid ${STEP_COLORS[idx].border}`,
                }}
              >
                <div className="text-2xl mb-3">{step.icon}</div>
                <p className="text-[10px] font-bold tracking-widest text-zinc-500 mb-1">
                  STEP {step.n}
                </p>
                <h3 className="font-semibold text-white text-sm mb-1.5">{step.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roadmap ── */}
      <section
        id="roadmap"
        className="py-12 md:py-16 px-4 sm:px-6"
        style={{ background: "linear-gradient(180deg, #0f0e13 0%, #11101a 50%, #0f0e13 100%)" }}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xs font-bold tracking-[0.3em] uppercase mb-10 text-center" style={{ color: "#f9a8d4" }}>
            Roadmap
          </h2>

          <div className="relative">
            {/* Center line */}
            <div
              className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden md:block"
              style={{ background: "linear-gradient(to bottom, #22c55e60, #f59e0b60, #6b728030, #ec489930)" }}
            />

            <div className="space-y-6 md:space-y-8">
              {ROADMAP.map((phase, i) => {
                const badge = STATUS_BADGE[phase.status];
                const isLeft = i % 2 === 0;

                return (
                  <div key={phase.phase} className="relative flex items-start">
                    {/* Dot on center line (desktop only) */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 z-10 top-5 hidden md:block"
                      style={{
                        backgroundColor: phase.dot,
                        borderColor: phase.dot,
                        boxShadow: `0 0 8px ${phase.dot}60`,
                      }}
                    />

                    {/* Card — alternates on desktop, full width on mobile */}
                    <div className={`w-full md:w-[calc(50%-1.5rem)] ${isLeft ? "md:mr-auto md:pr-4" : "md:ml-auto md:pl-4"}`}>
                      <div
                        className="p-4 rounded-xl"
                        style={{
                          background: "#13121b",
                          border: `1px solid ${phase.border}`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <p className="text-[10px] text-zinc-600 mb-0.5">{phase.phase}</p>
                            <h3 className="font-bold text-white text-sm">{phase.title}</h3>
                          </div>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0"
                            style={{
                              background: badge.bg,
                              border: `1px solid ${badge.border}`,
                              color: badge.color,
                            }}
                          >
                            {badge.label}
                          </span>
                        </div>
                        {phase.items.length > 0 && (
                          <ul className="space-y-1">
                            {phase.items.map((item) => (
                              <li key={item.text} className="flex items-start gap-2 text-xs text-zinc-400">
                                <span
                                  className="flex-shrink-0 mt-0.5"
                                  style={{
                                    color: item.done ? "#4ade80" : phase.status === "in-progress" ? "#fbbf24" : "#6b7280",
                                  }}
                                >
                                  {item.done ? "✓" : phase.status === "in-progress" ? "●" : "○"}
                                </span>
                                {item.text}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
