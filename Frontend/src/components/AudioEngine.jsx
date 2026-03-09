import { useEffect, useRef } from "react";
import { usePlayerStore } from "../store/playerStore";

export default function AudioEngine() {
  const audioRef = useRef(null);
  const setAudioEl = usePlayerStore((s) => s.setAudioEl);

  useEffect(() => {
    if (audioRef.current) setAudioEl(audioRef.current);
  }, [setAudioEl]);

  return <audio ref={audioRef} />;
}