import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "../store/playerStore";
import { useAuthStore } from "../store/authStore";
import { musicApi } from "../lib/musicApi";

function MetaPill({ children }) {
  if (!children) return null;

  return (
    <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-white/80">
      {children}
    </span>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;

  return (
    <div className="grid grid-cols-[90px_1fr] gap-3 text-sm">
      <div className="text-white/55">{label}</div>
      <div className="text-white/90">{value}</div>
    </div>
  );
}

export default function NowPlaying() {
  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isShuffle = usePlayerStore((s) => s.isShuffle);
  const isLoopAll = usePlayerStore((s) => s.isLoopAll);
  const isLoopOne = usePlayerStore((s) => s.isLoopOne);

  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const playbackRate = usePlayerStore((s) => s.playbackRate);

  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const seek = usePlayerStore((s) => s.seek);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const toggleLoopAll = usePlayerStore((s) => s.toggleLoopAll);
  const toggleLoopOne = usePlayerStore((s) => s.toggleLoopOne);
  const reorderQueue = usePlayerStore((s) => s.reorderQueue);
  const playQueueItem = usePlayerStore((s) => s.playQueueItem);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
  const skipForward = usePlayerStore((s) => s.skipForward);
  const skipBackward = usePlayerStore((s) => s.skipBackward);
  const setPlaybackRate = usePlayerStore((s) => s.setPlaybackRate);

  const access = useAuthStore((s) => s.access);

  const track = queue[currentIndex];
  const lastAutoPlayedTrackId = useRef(null);
  const [dragIndex, setDragIndex] = useState(null);

  useEffect(() => {
    if (!track) return;

    if (lastAutoPlayedTrackId.current !== track.id) {
      lastAutoPlayedTrackId.current = track.id;
      if (!isPlaying) togglePlay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track?.id]);

  useEffect(() => {
    if (!track?.isPodcast || !track?.id) return;

    const interval = setInterval(() => {
      const seconds = Math.floor(usePlayerStore.getState().currentTime || 0);
      if (seconds > 0) {
        musicApi.savePodcastProgress(access, track.id, seconds).catch(() => {});
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [track?.id, track?.isPodcast, access]);

  const mmss = (sec) => {
    const s = Number(sec || 0);
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${String(r).padStart(2, "0")}`;
  };

  const progress = duration ? Math.min((currentTime / duration) * 100, 100) : 0;

  if (!track) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
        <div className="text-xl font-semibold">Now Playing</div>
        <div className="mt-3 text-white/70">Nothing is playing.</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
      <div className="px-6 py-8">
        <div className="grid grid-cols-2 xl:grid-cols-[260px_1fr_320px] gap-8 items-start">
          <div className="flex justify-center xl:justify-start">
            <div className="w-52 md:w-60">
              {track.albumCover ? (
                <img
                  src={track.albumCover}
                  alt={track.albumTitle || track.title}
                  className="w-full rounded-lg border border-white/10 bg-white/10 object-cover"
                />
              ) : (
                <div className="w-full h-60 rounded-lg border border-white/10 bg-white/10 flex items-center justify-center text-white/40">
                  Podcast
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-white/55">
              Now Playing
            </div>

            <h1 className="mt-2 text-3xl md:text-4xl font-bold text-white">
              {track.title}
            </h1>

            <div className="mt-3 flex flex-wrap gap-2">
              <MetaPill>
                {track.isPodcast ? track.podcastTitle || track.albumTitle : track.albumTitle}
              </MetaPill>
              <MetaPill>{track.language?.name}</MetaPill>
              <MetaPill>{track.isPodcast ? track.category?.name : track.genre?.name}</MetaPill>
              {!track.isPodcast ? <MetaPill>{track.movie_name}</MetaPill> : null}
            </div>

            <div className="mt-6 space-y-3">
              {track.isPodcast ? (
                <>
                  <InfoRow label="Podcast" value={track.podcastTitle || track.albumTitle} />
                  <InfoRow label="Guests" value={track.guest_names || track.artist_text} />
                  <InfoRow label="Language" value={track.language?.name} />
                  <InfoRow label="Category" value={track.category?.name} />
                </>
              ) : (
                <>
                  <InfoRow label="Singers" value={track.singers_text || track.artist_text} />
                  <InfoRow label="Actors" value={track.actors_text} />
                  <InfoRow label="Movie" value={track.movie_name} />
                  <InfoRow label="Language" value={track.language?.name} />
                  <InfoRow label="Genre" value={track.genre?.name} />
                  <InfoRow label="Album" value={track.albumTitle} />
                </>
              )}
            </div>
          </div>

        
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-3 text-xs text-white/60">
            <span className="w-10">{mmss(currentTime)}</span>

            <div
              className="relative flex-1 h-1.5 rounded-full bg-white/20 cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                seek(pct * (duration || 0));
              }}
              title="Seek"
            >
              <div
                className="absolute left-0 top-0 h-1.5 rounded-full bg-white"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute -top-1 h-3.5 w-3.5 rounded-full bg-white"
                style={{ left: `calc(${progress}% - 7px)` }}
              />
            </div>

            <span className="w-10 text-right">{mmss(duration)}</span>
          </div>
        </div>

        <div className="mt-7 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              className={`opacity-90 hover:opacity-100 ${isShuffle ? "text-primary" : "text-white"}`}
              title="Shuffle"
              onClick={toggleShuffle}
            >
              ⤮
            </button>

            <button
              className="opacity-90 hover:opacity-100"
              onClick={prev}
              title="Previous"
            >
              ⏮
            </button>

            {track.isPodcast ? (
              <button
                className="opacity-90 hover:opacity-100"
                onClick={skipBackward}
                title="Back 30 seconds"
              >
                ⏪ 30s
              </button>
            ) : null}

            <button
              className="h-11 w-11 rounded-full bg-white text-black flex items-center justify-center"
              onClick={togglePlay}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? "❚❚" : "▶"}
            </button>

            {track.isPodcast ? (
              <button
                className="opacity-90 hover:opacity-100"
                onClick={skipForward}
                title="Forward 30 seconds"
              >
                ⏩ 30s
              </button>
            ) : null}

            <button
              className="opacity-90 hover:opacity-100"
              onClick={next}
              title="Next"
            >
              ⏭
            </button>

            <button
              className={`opacity-90 hover:opacity-100 ${isLoopAll ? "text-primary" : "text-white"}`}
              title="Loop playlist"
              onClick={toggleLoopAll}
            >
              🔁
            </button>

            <button
              className={`opacity-90 hover:opacity-100 ${isLoopOne ? "text-primary" : "text-white"}`}
              title="Loop song"
              onClick={toggleLoopOne}
            >
              🔂
            </button>

            {track.isPodcast ? (
              <select
                value={playbackRate}
                onChange={(e) => setPlaybackRate(Number(e.target.value))}
                className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white"
              >
                <option value={1} className="text-black">1x</option>
                <option value={1.25} className="text-black">1.25x</option>
                <option value={1.5} className="text-black">1.5x</option>
                <option value={2} className="text-black">2x</option>
              </select>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <button
              className="opacity-90 hover:opacity-100"
              title={isMuted ? "Unmute" : "Mute"}
              onClick={toggleMute}
            >
              {isMuted || volume === 0 ? "🔇" : "🔊"}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-32"
            />

            <div className="w-10 text-right text-xs text-white/60">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </div>
          </div>
        </div>
          <div className="rounded-lg border border-white/10 bg-black/20 p-4">
            <div className="text-lg font-semibold text-white mb-4">Queue</div>

            {!queue.length ? (
              <div className="text-sm text-white/60">No tracks in queue.</div>
            ) : (
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {queue.map((item, index) => {
                  const active = index === currentIndex;

                  return (
                    <div
                      key={`${item.id}-${index}`}
                      draggable
                      onDragStart={() => setDragIndex(index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (dragIndex == null) return;
                        reorderQueue(dragIndex, index);
                        setDragIndex(null);
                      }}
                      className={`rounded-lg border px-3 py-3 cursor-move transition ${
                        active
                          ? "border-primary bg-primary/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-white/40 text-sm">≡</div>

                        <button
                          className="min-w-0 flex-1 text-left"
                          onClick={() => playQueueItem(index)}
                        >
                          <div className="text-sm font-medium text-white truncate">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-white/60 truncate">
                            {item.singers_text || item.artist_text || item.albumTitle || "—"}
                          </div>
                        </button>

                        {active ? (
                          <div className="text-[11px] text-primary font-medium">
                            Playing
                          </div>
                        ) : null}

                        <button
                          className="text-white/50 hover:text-white text-sm"
                          title="Remove from queue"
                          onClick={() => removeFromQueue(index)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
      </div>

      <div className="px-6 py-4 border-t border-white/10 text-[11px] text-white/60">
        © 2025 Tune Hive Media Limited All rights reserved
      </div>
    </div>
  );
}