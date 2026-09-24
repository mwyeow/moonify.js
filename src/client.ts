import { LastFmService } from "./services/lastfm.service.js";
import { SpotifyService } from "./services/spotify.service.js";
import { MoonifyConfig } from "./types/config.js";
import {
  ResolvedCurrentlyPlaying,
  ResolvedTrackItem,
  LastFmUserProfile,
} from "./types/results.js";
import { normalizeString } from "./utils/normalise.js";

export class Moonify {
  private lastfm: LastFmService;
  private spotify: SpotifyService;

  constructor(config: MoonifyConfig) {
    if (!config.lastfmApiKey) {
      throw new Error("lastfm api key is required.");
    }

    this.lastfm = new LastFmService(
      config.lastfmApiKey,
      config.requestTimeoutMs,
    );
    this.spotify = new SpotifyService(
      config.spotifyClientId,
      config.spotifyClientSecret,
      config.requestTimeoutMs,
    );
  }

  public async getCurrentlyPlaying(
    username: string,
  ): Promise<ResolvedCurrentlyPlaying | null> {
    const tracks = await this.lastfm.getRecentTracks(username, 10);
    if (tracks.length === 0) return null;

    const currentTrack = tracks[0];
    const isNowPlaying = currentTrack["@attr"]?.nowplaying === "true";
    if (!isNowPlaying) return null;

    const trackName = currentTrack.name;
    const artistName =
      currentTrack.artist["#text"] ||
      currentTrack.artist.name ||
      "Unknown Artist";

    const lastFmTrackUrl = currentTrack.url;
    const lastFmArtistUrl = `https://www.last.fm/music/${encodeURIComponent(artistName)}`;
    const lastFmAlbum = currentTrack.album?.["#text"] || null;

    const lastFmImages = currentTrack.image;
    const lastFmCoverArt =
      lastFmImages?.find((img) => img.size === "extralarge")?.["#text"] ||
      lastFmImages?.find((img) => img.size === "large")?.["#text"] ||
      lastFmImages?.find((img) => img["#text"])?.["#text"] ||
      null;

    const spotifyMatch = await this.spotify.resolveTrack(trackName, artistName);

    const normTrack = normalizeString(trackName);
    const normArtist = normalizeString(artistName);

    let repeatCount = 0;
    for (let i = 1; i < tracks.length; i++) {
      const item = tracks[i];
      const tName = normalizeString(item.name || "");
      const tArtist = normalizeString(
        item.artist["#text"] || item.artist.name || "",
      );

      if (tName === normTrack && tArtist === normArtist) {
        repeatCount++;
      }
    }

    return {
      trackName,
      artistName,
      albumName: spotifyMatch.albumName || lastFmAlbum,
      coverArtUrl: spotifyMatch.coverArtUrl || lastFmCoverArt,
      trackUrl: spotifyMatch.trackUrl || lastFmTrackUrl,
      artistUrl: spotifyMatch.artistUrl || lastFmArtistUrl,
      lastFmTrackUrl,
      lastFmArtistUrl,
      spotifyTrackUrl: spotifyMatch.trackUrl,
      spotifyArtistUrl: spotifyMatch.artistUrl,
      isOnRepeat: repeatCount >= 2,
      repeatCount,
    };
  }

  public async getRecentTracks(
    username: string,
    limit = 5,
  ): Promise<ResolvedTrackItem[]> {
    const rawTracks = await this.lastfm.getRecentTracks(username, limit);
    if (!rawTracks.length) return [];

    const slicedTracks = rawTracks.slice(0, limit);

    return Promise.all(
      slicedTracks.map(async (raw) => {
        const trackName = raw.name;
        const artistName =
          raw.artist["#text"] || raw.artist.name || "Unknown Artist";
        const isPlaying = raw["@attr"]?.nowplaying === "true";

        const lastFmTrackUrl = raw.url;
        const lastFmArtistUrl = `https://www.last.fm/music/${encodeURIComponent(artistName)}`;
        const lastFmAlbum = raw.album?.["#text"] || null;

        const lastFmImages = raw.image;
        const lastFmCoverArt =
          lastFmImages?.find((img) => img.size === "extralarge")?.["#text"] ||
          lastFmImages?.find((img) => img.size === "large")?.["#text"] ||
          lastFmImages?.find((img) => img["#text"])?.["#text"] ||
          null;

        const spotifyMatch = await this.spotify.resolveTrack(
          trackName,
          artistName,
        );

        return {
          trackName,
          artistName,
          albumName: spotifyMatch.albumName || lastFmAlbum,
          coverArtUrl: spotifyMatch.coverArtUrl || lastFmCoverArt,
          trackUrl: spotifyMatch.trackUrl || lastFmTrackUrl,
          artistUrl: spotifyMatch.artistUrl || lastFmArtistUrl,
          lastFmTrackUrl,
          lastFmArtistUrl,
          spotifyTrackUrl: spotifyMatch.trackUrl,
          spotifyArtistUrl: spotifyMatch.artistUrl,
          isPlaying,
        };
      }),
    );
  }

  public async getUserProfile(
    username: string,
  ): Promise<LastFmUserProfile | null> {
    const user = await this.lastfm.getUserInfo(username);
    if (!user) return null;

    const validImages = user.image?.filter((img) =>
      Boolean(img["#text"]?.trim()),
    );
    const avatarUrl =
      validImages?.find((img) => img.size === "extralarge")?.["#text"] ||
      validImages?.find((img) => img.size === "large")?.["#text"] ||
      validImages?.at(-1)?.["#text"] ||
      null;

    const playCount = Number(user.playcount ?? 0);
    const registeredAt = user.registered
      ? Number(user.registered.unixtime || user.registered["#text"])
      : null;

    return {
      username: user.name,
      url: user.url,
      avatarUrl,
      country: user.country && user.country !== "None" ? user.country : null,
      playCount: Number.isNaN(playCount) ? 0 : playCount,
      registeredAt: Number.isNaN(registeredAt) ? null : registeredAt,
    };
  }
}
