"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Team", href: "/#team" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Roadmap", href: "/#roadmap" },
  { label: "Office", href: "/experimental" },
];

export function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      style={{ background: "#0a0a0aee", borderBottom: "1px solid #1f1f1f", backdropFilter: "blur(8px)" }}
    >
      <div className="flex items-center justify-between">
        <Link href="/" className="text-xl font-medium tracking-tight gradient-text" style={{ fontFamily: 'var(--font-headline)' }}>
          MochiTheater
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm transition-colors"
                style={{ color: isActive ? "#f5f5f5" : "#6b7280" }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#f5f5f5"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.color = isActive ? "#f5f5f5" : "#6b7280"; }}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="https://github.com/mochi-minds"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm transition-colors px-3 py-1 rounded-full"
            style={{ color: "#a1a1aa", border: "1px solid #3f3f46" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#f5f5f5"; (e.currentTarget as HTMLElement).style.borderColor = "#71717a"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#a1a1aa"; (e.currentTarget as HTMLElement).style.borderColor = "#3f3f46"; }}
          >
            GitHub ↗
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className="block w-5 h-[2px] transition-transform duration-200"
            style={{ background: "#a1a1aa", transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none" }}
          />
          <span
            className="block w-5 h-[2px] transition-opacity duration-200"
            style={{ background: "#a1a1aa", opacity: menuOpen ? 0 : 1 }}
          />
          <span
            className="block w-5 h-[2px] transition-transform duration-200"
            style={{ background: "#a1a1aa", transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none" }}
          />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden flex flex-col pt-4 pb-2 gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm py-2 transition-colors"
                style={{ color: isActive ? "#f5f5f5" : "#6b7280" }}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="https://github.com/mochi-minds"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm py-2 transition-colors"
            style={{ color: "#a1a1aa" }}
            onClick={() => setMenuOpen(false)}
          >
            GitHub ↗
          </Link>
        </div>
      )}
    </nav>
  );
}
