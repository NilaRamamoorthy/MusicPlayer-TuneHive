from rest_framework import serializers
from .models import Artist, Album, Track, Language, Genre, LikedAlbum, PodcastCategory, Podcast, PodcastEpisode, EpisodeProgress


class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ["id", "name", "slug"]


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ["id", "name", "slug"]


class ArtistMiniSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Artist
        fields = ["id", "name", "slug", "image_url"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class AlbumListSerializer(serializers.ModelSerializer):
    primary_artist = ArtistMiniSerializer()
    cover_url = serializers.SerializerMethodField()
    language = LanguageSerializer()
    genre = GenreSerializer()

    class Meta:
        model = Album
        fields = [
            "id",
            "title",
            "slug",
            "album_type",
            "movie_name",
            "year",
            "label",
            "plays_count",
            "cover_url",
            "primary_artist",
            "language",
            "genre",
        ]

    def get_cover_url(self, obj):
        request = self.context.get("request")
        if obj.cover and request:
            return request.build_absolute_uri(obj.cover.url)
        return None


class AlbumDetailSerializer(serializers.ModelSerializer):
    primary_artist = ArtistMiniSerializer()
    cover_url = serializers.SerializerMethodField()
    tracks_count = serializers.IntegerField(source="tracks.count", read_only=True)
    language = LanguageSerializer()
    genre = GenreSerializer()

    class Meta:
        model = Album
        fields = [
            "id",
            "title",
            "slug",
            "album_type",
            "movie_name",
            "year",
            "label",
            "plays_count",
            "cover_url",
            "primary_artist",
            "language",
            "genre",
            "tracks_count",
        ]

    def get_cover_url(self, obj):
        request = self.context.get("request")
        if obj.cover and request:
            return request.build_absolute_uri(obj.cover.url)
        return None


class TrackSerializer(serializers.ModelSerializer):
    audio_url = serializers.SerializerMethodField()
    language = LanguageSerializer()
    genre = GenreSerializer()
    album_id = serializers.IntegerField(source="album.id", read_only=True)
    album_title = serializers.CharField(source="album.title", read_only=True)
    album_cover_url = serializers.SerializerMethodField()

    class Meta:
        model = Track
        fields = [
            "id",
            "title",
            "track_no",
            "artist_text",
            "singers_text",
            "actors_text",
            "movie_name",
            "language",
            "genre",
            "duration_seconds",
            "plays_count",
            "audio_url",
            "album_id",
            "album_title",
            "album_cover_url",
        ]

    def get_audio_url(self, obj):
        request = self.context.get("request")
        if obj.audio_file and request:
            return request.build_absolute_uri(obj.audio_file.url)
        return None

    def get_album_cover_url(self, obj):
        request = self.context.get("request")
        if obj.album and obj.album.cover and request:
            return request.build_absolute_uri(obj.album.cover.url)
        return None


from .models import LikedTrack, PlayHistory, Playlist, PlaylistTrack


class LikedTrackSerializer(serializers.ModelSerializer):
    track = TrackSerializer()

    class Meta:
        model = LikedTrack
        fields = ["id", "created_at", "track"]


class PlayHistorySerializer(serializers.ModelSerializer):
    track = TrackSerializer()

    class Meta:
        model = PlayHistory
        fields = ["id", "played_at", "track"]


class PlaylistTrackSerializer(serializers.ModelSerializer):
    track = TrackSerializer()

    class Meta:
        model = PlaylistTrack
        fields = ["id", "position", "track"]


class PlaylistSerializer(serializers.ModelSerializer):
    tracks_count = serializers.IntegerField(source="playlist_tracks.count", read_only=True)

    class Meta:
        model = Playlist
        fields = ["id", "name", "is_public", "created_at", "tracks_count"]


class PlaylistDetailSerializer(serializers.ModelSerializer):
    playlist_tracks = PlaylistTrackSerializer(many=True)
    tracks_count = serializers.IntegerField(source="playlist_tracks.count", read_only=True)

    class Meta:
        model = Playlist
        fields = ["id", "name", "is_public", "created_at", "tracks_count", "playlist_tracks"]


class CreatePlaylistSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    is_public = serializers.BooleanField(required=False, default=False)


class AddTrackToPlaylistSerializer(serializers.Serializer):
    track_id = serializers.IntegerField()

class LikedAlbumSerializer(serializers.ModelSerializer):
    album = AlbumListSerializer()

    class Meta:
        model = LikedAlbum
        fields = ["id", "created_at", "album"]


#Podcast
class PodcastCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PodcastCategory
        fields = ["id", "name", "slug"]


class PodcastListSerializer(serializers.ModelSerializer):
    cover_url = serializers.SerializerMethodField()
    language = LanguageSerializer()
    category = PodcastCategorySerializer()

    class Meta:
        model = Podcast
        fields = [
            "id",
            "title",
            "slug",
            "host_name",
            "description",
            "cover_url",
            "language",
            "category",
            "plays_count",
        ]

    def get_cover_url(self, obj):
        request = self.context.get("request")
        if obj.cover and request:
            return request.build_absolute_uri(obj.cover.url)
        return None


class PodcastDetailSerializer(serializers.ModelSerializer):
    cover_url = serializers.SerializerMethodField()
    language = LanguageSerializer()
    category = PodcastCategorySerializer()
    episodes_count = serializers.IntegerField(source="episodes.count", read_only=True)

    class Meta:
        model = Podcast
        fields = [
            "id",
            "title",
            "slug",
            "host_name",
            "description",
            "cover_url",
            "language",
            "category",
            "plays_count",
            "episodes_count",
        ]

    def get_cover_url(self, obj):
        request = self.context.get("request")
        if obj.cover and request:
            return request.build_absolute_uri(obj.cover.url)
        return None


class PodcastEpisodeSerializer(serializers.ModelSerializer):
    audio_url = serializers.SerializerMethodField()
    podcast_id = serializers.IntegerField(source="podcast.id", read_only=True)
    podcast_title = serializers.CharField(source="podcast.title", read_only=True)
    podcast_cover_url = serializers.SerializerMethodField()
    language = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()

    class Meta:
        model = PodcastEpisode
        fields = [
            "id",
            "title",
            "episode_number",
            "description",
            "guest_names",
            "audio_url",
            "duration_seconds",
            "published_date",
            "plays_count",
            "podcast_id",
            "podcast_title",
            "podcast_cover_url",
            "language",
            "category",
        ]

    def get_audio_url(self, obj):
        request = self.context.get("request")
        if obj.audio_file and request:
            return request.build_absolute_uri(obj.audio_file.url)
        return None

    def get_podcast_cover_url(self, obj):
        request = self.context.get("request")
        if obj.podcast and obj.podcast.cover and request:
            return request.build_absolute_uri(obj.podcast.cover.url)
        return None

    def get_language(self, obj):
        if obj.podcast and obj.podcast.language:
            return LanguageSerializer(obj.podcast.language).data
        return None

    def get_category(self, obj):
        if obj.podcast and obj.podcast.category:
            return PodcastCategorySerializer(obj.podcast.category).data
        return None
    
class SaveEpisodeProgressSerializer(serializers.Serializer):
    progress_seconds = serializers.IntegerField(min_value=0)


class EpisodeProgressSerializer(serializers.ModelSerializer):
    episode = PodcastEpisodeSerializer()

    class Meta:
        model = EpisodeProgress
        fields = ["id", "progress_seconds", "updated_at", "episode"]