import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { usePlayerStore } from "../store/playerStore";
import { musicApi } from "../lib/musicApi";
import LikeButton from "../components/LikeButton";
import PlaylistTrackActionsMenu from "../components/PlaylistTrackActionsMenu";

export default function PlaylistDetailPage() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const access = useAuthStore((s) => s.access);
  const setQueueAndPlay = usePlayerStore((s) => s.setQueueAndPlay);

  const [playlist, setPlaylist] = useState(null);
  const [likedIds, setLikedIds] = useState(new Set());
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const [playlistData, likedData] = await Promise.all([
          musicApi.playlistDetail(access, playlistId),
          musicApi.likedTracks(access),
        ]);

        if (!alive) return;

        setPlaylist(playlistData);
        setLikedIds(new Set(likedData.map((x) => x.track.id)));
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Failed to load playlist");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [access, playlistId]);

  const tracks = useMemo(() => {
    return playlist?.playlist_tracks?.map((x) => ({
      ...x.track,
      albumId: x.track.album_id,
      albumTitle: x.track.album_title,
      albumCover: x.track.album_cover_url,
    })) || [];
  }, [playlist]);

  const mmss = (sec) => {
    const s = Number(sec || 0);
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${String(r).padStart(2, "0")}`;
  };

  const playFromIndex = (idx) => {
    setQueueAndPlay(tracks, idx);
    navigate("/now-playing");
  };

  const handleLikedChange = (trackId, nextLiked) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (nextLiked) next.add(trackId);
      else next.delete(trackId);
      return next;
    });
  };

  const handleRemoved = (trackId) => {
    setPlaylist((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        playlist_tracks: prev.playlist_tracks.filter((x) => x.track.id !== trackId),
      };
    });
  };

  if (loading) {
    return <div className="bg-white/5 border border-white/10 rounded-lg p-6">Loading playlist...</div>;
  }

  if (err) {
    return <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-red-300">{err}</div>;
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-5">
      <div className="text-lg font-semibold text-white mb-4">
        {playlist?.name || "Playlist"}
      </div>

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
                onChange={(nextLiked) => handleLikedChange(t.id, nextLiked)}
              />

              <div className="text-right text-xs text-white/70">
                {t.duration_seconds ? mmss(t.duration_seconds) : "—"}
              </div>

              <div className="justify-self-end">
                <PlaylistTrackActionsMenu
                  playlistId={playlistId}
                  trackId={t.id}
                  onRemoved={handleRemoved}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}