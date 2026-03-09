import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { musicApi } from "../lib/musicApi";

export default function AddToPlaylistModal({ open, onClose, trackId }) {
  const access = useAuthStore((s) => s.access);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await musicApi.playlists(access);
        if (!alive) return;
        setPlaylists(data);
      } catch (err) {
        if (!alive) return;
        alert(err.message || "Failed to load playlists.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open, access]);

  if (!open) return null;

  const handleAdd = async (playlistId) => {
    try {
      await musicApi.addTrackToPlaylist(access, playlistId, trackId);
      onClose();
      alert("Track added to playlist.");
    } catch (err) {
      alert(err.message || "Failed to add track.");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#111827]/95 backdrop-blur-md p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="text-lg font-semibold text-white">Add to Playlist</div>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            ✕
          </button>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="text-sm text-white/60">Loading playlists...</div>
          ) : !playlists.length ? (
            <div className="text-sm text-white/60">No playlists found.</div>
          ) : (
            <div className="space-y-2">
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  className="block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white hover:bg-white/10"
                  onClick={() => handleAdd(playlist.id)}
                >
                  {playlist.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}