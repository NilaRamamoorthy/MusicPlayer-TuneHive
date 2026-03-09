import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { musicApi } from "../lib/musicApi";

function HeartIcon({ filled = false }) {
  if (filled) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF0067" stroke="#FF0067" strokeWidth="2">
        <path d="M20.8 4.6c-1.4-1.4-3.6-1.4-5 0L12 8.4 8.2 4.6c-1.4-1.4-3.6-1.4-5 0s-1.4 3.6 0 5L12 21l8.8-11.4c1.4-1.4 1.4-3.6 0-5z" />
      </svg>
    );
  }

  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
      <path d="M20.8 4.6c-1.4-1.4-3.6-1.4-5 0L12 8.4 8.2 4.6c-1.4-1.4-3.6-1.4-5 0s-1.4 3.6 0 5L12 21l8.8-11.4c1.4-1.4 1.4-3.6 0-5z" />
    </svg>
  );
}

export default function LikeButton({ trackId, initiallyLiked = false, onChange }) {
  const access = useAuthStore((s) => s.access);
  const [liked, setLiked] = useState(initiallyLiked);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLiked(initiallyLiked);
  }, [initiallyLiked]);

  const handleToggle = async (e) => {
    e.stopPropagation();
    if (!trackId || loading) return;

    try {
      setLoading(true);
      const res = await musicApi.toggleLike(access, trackId);
      const nextLiked = !!res?.liked;
      setLiked(nextLiked);
      onChange?.(nextLiked);
    } catch (err) {
      alert(err.message || "Failed to update liked songs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="opacity-90 hover:opacity-100 transition justify-self-center disabled:opacity-50"
      title={liked ? "Unlike" : "Like"}
      onClick={handleToggle}
      disabled={loading}
    >
      <HeartIcon filled={liked} />
    </button>
  );
}