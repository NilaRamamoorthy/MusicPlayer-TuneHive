import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { musicApi } from "../lib/musicApi";
import TrackListBlock from "../components/TrackListBlock";

export default function HistoryPage() {
  const access = useAuthStore((s) => s.access);
  const [items, setItems] = useState([]);
  const [likedIds, setLikedIds] = useState(new Set());
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const [historyData, likedData] = await Promise.all([
          musicApi.history(access),
          musicApi.likedTracks(access),
        ]);

        if (!alive) return;

        setItems(historyData.map((x) => x.track));
        setLikedIds(new Set(likedData.map((x) => x.track.id)));
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Failed to load history");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [access]);

  const handleLikedChange = (trackId, nextLiked) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (nextLiked) next.add(trackId);
      else next.delete(trackId);
      return next;
    });
  };

  if (loading) return <div className="bg-white/5 border border-white/10 rounded-lg p-6">Loading history...</div>;
  if (err) return <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-red-300">{err}</div>;

  return (
    <TrackListBlock
      title="History"
      tracks={items}
      likedIds={likedIds}
      onLikedChange={handleLikedChange}
    />
  );
}