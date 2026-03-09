import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { musicApi } from "../lib/musicApi";
import { usePlayerStore } from "../store/playerStore";
import { useAuthStore } from "../store/authStore";

export default function PodcastDetailPage() {
  const { podcastId } = useParams();
  const navigate = useNavigate();
  const access = useAuthStore((s) => s.access);

  const setQueueAndPlay = usePlayerStore((s) => s.setQueueAndPlay);
  const seek = usePlayerStore((s) => s.seek);

  const [podcast, setPodcast] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const [podcastData, episodesData, progressData] = await Promise.all([
          musicApi.podcastDetail(podcastId),
          musicApi.podcastEpisodes(podcastId),
          musicApi.podcastProgress(access),
        ]);

        if (!alive) return;

        const nextProgressMap = {};
        progressData.forEach((item) => {
          nextProgressMap[item.episode.id] = item.progress_seconds || 0;
        });

        setPodcast(podcastData);
        setEpisodes(episodesData);
        setProgressMap(nextProgressMap);
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Failed to load podcast");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [podcastId, access]);

  const enrichedEpisodes = useMemo(() => {
    return episodes.map((ep) => ({
      ...ep,
      albumId: null,
      albumTitle: ep.podcast_title,
      albumCover: ep.podcast_cover_url || "",
      isPodcast: true,
      podcastId: ep.podcast_id,
      podcastTitle: ep.podcast_title,
      podcastCover: ep.podcast_cover_url || "",
      movie_name: "",
      singers_text: ep.guest_names || ep.podcast_title,
      artist_text: ep.guest_names || ep.podcast_title,
      savedProgressSeconds: progressMap[ep.id] || 0,
    }));
  }, [episodes, progressMap]);

  const playEpisode = (index) => {
    const ep = enrichedEpisodes[index];
    setQueueAndPlay(enrichedEpisodes, index);
    navigate("/now-playing");

    if (ep?.savedProgressSeconds > 0) {
      setTimeout(() => {
        seek(ep.savedProgressSeconds);
      }, 400);
    }
  };

  const mmss = (sec) => {
    const s = Number(sec || 0);
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${String(r).padStart(2, "0")}`;
  };

  if (loading) {
    return <div className="bg-white/5 border border-white/10 rounded-lg p-6">Loading podcast...</div>;
  }

  if (err) {
    return <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-red-300">{err}</div>;
  }

  if (!podcast) {
    return <div className="bg-white/5 border border-white/10 rounded-lg p-6">Podcast not found.</div>;
  }

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-5">
          <img
            src={podcast.cover_url || ""}
            alt={podcast.title}
            className="w-44 mx-auto rounded-md border border-white/10 bg-white/10"
          />

          <div className="mt-5 text-center">
            <div className="text-3xl font-extrabold tracking-wide">{podcast.title}</div>

            <div className="mt-2 text-xs text-white/70">
              Host: {podcast.host_name || "Unknown"} · {podcast.episodes_count} episodes
            </div>

            <div className="mt-1 text-[11px] text-white/60">
              {podcast.language?.name || "—"} • {podcast.category?.name || "—"}
            </div>

            {podcast.description ? (
              <div className="mt-4 text-xs text-white/60 leading-relaxed">
                {podcast.description}
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              className="rounded-full bg-primary px-8 py-2.5 text-sm font-semibold hover:opacity-95 transition disabled:opacity-50"
              onClick={() => playEpisode(0)}
              disabled={!enrichedEpisodes.length}
            >
              Play
            </button>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-5">
          {!enrichedEpisodes.length ? (
            <div className="text-sm text-white/60 py-6">No episodes found.</div>
          ) : (
            <div className="divide-y divide-white/10">
              {enrichedEpisodes.map((ep, idx) => (
                <div
                  key={ep.id}
                  className="grid grid-cols-[40px_1fr_110px_80px] items-center gap-3 py-3"
                >
                  <div className="text-xs text-white/60">{ep.episode_number || idx + 1}</div>

                  <button
                    className="min-w-0 text-left"
                    onClick={() => playEpisode(idx)}
                    title="Play episode"
                  >
                    <div className="text-sm font-medium truncate">{ep.title}</div>
                    <div className="text-[11px] text-white/60 truncate">
                      {ep.guest_names || podcast.host_name || "—"}
                    </div>
                    <div className="text-[11px] text-white/45 truncate">
                      {ep.published_date || "—"}
                    </div>
                  </button>

                  <div className="text-xs text-white/60 text-right">
                    {ep.savedProgressSeconds > 0 ? `Resume ${mmss(ep.savedProgressSeconds)}` : "New"}
                  </div>

                  <div className="text-right text-xs text-white/70">
                    {ep.duration_seconds ? mmss(ep.duration_seconds) : "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}