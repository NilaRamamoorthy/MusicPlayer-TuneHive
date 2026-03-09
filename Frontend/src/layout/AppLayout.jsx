import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./TopBar";
import PlayerBar from "./PlayerBar";
import AudioEngine from "../components/AudioEngine";
import bg from "../assets/home-bg.jpg";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  // Hide only the PlayerBar UI on now playing (audio must still exist)
  const hidePlayerBarUI = pathname === "/now-playing";

  return (
    <div className="relative min-h-screen text-white">
      {/* ✅ Audio stays mounted always */}
      <AudioEngine />

      {/* Background Image */}
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${bg})` }}
      />
      <div className="th-animated-overlay" />
      <div className="fixed inset-0 -z-10 bg-black/25" />

      <Topbar onOpenSidebar={() => setSidebarOpen(true)} />

      <div className="mx-auto max-w-[1400px] px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Desktop sidebar */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>

          {/* Main */}
          <main className="min-h-[70vh]">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-[999] lg:hidden">
          {/* backdrop */}
          <button
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />

          {/* panel */}
          <div className="absolute left-0 top-0 h-full w-[280px] p-4">
            <div className="h-full">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-itim text-lg text-primary">Tune Hive</div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="h-9 w-9 rounded-full border border-white/20 bg-white/5"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Close sidebar when user clicks any nav item (optional) */}
              <div onClick={() => setSidebarOpen(false)}>
                <Sidebar />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Player UI (hide only on now playing page) */}
      {!hidePlayerBarUI ? (
        <>
          <PlayerBar />
          <div className="h-20" />
        </>
      ) : (
        <div className="h-6" />
      )}
    </div>
  );
}