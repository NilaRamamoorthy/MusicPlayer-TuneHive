import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "../store/playerStore";
import { useAuthStore } from "../store/authStore";
import { musicApi } from "../lib/musicApi";
import AddToPlaylistModal from "./AddToPlaylistModal";

export default function TrackActionsMenu({ track }) {
  const [open, setOpen] = useState(false);
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const menuRef = useRef(null);

  const addToPlayNext = usePlayerStore((s) => s.addToPlayNext);
  const addToPlayLast = usePlayerStore((s) => s.addToPlayLast);

  const plan = useAuthStore((s) => s.plan);
  const access = useAuthStore((s) => s.access);

  const planName = plan?.name || "Free";
  const isFree = planName === "Free";

  useEffect(() => {
    function onDocClick(e) {
      if (!menuRef.current?.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleComingSoon = (label) => {
    setOpen(false);
    alert(`${label} will be connected next.`);
  };

  const handlePlanBlocked = (label) => {
    setOpen(false);
    alert(`${label} is available only for Pro or Premium users.`);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      await musicApi.toggleLike(access, track.id);
      setOpen(false);
      alert("Updated liked songs.");
    } catch (err) {
      alert(err.message || "Failed to update like.");
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.stopPropagation();
    if (isFree) return handlePlanBlocked("Create new playlist");

    try {
      const name = window.prompt("Enter new playlist name");
      if (!name) return;

      await musicApi.createPlaylist(access, {
        name,
        is_public: false,
      });
      setOpen(false);
      alert("Playlist created.");
    } catch (err) {
      alert(err.message || "Failed to create playlist.");
    }
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          className="h-8 w-8 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition text-white"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          title="More actions"
        >
          ⋮
        </button>

        {open ? (
          <div className="absolute right-0 top-10 z-50 min-w-[190px] rounded-lg border border-white/10 bg-[#111827]/95 backdrop-blur-md shadow-xl overflow-hidden">
            <button
              className="w-full px-4 py-3 text-left text-sm text-white/90 hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                addToPlayNext(track);
                setOpen(false);
              }}
            >
              Play next
            </button>

            <button
              className="w-full px-4 py-3 text-left text-sm text-white/90 hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                addToPlayLast(track);
                setOpen(false);
              }}
            >
              Play last
            </button>

            <button
              className="w-full px-4 py-3 text-left text-sm text-white/90 hover:bg-white/10"
              onClick={handleLike}
            >
              Like song
            </button>

            <button
              className={`w-full px-4 py-3 text-left text-sm hover:bg-white/10 ${
                isFree ? "text-white/40" : "text-white/90"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (isFree) return handlePlanBlocked("Download");
                handleComingSoon("Download");
              }}
            >
              Download
            </button>

            <button
              className={`w-full px-4 py-3 text-left text-sm hover:bg-white/10 ${
                isFree ? "text-white/40" : "text-white/90"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (isFree) return handlePlanBlocked("Add to playlist");
                setOpen(false);
                setPlaylistModalOpen(true);
              }}
            >
              Add to playlist
            </button>

            <button
              className={`w-full px-4 py-3 text-left text-sm hover:bg-white/10 ${
                isFree ? "text-white/40" : "text-white/90"
              }`}
              onClick={handleCreatePlaylist}
            >
              Create new playlist
            </button>
          </div>
        ) : null}
      </div>

      <AddToPlaylistModal
        open={playlistModalOpen}
        onClose={() => setPlaylistModalOpen(false)}
        trackId={track.id}
      />
    </>
  );
}