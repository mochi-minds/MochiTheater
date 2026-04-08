# MochiTheater — Technical Specification

## Overview

**Project name:** MochiTheater
**One-liner:** A fully static frontend that replays AI agent team build sessions as an animated timeline.
**Value proposition:** Parse a JSONL event log and play it back cinematically — watch nine specialized agents collaborate with live status cards, task tracking, phase progress, and message highlights.

No wallet. No contracts. No API routes. No environment variables. Pure static Next.js with bundled data.

---

## Architecture

```
public/
  sample-log.jsonl         ← raw JSONL log (source data)
  avatars/<slug>.png       ← 9 agent avatars

src/
  data/
    agents.ts              ← static agent roster (9 agents, typed)
    log.ts                 ← import + parse sample-log.jsonl at build time

  types/
    log.ts                 ← LogEvent discriminated union, all subtypes
    replay.ts              ← ReplayState, AgentState, TaskState, Phase
    agents.ts              ← AgentDef type

  lib/
    parseLog.ts            ← parse raw JSONL → LogEvent[]
    replayEngine.ts        ← deriveReplayState(events, cursor) pure function

  app/
    layout.tsx             ← root layout, nav, dark theme
    page.tsx               ← / Landing
    team/page.tsx          ← /team Agent Roster
    agents/[slug]/page.tsx ← /agents/[slug] Agent Detail
    replay/page.tsx        ← /replay Log Player

  components/
    AgentCard.tsx
    AgentGrid.tsx
    PhasePipeline.tsx
    TaskTracker.tsx
    EventFeed.tsx
    PlaybackControls.tsx
    HoverTooltip.tsx
    AgentPill.tsx
    ProjectHistoryCard.tsx
    Nav.tsx
    Footer.tsx
```

**Data flow:**
1. At build time, `src/data/log.ts` imports `public/sample-log.jsonl` and calls `parseLog()` to produce `LogEvent[]`.
2. The `/replay` page holds `cursor` (index into the event array) in React state.
3. `deriveReplayState(events, cursor)` is called on every render — it folds all events up to `cursor` to produce the current `ReplayState`.
4. Playback timer increments `cursor` at the configured speed. Scrubber sets `cursor` directly.
5. All other pages read from `src/data/agents.ts` (static) and the parsed `LogEvent[]` (for project history).

---

## TypeScript Types

All types live in `frontend/src/types/`.

### `types/agents.ts`

```ts
export interface AgentDef {
  slug: string;
  name: string;
  role: string;
  color: string;        // Tailwind color name, e.g. "indigo"
  colorHex: string;     // e.g. "#6366f1"
  description: string;
  skills: string[];
  owns: string[];       // file ownership summary lines
}
```

### `types/log.ts`

Each event shares a base shape. The `type` field is the discriminant.

```ts
export interface BaseEvent {
  ts: string;           // ISO timestamp
  agent: string;        // slug of the emitting agent
  message: string;      // human-readable summary
  project: string;
}

export interface ProjectCreatedEvent extends BaseEvent {
  type: "project-created";
  data: { name: string };
}

export interface PhaseChangedEvent extends BaseEvent {
  type: "phase-changed";
  data: { phase: Phase };
}

export interface AgentJoinedEvent extends BaseEvent {
  type: "agent-joined";
  data: Record<string, never>;
}

export interface AgentLeftEvent extends BaseEvent {
  type: "agent-left";
  data: Record<string, never>;
}

export interface AgentBusyEvent extends BaseEvent {
  type: "agent-busy";
  data: { activity: AgentActivity };
}

export interface AgentIdleEvent extends BaseEvent {
  type: "agent-idle";
  data: Record<string, never>;
}

export interface TaskCreatedEvent extends BaseEvent {
  type: "task-created";
  data: { taskId: string; subject: string };
}

export interface TaskStartedEvent extends BaseEvent {
  type: "task-started";
  data: { taskId: string };
}

export interface TaskCompletedEvent extends BaseEvent {
  type: "task-completed";
  data: { taskId: string };
}

export interface MessageEvent extends BaseEvent {
  type: "message";
  data: { from: string; to: string; body: string };
}

export interface IssueFoundEvent extends BaseEvent {
  type: "issue-found";
  data: { description: string };
}

export interface FixAppliedEvent extends BaseEvent {
  type: "fix-applied";
  data: { description: string };
}

export type LogEvent =
  | ProjectCreatedEvent
  | PhaseChangedEvent
  | AgentJoinedEvent
  | AgentLeftEvent
  | AgentBusyEvent
  | AgentIdleEvent
  | TaskCreatedEvent
  | TaskStartedEvent
  | TaskCompletedEvent
  | MessageEvent
  | IssueFoundEvent
  | FixAppliedEvent;
```

