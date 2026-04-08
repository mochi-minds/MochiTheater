import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AGENTS, AGENTS_BY_SLUG } from "@/lib/agents";
import { parseLog, groupByProject } from "@/lib/helpers/parseLog";
import { deriveProjects } from "@/lib/helpers/projects";
import type { LogEvent } from "@/types/log";
import type { AgentDef } from "@/types/agents";

function loadAllReplayEvents(): LogEvent[] {
  const replaysDir = join(process.cwd(), "public", "replays");
  try {
    const files = readdirSync(replaysDir).filter((f) => f.endsWith(".display.jsonl"));
    const allEvents: LogEvent[] = [];
    for (const file of files) {
      const raw = readFileSync(join(replaysDir, file), "utf8");
      allEvents.push(...parseLog(raw));
    }
    return allEvents;
  } catch {
    return [];
  }
}

export function generateStaticParams() {
  return AGENTS.map((a) => ({ slug: a.slug }));
}

function getProjectHistory(slug: string) {
  const LOG_EVENTS = loadAllReplayEvents();
  const projects: Record<string, Set<string>> = {};

  for (const event of LOG_EVENTS) {
    const isInvolved =
      event.agent === slug ||
      (event.type === "message" && (event.data.from === slug || event.data.to === slug));

    if (isInvolved && event.project) {
      if (!projects[event.project]) projects[event.project] = new Set();
      projects[event.project].add(event.agent);
      if (event.type === "message") {
        projects[event.project].add(event.data.from);
        projects[event.project].add(event.data.to);
      }
    }
  }

  const allByProject = groupByProject(LOG_EVENTS);
  const allProjectSummaries = deriveProjects(LOG_EVENTS);
  const githubMap = Object.fromEntries(
    allProjectSummaries.map((p) => [p.name, p.githubUrl])
  );

  return Object.entries(projects).map(([projectName]) => {
    const projectEvents = allByProject[projectName] ?? [];
    const collaboratorSlugs = new Set<string>();
    for (const e of projectEvents) {
      collaboratorSlugs.add(e.agent);
      if (e.type === "message") {
        collaboratorSlugs.add(e.data.from);
        collaboratorSlugs.add(e.data.to);
      }
    }
    collaboratorSlugs.delete(slug);

    const collaborators = Array.from(collaboratorSlugs)
      .map((s) => AGENTS_BY_SLUG[s])
      .filter(Boolean) as AgentDef[];

    return { projectName, collaborators, githubUrl: githubMap[projectName] };
  });
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AgentDetailPage({ params }: Props) {
  const { slug } = await params;
  const agent = AGENTS_BY_SLUG[slug];
  if (!agent) notFound();

  const projectHistory = getProjectHistory(agent.slug);
  const otherAgents = AGENTS.filter((a) => a.slug !== agent.slug);

  return (
    <main
      className="py-12 px-4 sm:px-6"
      style={{ background: `radial-gradient(ellipse 70% 40% at 50% 0%, ${agent.colorHex}08 0%, transparent 60%)` }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Back link */}
        <Link
          href="/#team"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Team
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ── Left column: avatar + identity ── */}
          <div className="md:col-span-1">
            <div className="sticky top-24 flex flex-col items-center md:items-start text-center md:text-left gap-4">
              {/* Avatar — large, no glow, no ring */}
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden">
                <Image
                  src={`/avatars/${agent.slug}.png`}
                  alt={agent.name}
                  fill
                  className="object-cover"
                  sizes="144px"
                />
              </div>

              {/* Name */}
              <div>
                <h1
                  className="text-3xl sm:text-4xl font-medium"
                  style={{ fontFamily: "var(--font-headline)", color: agent.colorHex }}
                >
                  {agent.name}
                </h1>
                <p
                  className="text-xs font-bold tracking-[0.25em] uppercase mt-1"
                  style={{ color: `${agent.colorHex}99` }}
                >
                  {agent.role}
                </p>
              </div>

              <div className="w-12 h-px" style={{ background: `${agent.colorHex}40` }} />

              <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
                {agent.description}
              </p>

            </div>
          </div>

          {/* ── Right column: skills, projects, team ── */}
          <div className="md:col-span-2 space-y-6">
            {/* Skills */}
            {agent.skills.length > 0 && (
              <div>
                <h2
                  className="text-xs font-bold tracking-[0.3em] uppercase mb-4"
                  style={{ color: `${agent.colorHex}80` }}
                >
                  Skills
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {agent.skills.map((skill) => (
                    <div
                      key={skill.name}
                      className="p-4 rounded-xl transition-colors hover:border-opacity-60"
                      style={{
                        background: `${agent.colorHex}06`,
                        border: `1px solid ${agent.colorHex}18`,
                      }}
                    >
                      <p className="text-sm font-semibold text-zinc-200">{skill.name}</p>
                      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{skill.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {projectHistory.length > 0 && (
              <div>
                <h2
                  className="text-xs font-bold tracking-[0.3em] uppercase mb-4"
                  style={{ color: `${agent.colorHex}80` }}
                >
                  Projects
                </h2>
                <div className="space-y-3">
                  {projectHistory.map(({ projectName, collaborators, githubUrl }) => (
                    <div
                      key={projectName}
                      className="rounded-xl p-4"
                      style={{
                        background: "#13121b",
                        border: `1px solid ${agent.colorHex}18`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="font-semibold text-base" style={{ color: agent.colorHex }}>
                            {projectName}
                          </h3>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {agent.name} contributed to {projectName}
                          </p>
                        </div>
                        {githubUrl && (
                          <a
                            href={githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
                          >
                            ↗ GitHub
                          </a>
                        )}
                      </div>
                      {collaborators.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {collaborators.map((a) => (
                            <Link
                              key={a.slug}
                              href={`/agents/${a.slug}`}
                              className="inline-flex items-center gap-1.5 rounded-full text-[11px] font-medium pl-1 pr-2.5 py-0.5 transition-opacity hover:opacity-80"
                              style={{
                                backgroundColor: `${a.colorHex}15`,
                                color: a.colorHex,
                              }}
                            >
                              <div className="relative w-4 h-4 rounded-full overflow-hidden">
                                <Image
                                  src={`/avatars/${a.slug}.png`}
                                  alt={a.name}
                                  fill
                                  className="object-cover"
                                  sizes="16px"
                                />
                              </div>
                              {a.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full team */}
            <div>
              <h2
                className="text-xs font-bold tracking-[0.3em] uppercase mb-4"
                style={{ color: `${agent.colorHex}80` }}
              >
                The Council
              </h2>
              <div className="flex flex-wrap gap-2">
                {AGENTS.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/agents/${a.slug}`}
                    className={`inline-flex items-center gap-1.5 rounded-full text-xs font-medium pl-1.5 pr-3 py-1 transition-all ${
                      a.slug === agent.slug ? "ring-1" : "hover:scale-105"
                    }`}
                    style={{
                      backgroundColor: a.slug === agent.slug ? `${a.colorHex}25` : `${a.colorHex}10`,
                      color: a.colorHex,
                      boxShadow: a.slug === agent.slug ? `0 0 0 1px ${a.colorHex}` : undefined,
                    }}
                  >
                    <div className="relative w-5 h-5 rounded-full overflow-hidden">
                      <Image
                        src={`/avatars/${a.slug}.png`}
                        alt={a.name}
                        fill
                        className="object-cover"
                        sizes="20px"
                      />
                    </div>
                    {a.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
