import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { musicApi } from "../lib/musicApi";

export default function NewPlaylistPage() {
  const navigate = useNavigate();
  const access = useAuthStore((s) => s.access);
  const plan = useAuthStore((s) => s.plan);

  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const isFree = (plan?.name || "Free") === "Free";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setErr("");

      const created = await musicApi.createPlaylist(access, {
        name,
        is_public: isPublic,
      });

      navigate(`/playlists/${created.id}`);
    } catch (e2) {
      setErr(e2.message || "Failed to create playlist");
    } finally {
      setLoading(false);
    }
  };

  if (isFree) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <div className="text-xl font-semibold text-white">Create Playlist</div>
        <div className="mt-3 text-white/70">
          Playlist creation is available only for Pro or Premium users.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 max-w-xl">
      <div className="text-xl font-semibold text-white">Create New Playlist</div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="block text-sm text-white/80 mb-2">Playlist name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-3 text-white outline-none"
            placeholder="My Playlist"
            required
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          Make this playlist public
        </label>

        {err ? <div className="text-red-300 text-sm">{err}</div> : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-primary px-5 py-2 text-white text-sm font-medium disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Playlist"}
        </button>
      </form>
    </div>
  );
}