from django.db import models
from django.utils.text import slugify
from django.conf import settings

class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Genre(TimeStampedModel):
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Language(TimeStampedModel):
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)

    class Meta:
        verbose_name_plural = "Languages"
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Artist(TimeStampedModel):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=160, unique=True, blank=True)
    image = models.ImageField(upload_to="artists/", null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Album(TimeStampedModel):
    ALBUM_TYPE_CHOICES = [
        ("movie", "Movie Soundtrack"),
        ("album", "Independent Album"),
        ("single", "Single"),
        ("ep", "EP"),
    ]

    title = models.CharField(max_length=160)
    slug = models.SlugField(max_length=200, unique=True, blank=True)

    album_type = models.CharField(max_length=20, choices=ALBUM_TYPE_CHOICES, default="album")
    movie_name = models.CharField(max_length=200, blank=True)

    primary_artist = models.ForeignKey(
        Artist,
        on_delete=models.SET_NULL,
        null=True,
        related_name="albums"
    )

    language = models.ForeignKey(
        Language,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="albums"
    )

    genre = models.ForeignKey(
        Genre,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="albums"
    )

    cover = models.ImageField(upload_to="albums/covers/", null=True, blank=True)
    year = models.PositiveIntegerField(null=True, blank=True)
    label = models.CharField(max_length=120, blank=True)

    plays_count = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)
            slug = base
            i = 1
            while Album.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                i += 1
                slug = f"{base}-{i}"
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        if self.album_type == "movie" and self.movie_name:
            return f"{self.title} (Movie: {self.movie_name})"
        return self.title


class Track(TimeStampedModel):
    title = models.CharField(max_length=200)

    album = models.ForeignKey(
        Album,
        on_delete=models.CASCADE,
        related_name="tracks"
    )

    track_no = models.PositiveIntegerField(default=1)

    # display metadata
    artist_text = models.CharField(max_length=240, blank=True)
    singers_text = models.CharField(max_length=240, blank=True)
    actors_text = models.CharField(max_length=240, blank=True)
    movie_name = models.CharField(max_length=200, blank=True)

    language = models.ForeignKey(
        Language,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tracks"
    )

    genre = models.ForeignKey(
        Genre,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tracks"
    )

    audio_file = models.FileField(upload_to="tracks/audio/")
    duration_seconds = models.PositiveIntegerField(default=0)
    plays_count = models.PositiveIntegerField(default=0)

    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ["album_id", "track_no", "id"]
        unique_together = ("album", "track_no")

    def save(self, *args, **kwargs):
        # inherit defaults from album if not explicitly given
        if self.album:
            if not self.movie_name and self.album.movie_name:
                self.movie_name = self.album.movie_name
            if not self.language and self.album.language:
                self.language = self.album.language
            if not self.genre and self.album.genre:
                self.genre = self.album.genre
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.album.title})"
    

class LikedTrack(TimeStampedModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="liked_tracks"
    )
    track = models.ForeignKey(
        Track,
        on_delete=models.CASCADE,
        related_name="liked_by_users"
    )

    class Meta:
        unique_together = ("user", "track")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} liked {self.track.title}"


class PlayHistory(TimeStampedModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="play_history"
    )
    track = models.ForeignKey(
        Track,
        on_delete=models.CASCADE,
        related_name="history_entries"
    )
    played_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-played_at"]

    def __str__(self):
        return f"{self.user.email} played {self.track.title}"


class Playlist(TimeStampedModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="playlists"
    )
    name = models.CharField(max_length=120)
    is_public = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("user", "name")

    def __str__(self):
        return f"{self.name} - {self.user.email}"


class PlaylistTrack(TimeStampedModel):
    playlist = models.ForeignKey(
        Playlist,
        on_delete=models.CASCADE,
        related_name="playlist_tracks"
    )
    track = models.ForeignKey(
        Track,
        on_delete=models.CASCADE,
        related_name="in_playlists"
    )
    position = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["position", "id"]
        unique_together = ("playlist", "track")

    def __str__(self):
        return f"{self.track.title} in {self.playlist.name}"


class LikedAlbum(TimeStampedModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="liked_albums"
    )
    album = models.ForeignKey(
        Album,
        on_delete=models.CASCADE,
        related_name="liked_by_users"
    )

    class Meta:
        unique_together = ("user", "album")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} liked album {self.album.title}"


class PodcastCategory(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)

    class Meta:
        verbose_name_plural = "Podcast Categories"
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Podcast(TimeStampedModel):
    title = models.CharField(max_length=180)
    slug = models.SlugField(max_length=220, unique=True, blank=True)

    host_name = models.CharField(max_length=160, blank=True)
    description = models.TextField(blank=True)

    cover = models.ImageField(upload_to="podcasts/covers/", null=True, blank=True)

    language = models.ForeignKey(
        Language,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="podcasts"
    )

    category = models.ForeignKey(
        PodcastCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="podcasts"
    )

    is_published = models.BooleanField(default=True)
    plays_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)
            slug = base
            i = 1
            while Podcast.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                i += 1
                slug = f"{base}-{i}"
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class PodcastEpisode(TimeStampedModel):
    podcast = models.ForeignKey(
        Podcast,
        on_delete=models.CASCADE,
        related_name="episodes"
    )

    title = models.CharField(max_length=200)
    episode_number = models.PositiveIntegerField(default=1)

    description = models.TextField(blank=True)
    guest_names = models.CharField(max_length=240, blank=True)

    audio_file = models.FileField(upload_to="podcasts/episodes/")
    duration_seconds = models.PositiveIntegerField(default=0)

    published_date = models.DateField(null=True, blank=True)

    is_published = models.BooleanField(default=True)
    plays_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["podcast_id", "episode_number", "id"]
        unique_together = ("podcast", "episode_number")

    def __str__(self):
        return f"{self.title} ({self.podcast.title})"


class EpisodeProgress(TimeStampedModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="podcast_progress"
    )
    episode = models.ForeignKey(
        PodcastEpisode,
        on_delete=models.CASCADE,
        related_name="progress_entries"
    )
    progress_seconds = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("user", "episode")
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.user.email} - {self.episode.title} ({self.progress_seconds}s)"