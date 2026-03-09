import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { musicApi } from "../lib/musicApi";

export default function PodcastsPage() {
  const [podcasts, setPodcasts] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await musicApi.podcasts();
        if (!alive) return;
        setPodcasts(data);
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Failed to load podcasts");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return <div className="bg-white/5 border border-white/10 rounded-lg p-6">Loading podcasts...</div>;
  }

  if (err) {
    return <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-red-300">{err}</div>;
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-5">
      <div className="text-lg font-semibold text-white mb-4">Podcasts</div>

      {!podcasts.length ? (
        <div className="text-white/60 text-sm">No podcasts found.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {podcasts.map((podcast) => (
            <Link
              key={podcast.id}
              to={`/podcasts/${podcast.id}`}
              className="group block rounded-lg overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition"
            >
              <img
                src={podcast.cover_url || ""}
                alt={podcast.title}
                className="w-full h-36 object-cover bg-white/10"
              />

              <div className="p-3">
                <div className="text-sm font-medium truncate">{podcast.title}</div>
                <div className="mt-1 text-xs text-white/60 truncate">
                  {podcast.host_name || "Unknown host"}
                </div>
                <div className="mt-1 text-[11px] text-white/45 truncate">
                  {podcast.language?.name || "—"} • {podcast.category?.name || "—"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}