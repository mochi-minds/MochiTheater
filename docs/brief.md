# Project Brief: MochiTheater

## One-liner
A fully static frontend that replays AI agent team build sessions as an animated timeline — watch nine specialized agents collaborate in real time to build a project from brief to deployed contracts.

## Track
Dev Tooling

## Problem
AI agent teams produce rich, structured logs as they work — task creation, agent handoffs, code reviews, inter-agent messages — but there's no way to visualize or share what actually happened. The raw JSONL is unreadable to humans and invisible to stakeholders.

## Solution
MochiTheater parses a JSONL event log and plays it back as a cinematic, animated session replay. Users can watch each agent join the team, pick up tasks, go busy, message teammates, hit review issues, apply fixes, and complete work — all on a live timeline with full playback controls. No wallet, no contracts, no API routes. Pure static frontend.

## AI Integration
No AI API calls at runtime. The AI story is told through the log itself: the log was produced by Claude agents collaborating autonomously. MochiTheater visualizes that AI work as the content. Agent avatars and role descriptions communicate each agent's specialization (Mochi ideates, Forge writes contracts, Sage reviews, etc.).

## Smart Contracts Needed
None. MochiTheater is fully static — no blockchain interaction.

## Frontend Requirements

### Pages

**`/` — Landing**
- Hero section: "Watch AI agents build in real time" tagline, CTA to `/replay`
- Team grid: all 9 agents displayed as cards with avatar, name, role title, and color accent
- How It Works: 3-step explanation (log produced → MochiTheater parses → you watch the replay)
- Roadmap section: planned future features (multi-project logs, live streaming, shareable links)
- Footer with project name and stack credits

**`/team` — Agent Roster**
- Grid of all 9 agent cards
- Each card: avatar PNG, name, color badge, role title, one-line description
- Hover tooltip: skills list, file ownership

**`/agents/[slug]` — Agent Detail**
- Full agent profile: avatar, name, color, role
- Skills list
- File ownership table
- Project history: tasks this agent completed across logged sessions (parsed from log)

**`/replay` — Log Player (primary experience)**
- Loads log data from a static JSON file bundled with the app
- **Phase pipeline:** horizontal bar showing phases (planning → design → implementation → review → deployment) with current phase highlighted
- **Agent grid:** 9 agent cards showing live status — idle, busy (with activity label), or offline
- **Task tracker:** sidebar list of tasks — pending, in-progress, completed
- **Event feed:** scrolling list of log events as they play, newest at top
- **Message highlights:** agent-to-agent messages displayed as speech bubbles or highlighted rows
- **Issue/fix highlighting:** `issue-found` events shown in amber, `fix-applied` in green
- **Playback controls:** play/pause button, speed selector (0.5x, 1x, 2x, 4x), timeline scrubber (seek to any point)
- **No wallet connection needed**

### Key Interactions
- Scrubbing the timeline updates all agent statuses, task states, and phase to match that moment
- Clicking an agent card navigates to `/agents/[slug]`
- Speed control affects event dispatch rate during playback

### Theme
Dark background, per-agent color accents (unique color per agent), monospace font for event feed, clean card-based layout.

## API/Backend Requirements
None. All data is:
- Static agent definitions (hardcoded or imported JSON)
- Static log file bundled as a JSON import or fetched from `/public/sample-log.jsonl`

No `process.env.*` variables required. No Next.js API routes.

## Log Event Format
Each log line is a JSON object:
```json
{"type":"...","agent":"...","message":"...","ts":"...","data":{},"project":"..."}
```

### Event Types
| Type | Display |
|------|---------|
| `project-created` | Banner at start of timeline |
| `phase-changed` | Advance phase pipeline highlight |
| `agent-joined` | Agent card appears / activates |
| `agent-left` | Agent card grays out |
| `agent-busy` | Agent card shows activity label |
| `agent-idle` | Agent card shows idle state |
| `task-created` | Task appears in task tracker as pending |
| `task-started` | Task moves to in-progress |
| `task-completed` | Task moves to completed |
| `message` | Speech bubble between `data.from` and `data.to` agents |
| `issue-found` | Amber highlight in event feed |
| `fix-applied` | Green highlight in event feed |

## Agent Roster

| Slug | Name | Role | Color |
|------|------|------|-------|
| `lead` | Lead | Team Lead | Indigo |
| `mochi` | Mochi | Ideator | Pink |
| `blueprint` | Blueprint | Architect | Cyan |
| `forge` | Forge | Smart Contract Dev | Orange |
| `naga` | Naga | Tezos L1 Dev | Teal |
| `link` | Link | Backend/API Dev | Blue |
| `pixel` | Pixel | Frontend Dev | Purple |
| `sage` | Sage | Code Reviewer | Yellow |
| `rocket` | Rocket | DevOps/Deploy | Red |

Avatar PNGs are at `/docs/assets/<slug>.png` in the monorepo — copy to `public/avatars/` during setup.

## Why It's Cool
Most AI agent demos are a wall of terminal output. MochiTheater turns that raw log into something you can actually watch — nine distinct personalities with avatars and colors, tasks flowing through a pipeline, messages flying between agents, issues flagged in amber and resolved in green. It makes the invisible work of an AI team tangible and shareable. It also serves as a permanent record of how MochiMinds builds — every project becomes a replayable story.
