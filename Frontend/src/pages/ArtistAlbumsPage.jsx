import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { musicApi } from "../lib/musicApi";

export default function ArtistAlbumsPage() {
  const { artistId } = useParams();

  const [albums, setAlbums] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await musicApi.albums({ artist_id: artistId });
        if (!alive) return;
        setAlbums(data);
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Failed to load artist albums");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [artistId]);

  const artistName = useMemo(() => {
    return albums[0]?.primary_artist?.name || "Artist";
  }, [albums]);

  if (loading) {
    return <div className="bg-white/5 border border-white/10 rounded-lg p-6">Loading artist albums...</div>;
  }

  if (err) {
    return <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-red-300">{err}</div>;
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-5">
      <div className="text-lg font-semibold text-white mb-1">{artistName}</div>
      <div className="text-sm text-white/60 mb-5">
        {albums.length} album{albums.length !== 1 ? "s" : ""}
      </div>

      {!albums.length ? (
        <div className="text-white/60 text-sm">No albums found for this artist.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {albums.map((album) => (
            <Link
              key={album.id}
              to={`/album/${album.id}`}
              className="rounded-lg overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition block"
            >
              <img
                src={album.cover_url || ""}
                alt={album.title}
                className="w-full h-36 object-cover bg-white/10"
              />

              <div className="p-3">
                <div className="text-sm font-medium truncate">{album.title}</div>
                <div className="mt-1 text-xs text-white/60 truncate">
                  {album.language?.name || "—"} • {album.genre?.name || "—"}
                </div>
                {album.movie_name ? (
                  <div className="mt-1 text-[11px] text-white/45 truncate">
                    {album.movie_name}
                  </div>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}