import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { musicApi } from "../lib/musicApi";
import { usePlayerStore } from "../store/playerStore";
import TrackActionsMenu from "../components/TrackActionsMenu";
function useQuery() {
  const [searchParams] = useSearchParams();
  return {
    q: searchParams.get("q") || "",
    language: searchParams.get("language") || "",
  };
}

function AlbumCard({ album }) {
  return (
    <Link to={`/album/${album.id}`} className="group block">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 transition">
        <img
          src={album.cover_url || ""}
          alt={album.title}
          className="w-full h-36 object-cover bg-white/10"
        />
        <div className="p-3">
          <div className="text-sm font-semibold truncate">{album.title}</div>
          <div className="mt-1 text-xs text-white/60 truncate">
            {album.primary_artist?.name || "—"}
          </div>
          <div className="mt-1 text-[11px] text-white/50 truncate">
            {album.language?.name || "—"} • {album.genre?.name || "—"}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function SearchResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { q, language } = useQuery();

  const setQueueAndPlay = usePlayerStore((s) => s.setQueueAndPlay);

  const [data, setData] = useState({ albums: [], tracks: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const res = await musicApi.search({ q, language });

        if (!alive) return;
        setData(res);
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Failed to search");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [q, language, location.key]);

  const playTrack = (track) => {
    const enriched = [
      {
        ...track,
        albumId: track.album_id,
        albumTitle: track.album_title,
        albumCover: track.album_cover_url,
      },
    ];
    setQueueAndPlay(enriched, 0);
    navigate("/now-playing");
  };

  return (
    <div className="space-y-8">
      <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-5">
        <div className="text-2xl font-bold">Search Results</div>
        <div className="mt-2 text-white/70 text-sm">
          {q ? <>Query: <span className="text-white">{q}</span></> : "No text query"}
          {language ? <> • Language: <span className="text-white">{language}</span></> : null}
        </div>
      </section>

      {loading ? (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-white/70">
          Searching...
        </div>
      ) : err ? (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-red-300">
          {err}
        </div>
      ) : (
        <>
          <section>
            <div className="text-sm font-semibold text-white/80 mb-3">Albums</div>
            {data.albums?.length ? (
              <div className="grid grid-cols-[40px_1fr_50px_120px] md:grid-cols-[140px_1fr_50px_180px_120px] items-center py-3 gap-3">
                {data.albums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-white/60">
                No albums found.
              </div>
            )}
          </section>

          <section>
            <div className="text-sm font-semibold text-white/80 mb-3">Tracks</div>
            {data.tracks?.length ? (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 divide-y divide-white/10">
               {data.tracks.map((track, idx) => (
  <div
    key={track.id}
    className="grid grid-cols-[40px_1fr_50px_120px] md:grid-cols-[40px_1fr_50px_180px_120px] items-center py-3 gap-3"
  >
    <div className="text-xs text-white/60">{idx + 1}</div>

    <button
      onClick={() => playTrack(track)}
      className="text-left min-w-0"
    >
      <div className="text-sm font-medium truncate">{track.title}</div>
      <div className="text-[11px] text-white/60 truncate">
        {track.singers_text || track.artist_text || "—"}
      </div>
      <div className="text-[11px] text-white/45 truncate">
        {track.movie_name || track.album_title || "—"}
      </div>
    </button>

    <div className="justify-self-center">
      <TrackActionsMenu
        track={{
          ...track,
          albumId: track.album_id,
          albumTitle: track.album_title,
          albumCover: track.album_cover_url,
        }}
      />
    </div>

    <div className="hidden md:block text-xs text-white/60 truncate">
      {track.language?.name || "—"} • {track.genre?.name || "—"}
    </div>

    <div className="text-right text-xs text-white/70">
      {track.duration_seconds
        ? `${Math.floor(track.duration_seconds / 60)}:${String(
            track.duration_seconds % 60
          ).padStart(2, "0")}`
        : "—"}
    </div>
  </div>
))}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-white/60">
                No tracks found.
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}