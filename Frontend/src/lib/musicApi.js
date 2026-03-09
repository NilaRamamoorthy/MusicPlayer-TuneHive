const base = () => import.meta.env.VITE_API_BASE_URL;

async function request(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${base()}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error || data?.detail || "Request failed");
  }

  return data;
}

export const musicApi = {
  // ------------------------
  // HOME + ALBUMS
  // ------------------------

  homeSections: () => request("/api/music/home/sections/"),

  albumDetail: (albumId) => request(`/api/music/albums/${albumId}/`),

  albumTracks: (albumId) =>
    request(`/api/music/albums/${albumId}/tracks/`),

  albums: (params = {}) => {
    const qs = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        qs.append(key, value);
      }
    });

    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request(`/api/music/albums/${suffix}`);
  },

  languages: () => request("/api/music/languages/"),

  search: (params = {}) => {
    const qs = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        qs.append(key, value);
      }
    });

    return request(`/api/music/search/?${qs.toString()}`);
  },

  // ------------------------
  // HISTORY + LIKES
  // ------------------------

  history: (token) => request("/api/music/history/", { token }),

  likedTracks: (token) => request("/api/music/liked/", { token }),

  toggleLike: (token, trackId) =>
    request(`/api/music/liked/toggle/${trackId}/`, {
      method: "POST",
      token,
    }),

  // ------------------------
  // PLAYLISTS
  // ------------------------

  playlists: (token) => request("/api/music/playlists/", { token }),

  createPlaylist: (token, payload) =>
    request("/api/music/playlists/", {
      method: "POST",
      token,
      body: payload,
    }),

  playlistDetail: (token, playlistId) =>
    request(`/api/music/playlists/${playlistId}/`, { token }),

  addTrackToPlaylist: (token, playlistId, trackId) =>
    request(`/api/music/playlists/${playlistId}/add-track/`, {
      method: "POST",
      token,
      body: { track_id: trackId },
    }),

  removeTrackFromPlaylist: (token, playlistId, trackId) =>
    request(`/api/music/playlists/${playlistId}/remove-track/`, {
      method: "POST",
      token,
      body: { track_id: trackId },
    }),

  deletePlaylist: (token, playlistId) =>
    request(`/api/music/playlists/${playlistId}/delete/`, {
      method: "DELETE",
      token,
    }),

  // ------------------------
  // LIKED ALBUMS
  // ------------------------

  likedAlbums: (token) =>
    request("/api/music/liked-albums/", { token }),

  toggleLikeAlbum: (token, albumId) =>
    request(`/api/music/liked-albums/toggle/${albumId}/`, {
      method: "POST",
      token,
    }),

  // ------------------------
  // PODCAST APIs
  // ------------------------

  podcasts: (params = {}) => {
    const qs = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        qs.append(key, value);
      }
    });

    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request(`/api/music/podcasts/${suffix}`);
  },

  podcastDetail: (podcastId) =>
    request(`/api/music/podcasts/${podcastId}/`),

  podcastEpisodes: (podcastId) =>
    request(`/api/music/podcasts/${podcastId}/episodes/`),

  podcastEpisodeDetail: (episodeId) =>
    request(`/api/music/podcast-episodes/${episodeId}/`),


  savePodcastProgress: (token, episodeId, progressSeconds) =>
  request(`/api/music/podcast-episodes/${episodeId}/progress/`, {
    method: "POST",
    token,
    body: { progress_seconds: progressSeconds },
  }),

podcastProgress: (token) =>
  request("/api/music/podcast-progress/", { token }),
};

