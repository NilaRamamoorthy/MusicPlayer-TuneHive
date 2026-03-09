import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import Auth from "./pages/Auth";
import RequireAuth from "./components/RequireAuth";
import { useAuthStore } from "./store/authStore";

import AppLayout from "./layout/AppLayout";
import HomeLanding from "./pages/HomeLanding";
import AlbumDetails from "./pages/AlbumDetails";
import NowPlaying from "./pages/NowPlaying";
import PlansPage from "./pages/PlansPage";
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import SearchResults from "./pages/SearchResults";
import HistoryPage from "./pages/HistoryPage";
import LikedSongsPage from "./pages/LikedSongsPage";
import AlbumsPage from "./pages/AlbumsPage";
import ArtistsPage from "./pages/ArtistsPage";
import PlaylistsPage from "./pages/PlaylistsPage";
import NewPlaylistPage from "./pages/NewPlaylistPage";
import PlaylistDetailPage from "./pages/PlaylistDetailPage";
import ProfilePage from "./pages/ProfilePage";
import LoggedOutPage from "./pages/LoggedOutPage";
import PodcastsPage from "./pages/PodcastsPage";
import ArtistAlbumsPage from "./pages/ArtistAlbumsPage";
import LikedAlbumsPage from "./pages/LikedAlbumsPage";
import PodcastDetailPage from "./pages/PodcastDetailPage";
function Boot() {
  const loadMe = useAuthStore((s) => s.loadMe);

  React.useEffect(() => {
    loadMe();
  }, [loadMe]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Auth />} />
      <Route path="/logged-out" element={<LoggedOutPage />} />

      {/* Protected app routes */}
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<HomeLanding />} />
        <Route path="/album/:id" element={<AlbumDetails />} />
        <Route path="/now-playing" element={<NowPlaying />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/payment/:planId" element={<PaymentPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/liked-songs" element={<LikedSongsPage />} />
        <Route path="/albums" element={<AlbumsPage />} />
        <Route path="/artists" element={<ArtistsPage />} />
        <Route path="/artists/:artistId" element={<ArtistAlbumsPage />} />
        <Route path="/playlists" element={<PlaylistsPage />} />
        <Route path="/playlists/new" element={<NewPlaylistPage />} />
        <Route path="/playlists/:playlistId" element={<PlaylistDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/podcasts" element={<PodcastsPage />} />
        <Route path="/liked-albums" element={<LikedAlbumsPage />} />
        <Route path="/podcasts/:podcastId" element={<PodcastDetailPage />} />

      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Boot />
    </BrowserRouter>
  </React.StrictMode>
);