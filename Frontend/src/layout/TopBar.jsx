import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useEffect, useRef, useState } from "react";
import { musicApi } from "../lib/musicApi";

export default function Topbar({ onOpenSidebar }) {
  const navigate = useNavigate();
  const plan = useAuthStore((s) => s.plan);
  const logout = useAuthStore((s) => s.logout);

  const [searchParams] = useSearchParams();

  const [languages, setLanguages] = useState([]);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get("language") || "");
  const [profileOpen, setProfileOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  const profileRef = useRef(null);
  const languageRef = useRef(null);

  const planName = plan?.name || "Free";
  const isPaid = planName.toLowerCase() !== "free";

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await musicApi.languages();
        if (alive) setLanguages(data);
      } catch {
        if (alive) setLanguages([]);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (!profileRef.current?.contains(e.target)) setProfileOpen(false);
      if (!languageRef.current?.contains(e.target)) setLanguageOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    const qs = new URLSearchParams();

    if (query.trim()) qs.set("q", query.trim());
    if (selectedLanguage) qs.set("language", selectedLanguage);

    navigate(`/search?${qs.toString()}`);
  };

const handleLogout = () => {
  navigate("/logged-out");
};

  const handleLanguageSelect = (langName) => {
    setSelectedLanguage(langName);
    setLanguageOpen(false);

    const qs = new URLSearchParams();
    if (query.trim()) qs.set("q", query.trim());
    if (langName) qs.set("language", langName);

    navigate(`/search?${qs.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-lg border-b border-white/10">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-6">
        <button
          className="lg:hidden h-10 w-10 rounded-full border border-white/15 bg-white/5 flex items-center justify-center"
          onClick={onOpenSidebar}
          aria-label="Open menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
          </svg>
        </button>

        <Link
          to="/"
          className="flex items-center gap-2 hover:scale-105 transition"
          aria-label="Go to Home"
        >
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M9 18V5l12-2v13" stroke="white" strokeWidth="2" fill="none" />
              <circle cx="6" cy="18" r="3" fill="white" />
              <circle cx="18" cy="16" r="3" fill="white" />
            </svg>
          </div>

          <span className="font-itim text-lg sm:text-xl text-primary">Tune Hive</span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm text-white/80">
          <Link to="/albums" className="hover:text-white">Music</Link>
          <Link to="/podcasts" className="hover:text-white">Podcasts</Link>

          <Link
            to="/plans"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition text-xs font-semibold text-white"
          >
            {isPaid ? (
              <span title="Premium plan">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD54A">
                  <path d="M5 16 3 7l5 3 4-6 4 6 5-3-2 9H5zm0 2h14v2H5z" />
                </svg>
              </span>
            ) : null}
            <span>{planName}</span>
          </Link>
        </nav>

        <div className="flex-1">
          <form onSubmit={submitSearch} className="flex items-center gap-2">
            <div className="flex-1">
              <input
                className="w-full rounded-full bg-white/10 border border-white/15 px-4 sm:px-5 py-2.5 text-sm outline-none focus:border-white/30"
                placeholder="Search albums, artists, singers, movies..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="rounded-full bg-primary px-4 py-2.5 text-white text-sm font-medium hover:opacity-95 transition"
            >
              Search
            </button>
          </form>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm text-white/80">
          <div className="relative" ref={languageRef}>
            <button
              onClick={() => setLanguageOpen((v) => !v)}
              className="hover:text-white flex items-center gap-1"
            >
              Music language <span>▾</span>
            </button>

            {languageOpen ? (
              <div className="absolute right-0 top-10 min-w-[180px] rounded-lg border border-white/10 bg-[#111827]/95 backdrop-blur-md shadow-xl overflow-hidden z-50">
                <button
                  className="block w-full text-left px-4 py-3 text-sm text-white/90 hover:bg-white/10"
                  onClick={() => handleLanguageSelect("")}
                >
                  All languages
                </button>
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    className="block w-full text-left px-4 py-3 text-sm text-white/90 hover:bg-white/10"
                    onClick={() => handleLanguageSelect(lang.name)}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="h-10 w-10 rounded-full border border-white/15 bg-white/5 flex items-center justify-center hover:bg-white/10"
              title="Profile"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M20 21a8 8 0 0 0-16 0" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>

            {profileOpen ? (
              <div className="absolute right-0 top-12 min-w-[190px] rounded-lg border border-white/10 bg-[#111827]/95 backdrop-blur-md shadow-xl overflow-hidden z-50">
                <Link
                  to="/profile"
                  className="block px-4 py-3 text-sm text-white/90 hover:bg-white/10"
                  onClick={() => setProfileOpen(false)}
                >
                  Profile
                </Link>

                <Link
                  to="/plans"
                  className="block px-4 py-3 text-sm text-white/90 hover:bg-white/10"
                  onClick={() => setProfileOpen(false)}
                >
                  Subscription
                </Link>

                <button
                  className="block w-full text-left px-4 py-3 text-sm text-red-300 hover:bg-white/10"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="h-10 w-10 rounded-full border border-white/15 bg-white/5 flex items-center justify-center"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M20 21a8 8 0 0 0-16 0" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}