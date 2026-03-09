import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { musicApi } from "../lib/musicApi";

export default function LikedAlbumsPage() {
  const access = useAuthStore((s) => s.access);
  const [albums, setAlbums] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await musicApi.likedAlbums(access);
        if (!alive) return;
        setAlbums(data.map((x) => x.album));
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Failed to load liked albums");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [access]);

  if (loading) {
    return <div className="bg-white/5 border border-white/10 rounded-lg p-6">Loading liked albums...</div>;
  }

  if (err) {
    return <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-red-300">{err}</div>;
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-5">
      <div className="text-lg font-semibold text-white mb-4">Liked Albums</div>

      {!albums.length ? (
        <div className="text-sm text-white/60">No liked albums yet.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {albums.map((album) => (
            <Link key={album.id} to={`/album/${album.id}`} className="group block">
              <div className="rounded-lg overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition">
                <img
                  src={album.cover_url || ""}
                  alt={album.title}
                  className="w-full h-36 object-cover bg-white/10"
                />
                <div className="p-3">
                  <div className="text-sm font-medium truncate">{album.title}</div>
                  <div className="mt-1 text-xs text-white/60 truncate">
                    {album.primary_artist?.name || "—"}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}