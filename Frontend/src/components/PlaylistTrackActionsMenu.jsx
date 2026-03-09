import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { musicApi } from "../lib/musicApi";

export default function PlaylistTrackActionsMenu({
  playlistId,
  trackId,
  onRemoved,
}) {
  const access = useAuthStore((s) => s.access);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!menuRef.current?.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleRemove = async (e) => {
    e.stopPropagation();

    try {
      await musicApi.removeTrackFromPlaylist(access, playlistId, trackId);
      setOpen(false);
      onRemoved?.(trackId);
    } catch (err) {
      alert(err.message || "Failed to remove track from playlist.");
    }
  };

  return (
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
            className="w-full px-4 py-3 text-left text-sm text-red-300 hover:bg-white/10"
            onClick={handleRemove}
          >
            Remove from playlist
          </button>
        </div>
      ) : null}
    </div>
  );
}