import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { musicApi } from "../lib/musicApi";

function AlbumCard({ a }) {
  return (
    <Link to={`/album/${a.id}`} className="group block">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 transition">
        <div className="relative">
          <img
            src={a.cover_url || ""}
            alt={a.title}
            className="w-full h-36 object-cover bg-white/10"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition" />
        </div>
        <div className="p-2">
          <div className="text-[11px] font-semibold truncate">{a.title}</div>
          <div className="mt-1 text-[10px] text-white/60 truncate">
            {a.primary_artist?.name || "—"} • {a.plays_count} plays
          </div>
        </div>
      </div>
    </Link>
  );
}

function Section({ title, items }) {
  if (!items?.length) return null;
  return (
    <section className="mb-7">
      <div className="text-xs font-semibold text-white/80 mb-3 uppercase">{title}</div>
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {items.map((a) => (
          <AlbumCard key={a.id} a={a} />
        ))}
      </div>
    </section>
  );
}

export default function HomeLanding() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr("");
        const d = await musicApi.homeSections();
        if (!alive) return;
        setData(d);
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Failed to load home");
      }
    })();
    return () => (alive = false);
  }, []);

  if (err) return <div className="bg-white/5 border border-white/10 rounded-lg p-6">{err}</div>;
  if (!data) return <div className="bg-white/5 border border-white/10 rounded-lg p-6">Loading...</div>;

  return (
    <div className="space-y-2">
      <Section title="Latest Songs" items={data.latest_songs} />
      <Section title="Trending Now" items={data.trending_now} />
      <Section title="Top Charts" items={data.top_charts} />
    </div>
  );
}