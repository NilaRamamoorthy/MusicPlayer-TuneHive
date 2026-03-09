from django.urls import path
from .views import (
    HomeSections,
    LanguageList,
    AlbumList,
    AlbumDetail,
    AlbumTracks,
    TrackDetail,
    TrackPlay,
    SearchView,
    HistoryList,
    LikedTracksList,
    ToggleLikeTrack,
    PlaylistListCreate,
    PlaylistDetailView,
    AddTrackToPlaylist,
    LikedAlbumsList,
    ToggleLikeAlbum,
    RemoveTrackFromPlaylist,
    DeletePlaylist,
    PodcastList,
    PodcastDetailView,
    PodcastEpisodesList,
    PodcastEpisodeDetail,
    PodcastEpisodePlay,
    SavePodcastEpisodeProgress,
    PodcastProgressList
    
)

urlpatterns = [
    path("home/sections/", HomeSections.as_view()),
    path("languages/", LanguageList.as_view()),
    path("search/", SearchView.as_view()),
    path("albums/", AlbumList.as_view()),
    path("albums/<int:album_id>/", AlbumDetail.as_view()),
    path("albums/<int:album_id>/tracks/", AlbumTracks.as_view()),
    path("tracks/<int:track_id>/", TrackDetail.as_view()),
    path("tracks/<int:track_id>/play/", TrackPlay.as_view()),

    # Sidebar/library APIs
    path("history/", HistoryList.as_view()),
    path("liked/", LikedTracksList.as_view()),
    path("liked/toggle/<int:track_id>/", ToggleLikeTrack.as_view()),
    path("playlists/", PlaylistListCreate.as_view()),
    path("playlists/<int:playlist_id>/", PlaylistDetailView.as_view()),
    path("playlists/<int:playlist_id>/add-track/", AddTrackToPlaylist.as_view()),
    path("playlists/<int:playlist_id>/remove-track/", RemoveTrackFromPlaylist.as_view()),
    path("playlists/<int:playlist_id>/delete/", DeletePlaylist.as_view()),

    path("liked-albums/", LikedAlbumsList.as_view()),
    path("liked-albums/toggle/<int:album_id>/", ToggleLikeAlbum.as_view()),


    path("podcasts/", PodcastList.as_view()),
    path("podcasts/<int:podcast_id>/", PodcastDetailView.as_view()),
    path("podcasts/<int:podcast_id>/episodes/", PodcastEpisodesList.as_view()),
    path("podcast-episodes/<int:episode_id>/", PodcastEpisodeDetail.as_view()),
    path("podcast-episodes/<int:episode_id>/play/", PodcastEpisodePlay.as_view()),
    path("podcast-episodes/<int:episode_id>/progress/",SavePodcastEpisodeProgress.as_view()),
    path("podcast-progress/",PodcastProgressList.as_view()
),
]