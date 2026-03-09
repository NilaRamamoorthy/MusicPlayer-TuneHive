import { create } from "zustand";

function formatTime(sec) {
  if (sec == null || Number.isNaN(sec)) return "0:00";
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

async function logTrackPlay(trackId) {
  const token = localStorage.getItem("tunehive_access") || "";

  try {
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/music/tracks/${trackId}/play/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    // ignore logging failures
  }
}

export const usePlayerStore = create((set, get) => ({
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  previousVolume: 0.8,
  isMuted: false,
  playbackRate: 1,
  audio: null,

  isShuffle: false,
  isLoopAll: false,
  isLoopOne: false,

  setAudioEl: (el) => {
    if (!el) return;

    const old = get().audio;
    if (old && old !== el) {
      try {
        old.pause();
        old.src = "";
        old.load?.();
      } catch {}
    }

    el.volume = get().isMuted ? 0 : get().volume;
    el.playbackRate = get().playbackRate || 1;

    el.ontimeupdate = () => set({ currentTime: el.currentTime || 0 });
    el.onloadedmetadata = () => set({ duration: el.duration || 0 });

    el.onended = () => {
      const { isLoopOne } = get();

      if (isLoopOne) {
        const idx = get().currentIndex;
        get().playIndex(idx);
        return;
      }

      get().next();
    };

    set({ audio: el });
  },

  setVolume: (v) => {
    const audio = get().audio;
    const vol = Math.min(1, Math.max(0, Number(v)));

    if (audio) {
      audio.volume = vol;
    }

    set({
      volume: vol,
      isMuted: vol === 0,
      previousVolume: vol > 0 ? vol : get().previousVolume,
    });
  },

  toggleMute: () => {
    const { audio, isMuted, volume, previousVolume } = get();
    if (!audio) return;

    if (isMuted || volume === 0) {
      const restored = previousVolume > 0 ? previousVolume : 0.8;
      audio.volume = restored;
      set({
        isMuted: false,
        volume: restored,
      });
    } else {
      audio.volume = 0;
      set({
        isMuted: true,
        previousVolume: volume,
      });
    }
  },

  setPlaybackRate: (rate) => {
    const audio = get().audio;
    const nextRate = Number(rate) || 1;

    if (audio) {
      audio.playbackRate = nextRate;
    }

    set({ playbackRate: nextRate });
  },

  toggleShuffle: () => {
    set((state) => ({ isShuffle: !state.isShuffle }));
  },

  toggleLoopAll: () => {
    set((state) => ({
      isLoopAll: !state.isLoopAll,
      isLoopOne: !state.isLoopAll ? false : state.isLoopOne,
    }));
  },

  toggleLoopOne: () => {
    set((state) => ({
      isLoopOne: !state.isLoopOne,
      isLoopAll: !state.isLoopOne ? false : state.isLoopAll,
    }));
  },

  setQueueAndPlay: (tracks, startIndex = 0) => {
    set({ queue: tracks, currentIndex: startIndex });
    get().playIndex(startIndex);
  },

  playIndex: async (index) => {
    const { queue, audio } = get();
    const track = queue[index];
    if (!track || !audio) return;

    try {
      audio.pause();
      audio.currentTime = 0;
      audio.src = track.audio_url;
      audio.load?.();

      await audio.play();

      set({
        isPlaying: true,
        currentIndex: index,
        currentTime: 0,
      });

      if (track.id && !track.isPodcast) {
        logTrackPlay(track.id);
      }
    } catch {
      set({
        isPlaying: false,
        currentIndex: index,
        currentTime: 0,
      });
    }
  },

  togglePlay: async () => {
    const { audio, isPlaying, currentIndex, queue } = get();
    if (!audio) return;

    if (currentIndex === -1 && queue.length) {
      return get().playIndex(0);
    }

    if (isPlaying) {
      audio.pause();
      set({ isPlaying: false });
    } else {
      try {
        await audio.play();
        set({ isPlaying: true });
      } catch {
        set({ isPlaying: false });
      }
    }
  },

  next: () => {
    const { queue, currentIndex, isShuffle, isLoopAll } = get();
    if (!queue.length) return;

    if (isShuffle && queue.length > 1) {
      let randomIndex = currentIndex;
      while (randomIndex === currentIndex) {
        randomIndex = Math.floor(Math.random() * queue.length);
      }
      get().playIndex(randomIndex);
      return;
    }

    if (currentIndex < queue.length - 1) {
      get().playIndex(currentIndex + 1);
      return;
    }

    if (isLoopAll) {
      get().playIndex(0);
      return;
    }

    const audio = get().audio;
    if (audio) audio.pause();
    set({ isPlaying: false });
  },

  prev: () => {
    const { queue, currentIndex, audio } = get();
    if (!queue.length) return;

    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      set({ currentTime: 0 });
      return;
    }

    if (currentIndex > 0) {
      get().playIndex(currentIndex - 1);
    } else {
      get().playIndex(0);
    }
  },

  seek: (time) => {
    const audio = get().audio;
    if (!audio) return;
    const t = Math.min(Math.max(0, time), audio.duration || time);
    audio.currentTime = t;
    set({ currentTime: t });
  },

  skipForward: () => {
    const audio = get().audio;
    if (!audio) return;

    const newTime = Math.min(audio.currentTime + 30, audio.duration || audio.currentTime + 30);
    audio.currentTime = newTime;
    set({ currentTime: newTime });
  },

  skipBackward: () => {
    const audio = get().audio;
    if (!audio) return;

    const newTime = Math.max(audio.currentTime - 30, 0);
    audio.currentTime = newTime;
    set({ currentTime: newTime });
  },

  addToPlayNext: (track) => {
    const { queue, currentIndex } = get();

    if (currentIndex === -1 || !queue.length) {
      set({ queue: [track], currentIndex: 0 });
      get().playIndex(0);
      return;
    }

    const newQueue = [...queue];
    newQueue.splice(currentIndex + 1, 0, track);
    set({ queue: newQueue });
  },

  addToPlayLast: (track) => {
    const { queue, currentIndex } = get();

    if (currentIndex === -1 || !queue.length) {
      set({ queue: [track], currentIndex: 0 });
      get().playIndex(0);
      return;
    }

    set({ queue: [...queue, track] });
  },

  reorderQueue: (fromIndex, toIndex) => {
    const { queue, currentIndex } = get();

    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= queue.length ||
      toIndex >= queue.length
    ) {
      return;
    }

    const newQueue = [...queue];
    const [movedItem] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, movedItem);

    let newCurrentIndex = currentIndex;

    if (fromIndex === currentIndex) {
      newCurrentIndex = toIndex;
    } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
      newCurrentIndex -= 1;
    } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
      newCurrentIndex += 1;
    }

    set({
      queue: newQueue,
      currentIndex: newCurrentIndex,
    });
  },

  removeFromQueue: (index) => {
    const { queue, currentIndex, audio } = get();
    if (index < 0 || index >= queue.length) return;

    const newQueue = [...queue];
    newQueue.splice(index, 1);

    if (!newQueue.length) {
      if (audio) {
        audio.pause();
        audio.src = "";
        audio.load?.();
      }

      set({
        queue: [],
        currentIndex: -1,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
      });
      return;
    }

    let newCurrentIndex = currentIndex;

    if (index < currentIndex) {
      newCurrentIndex = currentIndex - 1;
    } else if (index === currentIndex) {
      if (currentIndex >= newQueue.length) {
        newCurrentIndex = newQueue.length - 1;
      }

      set({
        queue: newQueue,
        currentIndex: newCurrentIndex,
      });

      get().playIndex(newCurrentIndex);
      return;
    }

    set({
      queue: newQueue,
      currentIndex: newCurrentIndex,
    });
  },

  playQueueItem: (index) => {
    get().playIndex(index);
  },

  clearQueue: () => {
    const audio = get().audio;

    if (audio) {
      try {
        audio.pause();
        audio.src = "";
        audio.load?.();
      } catch {}
    }

    set({
      queue: [],
      currentIndex: -1,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isShuffle: false,
      isLoopAll: false,
      isLoopOne: false,
      playbackRate: 1,
    });
  },

  nowPlaying: () => {
    const { queue, currentIndex, currentTime, duration } = get();
    const track = queue[currentIndex] || null;
    return {
      track,
      currentTime,
      duration,
      currentTimeLabel: formatTime(currentTime),
      durationLabel: formatTime(duration),
    };
  },
}));