### `types/replay.ts`

```ts
export type Phase =
  | "planning"
  | "design"
  | "implementation"
  | "review"
  | "deployment";

export type AgentActivity =
  | "reading"
  | "writing"
  | "reviewing"
  | "deploying"
  | "messaging"
  | string;   // open string for arbitrary labels

export type AgentStatus = "offline" | "idle" | "busy";

export interface AgentState {
  slug: string;
  status: AgentStatus;
  activity: AgentActivity | null;  // set when status === "busy"
}

export type TaskStatus = "pending" | "in-progress" | "completed";

export interface TaskState {
  taskId: string;
  subject: string;
  status: TaskStatus;
  assignee: string | null;  // agent slug
}

export interface ReplayState {
  projectName: string | null;
  phase: Phase | null;
  agents: Record<string, AgentState>;   // keyed by slug
  tasks: TaskState[];
  visibleEvents: LogEvent[];            // all events up to cursor
  cursor: number;
  totalEvents: number;
}
```

---

## Log Parser

**`frontend/src/lib/parseLog.ts`** — owned by Link.

```ts
export function parseLog(raw: string): LogEvent[]
```

- Splits on newlines, trims blanks.
- `JSON.parse()` each line.
- Validates that `type` is one of the 11 known event types — silently drops unknown lines.
- Returns `LogEvent[]` in order.

**`frontend/src/data/log.ts`** — owned by Link.

```ts
import rawLog from "../../public/sample-log.jsonl";  // via next.config: raw loader
export const LOG_EVENTS: LogEvent[] = parseLog(rawLog);
```

Alternatively, if raw import is awkward, the `/replay` page uses `fetch("/sample-log.jsonl")` inside a `useEffect` on mount and stores the parsed events in state. Prefer the static import for simplicity — use the `fetch` fallback if TypeScript/webpack config is a problem.

---

## Replay Engine

**`frontend/src/lib/replayEngine.ts`** — owned by Link.

```ts
export function deriveReplayState(
  events: LogEvent[],
  cursor: number
): ReplayState
```

This is a pure function — no side effects, no mutations. It folds `events[0..cursor]` into a `ReplayState`.

### Fold rules per event type:

| Event | State mutation |
|---|---|
| `project-created` | `state.projectName = event.data.name` |
| `phase-changed` | `state.phase = event.data.phase` |
| `agent-joined` | `agents[event.agent].status = "idle"` |
| `agent-left` | `agents[event.agent].status = "offline"` |
| `agent-busy` | `agents[event.agent].status = "busy"`, `activity = event.data.activity` |
| `agent-idle` | `agents[event.agent].status = "idle"`, `activity = null` |
| `task-created` | push `{ taskId, subject, status: "pending", assignee: null }` |
| `task-started` | find task by `taskId`, set `status = "in-progress"`, `assignee = event.agent` |
| `task-completed` | find task by `taskId`, set `status = "completed"` |
| `message` | push to `visibleEvents` only |
| `issue-found` | push to `visibleEvents` only |
| `fix-applied` | push to `visibleEvents` only |

All events are appended to `visibleEvents`. `cursor` and `totalEvents` are set from the input params.

Start state: all agents `"offline"`, no phase, no tasks, empty event feed.

---

## Static Agent Data

**`frontend/src/data/agents.ts`** — owned by Link.

Nine `AgentDef` entries, one per slug. Color values follow the design screenshots.

