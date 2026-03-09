import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "../store/playerStore";
import TrackActionsMenu from "./TrackActionsMenu";
import LikeButton from "./LikeButton";

export default function TrackListBlock({ title, tracks = [], likedIds = new Set(), onLikedChange }) {
  const navigate = useNavigate();
  const setQueueAndPlay = usePlayerStore((s) => s.setQueueAndPlay);

  const mmss = (sec) => {
    const s = Number(sec || 0);
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${String(r).padStart(2, "0")}`;
  };

  const playFromIndex = (idx) => {
    const enriched = tracks.map((t) => ({
      ...t,
      albumId: t.album_id || t.albumId,
      albumTitle: t.album_title || t.albumTitle,
      albumCover: t.album_cover_url || t.albumCover || "",
    }));

    setQueueAndPlay(enriched, idx);
    navigate("/now-playing");
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-5">
      <div className="text-lg font-semibold text-white mb-4">{title}</div>

      {!tracks.length ? (
        <div className="text-sm text-white/60 py-4">No tracks found.</div>
      ) : (
        <div className="divide-y divide-white/10">
          {tracks.map((t, idx) => (
            <div
              key={`${t.id}-${idx}`}
              className="grid grid-cols-[40px_1fr_40px_60px_50px] items-center gap-3 py-3"
            >
              <div className="text-xs text-white/60">{idx + 1}</div>

              <button
                className="min-w-0 text-left"
                onClick={() => playFromIndex(idx)}
                title="Play track"
              >
                <div className="text-sm font-medium truncate">{t.title}</div>
                <div className="text-[11px] text-white/60 truncate">
                  {t.singers_text || t.artist_text || "—"}
                </div>
                <div className="text-[11px] text-white/45 truncate">
                  {t.movie_name || t.album_title || t.albumTitle || "—"}
                </div>
              </button>

              <LikeButton
                trackId={t.id}
                initiallyLiked={likedIds.has(t.id)}
                onChange={(nextLiked) => onLikedChange?.(t.id, nextLiked)}
              />

              <div className="text-right text-xs text-white/70">
                {t.duration_seconds ? mmss(t.duration_seconds) : "—"}
              </div>

              <div className="justify-self-end">
                <TrackActionsMenu track={t} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}