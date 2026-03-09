import heroAlbum from "../assets/album-cover.jpg"; // put any sample image here

const youMightLike = [
  { id: 1, title: "Latest Hindi songs", fans: "2.9k fans", img: heroAlbum },
  { id: 2, title: "Latest Hindi songs", fans: "2.9k fans", img: heroAlbum },
  { id: 3, title: "Latest Hindi songs", fans: "2.9k fans", img: heroAlbum },
  { id: 4, title: "Latest Hindi songs", fans: "2.9k fans", img: heroAlbum },
  { id: 5, title: "Latest Hindi songs", fans: "2.9k fans", img: heroAlbum },
  { id: 6, title: "Latest Hindi songs", fans: "2.9k fans", img: heroAlbum },
];

const tracks = [
  { id: 1, name: "Majili", artist: "Tanishk Bagchi, Faheem Abdullah", time: "5:00" },
  { id: 2, name: "Barbad", artist: "Tanishk Bagchi, Faheem Abdullah", time: "5:00" },
  { id: 3, name: "Tum ho tum", artist: "Saiyaara album released", time: "5:00" },
  { id: 4, name: "Dhun", artist: "Saiyaara is composed by Various Artists.", time: "5:00" },
  { id: 5, name: "HalliSaiyaara", artist: "Saiyaara, Barbaad, Tum Ho Toh...", time: "5:00" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-black/40 backdrop-blur border-b border-white/10">
        <div className="mx-auto max-w-[1400px] px-6 py-3 flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="font-itim text-xl text-primary">Tune Hive</div>
          </div>

          <nav className="hidden md:flex items-center gap-5 text-sm text-white/80">
            <button className="hover:text-white">Music</button>
            <button className="hover:text-white">Podcasts</button>
            <button className="hover:text-white">Pro</button>
          </nav>

          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-lg">
              <input
                className="w-full rounded-full bg-white/10 border border-white/15 px-5 py-2.5 text-sm outline-none focus:border-white/30"
                placeholder="Search"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-white/80">
            <button className="hover:text-white">Music language</button>
            <button className="hover:text-white">Login</button>
            <button className="hover:text-white">Sign up</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="bg-white/10 border border-white/10 rounded-lg p-5 h-fit">
            <div className="text-xs font-semibold text-white/70 mb-3">BROWSE</div>

            <div className="space-y-3 text-sm text-white/85">
              <button className="w-full text-left hover:text-white">New Release</button>
              <button className="w-full text-left hover:text-white">Top Charts</button>
              <button className="w-full text-left hover:text-white">Top Playlists</button>
              <button className="w-full text-left hover:text-white">Podcasts</button>
              <button className="w-full text-left hover:text-white">Top Artists</button>
            </div>

            <div className="mt-8 text-xs font-semibold text-white/70 mb-3">LIBRARY</div>
            <div className="space-y-3 text-sm text-white/85">
              <button className="w-full text-left hover:text-white">History</button>
              <button className="w-full text-left hover:text-white">Liked Songs</button>
              <button className="w-full text-left hover:text-white">Albums</button>
              <button className="w-full text-left hover:text-white">Podcasts</button>
              <button className="w-full text-left hover:text-white">Artists</button>
            </div>

            <button className="mt-8 w-full rounded-full bg-primary py-2.5 text-sm font-semibold">
              + New Play List
            </button>
          </aside>

          {/* Main */}
          <main className="space-y-6">
            {/* Album + Tracklist */}
            <section className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
              {/* Album card */}
              <div className="bg-white/10 border border-white/10 rounded-lg p-5">
                <img
                  src={heroAlbum}
                  alt="Album"
                  className="w-full rounded-md border border-white/10"
                />
                <div className="mt-4 text-3xl font-bold">MAJILI</div>
                <div className="mt-1 text-sm text-white/70">
                  by Various Artists · 7 songs · 2,03,234 plays
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <button className="rounded-full bg-primary px-6 py-2 text-sm font-semibold">
                    Play
                  </button>
                  <button className="w-9 h-9 rounded-full border border-white/20" />
                  <button className="w-9 h-9 rounded-full border border-white/20" />
                </div>
              </div>

              {/* Track list */}
              <div className="bg-white/10 border border-white/10 rounded-lg p-5">
                <div className="grid grid-cols-[40px_1fr_60px_40px] text-xs text-white/60 pb-3 border-b border-white/10">
                  <div>#</div>
                  <div>Title</div>
                  <div className="text-right">Time</div>
                  <div />
                </div>

                <div className="divide-y divide-white/10">
                  {tracks.map((t, idx) => (
                    <div
                      key={t.id}
                      className="grid grid-cols-[40px_1fr_60px_40px] items-center py-3 text-sm"
                    >
                      <div className="text-white/60">{idx + 1}</div>
                      <div>
                        <div className="font-medium">{t.name}</div>
                        <div className="text-xs text-white/60">{t.artist}</div>
                      </div>
                      <div className="text-right text-white/70">{t.time}</div>
                      <div className="text-right">
                        <button className="w-6 h-6 rounded-full border border-white/20" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* You might like */}
            <section>
              <div className="text-sm font-semibold text-white/80 mb-3">
                You Might Like
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {youMightLike.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white/10 border border-white/10 rounded-lg overflow-hidden hover:bg-white/15 transition"
                  >
                    <img src={item.img} alt="" className="w-full h-32 object-cover" />
                    <div className="p-3">
                      <div className="text-xs font-semibold">{item.title}</div>
                      <div className="mt-1 text-[11px] text-white/60">{item.fans}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Bottom player bar (dummy) */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur border-t border-white/10">
        <div className="mx-auto max-w-[1400px] px-6 py-3 flex items-center justify-between gap-6">
          <div className="text-sm text-white/70">00:00 / 05:00</div>

          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-full border border-white/20" />
            <button className="w-10 h-10 rounded-full bg-primary" />
            <button className="w-9 h-9 rounded-full border border-white/20" />
          </div>

          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-full border border-white/20" />
            <div className="w-28 h-1 rounded bg-white/20" />
          </div>
        </div>
      </footer>

      {/* spacer so content doesn't hide behind footer */}
      <div className="h-20" />
    </div>
  );
}