| Slug | Name | Role | Color |
|---|---|---|---|
| `lead` | Lead | Team Lead | indigo / `#6366f1` |
| `mochi` | Mochi | Ideator | pink / `#ec4899` |
| `blueprint` | Blueprint | Architect | cyan / `#06b6d4` |
| `forge` | Forge | Smart Contract Dev | orange / `#f97316` |
| `naga` | Naga | Tezos L1 Dev | teal / `#14b8a6` |
| `link` | Link | Backend Dev | blue / `#3b82f6` |
| `pixel` | Pixel | Frontend Dev | purple / `#a855f7` |
| `sage` | Sage | Reviewer | yellow / `#eab308` |
| `rocket` | Rocket | Deployer | red / `#ef4444` |

Skills and ownership lines come from the `.claude/agents/<slug>.md` files (Pixel reads these and hardcodes them in `agents.ts`).

---

## Pages

### `/` — Landing (`app/page.tsx`)

Sections in order:

1. **Hero** — full-viewport section. Gradient text "MochiTheater" (pink → cyan → purple, left-to-right). Subtitle: "Watch AI agents build in real time." CTA button → `/replay`. Dark background (`bg-black` or near-black). The design screenshots show the text very large, centered, with emoji-style agent faces visible below.

2. **Meet the Team** — section heading "MEET THE TEAM", subtext "Hover a card to see each agent's profile." Horizontal scrolling row (or wrapped grid) of 9 `AgentCard` components in idle state (no hover detail). Clicking navigates to `/agents/[slug]`.

3. **How It Works** — section heading "HOW IT WORKS", 3 numbered cards with icons:
   - 1. "Describe your project" — brief is written, agents are activated
   - 2. "Agents build it" — 9 specialized agents write Solidity, build the frontend, API routes, and review each other's code
   - 3. "Ship to Etherlink" — verified contracts deploy to Etherlink. Code pushed to GitHub.

4. **Roadmap** — section heading "ROADMAP", 4 phase cards in a vertical timeline. From the screenshots:
   - Phase 1: Foundation — `COMPLETED` badge. Items: 9-agent architecture, smart contract dev with Foundry + OpenZeppelin, full-stack dApp generation, automated code review and security auditing, one-click deploy to Etherlink/Shadownet.
   - Phase 2: AgentTheater — `IN PROGRESS` badge. Items: Live replay of agent build sessions, agent profile pages with skills and project history, speed-controlled event playback, interactive team visualization.
   - Phase 3: New Agents — `UPCOMING` badge. Items: Beautify agent — smart contracts on Tezos L1 using our own Beautify skill.
   - Phase 4: Autonomy — `UPCOMING` badge. (No items shown in screenshot.)

5. **Footer** — "AgentTheater" brand, tagline "AI agents building on Etherlink / Powered by Claude Code Agent Teams", project links (GitHub, Team, Roadmap, Replay), stack links (Claude Code, Etherlink, Foundry, Next.js, Tailwind CSS), "Built by MochiMinds" bottom bar.

**Component:** this page is a Server Component. No state needed.

---

### `/team` — Agent Roster (`app/team/page.tsx`)

- Heading: "MEET THE TEAM"
- Subtext: "Hover a card to see each agent's profile."
- Grid of all 9 `AgentCard` components.
- On hover: `HoverTooltip` overlays on the card showing: agent name, role badge (colored), one-line description, skills as pill tags, "View Profile →" link to `/agents/[slug]`.

The tooltip behavior shown in screenshots: a dark card lifts out of the grid card with name, role pill, description text, a skill tag (e.g. "Etherlink API"), and a "View Profile →" text link.

**Server Component.** Agent data is imported from `src/data/agents.ts`.

---

### `/agents/[slug]` — Agent Detail (`app/agents/[slug]/page.tsx`)

Layout from screenshots:

**Left column (1/3 width):**
- Large circular avatar PNG (`public/avatars/<slug>.png`)
- Color emoji/icon + name (large)
- Role title (subdued, uppercase)
- One-line description
- "Also worked with" — row of `AgentPill` for agents this agent co-appeared in projects with

**Right column (2/3 width):**
- **Skills** section: two or more skill cards (icon + skill name + one-line description)
- **Projects** section: `ProjectHistoryCard` for each project this agent appears in the log. Each card shows: project name, status badge (e.g. "DONE"), one-line description, row of `AgentPill` for all agents on that project.

**Bottom:** "← Back to all agents" link.

**Page generation:** use `generateStaticParams()` returning all 9 slugs.

Project history is derived by scanning `LOG_EVENTS` for events where `event.agent === slug` or `event.data.from === slug` or `event.data.to === slug`, grouped by `event.project`.

