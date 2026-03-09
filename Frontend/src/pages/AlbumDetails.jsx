import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { musicApi } from "../lib/musicApi";
import { usePlayerStore } from "../store/playerStore";
import { useAuthStore } from "../store/authStore";
import TrackActionsMenu from "../components/TrackActionsMenu";
import LikeButton from "../components/LikeButton";
import AlbumLikeButton from "../components/AlbumLikeButton";

function AlbumRow({ title, items = [] }) {
  if (!items.length) return null;

  return (
    <section className="mt-6">
      <div className="text-xs font-semibold text-white/80 mb-3">{title}</div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
        {items.map((a) => (
          <Link key={a.id} to={`/album/${a.id}`} className="group block">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 transition">
              <div className="relative">
                <img
                  src={a.cover_url || ""}
                  alt={a.title}
                  className="w-full h-28 object-cover bg-white/10"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition" />
              </div>

              <div className="p-2">
                <div className="text-[11px] font-semibold truncate">{a.title}</div>
                <div className="mt-1 text-[10px] text-white/60 truncate">
                  {a.primary_artist?.name || "—"}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function AlbumDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const access = useAuthStore((s) => s.access);
  const setQueueAndPlay = usePlayerStore((s) => s.setQueueAndPlay);

  const [album, setAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [more, setMore] = useState(null);
  const [allAlbums, setAllAlbums] = useState([]);
  const [likedIds, setLikedIds] = useState(new Set());
  const [likedAlbumIds, setLikedAlbumIds] = useState(new Set());
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setErr("");
        setAlbum(null);

        const [a, t, sections, albums, likedTracks, likedAlbums] = await Promise.all([
          musicApi.albumDetail(id),
          musicApi.albumTracks(id),
          musicApi.homeSections(),
          musicApi.albums(),
          musicApi.likedTracks(access),
          musicApi.likedAlbums(access),
        ]);

        if (!alive) return;

        setAlbum(a);
        setTracks(t);
        setMore(sections);
        setAllAlbums(albums);
        setLikedIds(new Set(likedTracks.map((x) => x.track.id)));
        setLikedAlbumIds(new Set(likedAlbums.map((x) => x.album.id)));
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Failed to load album");
      }
    })();

    return () => {
      alive = false;
    };
  }, [id, access]);

  const mmss = (sec) => {
    const s = Number(sec || 0);
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${String(r).padStart(2, "0")}`;
  };

  const enrichedTracks = useMemo(() => {
    if (!album) return tracks;

    return tracks.map((t) => ({
      ...t,
      albumId: t.album_id || album.id,
      albumTitle: t.album_title || album.title,
      albumCover: t.album_cover_url || album.cover_url || "",
    }));
  }, [album, tracks]);

  const playFromIndex = (idx) => {
    setQueueAndPlay(enrichedTracks, idx);
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

  const handleAlbumLikedChange = (nextLiked) => {
    setLikedAlbumIds((prev) => {
      const next = new Set(prev);
      if (nextLiked) next.add(Number(id));
      else next.delete(Number(id));
      return next;
    });
  };

  if (err) {
    return <div className="bg-white/5 border border-white/10 rounded-lg p-6">{err}</div>;
  }

  if (!album) {
    return <div className="bg-white/5 border border-white/10 rounded-lg p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-5">
          <img
            src={album.cover_url || ""}
            alt={album.title}
            className="w-44 mx-auto rounded-md border border-white/10 bg-white/10"
          />

          <div className="mt-5 text-center">
            <div className="text-3xl font-extrabold tracking-wide">{album.title}</div>

            <div className="mt-2 text-xs text-white/70">
              by {album.primary_artist?.name || "—"} · {album.tracks_count} songs · {album.plays_count} plays
            </div>

            {album.album_type === "movie" && album.movie_name ? (
              <div className="mt-1 text-[11px] text-white/60">Movie: {album.movie_name}</div>
            ) : null}

            <div className="mt-1 text-[11px] text-white/60">
              © {album.year || "—"} {album.label || ""}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              className="rounded-full bg-primary px-8 py-2.5 text-sm font-semibold hover:opacity-95 transition disabled:opacity-50"
              onClick={() => playFromIndex(0)}
              disabled={!enrichedTracks.length}
            >
              Play
            </button>

            <AlbumLikeButton
              albumId={album.id}
              initiallyLiked={likedAlbumIds.has(album.id)}
              onChange={handleAlbumLikedChange}
            />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-5">
          {!enrichedTracks.length ? (
            <div className="text-sm text-white/60 py-6">No tracks found.</div>
          ) : (
            <div className="divide-y divide-white/10">
              {enrichedTracks.map((t, idx) => (
                <div
                  key={t.id}
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
                      {t.artist_text || t.singers_text || "—"}
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
                    <TrackActionsMenu track={t} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <AlbumRow title="You Might Like" items={more?.latest_songs || []} />
      <AlbumRow title="Trending Now" items={more?.trending_now || []} />
      <AlbumRow title="Top Rated Albums" items={more?.top_charts || []} />
      <AlbumRow
        title="More Albums"
        items={allAlbums?.filter((a) => String(a.id) !== String(id)).slice(0, 14)}
      />
    </div>
  );
}