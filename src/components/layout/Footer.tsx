import Link from "next/link";
import { AGENTS } from "@/lib/agents";

export function Footer() {
  return (
    <footer style={{ background: "#080808", borderTop: "1px solid #1f1f1f" }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <p className="font-bold text-lg mb-2 gradient-text">MochiTheater</p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              AI agents building on Etherlink.<br />
              Powered by Claude Code Agent Teams.
            </p>
            {/* Agent color dots */}
            <div className="flex gap-1.5 mt-4">
              {AGENTS.map((agent) => (
                <span
                  key={agent.slug}
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: agent.colorHex }}
                  title={agent.name}
                />
              ))}
            </div>
          </div>

          {/* Project links */}
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Project</p>
            <ul className="space-y-2">
              {[
                { label: "GitHub", href: "https://github.com/mochi-minds", external: true },
                { label: "Team", href: "/team" },
                { label: "Roadmap", href: "/#roadmap" },
                { label: "Replay", href: "/replay" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div style={{ borderTop: "1px solid #1f1f1f" }} className="pt-6 text-center">
          <p className="text-xs text-zinc-600">
            Built by{" "}
            <a
              href="https://github.com/mochi-minds"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-400 transition-colors"
            >
              MochiMinds
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
