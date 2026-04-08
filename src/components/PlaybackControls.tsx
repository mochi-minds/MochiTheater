"use client";

interface PlaybackControlsProps {
  playing: boolean;
  cursor: number;
  totalEvents: number;
  speed: 0.5 | 1 | 2 | 4;
  onPlayPause: () => void;
  onSkip: () => void;
  onSeek: (cursor: number) => void;
  onSpeedChange: (speed: 0.5 | 1 | 2 | 4) => void;
}

const SPEEDS: Array<0.5 | 1 | 2 | 4> = [0.5, 1, 2, 4];

export function PlaybackControls({
  playing,
  cursor,
  totalEvents,
  speed,
  onPlayPause,
  onSkip,
  onSeek,
  onSpeedChange,
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "#111111", border: "1px solid #1f1f1f" }}>
      {/* Play/Pause */}
      <button
        onClick={onPlayPause}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-zinc-800"
        style={{
          background: "#1a1a2e",
          border: "1px solid #6366f140",
          color: "#a5b4fc",
        }}
      >
        {playing ? (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Pause
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Play
          </>
        )}
      </button>

      {/* Skip to end */}
      <button
        onClick={onSkip}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors hover:bg-zinc-800"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
        </svg>
        Skip
      </button>

      {/* Position counter */}
      <span className="text-xs font-mono text-zinc-500 tabular-nums">
        {cursor} / {totalEvents}
      </span>

      {/* Scrubber */}
      <input
        type="range"
        min={0}
        max={totalEvents}
        value={cursor}
        onChange={(e) => onSeek(Number(e.target.value))}
        className="flex-1 h-1.5 rounded-full cursor-pointer"
        style={{ accentColor: "#6366f1" }}
      />

      {/* Speed buttons */}
      <div className="flex gap-1">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className="text-xs px-2 py-1 rounded font-mono font-medium transition-colors"
            style={{
              background: speed === s ? "#6366f120" : "transparent",
              border: `1px solid ${speed === s ? "#6366f160" : "#333333"}`,
              color: speed === s ? "#a5b4fc" : "#6b7280",
            }}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