**Server Component.** Import agents and log events statically.

---

### `/replay` — Log Player (`app/replay/page.tsx`)

This is a **Client Component** (`"use client"`). All interactive state lives here.

**Layout (from screenshots):**
- Top bar: project name (e.g. "EcosyStore"), "WATCH THEIR WORK" label
- Phase pipeline bar below the top bar
- Playback controls row: Play/Skip buttons, timeline scrubber, speed selector (0.5x, 1x, 2x, 4x)
- Agent grid: 3×3 grid of `AgentCard` components, each reflecting live `AgentState`
- Below the agent grid: task tracker sidebar + event feed (shown in screenshots as a panel labeled "AGENTTHEATER #0" with agent count)
- When no events have played yet: "No events yet — press play to start replay" placeholder in event feed area

**State managed in this component:**

```ts
const [events, setEvents] = useState<LogEvent[]>([])
const [cursor, setCursor] = useState(0)
const [playing, setPlaying] = useState(false)
const [speed, setSpeed] = useState<0.5 | 1 | 2 | 4>(1)
```

On mount: load events (static import or fetch from `/sample-log.jsonl`).

**Playback timer:** `useEffect` that sets an interval when `playing === true`. Interval fires every `(BASE_INTERVAL_MS / speed)` ms and calls `setCursor(c => Math.min(c + 1, events.length))`. Clears interval when `playing` becomes false or cursor reaches end.

**Scrubber:** `<input type="range" min={0} max={events.length} value={cursor} onChange={e => setCursor(Number(e.target.value))} />`

**Derived state:** `const replayState = deriveReplayState(events, cursor)` — called inline on each render, no memoization needed for typical log sizes (<10k events). Add `useMemo` if profiling shows a problem.

#### Agent card visual states

