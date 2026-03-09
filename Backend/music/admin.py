from django.contrib import admin
from .models import Artist, Album, Track, Genre, Language, LikedTrack, PlayHistory, Playlist, PlaylistTrack, PodcastCategory,Podcast, PodcastEpisode

@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name",)


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name",)


@admin.register(Artist)
class ArtistAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name",)


class TrackInline(admin.TabularInline):
    model = Track
    extra = 0
    fields = (
        "track_no",
        "title",
        "artist_text",
        "singers_text",
        "actors_text",
        "movie_name",
        "language",
        "genre",
        "audio_file",
        "duration_seconds",
        "is_published",
    )


@admin.register(Album)
class AlbumAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "album_type",
        "movie_name",
        "primary_artist",
        "language",
        "genre",
        "year",
        "is_published",
    )
    list_filter = ("album_type", "language", "genre", "year", "is_published")
    search_fields = ("title", "movie_name", "primary_artist__name")
    inlines = [TrackInline]


@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "album",
        "track_no",
        "language",
        "genre",
        "movie_name",
        "is_published",
    )
    list_filter = ("language", "genre", "is_published")
    search_fields = (
        "title",
        "artist_text",
        "singers_text",
        "actors_text",
        "movie_name",
        "album__title",
    )


@admin.register(LikedTrack)
class LikedTrackAdmin(admin.ModelAdmin):
    list_display = ("user", "track", "created_at")
    search_fields = ("user__email", "track__title")
    list_filter = ("created_at",)


@admin.register(PlayHistory)
class PlayHistoryAdmin(admin.ModelAdmin):
    list_display = ("user", "track", "played_at")
    search_fields = ("user__email", "track__title")
    list_filter = ("played_at",)


class PlaylistTrackInline(admin.TabularInline):
    model = PlaylistTrack
    extra = 0
    fields = ("track", "position")


@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "is_public", "created_at")
    search_fields = ("name", "user__email")
    list_filter = ("is_public", "created_at")
    inlines = [PlaylistTrackInline]


@admin.register(PlaylistTrack)
class PlaylistTrackAdmin(admin.ModelAdmin):
    list_display = ("playlist", "track", "position", "created_at")
    search_fields = ("playlist__name", "track__title")
    list_filter = ("created_at",)


@admin.register(PodcastCategory)
class PodcastCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name",)


class PodcastEpisodeInline(admin.TabularInline):
    model = PodcastEpisode
    extra = 0
    fields = (
        "episode_number",
        "title",
        "guest_names",
        "published_date",
        "duration_seconds",
        "audio_file",
        "is_published",
    )


@admin.register(Podcast)
class PodcastAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "host_name",
        "language",
        "category",
        "is_published",
        "plays_count",
    )
    list_filter = ("language", "category", "is_published")
    search_fields = ("title", "host_name", "description")
    inlines = [PodcastEpisodeInline]


@admin.register(PodcastEpisode)
class PodcastEpisodeAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "podcast",
        "episode_number",
        "published_date",
        "is_published",
        "plays_count",
    )
    list_filter = ("is_published", "published_date", "podcast")
    search_fields = ("title", "podcast__title", "guest_names", "description")