import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "../store/playerStore";

export default function PlayerBar() {
  const navigate = useNavigate();

  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const seek = usePlayerStore((s) => s.seek);
  const setVolume = usePlayerStore((s) => s.setVolume);

  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const volume = usePlayerStore((s) => s.volume);
  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);

  const track = queue[currentIndex];

  const progress = duration ? Math.min((currentTime / duration) * 100, 100) : 0;

  const mmss = (sec) => {
    const s = Number(sec || 0);
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${String(r).padStart(2, "0")}`;
  };

  return (
    <footer
      onClick={() => navigate("/now-playing")}
      className="fixed bottom-0 left-0 right-0 bg-black/70 backdrop-blur-lg border-t border-white/10 cursor-pointer"
      title="Open Now Playing"
    >
      <div className="mx-auto max-w-[1400px] px-6 py-3 grid grid-cols-1 md:grid-cols-3 items-center gap-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            className="h-12 w-12 rounded overflow-hidden bg-white/10 border border-white/10 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              if (track?.albumId) navigate(`/album/${track.albumId}`);
            }}
            title="Go to album"
          >
            {track?.albumCover ? (
              <img src={track.albumCover} alt="cover" className="h-full w-full object-cover" />
            ) : null}
          </button>

          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{track?.title || "Not Playing"}</div>
            <div className="text-xs text-white/60 truncate">{track?.artist_text || "—"}</div>
          </div>
        </div>

        {/* Center */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <button
              className="opacity-90 hover:opacity-100"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              title="Previous"
            >
              ⏮
            </button>

            <button
              className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center font-bold"
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? "❚❚" : "▶"}
            </button>

            <button
              className="opacity-90 hover:opacity-100"
              onClick={(e) => { e.stopPropagation(); next(); }}
              title="Next"
            >
              ⏭
            </button>
          </div>

          {/* Seek */}
          <div className="w-full max-w-md flex items-center gap-2 text-xs text-white/60">
            <span>{mmss(currentTime)}</span>

            <div
              className="relative flex-1 h-1 rounded bg-white/20 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                seek(pct * (duration || 0));
              }}
            >
              <div className="absolute left-0 top-0 h-1 rounded bg-white" style={{ width: `${progress}%` }} />
            </div>

            <span>{mmss(duration)}</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center justify-end gap-3">
          <span className="text-xs text-white/60">Vol</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => { e.stopPropagation(); setVolume(Number(e.target.value)); }}
            className="w-28"
          />
        </div>
      </div>
    </footer>
  );
}