| AgentStatus | Visual |
|---|---|
| `offline` | Dimmed avatar, no label, gray border |
| `idle` | Normal opacity, role label shown, neutral border |
| `busy` | Full opacity, colored glow border (agent's color), `activity` label shown below name |

#### Phase pipeline

Horizontal bar with 5 labeled segments: Planning → Design → Implementation → Review → Deployment. The currently active phase segment has a highlighted fill/outline in the agent's primary accent color (or a neutral accent). Completed phases show a checkmark or muted highlight.

#### Task tracker

Vertical list of tasks from `replayState.tasks`. Each item shows:
- Status icon: pending (gray circle), in-progress (spinner/yellow), completed (green check)
- Task subject text
- Assignee `AgentPill` (when `status !== "pending"`)

#### Event feed

Scrolling list, newest event at top. Each entry shows:
- Timestamp (formatted from `event.ts`)
- Agent name with colored dot
- Message text
- Visual treatment by type:
  - `message` → speech bubble row with `from → to` and `data.body`
  - `issue-found` → amber/orange background highlight
  - `fix-applied` → green background highlight
  - all others → default neutral row

Auto-scroll to top when new events arrive.

---

## Component Specifications

All components are in `frontend/src/components/`. Owned by Pixel.

### `AgentCard`

```ts
interface AgentCardProps {
  agent: AgentDef;
  state?: AgentState;       // if undefined, show in "roster" mode (idle appearance)
  showTooltip?: boolean;    // /team page hover tooltip
  onClick?: () => void;
}
```

Renders: circular avatar, colored name label with emoji/icon, role title. When `state.status === "busy"`, glowing colored border + activity label. When `state.status === "offline"`, dimmed opacity. Clicking navigates to `/agents/[slug]` (or calls `onClick` if provided).

### `AgentGrid`

```ts
interface AgentGridProps {
  agents: AgentDef[];
  states: Record<string, AgentState>;  // keyed by slug
}
```

3×3 grid of `AgentCard` with live state passed in. Used by `/replay`.

### `PhasePipeline`

```ts
interface PhasePipelineProps {
  currentPhase: Phase | null;
}
```

Horizontal pipeline bar with 5 labeled phases. Active phase is highlighted. Phases before active show as completed.

### `TaskTracker`

```ts
interface TaskTrackerProps {
  tasks: TaskState[];
  agents: AgentDef[];   // for resolving assignee slugs to colors
}
```

Vertical scrollable list of tasks with status icons and assignee pills.

### `EventFeed`

```ts
interface EventFeedProps {
  events: LogEvent[];   // visibleEvents from ReplayState, newest rendered first
  agents: AgentDef[];   // for resolving agent slugs to colors
}
```

Scrollable feed. `issue-found` rows get amber background, `fix-applied` rows get green. `message` events get a distinct speech-bubble layout.

### `PlaybackControls`

```ts
interface PlaybackControlsProps {
  playing: boolean;
  cursor: number;
  totalEvents: number;
  speed: 0.5 | 1 | 2 | 4;
  onPlayPause: () => void;
  onSkip: () => void;       // jump to end
  onSeek: (cursor: number) => void;
  onSpeedChange: (speed: 0.5 | 1 | 2 | 4) => void;
}
```

Play/pause button, Skip button, scrubber, speed buttons. The screenshots show: `► Play` and `← Skip` buttons left of scrubber, speed buttons (`0.5x 1x 2x 4x`) on the right, current position shown as `n / total` count.

### `HoverTooltip`

```ts
interface HoverTooltipProps {
  agent: AgentDef;
}
```

Dark overlay card that appears on hover over `AgentCard` on `/team`. Shows: name, colored role badge, description text, skill tags, "View Profile →" link.

### `AgentPill`

```ts
interface AgentPillProps {
  agent: AgentDef;
  size?: "sm" | "md";
}
```

Compact inline chip: emoji/icon + name, colored background. Used in event feed, project history, agent detail page.

### `ProjectHistoryCard`

```ts
interface ProjectHistoryCardProps {
  projectName: string;
  description: string;
  status: "done" | "in-progress" | "upcoming";
  collaborators: AgentDef[];
}
```

Card on `/agents/[slug]`. Shows project name, status badge, description, row of `AgentPill`.

### `Nav`

```ts
interface NavProps {
  // no props — reads active route from usePathname()
}
```

Top navigation bar: "AgentTheater" brand (left), links: Team, Replay, Roadmap, GitHub (right). From screenshots: minimal dark bar, links are plain text.

### `Footer`

No props. Static footer from landing page design.

---

## Hooks

Owned by Pixel.

### `useReplay`

```ts
function useReplay(events: LogEvent[]): {
  replayState: ReplayState;
  playing: boolean;
  speed: 0.5 | 1 | 2 | 4;
  play: () => void;
  pause: () => void;
  skip: () => void;
  seek: (cursor: number) => void;
  setSpeed: (speed: 0.5 | 1 | 2 | 4) => void;
}
```

Encapsulates all playback state and timer logic. The `/replay` page uses this hook and passes the returned values into child components. This keeps the page component thin.

Base interval: `1000ms` at `1x` speed. At `2x` → `500ms`, `4x` → `250ms`, `0.5x` → `2000ms`.

---

## Theme & Design

- Background: `#0a0a0a` (near-black)
- Surface cards: `#111111` with `#1f1f1f` border
- Text primary: `#f5f5f5`
- Text muted: `#6b7280`
- Font: monospace font for event feed (`font-mono`). Display font for hero heading (Google Fonts — a geometric sans or display font with gradient). Body: system sans.
- Per-agent glow: `box-shadow: 0 0 12px <agent colorHex>` on busy cards.
- Tailwind config extends `colors` with `agent-lead`, `agent-mochi`, etc. mapped to the hex values above.
- All agent colors are defined in `tailwind.config.ts` as safelist entries so purging doesn't strip them.

---

## Sample Log File

**`public/sample-log.jsonl`** — owned by Rocket.

Rocket generates a realistic sample log representing the MochiTheater project build itself (meta: the MochiTheater team building MochiTheater). It should include all 11 event types, cover all 9 agents, and span all 5 phases. Minimum 60 events to give the replay meaningful length at 1x speed.

Format per line:
```json
{"type":"project-created","agent":"lead","message":"MochiTheater project initialized","ts":"2026-04-05T10:00:00Z","data":{"name":"MochiTheater"},"project":"MochiTheater"}
```

---

## Phase 2 Plan — Session NFTs

Not implemented in Phase 1. Specified here for planning.

When a user replays a session, they can mint an NFT capturing the session as a permanent on-chain record. The NFT metadata references the JSONL log hash (stored on IPFS or Arweave) and a generated preview image.

**Contract (Etherlink EVM):**
- ERC-721 contract deployed on Etherlink
- `tokenURI` points to IPFS metadata JSON
- Metadata: `{ name, description, image, attributes: [ { project }, { eventCount }, { phases }, { agentCount } ] }`
- Mint function: `mint(address to, string calldata metadataURI)` — callable by anyone (open mint) or by session owner (verified by signature)

**Frontend additions:**
- "Mint this session" button on `/replay` page (only after full playback)
- Wallet connection via RainbowKit + Wagmi
- Transaction status component (use template `TxStatus.tsx`)

**API additions:**
- `POST /api/upload-log` — accepts log file, pins to IPFS via nft.storage or Pinata, returns CID
- `POST /api/mint-metadata` — generates metadata JSON, pins it, returns metadata URI

This is deferred to Phase 2. Phase 1 has no wallet, no contracts, no API routes.

---

## File Ownership Map

| Agent | Owns |
|---|---|
| **Link** | `frontend/src/types/agents.ts`, `frontend/src/types/log.ts`, `frontend/src/types/replay.ts`, `frontend/src/data/agents.ts`, `frontend/src/data/log.ts`, `frontend/src/lib/parseLog.ts`, `frontend/src/lib/replayEngine.ts`, `frontend/package.json`, `frontend/next.config.mjs` |
| **Pixel** | `frontend/src/app/layout.tsx`, `frontend/src/app/page.tsx`, `frontend/src/app/team/page.tsx`, `frontend/src/app/agents/[slug]/page.tsx`, `frontend/src/app/replay/page.tsx`, `frontend/src/components/**`, `frontend/src/hooks/useReplay.ts`, `frontend/tailwind.config.ts`, `frontend/src/app/globals.css` |
| **Sage** | Reviews all files, runs builds, messages teammates with issues |
| **Rocket** | `public/sample-log.jsonl`, `README.md`, `.env.example`, `.gitignore`, `contracts/script/` |

---

## Build Sequence

```
1. Link (Task #3)
   - Copy templates/frontend/ to projects/MochiTheater/frontend/
   - Write all types: types/agents.ts, types/log.ts, types/replay.ts
   - Write data/agents.ts with all 9 agents (hardcoded)
   - Write lib/parseLog.ts
   - Write lib/replayEngine.ts
   - Write data/log.ts (import or fetch from public/sample-log.jsonl)
   - Run: cd frontend && npm install && npx tsc --noEmit
   VERIFY: TypeScript compiles with no errors, all types exported correctly

2. Rocket (parallel with Link or after Link starts)
   - Write public/sample-log.jsonl with 60+ events covering all 11 types and all 9 agents
   VERIFY: valid JSON on each line, parses without errors

3. Pixel (Task #4) — can start after Link finishes types + data
   - Set up tailwind.config.ts with dark theme and agent colors
   - Set up globals.css with font imports and base styles
   - Build components in components/ (AgentCard, AgentGrid, PhasePipeline, TaskTracker, EventFeed, PlaybackControls, HoverTooltip, AgentPill, ProjectHistoryCard, Nav, Footer)
   - Build useReplay hook
   - Build pages: /, /team, /agents/[slug], /replay
   - Run: cd frontend && npm run build
   VERIFY: build passes, all pages render, replay plays end-to-end

4. Sage (Task #5) — after Pixel's build passes
   - Read all source files
   - Check: types match usage in components, replay state folding is correct, mobile layout not broken, no secrets in client code
   - Message teammates with specific issues (file + line)
   VERIFY: build passes after any fixes, no type errors

5. Rocket (Task #6)
   - Write README.md with project description, setup steps, and log format docs
   - Verify avatars are copied to public/avatars/
   - Push to GitHub
```

**Parallel opportunities:**
- Pixel can start building components with mock/empty data while waiting for Link to finish `replayEngine.ts`. The types are the blocking dependency, not the implementation.
- Rocket writes `sample-log.jsonl` in parallel with Link and Pixel — it has no code dependencies.

---

## No Environment Variables

This project requires no environment variables. There are no API routes, no secrets, no external services called at runtime. The `.env.example` file will be empty (or contain a comment only).
