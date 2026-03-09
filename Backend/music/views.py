from django.db.models import F, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from rest_framework.permissions import IsAuthenticated
from .models import (
    Album,
    Track,
    Language,
    LikedTrack,
    PlayHistory,
    Playlist,
    PlaylistTrack,
    LikedAlbum,
    Podcast,
    PodcastEpisode,
    EpisodeProgress,
)
from .serializers import (
    AlbumListSerializer,
    AlbumDetailSerializer,
    TrackSerializer,
    LanguageSerializer,
    LikedTrackSerializer,
    PlayHistorySerializer,
    PlaylistSerializer,
    PlaylistDetailSerializer,
    CreatePlaylistSerializer,
    AddTrackToPlaylistSerializer,
    LikedAlbumSerializer,
    PodcastListSerializer,
    PodcastDetailSerializer,
    PodcastEpisodeSerializer,
    EpisodeProgressSerializer,
    SaveEpisodeProgressSerializer,
)


class HomeSections(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        latest = (
            Album.objects.filter(is_published=True)
            .select_related("primary_artist", "language", "genre")
            .order_by("-created_at")[:12]
        )
        trending = (
            Album.objects.filter(is_published=True)
            .select_related("primary_artist", "language", "genre")
            .order_by("-plays_count", "-created_at")[:12]
        )
        top_charts = (
            Album.objects.filter(is_published=True)
            .select_related("primary_artist", "language", "genre")
            .order_by("-plays_count")[:12]
        )

        return Response(
            {
                "latest_songs": AlbumListSerializer(
                    latest, many=True, context={"request": request}
                ).data,
                "trending_now": AlbumListSerializer(
                    trending, many=True, context={"request": request}
                ).data,
                "top_charts": AlbumListSerializer(
                    top_charts, many=True, context={"request": request}
                ).data,
            }
        )


class LanguageList(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        languages = Language.objects.all().order_by("name")
        return Response(LanguageSerializer(languages, many=True).data)


class AlbumList(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        qs = (
            Album.objects.filter(is_published=True)
            .select_related("primary_artist", "language", "genre")
            .order_by("-created_at")
        )

        language_slug = request.query_params.get("language")
        genre_slug = request.query_params.get("genre")
        artist = request.query_params.get("artist")
        artist_id = request.query_params.get("artist_id")
        movie = request.query_params.get("movie")
        q = request.query_params.get("q")
        if language_slug:
            qs = qs.filter(language__slug=language_slug)

        if genre_slug:
            qs = qs.filter(genre__slug=genre_slug)
        
        if artist_id:
            qs = qs.filter(primary_artist__id=artist_id)

        if artist:
            qs = qs.filter(primary_artist__name__icontains=artist)

        if movie:
            qs = qs.filter(movie_name__icontains=movie)

        if q:
            qs = qs.filter(
                Q(title__icontains=q)
                | Q(movie_name__icontains=q)
                | Q(primary_artist__name__icontains=q)
                | Q(language__name__icontains=q)
                | Q(genre__name__icontains=q)
            )

        return Response(
            AlbumListSerializer(qs, many=True, context={"request": request}).data
        )


class AlbumDetail(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, album_id):
        album = (
            Album.objects.filter(id=album_id, is_published=True)
            .select_related("primary_artist", "language", "genre")
            .first()
        )
        if not album:
            return Response(
                {"error": "Album not found"}, status=status.HTTP_404_NOT_FOUND
            )

        return Response(AlbumDetailSerializer(album, context={"request": request}).data)


class AlbumTracks(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, album_id):
        qs = (
            Track.objects.filter(album_id=album_id, is_published=True)
            .select_related("album", "language", "genre")
            .order_by("track_no")
        )
        return Response(TrackSerializer(qs, many=True, context={"request": request}).data)


class TrackDetail(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, track_id):
        t = (
            Track.objects.filter(id=track_id, is_published=True)
            .select_related("album", "language", "genre")
            .first()
        )
        if not t:
            return Response(
                {"error": "Track not found"}, status=status.HTTP_404_NOT_FOUND
            )
        return Response(TrackSerializer(t, context={"request": request}).data)


class TrackPlay(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def post(self, request, track_id):
        track = Track.objects.filter(id=track_id).first()
        if not track:
            return Response({"error": "Track not found"}, status=404)

        Track.objects.filter(id=track_id).update(plays_count=F("plays_count") + 1)

        if request.user.is_authenticated:
            PlayHistory.objects.create(user=request.user, track=track)

        return Response({"message": "ok"})


class SearchView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        q = request.query_params.get("q", "").strip()
        language = request.query_params.get("language", "").strip()
        genre = request.query_params.get("genre", "").strip()
        movie = request.query_params.get("movie", "").strip()
        artist = request.query_params.get("artist", "").strip()
        singer = request.query_params.get("singer", "").strip()

        album_qs = (
            Album.objects.filter(is_published=True)
            .select_related("primary_artist", "language", "genre")
            .order_by("-created_at")
        )

        track_qs = (
            Track.objects.filter(is_published=True)
            .select_related("album", "language", "genre")
            .order_by("album_id", "track_no")
        )

        if q:
            album_qs = album_qs.filter(
                Q(title__icontains=q)
                | Q(movie_name__icontains=q)
                | Q(primary_artist__name__icontains=q)
                | Q(language__name__icontains=q)
                | Q(genre__name__icontains=q)
            )

            track_qs = track_qs.filter(
                Q(title__icontains=q)
                | Q(artist_text__icontains=q)
                | Q(singers_text__icontains=q)
                | Q(actors_text__icontains=q)
                | Q(movie_name__icontains=q)
                | Q(language__name__icontains=q)
                | Q(genre__name__icontains=q)
                | Q(album__title__icontains=q)
            )

        if language:
            album_qs = album_qs.filter(language__name__icontains=language)
            track_qs = track_qs.filter(language__name__icontains=language)

        if genre:
            album_qs = album_qs.filter(genre__name__icontains=genre)
            track_qs = track_qs.filter(genre__name__icontains=genre)

        if movie:
            album_qs = album_qs.filter(movie_name__icontains=movie)
            track_qs = track_qs.filter(movie_name__icontains=movie)

        if artist:
            album_qs = album_qs.filter(primary_artist__name__icontains=artist)
            track_qs = track_qs.filter(artist_text__icontains=artist)

        if singer:
            track_qs = track_qs.filter(singers_text__icontains=singer)

        return Response(
            {
                "albums": AlbumListSerializer(
                    album_qs[:20], many=True, context={"request": request}
                ).data,
                "tracks": TrackSerializer(
                    track_qs[:50], many=True, context={"request": request}
                ).data,
            }
        )
    

def user_can_use_playlists(user):
    sub = getattr(user, "usersubscription", None)
    if not sub or not sub.plan:
        return False
    return sub.plan.name in ["Pro", "Premium"]


class HistoryList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = (
            PlayHistory.objects.filter(user=request.user)
            .select_related("track__album", "track__language", "track__genre")
            .order_by("-played_at")[:100]
        )
        return Response(PlayHistorySerializer(qs, many=True, context={"request": request}).data)


class LikedTracksList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = (
            LikedTrack.objects.filter(user=request.user)
            .select_related("track__album", "track__language", "track__genre")
            .order_by("-created_at")
        )
        return Response(LikedTrackSerializer(qs, many=True, context={"request": request}).data)


class ToggleLikeTrack(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, track_id):
        track = Track.objects.filter(id=track_id, is_published=True).first()
        if not track:
            return Response({"error": "Track not found"}, status=status.HTTP_404_NOT_FOUND)

        liked = LikedTrack.objects.filter(user=request.user, track=track).first()
        if liked:
            liked.delete()
            return Response({"message": "Track unliked", "liked": False})

        LikedTrack.objects.create(user=request.user, track=track)
        return Response({"message": "Track liked", "liked": True})


class PlaylistListCreate(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Playlist.objects.filter(user=request.user).order_by("-created_at")
        return Response(PlaylistSerializer(qs, many=True).data)

    def post(self, request):
        if not user_can_use_playlists(request.user):
            return Response(
                {"error": "Playlist creation is available only for Pro or Premium users."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = CreatePlaylistSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        name = serializer.validated_data["name"]
        is_public = serializer.validated_data.get("is_public", False)

        playlist = Playlist.objects.create(
            user=request.user,
            name=name,
            is_public=is_public,
        )
        return Response(PlaylistSerializer(playlist).data, status=status.HTTP_201_CREATED)


class PlaylistDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, playlist_id):
        playlist = (
            Playlist.objects.filter(id=playlist_id, user=request.user)
            .prefetch_related("playlist_tracks__track__album", "playlist_tracks__track__language", "playlist_tracks__track__genre")
            .first()
        )
        if not playlist:
            return Response({"error": "Playlist not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response(PlaylistDetailSerializer(playlist, context={"request": request}).data)


class AddTrackToPlaylist(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, playlist_id):
        if not user_can_use_playlists(request.user):
            return Response(
                {"error": "Playlist features are available only for Pro or Premium users."},
                status=status.HTTP_403_FORBIDDEN,
            )

        playlist = Playlist.objects.filter(id=playlist_id, user=request.user).first()
        if not playlist:
            return Response({"error": "Playlist not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = AddTrackToPlaylistSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        track_id = serializer.validated_data["track_id"]
        track = Track.objects.filter(id=track_id, is_published=True).first()
        if not track:
            return Response({"error": "Track not found"}, status=status.HTTP_404_NOT_FOUND)

        existing = PlaylistTrack.objects.filter(playlist=playlist, track=track).first()
        if existing:
            return Response({"message": "Track already in playlist"})

        last_position = (
            PlaylistTrack.objects.filter(playlist=playlist).order_by("-position").values_list("position", flat=True).first()
            or 0
        )

        PlaylistTrack.objects.create(
            playlist=playlist,
            track=track,
            position=last_position + 1,
        )

        return Response({"message": "Track added to playlist"}, status=status.HTTP_201_CREATED)
    
class LikedAlbumsList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = (
            LikedAlbum.objects.filter(user=request.user)
            .select_related("album__primary_artist", "album__language", "album__genre")
            .order_by("-created_at")
        )
        return Response(LikedAlbumSerializer(qs, many=True, context={"request": request}).data)


class ToggleLikeAlbum(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, album_id):
        album = Album.objects.filter(id=album_id, is_published=True).first()
        if not album:
            return Response({"error": "Album not found"}, status=status.HTTP_404_NOT_FOUND)

        liked = LikedAlbum.objects.filter(user=request.user, album=album).first()
        if liked:
            liked.delete()
            return Response({"message": "Album unliked", "liked": False})

        LikedAlbum.objects.create(user=request.user, album=album)
        return Response({"message": "Album liked", "liked": True})


class RemoveTrackFromPlaylist(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, playlist_id):
        playlist = Playlist.objects.filter(id=playlist_id, user=request.user).first()
        if not playlist:
            return Response({"error": "Playlist not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = AddTrackToPlaylistSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        track_id = serializer.validated_data["track_id"]

        playlist_track = PlaylistTrack.objects.filter(
            playlist=playlist,
            track_id=track_id,
        ).first()

        if not playlist_track:
            return Response({"error": "Track not found in playlist"}, status=status.HTTP_404_NOT_FOUND)

        playlist_track.delete()

        # optional: resequence positions
        remaining = PlaylistTrack.objects.filter(playlist=playlist).order_by("position", "id")
        for idx, item in enumerate(remaining, start=1):
            if item.position != idx:
                item.position = idx
                item.save(update_fields=["position"])

        return Response({"message": "Track removed from playlist"}, status=status.HTTP_200_OK)



class DeletePlaylist(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, playlist_id):
        playlist = Playlist.objects.filter(id=playlist_id, user=request.user).first()
        if not playlist:
            return Response(
                {"error": "Playlist not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        playlist.delete()
        return Response({"message": "Playlist deleted"}, status=status.HTTP_200_OK)
    
#Podcast

class PodcastList(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        qs = (
            Podcast.objects.filter(is_published=True)
            .select_related("language", "category")
            .order_by("-created_at")
        )

        language = request.query_params.get("language")
        category = request.query_params.get("category")
        q = request.query_params.get("q")

        if language:
            qs = qs.filter(language__name__icontains=language)

        if category:
            qs = qs.filter(category__name__icontains=category)

        if q:
            qs = qs.filter(
                Q(title__icontains=q)
                | Q(host_name__icontains=q)
                | Q(description__icontains=q)
                | Q(category__name__icontains=q)
            )

        return Response(
            PodcastListSerializer(qs, many=True, context={"request": request}).data
        )


class PodcastDetailView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, podcast_id):
        podcast = (
            Podcast.objects.filter(id=podcast_id, is_published=True)
            .select_related("language", "category")
            .first()
        )

        if not podcast:
            return Response({"error": "Podcast not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response(PodcastDetailSerializer(podcast, context={"request": request}).data)


class PodcastEpisodesList(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, podcast_id):
        qs = (
            PodcastEpisode.objects.filter(podcast_id=podcast_id, is_published=True)
            .select_related("podcast__language", "podcast__category")
            .order_by("episode_number")
        )

        return Response(
            PodcastEpisodeSerializer(qs, many=True, context={"request": request}).data
        )


class PodcastEpisodeDetail(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, episode_id):
        episode = (
            PodcastEpisode.objects.filter(id=episode_id, is_published=True)
            .select_related("podcast__language", "podcast__category")
            .first()
        )

        if not episode:
            return Response({"error": "Episode not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response(PodcastEpisodeSerializer(episode, context={"request": request}).data)


class PodcastEpisodePlay(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def post(self, request, episode_id):
        episode = PodcastEpisode.objects.filter(id=episode_id).first()
        if not episode:
            return Response({"error": "Episode not found"}, status=status.HTTP_404_NOT_FOUND)

        PodcastEpisode.objects.filter(id=episode_id).update(
            plays_count=F("plays_count") + 1
        )
        Podcast.objects.filter(id=episode.podcast_id).update(
            plays_count=F("plays_count") + 1
        )

        return Response({"message": "ok"})
    

class SavePodcastEpisodeProgress(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, episode_id):
        episode = PodcastEpisode.objects.filter(id=episode_id, is_published=True).first()
        if not episode:
            return Response({"error": "Episode not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = SaveEpisodeProgressSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        progress_seconds = serializer.validated_data["progress_seconds"]

        progress_obj, _ = EpisodeProgress.objects.update_or_create(
            user=request.user,
            episode=episode,
            defaults={"progress_seconds": progress_seconds},
        )

        return Response(
            {
                "message": "Progress saved",
                "progress_seconds": progress_obj.progress_seconds,
            },
            status=status.HTTP_200_OK,
        )


class PodcastProgressList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = (
            EpisodeProgress.objects.filter(user=request.user)
            .select_related("episode__podcast__language", "episode__podcast__category")
            .order_by("-updated_at")
        )

        return Response(
            EpisodeProgressSerializer(qs, many=True, context={"request": request}).data
        )