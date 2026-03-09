import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

function SideLink({ to, icon, children }) {
  const { pathname } = useLocation();
  const active = pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 w-full text-left text-sm transition ${
        active ? "text-white font-semibold" : "text-white/85 hover:text-white"
      }`}
    >
      <span className="text-white/70">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}

export default function Sidebar() {
  const plan = useAuthStore((s) => s.plan);
  const isFree = (plan?.name || "Free") === "Free";

  return (
    <aside className="bg-white/10 backdrop-blur-md border border-white/10 rounded-lg p-5 h-fit">
      <div className="text-xs font-semibold text-white/70 mb-3">BROWSE</div>

      <div className="space-y-4">
        <SideLink to="/" icon="⌂">Home</SideLink>
        <SideLink to="/albums" icon="◎">Albums</SideLink>
        <SideLink to="/artists" icon="◔">Artists</SideLink>
        <SideLink to="/podcasts" icon="◉">Podcasts</SideLink>
      </div>

      <div className="mt-8 text-xs font-semibold text-white/70 mb-3">LIBRARY</div>
      <div className="space-y-4">
        <SideLink to="/history" icon="↺">History</SideLink>
        <SideLink to="/liked-songs" icon="♪">Liked Songs</SideLink>
        <SideLink to="/liked-albums" icon="◎">Liked Albums</SideLink>
        <SideLink to="/playlists" icon="☰">My Playlists</SideLink>
        <SideLink to="/profile" icon="◌">Profile</SideLink>
      </div>

      {isFree ? (
        <Link
          to="/plans"
          className="mt-8 block w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-center"
        >
          Upgrade for Playlists
        </Link>
      ) : (
        <Link
          to="/playlists/new"
          className="mt-8 block w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-center"
        >
          + New Playlist
        </Link>
      )}
    </aside>
  );
}