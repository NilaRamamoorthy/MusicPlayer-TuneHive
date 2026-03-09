import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { musicApi } from "../lib/musicApi";

export default function PlaylistsPage() {
  const access = useAuthStore((s) => s.access);
  const plan = useAuthStore((s) => s.plan);
  const navigate = useNavigate();

  const [playlists, setPlaylists] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const planName = plan?.name || "Free";
  const isFree = planName === "Free";

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await musicApi.playlists(access);
        if (!alive) return;
        setPlaylists(data);
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Failed to load playlists");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [access]);

  const handleDelete = async (e, playlistId) => {
    e.preventDefault();
    e.stopPropagation();

    const ok = window.confirm("Are you sure you want to delete this playlist?");
    if (!ok) return;

    try {
      await musicApi.deletePlaylist(access, playlistId);
      setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
    } catch (error) {
      alert(error.message || "Failed to delete playlist");
    }
  };

  if (loading) {
    return <div className="bg-white/5 border border-white/10 rounded-lg p-6">Loading playlists...</div>;
  }

  if (err) {
    return <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-red-300">{err}</div>;
  }

  if (isFree) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <div className="text-xl font-semibold text-white">My Playlists</div>
        <div className="mt-3 text-white/70">
          Playlist features are available only for Pro or Premium users.
        </div>
        <Link
          to="/plans"
          className="inline-block mt-5 rounded-full bg-primary px-5 py-2 text-sm font-medium text-white"
        >
          Upgrade Plan
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-5">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="text-lg font-semibold text-white">My Playlists</div>
        <Link
          to="/playlists/new"
          className="rounded-full bg-primary px-4 py-2 text-sm text-white font-medium"
        >
          + New Playlist
        </Link>
      </div>

      {!playlists.length ? (
        <div className="text-white/60 text-sm">No playlists yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {playlists.map((playlist) => (
            <Link
              key={playlist.id}
              to={`/playlists/${playlist.id}`}
              className="rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-white font-medium truncate">{playlist.name}</div>
                  <div className="mt-2 text-xs text-white/60">
                    {playlist.tracks_count} tracks
                  </div>
                </div>

                <button
                  onClick={(e) => handleDelete(e, playlist.id)}
                  className="shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-red-300 hover:bg-white/10"
                  title="Delete playlist"
                >
                  Delete
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}