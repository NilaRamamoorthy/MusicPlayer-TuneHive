import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { musicApi } from "../lib/musicApi";

export default function ArtistsPage() {
  const [albums, setAlbums] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await musicApi.albums();
        if (!alive) return;
        setAlbums(data);
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Failed to load artists");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const artists = useMemo(() => {
    const map = new Map();

    albums.forEach((a) => {
      if (a.primary_artist?.id && !map.has(a.primary_artist.id)) {
        map.set(a.primary_artist.id, {
          ...a.primary_artist,
          albumsCount: 1,
        });
      } else if (a.primary_artist?.id) {
        const existing = map.get(a.primary_artist.id);
        map.set(a.primary_artist.id, {
          ...existing,
          albumsCount: existing.albumsCount + 1,
        });
      }
    });

    return Array.from(map.values());
  }, [albums]);

  if (loading) {
    return <div className="bg-white/5 border border-white/10 rounded-lg p-6">Loading artists...</div>;
  }

  if (err) {
    return <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-red-300">{err}</div>;
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-5">
      <div className="text-lg font-semibold text-white mb-4">Artists</div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {artists.map((artist) => (
          <Link
            key={artist.id}
            to={`/artists/${artist.id}`}
            className="rounded-lg overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition block"
          >
            <div className="h-36 bg-white/10">
              {artist.image_url ? (
                <img
                  src={artist.image_url}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>

            <div className="p-3">
              <div className="text-sm font-medium truncate">{artist.name}</div>
              <div className="mt-1 text-xs text-white/60">
                {artist.albumsCount} album{artist.albumsCount > 1 ? "s" : ""}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}